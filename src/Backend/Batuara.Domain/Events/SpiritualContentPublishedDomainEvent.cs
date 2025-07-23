using System;
using Batuara.Domain.Entities;

namespace Batuara.Domain.Events
{
    public class SpiritualContentPublishedDomainEvent : IDomainEvent
    {
        public DateTime OccurredOn { get; }
        public Guid EventId { get; }
        public SpiritualContent Content { get; }

        public SpiritualContentPublishedDomainEvent(SpiritualContent content)
        {
            OccurredOn = DateTime.UtcNow;
            EventId = Guid.NewGuid();
            Content = content;
        }
    }
}