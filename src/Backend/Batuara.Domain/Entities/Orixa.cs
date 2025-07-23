using System;
using System.Collections.Generic;
using System.Linq;
using Batuara.Domain.Common;

namespace Batuara.Domain.Entities
{
    public class Orixa : BaseEntity, IAggregateRoot
    {
        public string Name { get; private set; } = string.Empty;
        public string Description { get; private set; } = string.Empty;
        public string Origin { get; private set; } = string.Empty;
        public string BatuaraTeaching { get; private set; } = string.Empty;
        public string? ImageUrl { get; private set; }
        public int DisplayOrder { get; private set; }

        private readonly List<string> _characteristics = new();
        private readonly List<string> _colors = new();
        private readonly List<string> _elements = new();

        public IReadOnlyList<string> Characteristics => _characteristics.AsReadOnly();
        public IReadOnlyList<string> Colors => _colors.AsReadOnly();
        public IReadOnlyList<string> Elements => _elements.AsReadOnly();

        private Orixa() { } // For EF Core

        public Orixa(
            string name, 
            string description, 
            string origin, 
            string batuaraTeaching,
            IEnumerable<string> characteristics,
            IEnumerable<string> colors,
            IEnumerable<string> elements,
            int displayOrder = 0,
            string? imageUrl = null)
        {
            ValidateOrixa(name, description, origin, batuaraTeaching, characteristics, colors, elements);
            
            Name = name;
            Description = description;
            Origin = origin;
            BatuaraTeaching = batuaraTeaching;
            DisplayOrder = displayOrder;
            ImageUrl = imageUrl;
            
            _characteristics.AddRange(characteristics);
            _colors.AddRange(colors);
            _elements.AddRange(elements);
        }

        private static void ValidateOrixa(
            string name, 
            string description, 
            string origin, 
            string batuaraTeaching,
            IEnumerable<string> characteristics,
            IEnumerable<string> colors,
            IEnumerable<string> elements)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Orixa name cannot be empty", nameof(name));

            if (name.Length > 100)
                throw new ArgumentException("Orixa name cannot exceed 100 characters", nameof(name));

            if (string.IsNullOrWhiteSpace(description))
                throw new ArgumentException("Orixa description cannot be empty", nameof(description));

            if (description.Length > 5000)
                throw new ArgumentException("Orixa description cannot exceed 5000 characters", nameof(description));

            if (string.IsNullOrWhiteSpace(origin))
                throw new ArgumentException("Orixa origin cannot be empty", nameof(origin));

            if (origin.Length > 1000)
                throw new ArgumentException("Orixa origin cannot exceed 1000 characters", nameof(origin));

            if (string.IsNullOrWhiteSpace(batuaraTeaching))
                throw new ArgumentException("Batuara teaching cannot be empty", nameof(batuaraTeaching));

            if (batuaraTeaching.Length > 5000)
                throw new ArgumentException("Batuara teaching cannot exceed 5000 characters", nameof(batuaraTeaching));

            if (characteristics == null || !characteristics.Any())
                throw new ArgumentException("Orixa must have at least one characteristic", nameof(characteristics));

            if (colors == null || !colors.Any())
                throw new ArgumentException("Orixa must have at least one color", nameof(colors));

            if (elements == null || !elements.Any())
                throw new ArgumentException("Orixa must have at least one element", nameof(elements));
        }

        public void UpdateBasicInfo(string name, string description, string origin, int displayOrder)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Orixa name cannot be empty", nameof(name));

            if (string.IsNullOrWhiteSpace(description))
                throw new ArgumentException("Orixa description cannot be empty", nameof(description));

            if (string.IsNullOrWhiteSpace(origin))
                throw new ArgumentException("Orixa origin cannot be empty", nameof(origin));

            Name = name;
            Description = description;
            Origin = origin;
            DisplayOrder = displayOrder;
            UpdateTimestamp();
        }

        public void UpdateBatuaraTeaching(string batuaraTeaching)
        {
            if (string.IsNullOrWhiteSpace(batuaraTeaching))
                throw new ArgumentException("Batuara teaching cannot be empty", nameof(batuaraTeaching));

            if (batuaraTeaching.Length > 5000)
                throw new ArgumentException("Batuara teaching cannot exceed 5000 characters", nameof(batuaraTeaching));

            BatuaraTeaching = batuaraTeaching;
            UpdateTimestamp();
        }

        public void UpdateCharacteristics(IEnumerable<string> characteristics)
        {
            if (characteristics == null || !characteristics.Any())
                throw new ArgumentException("Orixa must have at least one characteristic", nameof(characteristics));

            _characteristics.Clear();
            _characteristics.AddRange(characteristics.Where(c => !string.IsNullOrWhiteSpace(c)));
            UpdateTimestamp();
        }

        public void UpdateColors(IEnumerable<string> colors)
        {
            if (colors == null || !colors.Any())
                throw new ArgumentException("Orixa must have at least one color", nameof(colors));

            _colors.Clear();
            _colors.AddRange(colors.Where(c => !string.IsNullOrWhiteSpace(c)));
            UpdateTimestamp();
        }

        public void UpdateElements(IEnumerable<string> elements)
        {
            if (elements == null || !elements.Any())
                throw new ArgumentException("Orixa must have at least one element", nameof(elements));

            _elements.Clear();
            _elements.AddRange(elements.Where(e => !string.IsNullOrWhiteSpace(e)));
            UpdateTimestamp();
        }

        public void UpdateImage(string? imageUrl)
        {
            ImageUrl = imageUrl;
            UpdateTimestamp();
        }

        public string GetPrimaryColor()
        {
            return _colors.FirstOrDefault() ?? "Azul";
        }

        public string GetPrimaryElement()
        {
            return _elements.FirstOrDefault() ?? "Água";
        }
    }
}