using Batuara.Domain.Common;
using Batuara.Domain.ValueObjects;
using Batuara.Domain.Events;

namespace Batuara.Domain.Entities
{
    public class Event : BaseEntity, IAggregateRoot
    {
        public string Title { get; private set; } = string.Empty;
        public string Description { get; private set; } = string.Empty;
        public EventDate EventDate { get; private set; } = null!;
        public EventType Type { get; private set; }
        public string? ImageUrl { get; private set; }
        public string? Location { get; private set; }

        private Event() { } // For EF Core

        public Event(string title, string description, EventDate eventDate, EventType type, string? location = null, string? imageUrl = null)
        {
            ValidateEvent(title, description, eventDate);
            
            Title = title;
            Description = description;
            EventDate = eventDate;
            Type = type;
            Location = location;
            ImageUrl = imageUrl;

            // Disparar domain event
            AddDomainEvent(new EventCreatedDomainEvent(this));
        }

        private static void ValidateEvent(string title, string description, EventDate eventDate)
        {
            if (string.IsNullOrWhiteSpace(title))
                throw new ArgumentException("O título do evento não pode ser vazio", nameof(title));

            if (title.Length > 200)
                throw new ArgumentException("O título do evento não pode exceder 200 caracteres", nameof(title));

            if (string.IsNullOrWhiteSpace(description))
                throw new ArgumentException("A descrição do evento não pode ser vazia", nameof(description));

            if (description.Length > 2000)
                throw new ArgumentException("A descrição do evento não pode exceder 2000 caracteres", nameof(description));

            ArgumentNullException.ThrowIfNull(eventDate);
        }

        public void UpdateDetails(string title, string description, string? location = null)
        {
            ValidateEvent(title, description, EventDate);
            
            List<string> changedProperties = [];
            if (Title != title) changedProperties.Add(nameof(Title));
            if (Description != description) changedProperties.Add(nameof(Description));
            if (Location != location) changedProperties.Add(nameof(Location));
            
            Title = title;
            Description = description;
            Location = location;
            UpdateTimestamp();

            if (changedProperties.Count != 0)
            {
                AddDomainEvent(new EventUpdatedDomainEvent(this, [.. changedProperties]));
            }
        }

        public void UpdateEventDate(EventDate newEventDate)
        {
            ArgumentNullException.ThrowIfNull(newEventDate);

            EventDate = newEventDate;
            UpdateTimestamp();
            
            AddDomainEvent(new EventUpdatedDomainEvent(this, [nameof(EventDate)]));
        }

        public void UpdateImage(string? imageUrl)
        {
            ImageUrl = imageUrl;
            UpdateTimestamp();
            
            AddDomainEvent(new EventUpdatedDomainEvent(this, [nameof(ImageUrl)]));
        }

        public void UpdateType(EventType type)
        {
            if (!Enum.IsDefined(typeof(EventType), type))
                throw new ArgumentException("Tipo de evento inválido", nameof(type));

            if (Type == type)
                return;

            Type = type;
            UpdateTimestamp();

            AddDomainEvent(new EventUpdatedDomainEvent(this, [nameof(Type)]));
        }

        public bool IsUpcoming()
        {
            return EventDate.Date >= DateTime.Today;
        }

        public bool IsThisMonth()
        {
            var today = DateTime.Today;
            return EventDate.Date.Year == today.Year && EventDate.Date.Month == today.Month;
        }

        public void Deactivate()
        {
            IsActive = false;
            UpdateTimestamp();
        }

        public void Activate()
        {
            IsActive = true;
            UpdateTimestamp();
        }
    }

    public enum EventType
    {
        Festa = 1,
        Evento = 2,
        Celebracao = 3,
        Bazar = 4,
        Palestra = 5
    }
}
