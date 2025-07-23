using System;
using Batuara.Domain.Common;
using Batuara.Domain.Enums;
using Batuara.Domain.Events;

namespace Batuara.Domain.Entities
{
    public class SpiritualContent : BaseEntity, IAggregateRoot
    {
        public string Title { get; private set; } = string.Empty;
        public string Content { get; private set; } = string.Empty;
        public SpiritualContentType Type { get; private set; }
        public SpiritualCategory Category { get; private set; }
        public string Source { get; private set; } = string.Empty;
        public int DisplayOrder { get; private set; }
        public bool IsFeatured { get; private set; }

        private SpiritualContent() { } // For EF Core

        public SpiritualContent(
            string title,
            string content,
            SpiritualContentType type,
            SpiritualCategory category,
            string source,
            int displayOrder = 0,
            bool isFeatured = false)
        {
            ValidateSpiritualContent(title, content, type, category, source);
            
            Title = title;
            Content = content;
            Type = type;
            Category = category;
            Source = source;
            DisplayOrder = displayOrder;
            IsFeatured = isFeatured;

            // Disparar domain event quando o conteúdo é ativado
            if (IsActive)
            {
                AddDomainEvent(new SpiritualContentPublishedDomainEvent(this));
            }
        }

        private static void ValidateSpiritualContent(
            string title,
            string content,
            SpiritualContentType type,
            SpiritualCategory category,
            string source)
        {
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("Spiritual content title cannot be empty", nameof(title));

            if (title.Length > 200)
                throw new ArgumentException("Spiritual content title cannot exceed 200 characters", nameof(title));

            if (string.IsNullOrWhiteSpace(content))
                throw new ArgumentException("Spiritual content cannot be empty", nameof(content));

            if (content.Length > 10000)
                throw new ArgumentException("Spiritual content cannot exceed 10000 characters", nameof(content));

            if (!Enum.IsDefined(typeof(SpiritualContentType), type))
                throw new ArgumentException("Invalid spiritual content type", nameof(type));

            if (!Enum.IsDefined(typeof(SpiritualCategory), category))
                throw new ArgumentException("Invalid spiritual category", nameof(category));

            if (string.IsNullOrWhiteSpace(source))
                throw new ArgumentException("Spiritual content source cannot be empty", nameof(source));

            if (source.Length > 200)
                throw new ArgumentException("Spiritual content source cannot exceed 200 characters", nameof(source));
        }

        public void UpdateContent(string title, string content, string source)
        {
            ValidateSpiritualContent(title, content, Type, Category, source);
            
            Title = title;
            Content = content;
            Source = source;
            UpdateTimestamp();
        }

        public void UpdateType(SpiritualContentType type, SpiritualCategory category)
        {
            if (!Enum.IsDefined(typeof(SpiritualContentType), type))
                throw new ArgumentException("Invalid spiritual content type", nameof(type));

            if (!Enum.IsDefined(typeof(SpiritualCategory), category))
                throw new ArgumentException("Invalid spiritual category", nameof(category));

            Type = type;
            Category = category;
            UpdateTimestamp();
        }

        public void UpdateDisplayOrder(int displayOrder)
        {
            DisplayOrder = displayOrder;
            UpdateTimestamp();
        }

        public void SetFeatured(bool isFeatured)
        {
            IsFeatured = isFeatured;
            UpdateTimestamp();
        }

        public string GetTypeDisplayName()
        {
            return Type switch
            {
                SpiritualContentType.Prayer => "Oração",
                SpiritualContentType.Teaching => "Ensinamento",
                SpiritualContentType.Doctrine => "Doutrina",
                SpiritualContentType.Hymn => "Ponto Cantado",
                SpiritualContentType.Ritual => "Ritual",
                _ => Type.ToString()
            };
        }

        public string GetCategoryDisplayName()
        {
            return Category switch
            {
                SpiritualCategory.Umbanda => "Umbanda",
                SpiritualCategory.Kardecismo => "Kardecismo",
                SpiritualCategory.General => "Geral",
                SpiritualCategory.Orixas => "Orixás",
                _ => Category.ToString()
            };
        }

        public bool IsForCategory(SpiritualCategory category)
        {
            return Category == category || Category == SpiritualCategory.General;
        }
    }
}