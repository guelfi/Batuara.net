using System;
using Xunit;
using FluentAssertions;
using Batuara.Domain.Entities;
using Batuara.Domain.ValueObjects;
using Batuara.Domain.Events;

namespace Batuara.Domain.Tests.Entities
{
    public class CalendarAttendanceTests
    {
        [Fact]
        public void CalendarAttendance_WhenCreatedWithValidData_ShouldCreateSuccessfully()
        {
            // Arrange
            var attendanceDate = new EventDate(DateTime.Today.AddDays(7), TimeSpan.FromHours(19), TimeSpan.FromHours(21));
            var type = AttendanceType.Kardecismo;
            var description = "Atendimento Kardecista";
            var observations = "Trazer água";
            var requiresRegistration = true;
            var maxCapacity = 50;

            // Act
            var attendance = new CalendarAttendance(attendanceDate, type, description, observations, requiresRegistration, maxCapacity);

            // Assert
            attendance.AttendanceDate.Should().Be(attendanceDate);
            attendance.Type.Should().Be(type);
            attendance.Description.Should().Be(description);
            attendance.Observations.Should().Be(observations);
            attendance.RequiresRegistration.Should().Be(requiresRegistration);
            attendance.MaxCapacity.Should().Be(maxCapacity);
            attendance.IsActive.Should().BeTrue();
            attendance.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
            attendance.HasDomainEvents.Should().BeTrue();
            attendance.DomainEvents.Should().ContainSingle(e => e is CalendarAttendanceScheduledDomainEvent);
        }

        [Fact]
        public void CalendarAttendance_WhenCreatedWithNullAttendanceDate_ShouldThrowArgumentNullException()
        {
            // Arrange
            EventDate nullAttendanceDate = null!;
            var type = AttendanceType.Kardecismo;

            // Act & Assert
            var action = () => new CalendarAttendance(nullAttendanceDate, type);
            action.Should().Throw<ArgumentNullException>()
                .WithMessage("*attendanceDate*");
        }

        [Fact]
        public void CalendarAttendance_WhenCreatedWithoutTimeRange_ShouldThrowArgumentException()
        {
            // Arrange
            var attendanceDate = new EventDate(DateTime.Today.AddDays(7)); // All day event
            var type = AttendanceType.Kardecismo;

            // Act & Assert
            var action = () => new CalendarAttendance(attendanceDate, type);
            action.Should().Throw<ArgumentException>()
                .WithMessage("*Attendance must have start and end time*");
        }

        [Theory]
        [InlineData(-1)]
        [InlineData(0)]
        public void CalendarAttendance_WhenCreatedWithInvalidMaxCapacity_ShouldThrowArgumentException(int invalidCapacity)
        {
            // Arrange
            var attendanceDate = new EventDate(DateTime.Today.AddDays(7), TimeSpan.FromHours(19), TimeSpan.FromHours(21));
            var type = AttendanceType.Kardecismo;

            // Act & Assert
            var action = () => new CalendarAttendance(attendanceDate, type, maxCapacity: invalidCapacity);
            action.Should().Throw<ArgumentException>()
                .WithMessage("*Max capacity must be greater than zero*");
        }

        [Fact]
        public void UpdateDetails_WhenCalledWithValidData_ShouldUpdateSuccessfully()
        {
            // Arrange
            var attendance = CreateValidAttendance();
            var newDescription = "Updated Description";
            var newObservations = "Updated Observations";
            var originalUpdatedAt = attendance.UpdatedAt;

            // Act
            attendance.UpdateDetails(newDescription, newObservations);

            // Assert
            attendance.Description.Should().Be(newDescription);
            attendance.Observations.Should().Be(newObservations);
            attendance.UpdatedAt.Should().BeAfter(originalUpdatedAt);
        }

        [Fact]
        public void UpdateCapacity_WhenCalledWithValidData_ShouldUpdateSuccessfully()
        {
            // Arrange
            var attendance = CreateValidAttendance();
            var newMaxCapacity = 100;
            var newRequiresRegistration = true;
            var originalUpdatedAt = attendance.UpdatedAt;

            // Act
            attendance.UpdateCapacity(newMaxCapacity, newRequiresRegistration);

            // Assert
            attendance.MaxCapacity.Should().Be(newMaxCapacity);
            attendance.RequiresRegistration.Should().Be(newRequiresRegistration);
            attendance.UpdatedAt.Should().BeAfter(originalUpdatedAt);
        }

