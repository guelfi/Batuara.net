using System;
using System.Threading.Tasks;
using Batuara.Application.Calendar.Models;
using Batuara.Domain.Entities;
using Batuara.Domain.Services;
using Batuara.Infrastructure.Calendar.Services;
using Batuara.Infrastructure.Data;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Batuara.Infrastructure.Tests.Calendar
{
    public class CalendarAttendanceServiceTests
    {
        private static BatuaraDbContext CreateInMemoryDb()
        {
            var options = new DbContextOptionsBuilder<BatuaraDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new BatuaraDbContext(options);
        }

        [Fact]
        public async Task Create_Should_ReturnConflict_When_EventOverlaps()
        {
            await using var db = CreateInMemoryDb();
            var conflictDate = GetNextDay(DayOfWeek.Saturday);
            db.Events.Add(new Event(
                "Evento Especial",
                "Descrição",
                new Domain.ValueObjects.EventDate(conflictDate, TimeSpan.FromHours(19), TimeSpan.FromHours(21)),
                EventType.Evento));
            await db.SaveChangesAsync();

            var service = new CalendarAttendanceService(db, new CalendarDomainService());
            var request = new CreateCalendarAttendanceRequest
            {
                Date = conflictDate,
                StartTime = TimeSpan.FromHours(20),
                EndTime = TimeSpan.FromHours(22),
                Type = AttendanceType.Palestra
            };

            var (attendance, errors, conflict) = await service.CreateAsync(request);

            attendance.Should().BeNull();
            conflict.Should().BeTrue();
            errors.Should().ContainSingle();
        }

        private static DateTime GetNextDay(DayOfWeek dayOfWeek)
        {
            var date = DateTime.Today.AddDays(1);
            while (date.DayOfWeek != dayOfWeek)
            {
                date = date.AddDays(1);
            }

            return date;
        }
    }
}
