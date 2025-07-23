using System;
using System.Collections.Generic;
using System.Linq;
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
                throw new ArgumentException("Event title cannot be empty", nameof(title));

            if (title.Length > 200)
                throw new ArgumentException("Event title cannot exceed 200 characters", nameof(title));

            if (string.IsNullOrWhiteSpace(description))
                throw new ArgumentException("Event description cannot be empty", nameof(description));

            if (description.Length > 2000)
                throw new ArgumentException("Event description cannot exceed 2000 characters", nameof(description));

            if (eventDate == null)
                throw new ArgumentNullException(nameof(eventDate), "Event date cannot be null");
        }

        public void UpdateDetails(string title, string description, string? location = null)
        {
            ValidateEvent(title, description, EventDate);
            
            var changedProperties = new List<string>();
            if (Title != title) changedProperties.Add(nameof(Title));
            if (Description != description) changedProperties.Add(nameof(Description));
            if (Location != location) changedProperties.Add(nameof(Location));
            
            Title = title;
            Description = description;
            Location = location;
            UpdateTimestamp();

            if (changedProperties.Any())
            {
                AddDomainEvent(new EventUpdatedDomainEvent(this, changedProperties.ToArray()));
            }
        }

        public void UpdateEventDate(EventDate newEventDate)
        {
            if (newEventDate == null)
                throw new ArgumentNullException(nameof(newEventDate));

            EventDate = newEventDate;
            UpdateTimestamp();
            
            AddDomainEvent(new EventUpdatedDomainEvent(this, new[] { nameof(EventDate) }));
        }

        public void UpdateImage(string? imageUrl)
        {
            ImageUrl = imageUrl;
            UpdateTimestamp();
            
            AddDomainEvent(new EventUpdatedDomainEvent(this, new[] { nameof(ImageUrl) }));
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