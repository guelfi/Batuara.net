using System;
using Xunit;
using FluentAssertions;
using Batuara.Domain.ValueObjects;

namespace Batuara.Domain.Tests.ValueObjects
{
    public class EventDateTests
    {
        [Fact]
        public void EventDate_WhenCreatedWithValidDate_ShouldCreateSuccessfully()
        {
            // Arrange
            var date = DateTime.Today.AddDays(7);
            var startTime = TimeSpan.FromHours(19);
            var endTime = TimeSpan.FromHours(22);

            // Act
            var eventDate = new EventDate(date, startTime, endTime);

            // Assert
            eventDate.Date.Should().Be(date.Date);
            eventDate.StartTime.Should().Be(startTime);
            eventDate.EndTime.Should().Be(endTime);
            eventDate.HasTimeRange.Should().BeTrue();
            eventDate.IsAllDay.Should().BeFalse();
        }

        [Fact]
        public void EventDate_WhenCreatedWithDateOnly_ShouldCreateAllDayEvent()
        {
            // Arrange
            var date = DateTime.Today.AddDays(7);

            // Act
            var eventDate = new EventDate(date);

            // Assert
            eventDate.Date.Should().Be(date.Date);
            eventDate.StartTime.Should().BeNull();
            eventDate.EndTime.Should().BeNull();
            eventDate.IsAllDay.Should().BeTrue();
            eventDate.HasTimeRange.Should().BeFalse();
        }

        [Fact]
        public void EventDate_WhenStartTimeIsAfterEndTime_ShouldThrowArgumentException()
        {
            // Arrange
            var date = DateTime.Today.AddDays(7);
            var startTime = TimeSpan.FromHours(22);
            var endTime = TimeSpan.FromHours(19);

            // Act & Assert
            var action = () => new EventDate(date, startTime, endTime);
            action.Should().Throw<ArgumentException>()
                .WithMessage("*Start time must be before end time*");
        }

        [Fact]
        public void EventDate_WhenStartTimeIsEqualToEndTime_ShouldThrowArgumentException()
        {
            // Arrange
            var date = DateTime.Today.AddDays(7);
            var time = TimeSpan.FromHours(19);

            // Act & Assert
            var action = () => new EventDate(date, time, time);
            action.Should().Throw<ArgumentException>()
                .WithMessage("*Start time must be before end time*");
        }

        [Theory]
        [InlineData(-1)]
        [InlineData(24)]
        [InlineData(25)]
        public void EventDate_WhenStartTimeIsInvalid_ShouldThrowArgumentException(int hours)
        {
            // Arrange
            var date = DateTime.Today.AddDays(7);
            var invalidStartTime = TimeSpan.FromHours(hours);
            var endTime = TimeSpan.FromHours(22);

            // Act & Assert
            var action = () => new EventDate(date, invalidStartTime, endTime);
            action.Should().Throw<ArgumentException>()
                .WithMessage("*Start time must be between 00:00 and 23:59*");
        }

        [Theory]
        [InlineData(-1)]
        [InlineData(24)]
        [InlineData(25)]
        public void EventDate_WhenEndTimeIsInvalid_ShouldThrowArgumentException(int hours)
        {
            // Arrange
            var date = DateTime.Today.AddDays(7);
            var startTime = TimeSpan.FromHours(19);
            var invalidEndTime = TimeSpan.FromHours(hours);

            // Act & Assert
            var action = () => new EventDate(date, startTime, invalidEndTime);
            action.Should().Throw<ArgumentException>()
                .WithMessage("*End time must be between 00:00 and 23:59*");
        }

        [Fact]
        public void EventDate_WhenCreatedWithDefaultDate_ShouldThrowArgumentException()
        {
            // Arrange
            var defaultDate = default(DateTime);

            // Act & Assert
            var action = () => new EventDate(defaultDate);
            action.Should().Throw<ArgumentException>()
                .WithMessage("*Event date cannot be default value*");
        }

        [Fact]
        public void GetFormattedTime_WhenIsAllDay_ShouldReturnAllDayMessage()
        {
            // Arrange
            var eventDate = new EventDate(DateTime.Today.AddDays(7));

            // Act
            var formattedTime = eventDate.GetFormattedTime();

            // Assert
            formattedTime.Should().Be("Todo o dia");
        }

        [Fact]
        public void GetFormattedTime_WhenHasTimeRange_ShouldReturnFormattedRange()
        {
            // Arrange
            var eventDate = new EventDate(
                DateTime.Today.AddDays(7),
                TimeSpan.FromHours(19),
                TimeSpan.FromHours(22));

            // Act
            var formattedTime = eventDate.GetFormattedTime();

            // Assert
            formattedTime.Should().Be("19:00 - 22:00");
        }

        [Fact]
        public void GetFormattedTime_WhenHasOnlyStartTime_ShouldReturnStartTimeMessage()
        {
            // Arrange
            var eventDate = new EventDate(
                DateTime.Today.AddDays(7),
                TimeSpan.FromHours(19));

            // Act
            var formattedTime = eventDate.GetFormattedTime();

            // Assert
            formattedTime.Should().Be("A partir das 19:00");
        }

        [Fact]
        public void Equals_WhenComparingEqualEventDates_ShouldReturnTrue()
        {
            // Arrange
            var date = DateTime.Today.AddDays(7);
            var startTime = TimeSpan.FromHours(19);
            var endTime = TimeSpan.FromHours(22);
            
            var eventDate1 = new EventDate(date, startTime, endTime);
            var eventDate2 = new EventDate(date, startTime, endTime);

            // Act & Assert
            eventDate1.Equals(eventDate2).Should().BeTrue();
            (eventDate1 == eventDate2).Should().BeTrue();
            eventDate1.GetHashCode().Should().Be(eventDate2.GetHashCode());
        }

        [Fact]
        public void Equals_WhenComparingDifferentEventDates_ShouldReturnFalse()
        {
            // Arrange
            var eventDate1 = new EventDate(DateTime.Today.AddDays(7), TimeSpan.FromHours(19));
            var eventDate2 = new EventDate(DateTime.Today.AddDays(8), TimeSpan.FromHours(19));

            // Act & Assert
            eventDate1.Equals(eventDate2).Should().BeFalse();
            (eventDate1 != eventDate2).Should().BeTrue();
        }

        [Fact]
        public void Equals_WhenComparingWithNull_ShouldReturnFalse()
        {
            // Arrange
            var eventDate = new EventDate(DateTime.Today.AddDays(7));

            // Act & Assert
            eventDate.Equals(null).Should().BeFalse();
            (eventDate == null).Should().BeFalse();
            (eventDate != null).Should().BeTrue();
        }
    }
}