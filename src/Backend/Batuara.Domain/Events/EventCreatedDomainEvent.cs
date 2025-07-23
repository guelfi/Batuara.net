using System;
using Batuara.Domain.Entities;

namespace Batuara.Domain.Events
{
    public class EventCreatedDomainEvent : IDomainEvent
    {
        public DateTime OccurredOn { get; }
        public Guid EventId { get; }
        public Event Event { get; }

        public EventCreatedDomainEvent(Event eventEntity)
        {
            OccurredOn = DateTime.UtcNow;
            EventId = Guid.NewGuid();
            Event = eventEntity;
        }
    }
}