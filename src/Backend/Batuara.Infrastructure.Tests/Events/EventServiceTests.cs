using System;
using System.Linq;
using System.Threading.Tasks;
using Batuara.Application.Events.Models;
using Batuara.Domain.Entities;
using Batuara.Domain.Services;
using Batuara.Infrastructure.Data;
using Batuara.Infrastructure.Events.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Batuara.Infrastructure.Tests.Events
{
    public class EventServiceTests
    {
        private static BatuaraDbContext CreateInMemoryDb()
        {
            var options = new DbContextOptionsBuilder<BatuaraDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new BatuaraDbContext(options);
        }

        private static DateTime GetNextWeekdayUtc(DayOfWeek dayOfWeek)
        {
            var date = DateTime.Today.AddDays(1);
            while (date.DayOfWeek != dayOfWeek)
            {
                date = date.AddDays(1);
            }

            return DateTime.SpecifyKind(date, DateTimeKind.Utc);
        }

        [Fact]
        public async Task Create_Should_Return_Conflict_When_Overlapping_Times()
        {
            var db = CreateInMemoryDb();
            var service = new EventService(db, new EventDomainService());
            var eventDate = GetNextWeekdayUtc(DayOfWeek.Tuesday);

            db.Events.Add(new Event(
                "Evento Existente",
                "Descricao",
                new Domain.ValueObjects.EventDate(eventDate, TimeSpan.FromHours(10), TimeSpan.FromHours(11)),
                EventType.Evento
            ));
            await db.SaveChangesAsync();

            var request = new CreateEventRequest
            {
                Title = "Novo",
                Description = "Desc",
                Date = eventDate,
                StartTime = TimeSpan.FromHours(10).Add(TimeSpan.FromMinutes(30)),
                EndTime = TimeSpan.FromHours(11).Add(TimeSpan.FromMinutes(30)),
                Type = EventType.Evento
            };

            var (created, errors, conflict) = await service.CreateAsync(request);

            created.Should().BeNull();
            conflict.Should().BeTrue();
            errors.Should().NotBeEmpty();
        }

        [Fact]
        public async Task Create_And_GetPublic_Should_Succeed()
        {
            var db = CreateInMemoryDb();
            var service = new EventService(db, new EventDomainService());
            var eventDate = GetNextWeekdayUtc(DayOfWeek.Wednesday);

            var request = new CreateEventRequest
            {
                Title = "Palestra ABC",
                Description = "Descricao",
                Date = eventDate,
                StartTime = TimeSpan.FromHours(19),
                EndTime = TimeSpan.FromHours(21),
                Type = EventType.Palestra,
                Location = "Sede"
            };

            var (created, errors, conflict) = await service.CreateAsync(request);
            conflict.Should().BeFalse();
            errors.Should().BeEmpty();
            created.Should().NotBeNull();

            var publicList = await service.GetPublicAsync("ABC", null, null, null, 1, 10, null);
            publicList.TotalCount.Should().Be(1);
            publicList.Data.Should().HaveCount(1);
            publicList.Data.First().Title.Should().Contain("Palestra");
        }

        [Fact]
        public async Task Update_Should_Be_Denied_When_Less_Than_3_Days_Before_Scheduled_Date_And_Schedule_Changing()
        {
            var db = CreateInMemoryDb();
            var service = new EventService(db, new EventDomainService());
            var eventDate = DateTime.SpecifyKind(DateTime.Today.AddDays(2), DateTimeKind.Utc);

            var entity = new Event(
                "Evento",
                "Descricao",
                new Domain.ValueObjects.EventDate(eventDate, TimeSpan.FromHours(15), TimeSpan.FromHours(16)),
                EventType.Evento);
            db.Events.Add(entity);
            await db.SaveChangesAsync();

            var request = new UpdateEventRequest
            {
                Date = eventDate.AddDays(1)
            };

            var (updated, errors, conflict) = await service.UpdateAsync(entity.Id, request, isPatch: true);

            updated.Should().BeNull();
            conflict.Should().BeFalse();
            errors.Should().ContainSingle()
                .Which.Should().Contain("menos de 3 dias");
        }

        [Fact]
        public async Task Update_Should_Allow_NonSchedule_Changes_When_Less_Than_3_Days_Before_Scheduled_Date()
        {
            var db = CreateInMemoryDb();
            var service = new EventService(db, new EventDomainService());
            var eventDate = DateTime.SpecifyKind(DateTime.Today.AddDays(2), DateTimeKind.Utc);

            var entity = new Event(
                "Evento",
                "Descricao",
                new Domain.ValueObjects.EventDate(eventDate, TimeSpan.FromHours(15), TimeSpan.FromHours(16)),
                EventType.Evento);
            db.Events.Add(entity);
            await db.SaveChangesAsync();

            var request = new UpdateEventRequest
            {
                Title = "Evento alterado",
                CardColor = "#ff0000"
            };

            var (updated, errors, conflict) = await service.UpdateAsync(entity.Id, request, isPatch: true);

            updated.Should().NotBeNull();
            conflict.Should().BeFalse();
            errors.Should().BeEmpty();
            updated!.Title.Should().Be("Evento alterado");
        }

        [Fact]
        public async Task Update_Should_Succeed_When_At_Least_3_Days_Before_Scheduled_Date()
        {
            var db = CreateInMemoryDb();
            var service = new EventService(db, new EventDomainService());
            var eventDate = DateTime.SpecifyKind(DateTime.Today.AddDays(10), DateTimeKind.Utc);

            var entity = new Event(
                "Evento",
                "Descricao",
                new Domain.ValueObjects.EventDate(eventDate, TimeSpan.FromHours(15), TimeSpan.FromHours(16)),
                EventType.Evento);
            db.Events.Add(entity);
            await db.SaveChangesAsync();

            var request = new UpdateEventRequest
            {
                Title = "Evento alterado"
            };

            var (updated, errors, conflict) = await service.UpdateAsync(entity.Id, request, isPatch: true);

            updated.Should().NotBeNull();
            conflict.Should().BeFalse();
            errors.Should().BeEmpty();
            updated!.Title.Should().Be("Evento alterado");
        }

        [Fact]
        public async Task Update_Should_Allow_NonSchedule_Changes_Even_When_Existing_Event_Violates_Schedule_Rule()
        {
            var db = CreateInMemoryDb();
            var service = new EventService(db, new EventDomainService());
            var eventDate = DateTime.SpecifyKind(DateTime.Today.AddDays(10), DateTimeKind.Utc);

            var entity = new Event(
                "Evento",
                "Descricao",
                new Domain.ValueObjects.EventDate(eventDate, TimeSpan.FromHours(10), TimeSpan.FromHours(11)),
                EventType.Evento);
            db.Events.Add(entity);
            await db.SaveChangesAsync();

            var request = new UpdateEventRequest
            {
                Description = "Descricao atualizada"
            };

            var (updated, errors, conflict) = await service.UpdateAsync(entity.Id, request, isPatch: true);

            updated.Should().NotBeNull();
            conflict.Should().BeFalse();
            errors.Should().BeEmpty();
            updated!.Description.Should().Be("Descricao atualizada");
        }
    }
}
