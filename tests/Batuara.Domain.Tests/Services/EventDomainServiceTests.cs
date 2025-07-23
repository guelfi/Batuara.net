using System;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using FluentAssertions;
using Batuara.Domain.Entities;
using Batuara.Domain.ValueObjects;
using Batuara.Domain.Services;

namespace Batuara.Domain.Tests.Services
{
    public class EventDomainServiceTests
    {
        private readonly EventDomainService _eventDomainService;

        public EventDomainServiceTests()
        {
            _eventDomainService = new EventDomainService();
        }

        [Fact]
        public void HasTimeConflict_WhenEventsOnDifferentDates_ShouldReturnFalse()
        {
            // Arrange
            var event1 = CreateEvent("Event 1", DateTime.Today.AddDays(7), TimeSpan.FromHours(19), TimeSpan.FromHours(21));
            var event2 = CreateEvent("Event 2", DateTime.Today.AddDays(8), TimeSpan.FromHours(19), TimeSpan.FromHours(21));

            // Act
            var hasConflict = _eventDomainService.HasTimeConflict(event1, event2);

            // Assert
            hasConflict.Should().BeFalse();
        }

        [Fact]
        public void HasTimeConflict_WhenEventsOverlap_ShouldReturnTrue()
        {
            // Arrange
            var date = DateTime.Today.AddDays(7);
            var event1 = CreateEvent("Event 1", date, TimeSpan.FromHours(19), TimeSpan.FromHours(21));
            var event2 = CreateEvent("Event 2", date, TimeSpan.FromHours(20), TimeSpan.FromHours(22));

            // Act
            var hasConflict = _eventDomainService.HasTimeConflict(event1, event2);

            // Assert
            hasConflict.Should().BeTrue();
        }

        [Fact]
        public void HasTimeConflict_WhenOneEventIsAllDay_ShouldReturnTrue()
        {
            // Arrange
            var date = DateTime.Today.AddDays(7);
            var allDayEvent = CreateEvent("All Day Event", date);
            var timedEvent = CreateEvent("Timed Event", date, TimeSpan.FromHours(19), TimeSpan.FromHours(21));

            // Act
            var hasConflict = _eventDomainService.HasTimeConflict(allDayEvent, timedEvent);

            // Assert
            hasConflict.Should().BeTrue();
        }

        [Fact]
        public void HasTimeConflict_WhenEventsDoNotOverlap_ShouldReturnFalse()
        {
            // Arrange
            var date = DateTime.Today.AddDays(7);
            var event1 = CreateEvent("Event 1", date, TimeSpan.FromHours(19), TimeSpan.FromHours(21));
            var event2 = CreateEvent("Event 2", date, TimeSpan.FromHours(21), TimeSpan.FromHours(23));

            // Act
            var hasConflict = _eventDomainService.HasTimeConflict(event1, event2);

            // Assert
            hasConflict.Should().BeFalse();
        }

        [Fact]
        public void HasTimeConflict_WhenOneEventIsInactive_ShouldReturnFalse()
        {
            // Arrange
            var date = DateTime.Today.AddDays(7);
            var activeEvent = CreateEvent("Active Event", date, TimeSpan.FromHours(19), TimeSpan.FromHours(21));
            var inactiveEvent = CreateEvent("Inactive Event", date, TimeSpan.FromHours(20), TimeSpan.FromHours(22));
            inactiveEvent.Deactivate();

            // Act
            var hasConflict = _eventDomainService.HasTimeConflict(inactiveEvent, activeEvent);

            // Assert
            hasConflict.Should().BeFalse();
        }

        [Fact]
        public async Task CanScheduleEventAsync_WhenNoConflicts_ShouldReturnTrue()
        {
            // Arrange
            var newEvent = CreateEvent("New Event", DateTime.Today.AddDays(7), TimeSpan.FromHours(19), TimeSpan.FromHours(21));
            var existingEvents = new[]
            {
                CreateEvent("Existing Event", DateTime.Today.AddDays(8), TimeSpan.FromHours(19), TimeSpan.FromHours(21))
            };

            // Act
            var canSchedule = await _eventDomainService.CanScheduleEventAsync(newEvent, existingEvents);

            // Assert
            canSchedule.Should().BeTrue();
        }

        [Fact]
        public async Task CanScheduleEventAsync_WhenHasConflicts_ShouldReturnFalse()
        {
            // Arrange
            var date = DateTime.Today.AddDays(7);
            var newEvent = CreateEvent("New Event", date, TimeSpan.FromHours(19), TimeSpan.FromHours(21));
            var existingEvents = new[]
            {
                CreateEvent("Conflicting Event", date, TimeSpan.FromHours(20), TimeSpan.FromHours(22))
            };

            // Act
            var canSchedule = await _eventDomainService.CanScheduleEventAsync(newEvent, existingEvents);

            // Assert
            canSchedule.Should().BeFalse();
        }

        [Fact]
        public void ValidateEventBusinessRules_WhenEventInPast_ShouldReturnInvalid()
        {
            // Arrange
            var pastEvent = CreateEvent("Past Event", DateTime.Today.AddDays(-1));

            // Act
            var (isValid, errors) = _eventDomainService.ValidateEventBusinessRules(pastEvent);

            // Assert
            isValid.Should().BeFalse();
            errors.Should().Contain("Eventos não podem ser agendados no passado");
        }

