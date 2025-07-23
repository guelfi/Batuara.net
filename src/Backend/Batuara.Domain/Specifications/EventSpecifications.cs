using System;
using Batuara.Domain.Entities;

namespace Batuara.Domain.Specifications
{
    public class ActiveEventsSpecification : BaseSpecification<Event>
    {
        public ActiveEventsSpecification() : base(e => e.IsActive)
        {
        }
    }

    public class UpcomingEventsSpecification : BaseSpecification<Event>
    {
        public UpcomingEventsSpecification() : base(e => e.IsActive && e.EventDate.Date >= DateTime.Today)
        {
        }
    }

    public class EventsByMonthSpecification : BaseSpecification<Event>
    {
        public EventsByMonthSpecification(int year, int month) 
            : base(e => e.IsActive && e.EventDate.Date.Year == year && e.EventDate.Date.Month == month)
        {
        }
    }

    public class EventsByTypeSpecification : BaseSpecification<Event>
    {
        public EventsByTypeSpecification(EventType type) 
            : base(e => e.IsActive && e.Type == type)
        {
        }
    }

    public class EventsThisMonthSpecification : BaseSpecification<Event>
    {
        public EventsThisMonthSpecification() 
            : base(e => e.IsActive && 
                       e.EventDate.Date.Year == DateTime.Today.Year && 
                       e.EventDate.Date.Month == DateTime.Today.Month)
        {
        }
    }
}