        [Theory]
        [InlineData(-1)]
        [InlineData(0)]
        public void UpdateCapacity_WhenCalledWithInvalidCapacity_ShouldThrowArgumentException(int invalidCapacity)
        {
            // Arrange
            var attendance = CreateValidAttendance();

            // Act & Assert
            var action = () => attendance.UpdateCapacity(invalidCapacity, false);
            action.Should().Throw<ArgumentException>()
                .WithMessage("*Max capacity must be greater than zero*");
        }

        [Fact]
        public void RescheduleAttendance_WhenCalledWithValidDate_ShouldUpdateSuccessfully()
        {
            // Arrange
            var attendance = CreateValidAttendance();
            var newAttendanceDate = new EventDate(DateTime.Today.AddDays(14), TimeSpan.FromHours(20), TimeSpan.FromHours(22));
            var originalUpdatedAt = attendance.UpdatedAt;

            // Act
            attendance.RescheduleAttendance(newAttendanceDate);

            // Assert
            attendance.AttendanceDate.Should().Be(newAttendanceDate);
            attendance.UpdatedAt.Should().BeAfter(originalUpdatedAt);
        }

        [Fact]
        public void RescheduleAttendance_WhenCalledWithNullDate_ShouldThrowArgumentNullException()
        {
            // Arrange
            var attendance = CreateValidAttendance();

            // Act & Assert
            var action = () => attendance.RescheduleAttendance(null!);
            action.Should().Throw<ArgumentNullException>();
        }

        [Fact]
        public void RescheduleAttendance_WhenCalledWithoutTimeRange_ShouldThrowArgumentException()
        {
            // Arrange
            var attendance = CreateValidAttendance();
            var allDayDate = new EventDate(DateTime.Today.AddDays(14));

            // Act & Assert
            var action = () => attendance.RescheduleAttendance(allDayDate);
            action.Should().Throw<ArgumentException>()
                .WithMessage("*Attendance must have start and end time*");
        }

        [Fact]
        public void IsToday_WhenAttendanceDateIsToday_ShouldReturnTrue()
        {
            // Arrange
            var todayDate = new EventDate(DateTime.Today, TimeSpan.FromHours(19), TimeSpan.FromHours(21));
            var attendance = new CalendarAttendance(todayDate, AttendanceType.Kardecismo);

            // Act & Assert
            attendance.IsToday().Should().BeTrue();
        }

        [Fact]
        public void IsToday_WhenAttendanceDateIsNotToday_ShouldReturnFalse()
        {
            // Arrange
            var tomorrowDate = new EventDate(DateTime.Today.AddDays(1), TimeSpan.FromHours(19), TimeSpan.FromHours(21));
            var attendance = new CalendarAttendance(tomorrowDate, AttendanceType.Kardecismo);

            // Act & Assert
            attendance.IsToday().Should().BeFalse();
        }

        [Fact]
        public void IsThisWeek_WhenAttendanceDateIsThisWeek_ShouldReturnTrue()
        {
            // Arrange
            var thisWeekDate = new EventDate(DateTime.Today.AddDays(2), TimeSpan.FromHours(19), TimeSpan.FromHours(21));
            var attendance = new CalendarAttendance(thisWeekDate, AttendanceType.Kardecismo);

            // Act & Assert
            attendance.IsThisWeek().Should().BeTrue();
        }

        [Fact]
        public void GetTypeDisplayName_ShouldReturnCorrectDisplayName()
        {
            // Arrange & Act & Assert
            var kardecismoAttendance = new CalendarAttendance(
                new EventDate(DateTime.Today.AddDays(7), TimeSpan.FromHours(19), TimeSpan.FromHours(21)),
                AttendanceType.Kardecismo);
            kardecismoAttendance.GetTypeDisplayName().Should().Be("Atendimento Kardecista");

            var umbandaAttendance = new CalendarAttendance(
                new EventDate(DateTime.Today.AddDays(7), TimeSpan.FromHours(20), TimeSpan.FromHours(22)),
                AttendanceType.Umbanda);
            umbandaAttendance.GetTypeDisplayName().Should().Be("Gira de Umbanda");
        }

        private static CalendarAttendance CreateValidAttendance()
        {
            return new CalendarAttendance(
                new EventDate(DateTime.Today.AddDays(7), TimeSpan.FromHours(19), TimeSpan.FromHours(21)),
                AttendanceType.Kardecismo,
                "Test Attendance",
                "Test Observations");
        }
    }
}