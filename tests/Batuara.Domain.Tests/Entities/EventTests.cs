using System;
using Xunit;
using FluentAssertions;
using Batuara.Domain.Entities;
using Batuara.Domain.ValueObjects;

namespace Batuara.Domain.Tests.Entities
{
    public class EventTests
    {
        [Fact]
        public void Event_WhenCreatedWithValidData_ShouldCreateSuccessfully()
        {
            // Arrange
            var title = "Festa de Yemanjá";
            var description = "Celebração em honra à Yemanjá";
            var eventDate = new EventDate(DateTime.Today.AddDays(7), TimeSpan.FromHours(19), TimeSpan.FromHours(22));
            var type = EventType.Festa;
            var location = "Casa de Caridade Batuara";

            // Act
            var eventEntity = new Event(title, description, eventDate, type, location);

            // Assert
            eventEntity.Title.Should().Be(title);
            eventEntity.Description.Should().Be(description);
            eventEntity.EventDate.Should().Be(eventDate);
            eventEntity.Type.Should().Be(type);
            eventEntity.Location.Should().Be(location);
            eventEntity.IsActive.Should().BeTrue();
            eventEntity.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        [InlineData(null)]
        public void Event_WhenCreatedWithInvalidTitle_ShouldThrowArgumentException(string invalidTitle)
        {
            // Arrange
            var description = "Valid description";
            var eventDate = new EventDate(DateTime.Today.AddDays(7));
            var type = EventType.Evento;

            // Act & Assert
            var action = () => new Event(invalidTitle, description, eventDate, type);
            action.Should().Throw<ArgumentException>()
                .WithMessage("*title*");
        }

        [Fact]
        public void Event_WhenCreatedWithTitleTooLong_ShouldThrowArgumentException()
        {
            // Arrange
            var longTitle = new string('A', 201);
            var description = "Valid description";
            var eventDate = new EventDate(DateTime.Today.AddDays(7));
            var type = EventType.Evento;

            // Act & Assert
            var action = () => new Event(longTitle, description, eventDate, type);
            action.Should().Throw<ArgumentException>()
                .WithMessage("*title*200*");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        [InlineData(null)]
        public void Event_WhenCreatedWithInvalidDescription_ShouldThrowArgumentException(string invalidDescription)
        {
            // Arrange
            var title = "Valid title";
            var eventDate = new EventDate(DateTime.Today.AddDays(7));
            var type = EventType.Evento;

            // Act & Assert
            var action = () => new Event(title, invalidDescription, eventDate, type);
            action.Should().Throw<ArgumentException>()
                .WithMessage("*description*");
        }

        [Fact]
        public void Event_WhenCreatedWithNullEventDate_ShouldThrowArgumentNullException()
        {
            // Arrange
            var title = "Valid title";
            var description = "Valid description";
            EventDate nullEventDate = null!;
            var type = EventType.Evento;

            // Act & Assert
            var action = () => new Event(title, description, nullEventDate, type);
            action.Should().Throw<ArgumentNullException>()
                .WithMessage("*eventDate*");
        }

        [Fact]
        public void UpdateDetails_WhenCalledWithValidData_ShouldUpdateSuccessfully()
        {
            // Arrange
            var eventEntity = CreateValidEvent();
            var newTitle = "Updated Title";
            var newDescription = "Updated Description";
            var newLocation = "Updated Location";
            var originalUpdatedAt = eventEntity.UpdatedAt;

            // Act
            eventEntity.UpdateDetails(newTitle, newDescription, newLocation);

            // Assert
            eventEntity.Title.Should().Be(newTitle);
            eventEntity.Description.Should().Be(newDescription);
            eventEntity.Location.Should().Be(newLocation);
            eventEntity.UpdatedAt.Should().BeAfter(originalUpdatedAt);
        }

        [Fact]
        public void UpdateEventDate_WhenCalledWithValidDate_ShouldUpdateSuccessfully()
        {
            // Arrange
            var eventEntity = CreateValidEvent();
            var newEventDate = new EventDate(DateTime.Today.AddDays(14), TimeSpan.FromHours(20));
            var originalUpdatedAt = eventEntity.UpdatedAt;

            // Act
            eventEntity.UpdateEventDate(newEventDate);

            // Assert
            eventEntity.EventDate.Should().Be(newEventDate);
            eventEntity.UpdatedAt.Should().BeAfter(originalUpdatedAt);
        }

        [Fact]
        public void UpdateEventDate_WhenCalledWithNullDate_ShouldThrowArgumentNullException()
        {
            // Arrange
            var eventEntity = CreateValidEvent();

            // Act & Assert
            var action = () => eventEntity.UpdateEventDate(null!);
            action.Should().Throw<ArgumentNullException>();
        }

        [Fact]
        public void IsUpcoming_WhenEventDateIsInFuture_ShouldReturnTrue()
        {
            // Arrange
            var futureDate = new EventDate(DateTime.Today.AddDays(7));
            var eventEntity = new Event("Title", "Description", futureDate, EventType.Evento);

            // Act & Assert
            eventEntity.IsUpcoming().Should().BeTrue();
        }

        [Fact]
        public void IsUpcoming_WhenEventDateIsInPast_ShouldReturnFalse()
        {
            // Arrange
            var pastDate = new EventDate(DateTime.Today.AddDays(-7));
            var eventEntity = new Event("Title", "Description", pastDate, EventType.Evento);

            // Act & Assert
            eventEntity.IsUpcoming().Should().BeFalse();
        }

        [Fact]
        public void IsThisMonth_WhenEventDateIsThisMonth_ShouldReturnTrue()
        {
            // Arrange
            var thisMonthDate = new EventDate(DateTime.Today.AddDays(5));
            var eventEntity = new Event("Title", "Description", thisMonthDate, EventType.Evento);

            // Act & Assert
            eventEntity.IsThisMonth().Should().BeTrue();
        }

        [Fact]
        public void Deactivate_WhenCalled_ShouldSetIsActiveToFalse()
        {
            // Arrange
            var eventEntity = CreateValidEvent();
            var originalUpdatedAt = eventEntity.UpdatedAt;

            // Act
            eventEntity.Deactivate();

            // Assert
            eventEntity.IsActive.Should().BeFalse();
            eventEntity.UpdatedAt.Should().BeAfter(originalUpdatedAt);
        }

        private static Event CreateValidEvent()
        {
            return new Event(
                "Test Event",
                "Test Description",
                new EventDate(DateTime.Today.AddDays(7)),
                EventType.Evento);
        }
    }
}