        [Fact]
        public void ValidateEventBusinessRules_WhenFestaWithShortDuration_ShouldReturnInvalid()
        {
            // Arrange
            var shortFesta = CreateEvent("Short Festa", DateTime.Today.AddDays(7), TimeSpan.FromHours(19), TimeSpan.FromHours(20), EventType.Festa);

            // Act
            var (isValid, errors) = _eventDomainService.ValidateEventBusinessRules(shortFesta);

            // Assert
            isValid.Should().BeFalse();
            errors.Should().Contain("Festas devem ter duração mínima de 2 horas");
        }

        [Fact]
        public void ValidateEventBusinessRules_WhenPalestraWithoutTime_ShouldReturnInvalid()
        {
            // Arrange
            var palestraWithoutTime = CreateEvent("Palestra", DateTime.Today.AddDays(7), type: EventType.Palestra);

            // Act
            var (isValid, errors) = _eventDomainService.ValidateEventBusinessRules(palestraWithoutTime);

            // Assert
            isValid.Should().BeFalse();
            errors.Should().Contain("Palestras devem ter horário de início e fim definidos");
        }

        [Fact]
        public void ValidateEventBusinessRules_WhenSundayEventBeforeAfternoon_ShouldReturnInvalid()
        {
            // Arrange
            var sunday = GetNextSunday();
            var morningEvent = CreateEvent("Morning Event", sunday, TimeSpan.FromHours(10), TimeSpan.FromHours(12));

            // Act
            var (isValid, errors) = _eventDomainService.ValidateEventBusinessRules(morningEvent);

            // Assert
            isValid.Should().BeFalse();
            errors.Should().Contain("Eventos aos domingos devem ser agendados após 14h");
        }

        [Fact]
        public void ValidateEventBusinessRules_WhenValidEvent_ShouldReturnValid()
        {
            // Arrange
            var validEvent = CreateEvent("Valid Event", DateTime.Today.AddDays(7), TimeSpan.FromHours(19), TimeSpan.FromHours(21));

            // Act
            var (isValid, errors) = _eventDomainService.ValidateEventBusinessRules(validEvent);

            // Assert
            isValid.Should().BeTrue();
            errors.Should().BeEmpty();
        }

        [Fact]
        public void GetNextAvailableDate_ShouldReturnAppropriateDate()
        {
            // Arrange
            var existingEvents = new[]
            {
                CreateEvent("Existing Event", DateTime.Today.AddDays(2))
            };

            // Act
            var nextDate = _eventDomainService.GetNextAvailableDate(EventType.Festa, existingEvents);

            // Assert
            nextDate.Should().BeAfter(DateTime.Today);
            nextDate.DayOfWeek.Should().BeOneOf(DayOfWeek.Saturday, DayOfWeek.Sunday);
        }

        [Fact]
        public void SuggestAlternativeDates_ShouldReturnValidAlternatives()
        {
            // Arrange
            var conflictingEvent = CreateEvent("Conflicting Event", DateTime.Today.AddDays(7), TimeSpan.FromHours(19), TimeSpan.FromHours(21));
            var existingEvents = new[] { conflictingEvent };

            // Act
            var alternatives = _eventDomainService.SuggestAlternativeDates(conflictingEvent, existingEvents, 3);

            // Assert
            alternatives.Should().NotBeEmpty();
            (alternatives.Count() <= 3).Should().BeTrue();
            alternatives.Should().OnlyContain(date => date > DateTime.Today);
        }

        [Fact]
        public void IsSpecialEvent_WhenEventIsFesta_ShouldReturnTrue()
        {
            // Arrange
            var festa = CreateEvent("Festa", DateTime.Today.AddDays(7), type: EventType.Festa);

            // Act
            var isSpecial = _eventDomainService.IsSpecialEvent(festa);

            // Assert
            isSpecial.Should().BeTrue();
        }

        [Fact]
        public void IsSpecialEvent_WhenEventIsRegular_ShouldReturnFalse()
        {
            // Arrange
            var regularEvent = CreateEvent("Regular Event", DateTime.Today.AddDays(7), type: EventType.Evento);

            // Act
            var isSpecial = _eventDomainService.IsSpecialEvent(regularEvent);

            // Assert
            isSpecial.Should().BeFalse();
        }

        [Theory]
        [InlineData(EventType.Festa, 4)]
        [InlineData(EventType.Celebracao, 3)]
        [InlineData(EventType.Palestra, 2)]
        [InlineData(EventType.Bazar, 6)]
        [InlineData(EventType.Evento, 2)]
        public void GetEstimatedDuration_ShouldReturnCorrectDuration(EventType eventType, int expectedHours)
        {
            // Act
            var duration = _eventDomainService.GetEstimatedDuration(eventType);

            // Assert
            duration.Should().Be(TimeSpan.FromHours(expectedHours));
        }

        private static Event CreateEvent(string title, DateTime date, TimeSpan? startTime = null, TimeSpan? endTime = null, EventType type = EventType.Evento)
        {
            var eventDate = startTime.HasValue && endTime.HasValue
                ? new EventDate(date, startTime.Value, endTime.Value)
                : new EventDate(date);

            return new Event(title, "Test Description", eventDate, type);
        }

        private static DateTime GetNextSunday()
        {
            var today = DateTime.Today;
            var daysUntilSunday = ((int)DayOfWeek.Sunday - (int)today.DayOfWeek + 7) % 7;
            if (daysUntilSunday == 0) daysUntilSunday = 7; // If today is Sunday, get next Sunday
            return today.AddDays(daysUntilSunday);
        }
    }
}