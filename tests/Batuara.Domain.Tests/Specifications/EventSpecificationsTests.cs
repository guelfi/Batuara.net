using System;
using System.Linq;
using Xunit;
using FluentAssertions;
using Batuara.Domain.Entities;
using Batuara.Domain.ValueObjects;
using Batuara.Domain.Specifications;

namespace Batuara.Domain.Tests.Specifications
{
    public class EventSpecificationsTests
    {
        [Fact]
        public void ActiveEventsSpecification_ShouldReturnOnlyActiveEvents()
        {
            // Arrange
            var activeEvent = CreateEvent("Active Event", DateTime.Today.AddDays(7));
            var inactiveEvent = CreateEvent("Inactive Event", DateTime.Today.AddDays(8));
            inactiveEvent.Deactivate();

            var events = new[] { activeEvent, inactiveEvent };
            var specification = new ActiveEventsSpecification();

            // Act
            var result = events.Where(specification.ToExpression().Compile()).ToList();

            // Assert
            result.Should().HaveCount(1);
            result.Should().Contain(activeEvent);
            result.Should().NotContain(inactiveEvent);
        }

        [Fact]
        public void UpcomingEventsSpecification_ShouldReturnOnlyUpcomingActiveEvents()
        {
            // Arrange
            var upcomingEvent = CreateEvent("Upcoming Event", DateTime.Today.AddDays(7));
            var pastEvent = CreateEvent("Past Event", DateTime.Today.AddDays(-7));
            var inactiveUpcomingEvent = CreateEvent("Inactive Upcoming", DateTime.Today.AddDays(8));
            inactiveUpcomingEvent.Deactivate();

            var events = new[] { upcomingEvent, pastEvent, inactiveUpcomingEvent };
            var specification = new UpcomingEventsSpecification();

            // Act
            var result = events.Where(specification.ToExpression().Compile()).ToList();

            // Assert
            result.Should().HaveCount(1);
            result.Should().Contain(upcomingEvent);
            result.Should().NotContain(pastEvent);
            result.Should().NotContain(inactiveUpcomingEvent);
        }

        [Fact]
        public void EventsByMonthSpecification_ShouldReturnEventsFromSpecificMonth()
        {
            // Arrange
            var targetDate = DateTime.Today.AddMonths(1);
            var eventInTargetMonth = CreateEvent("Event in Target Month", targetDate);
            var eventInDifferentMonth = CreateEvent("Event in Different Month", targetDate.AddMonths(1));
            var inactiveEventInTargetMonth = CreateEvent("Inactive in Target Month", targetDate.AddDays(5));
            inactiveEventInTargetMonth.Deactivate();

            var events = new[] { eventInTargetMonth, eventInDifferentMonth, inactiveEventInTargetMonth };
            var specification = new EventsByMonthSpecification(targetDate.Year, targetDate.Month);

            // Act
            var result = events.Where(specification.ToExpression().Compile()).ToList();

            // Assert
            result.Should().HaveCount(1);
            result.Should().Contain(eventInTargetMonth);
            result.Should().NotContain(eventInDifferentMonth);
            result.Should().NotContain(inactiveEventInTargetMonth);
        }

        [Fact]
        public void EventsByTypeSpecification_ShouldReturnEventsOfSpecificType()
        {
            // Arrange
            var festa = CreateEvent("Festa", DateTime.Today.AddDays(7), EventType.Festa);
            var palestra = CreateEvent("Palestra", DateTime.Today.AddDays(8), EventType.Palestra);
            var inactiveFesta = CreateEvent("Inactive Festa", DateTime.Today.AddDays(9), EventType.Festa);
            inactiveFesta.Deactivate();

            var events = new[] { festa, palestra, inactiveFesta };
            var specification = new EventsByTypeSpecification(EventType.Festa);

            // Act
            var result = events.Where(specification.ToExpression().Compile()).ToList();

            // Assert
            result.Should().HaveCount(1);
            result.Should().Contain(festa);
            result.Should().NotContain(palestra);
            result.Should().NotContain(inactiveFesta);
        }

        [Fact]
        public void EventsThisMonthSpecification_ShouldReturnEventsFromCurrentMonth()
        {
            // Arrange
            var eventThisMonth = CreateEvent("Event This Month", DateTime.Today.AddDays(5));
            var eventNextMonth = CreateEvent("Event Next Month", DateTime.Today.AddMonths(1));
            var eventLastMonth = CreateEvent("Event Last Month", DateTime.Today.AddMonths(-1));
            var inactiveEventThisMonth = CreateEvent("Inactive This Month", DateTime.Today.AddDays(10));
            inactiveEventThisMonth.Deactivate();

            var events = new[] { eventThisMonth, eventNextMonth, eventLastMonth, inactiveEventThisMonth };
            var specification = new EventsThisMonthSpecification();

            // Act
            var result = events.Where(specification.ToExpression().Compile()).ToList();

            // Assert
            result.Should().HaveCount(1);
            result.Should().Contain(eventThisMonth);
            result.Should().NotContain(eventNextMonth);
            result.Should().NotContain(eventLastMonth);
            result.Should().NotContain(inactiveEventThisMonth);
        }

        [Fact]
        public void IsSatisfiedBy_ShouldWorkCorrectly()
        {
            // Arrange
            var activeEvent = CreateEvent("Active Event", DateTime.Today.AddDays(7));
            var inactiveEvent = CreateEvent("Inactive Event", DateTime.Today.AddDays(8));
            inactiveEvent.Deactivate();

            var specification = new ActiveEventsSpecification();

            // Act & Assert
            specification.IsSatisfiedBy(activeEvent).Should().BeTrue();
            specification.IsSatisfiedBy(inactiveEvent).Should().BeFalse();
        }

        private static Event CreateEvent(string title, DateTime date, EventType type = EventType.Evento)
        {
            return new Event(
                title,
                "Test Description",
                new EventDate(date),
                type);
        }
    }
}