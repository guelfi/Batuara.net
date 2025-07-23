using System;
using Batuara.Domain.Entities;

namespace Batuara.Domain.Events
{
    public class EventUpdatedDomainEvent : IDomainEvent
    {
        public DateTime OccurredOn { get; }
        public Guid EventId { get; }
        public Event Event { get; }
        public string[] ChangedProperties { get; }

        public EventUpdatedDomainEvent(Event eventEntity, string[] changedProperties)
        {
            OccurredOn = DateTime.UtcNow;
            EventId = Guid.NewGuid();
            Event = eventEntity;
            ChangedProperties = changedProperties;
        }
    }
}