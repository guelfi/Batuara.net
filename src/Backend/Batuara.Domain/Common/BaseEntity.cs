using System;
using System.Collections.Generic;
using Batuara.Domain.Events;

namespace Batuara.Domain.Common
{
    public abstract class BaseEntity
    {
        public int Id { get; protected set; }
        public DateTime CreatedAt { get; protected set; }
        public DateTime UpdatedAt { get; protected set; }
        public bool IsActive { get; set; } = true;

        private readonly List<IDomainEvent> _domainEvents = new List<IDomainEvent>();

        protected BaseEntity()
        {
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }
        public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();
        public bool HasDomainEvents => _domainEvents.Count > 0;

        protected void AddDomainEvent(IDomainEvent domainEvent)
        {
            _domainEvents.Add(domainEvent);
        }

        public void ClearDomainEvents()
        {
            _domainEvents.Clear();
        }

        protected void UpdateTimestamp()
        {
            UpdatedAt = DateTime.UtcNow;
        }

        protected void SetInactive()
        {
            IsActive = false;
            UpdateTimestamp();
        }
    }
}