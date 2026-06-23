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

        [Fact]
        public async Task Update_Should_Be_Denied_When_Less_Than_3_Days_Before_Scheduled_Date_And_Schedule_Changing()
        {
            await using var db = CreateInMemoryDb();
            var attendanceDate = DateTime.Today.AddDays(2);
            var entity = new CalendarAttendance(
                new Domain.ValueObjects.EventDate(attendanceDate, TimeSpan.FromHours(19), TimeSpan.FromHours(21)),
                AttendanceType.Palestra,
                "Descrição",
                "Obs",
                false,
                null);
            db.CalendarAttendances.Add(entity);
            await db.SaveChangesAsync();

            var service = new CalendarAttendanceService(db, new CalendarDomainService());
            var request = new UpdateCalendarAttendanceRequest
            {
                StartTime = TimeSpan.FromHours(20)
            };

            var (updated, errors, conflict) = await service.UpdateAsync(entity.Id, request);

            updated.Should().BeNull();
            conflict.Should().BeFalse();
            errors.Should().ContainSingle()
                .Which.Should().Contain("menos de 3 dias");
        }

        [Fact]
        public async Task Update_Should_Allow_NonSchedule_Changes_When_Less_Than_3_Days_Before_Scheduled_Date()
        {
            await using var db = CreateInMemoryDb();
            var attendanceDate = DateTime.Today.AddDays(2);
            var entity = new CalendarAttendance(
                new Domain.ValueObjects.EventDate(attendanceDate, TimeSpan.FromHours(19), TimeSpan.FromHours(21)),
                AttendanceType.Palestra,
                "Descrição",
                "Obs",
                false,
                null);
            db.CalendarAttendances.Add(entity);
            await db.SaveChangesAsync();

            var service = new CalendarAttendanceService(db, new CalendarDomainService());
            var request = new UpdateCalendarAttendanceRequest
            {
                Description = "Nova descrição"
            };

            var (updated, errors, conflict) = await service.UpdateAsync(entity.Id, request);

            updated.Should().NotBeNull();
            conflict.Should().BeFalse();
            errors.Should().BeEmpty();
            updated!.Description.Should().Be("Nova descrição");
        }

        [Fact]
        public async Task Update_Should_Succeed_When_At_Least_3_Days_Before_Scheduled_Date()
        {
            await using var db = CreateInMemoryDb();
            var attendanceDate = GetNextDayFrom(DateTime.Today.AddDays(3), DayOfWeek.Saturday);
            var entity = new CalendarAttendance(
                new Domain.ValueObjects.EventDate(attendanceDate, TimeSpan.FromHours(19), TimeSpan.FromHours(21)),
                AttendanceType.Palestra,
                "Descrição",
                "Obs",
                false,
                null);
            db.CalendarAttendances.Add(entity);
            await db.SaveChangesAsync();

            var service = new CalendarAttendanceService(db, new CalendarDomainService());
            var request = new UpdateCalendarAttendanceRequest
            {
                Description = "Nova descrição"
            };

            var (updated, errors, conflict) = await service.UpdateAsync(entity.Id, request);

            updated.Should().NotBeNull();
            conflict.Should().BeFalse();
            errors.Should().BeEmpty();
            updated!.Description.Should().Be("Nova descrição");
        }

        [Fact]
        public async Task Update_Should_Return_Weekday_In_Portuguese_When_Day_Is_Not_Appropriate()
        {
            await using var db = CreateInMemoryDb();
            var attendanceDate = GetNextDayFrom(DateTime.Today.AddDays(3), DayOfWeek.Monday);
            var entity = new CalendarAttendance(
                new Domain.ValueObjects.EventDate(attendanceDate, TimeSpan.FromHours(19), TimeSpan.FromHours(21)),
                AttendanceType.Palestra,
                "Descrição",
                "Obs",
                false,
                null);
            db.CalendarAttendances.Add(entity);
            await db.SaveChangesAsync();

            var service = new CalendarAttendanceService(db, new CalendarDomainService());
            var request = new UpdateCalendarAttendanceRequest
            {
                StartTime = TimeSpan.FromHours(19).Add(TimeSpan.FromMinutes(30))
            };

            var (updated, errors, conflict) = await service.UpdateAsync(entity.Id, request);

            updated.Should().BeNull();
            conflict.Should().BeFalse();
            errors.Should().ContainSingle();
            errors[0].Should().NotContain("Monday").And.Contain("segunda");
        }

        [Fact]
        public async Task Update_Should_Allow_NonSchedule_Changes_Even_When_Existing_Date_Is_Not_Appropriate()
        {
            await using var db = CreateInMemoryDb();
            var attendanceDate = GetNextDayFrom(DateTime.Today.AddDays(5), DayOfWeek.Monday);
            var entity = new CalendarAttendance(
                new Domain.ValueObjects.EventDate(attendanceDate, TimeSpan.FromHours(19), TimeSpan.FromHours(21)),
                AttendanceType.Kardecismo,
                "Descrição",
                null,
                false,
                null);
            db.CalendarAttendances.Add(entity);
            await db.SaveChangesAsync();

            var service = new CalendarAttendanceService(db, new CalendarDomainService());
            var request = new UpdateCalendarAttendanceRequest
            {
                Observations = "Atualizado"
            };

            var (updated, errors, conflict) = await service.UpdateAsync(entity.Id, request);

            updated.Should().NotBeNull();
            conflict.Should().BeFalse();
            errors.Should().BeEmpty();
            updated!.Observations.Should().Be("Atualizado");
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

        private static DateTime GetNextDayFrom(DateTime startDate, DayOfWeek dayOfWeek)
        {
            var date = startDate.Date;
            while (date.DayOfWeek != dayOfWeek)
            {
                date = date.AddDays(1);
            }

            return date;
        }
    }
}
