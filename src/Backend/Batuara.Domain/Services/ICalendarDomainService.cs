using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Batuara.Domain.Entities;

namespace Batuara.Domain.Services
{
    public interface ICalendarDomainService
    {
        /// <summary>
        /// Verifica se há conflito de horário entre atendimentos
        /// </summary>
        bool HasAttendanceConflict(CalendarAttendance existing, CalendarAttendance newAttendance);

        /// <summary>
        /// Verifica se um atendimento pode ser agendado
        /// </summary>
        Task<bool> CanScheduleAttendanceAsync(CalendarAttendance attendance, IEnumerable<CalendarAttendance> existingAttendances);

        /// <summary>
        /// Valida as regras de negócio para atendimentos
        /// </summary>
        (bool IsValid, string[] Errors) ValidateAttendanceBusinessRules(CalendarAttendance attendance);

        /// <summary>
        /// Sugere horários alternativos para um atendimento
        /// </summary>
        IEnumerable<DateTime> SuggestAlternativeAttendanceTimes(CalendarAttendance attendance, IEnumerable<CalendarAttendance> existingAttendances);

        /// <summary>
        /// Verifica se um dia é apropriado para um tipo de atendimento
        /// </summary>
        bool IsAppropriateDay(AttendanceType type, DayOfWeek dayOfWeek);

        /// <summary>
        /// Calcula a capacidade total de atendimentos para um período
        /// </summary>
        int CalculateTotalCapacity(IEnumerable<CalendarAttendance> attendances);

        /// <summary>
        /// Verifica se há sobreposição com eventos especiais
        /// </summary>
        Task<bool> HasConflictWithEventsAsync(CalendarAttendance attendance, IEnumerable<Event> events);

        /// <summary>
        /// Obtém os horários padrão para um tipo de atendimento
        /// </summary>
        (TimeSpan StartTime, TimeSpan EndTime) GetStandardTimes(AttendanceType type);
    }
}