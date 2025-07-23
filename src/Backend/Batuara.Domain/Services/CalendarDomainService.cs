using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Batuara.Domain.Entities;

namespace Batuara.Domain.Services
{
    public class CalendarDomainService : ICalendarDomainService
    {
        public bool HasAttendanceConflict(CalendarAttendance existing, CalendarAttendance newAttendance)
        {
            if (!existing.IsActive || existing.Id == newAttendance.Id)
                return false;

            // Se as datas são diferentes, não há conflito
            if (existing.AttendanceDate.Date.Date != newAttendance.AttendanceDate.Date.Date)
                return false;

            // Verifica sobreposição de horários
            var existingStart = existing.AttendanceDate.StartTime!.Value;
            var existingEnd = existing.AttendanceDate.EndTime!.Value;
            var newStart = newAttendance.AttendanceDate.StartTime!.Value;
            var newEnd = newAttendance.AttendanceDate.EndTime!.Value;

            return (newStart < existingEnd && newEnd > existingStart);
        }

        public async Task<bool> CanScheduleAttendanceAsync(CalendarAttendance attendance, IEnumerable<CalendarAttendance> existingAttendances)
        {
            await Task.CompletedTask; // Para manter a assinatura async

            var businessRulesValidation = ValidateAttendanceBusinessRules(attendance);
            if (!businessRulesValidation.IsValid)
                return false;

            // Verifica conflitos de horário
            foreach (var existingAttendance in existingAttendances)
            {
                if (HasAttendanceConflict(existingAttendance, attendance))
                    return false;
            }

            return true;
        }

        public (bool IsValid, string[] Errors) ValidateAttendanceBusinessRules(CalendarAttendance attendance)
        {
            var errors = new List<string>();

            // Regra: Atendimentos não podem ser no passado
            if (attendance.AttendanceDate.Date < DateTime.Today)
            {
                errors.Add("Atendimentos não podem ser agendados no passado");
            }

            // Regra: Verificar se o dia é apropriado para o tipo de atendimento
            if (!IsAppropriateDay(attendance.Type, attendance.AttendanceDate.Date.DayOfWeek))
            {
                errors.Add($"O dia {attendance.AttendanceDate.Date.DayOfWeek} não é apropriado para {attendance.GetTypeDisplayName()}");
            }

            // Regra: Horários devem estar dentro dos limites permitidos
            var (minStart, maxEnd) = GetAllowedTimeRange(attendance.Type);
            if (attendance.AttendanceDate.StartTime < minStart || attendance.AttendanceDate.EndTime > maxEnd)
            {
                errors.Add($"Horário deve estar entre {minStart:hh\\:mm} e {maxEnd:hh\\:mm} para {attendance.GetTypeDisplayName()}");
            }

            // Regra: Duração mínima e máxima
            var duration = attendance.AttendanceDate.EndTime!.Value - attendance.AttendanceDate.StartTime!.Value;
            var (minDuration, maxDuration) = GetDurationLimits(attendance.Type);
            
            if (duration < minDuration)
            {
                errors.Add($"Duração mínima para {attendance.GetTypeDisplayName()} é {minDuration.TotalHours} horas");
            }
            
            if (duration > maxDuration)
            {
                errors.Add($"Duração máxima para {attendance.GetTypeDisplayName()} é {maxDuration.TotalHours} horas");
            }

            // Regra: Capacidade deve ser razoável
            if (attendance.MaxCapacity.HasValue && attendance.MaxCapacity <= 0)
            {
                errors.Add("Capacidade máxima deve ser maior que zero");
            }

            if (attendance.MaxCapacity.HasValue && attendance.MaxCapacity > 200)
            {
                errors.Add("Capacidade máxima não pode exceder 200 pessoas");
            }

            return (errors.Count == 0, errors.ToArray());
        }

        public IEnumerable<DateTime> SuggestAlternativeAttendanceTimes(CalendarAttendance attendance, IEnumerable<CalendarAttendance> existingAttendances)
        {
            var suggestions = new List<DateTime>();
            var originalDate = attendance.AttendanceDate.Date;
            var appropriateDays = GetAppropriateDays(attendance.Type);

            // Sugerir datas próximas à data original
            for (int i = 1; i <= 30 && suggestions.Count < 5; i++)
            {
                var candidateDate = originalDate.AddDays(i);
                
                if (!appropriateDays.Contains(candidateDate.DayOfWeek))
                    continue;

                var testAttendance = new CalendarAttendance(
                    new Domain.ValueObjects.EventDate(candidateDate, attendance.AttendanceDate.StartTime, attendance.AttendanceDate.EndTime),
                    attendance.Type,
                    attendance.Description,
                    attendance.Observations,
                    attendance.RequiresRegistration,
                    attendance.MaxCapacity
                );

                if (CanScheduleAttendanceAsync(testAttendance, existingAttendances).Result)
                {
                    suggestions.Add(candidateDate);
                }
            }

            return suggestions;
        }

        public bool IsAppropriateDay(AttendanceType type, DayOfWeek dayOfWeek)
        {
            var appropriateDays = GetAppropriateDays(type);
            return appropriateDays.Contains(dayOfWeek);
        }

        public int CalculateTotalCapacity(IEnumerable<CalendarAttendance> attendances)
        {
            return attendances
                .Where(a => a.IsActive && a.MaxCapacity.HasValue)
                .Sum(a => a.MaxCapacity!.Value);
        }

        public async Task<bool> HasConflictWithEventsAsync(CalendarAttendance attendance, IEnumerable<Event> events)
        {
            await Task.CompletedTask; // Para manter a assinatura async

            var conflictingEvents = events.Where(e => 
                e.IsActive && 
                e.EventDate.Date.Date == attendance.AttendanceDate.Date.Date);

            foreach (var eventEntity in conflictingEvents)
            {
                // Se o evento é o dia todo, há conflito
                if (eventEntity.EventDate.IsAllDay)
                    return true;

                // Se o evento tem horário definido, verificar sobreposição
                if (eventEntity.EventDate.HasTimeRange)
                {
                    var eventStart = eventEntity.EventDate.StartTime!.Value;
                    var eventEnd = eventEntity.EventDate.EndTime!.Value;
                    var attendanceStart = attendance.AttendanceDate.StartTime!.Value;
                    var attendanceEnd = attendance.AttendanceDate.EndTime!.Value;

                    if (attendanceStart < eventEnd && attendanceEnd > eventStart)
                        return true;
                }
            }

            return false;
        }

        public (TimeSpan StartTime, TimeSpan EndTime) GetStandardTimes(AttendanceType type)
        {
            return type switch
            {
                AttendanceType.Kardecismo => (TimeSpan.FromHours(19), TimeSpan.FromHours(21)), // 19h às 21h
                AttendanceType.Umbanda => (TimeSpan.FromHours(20), TimeSpan.FromHours(22)), // 20h às 22h
                AttendanceType.Palestra => (TimeSpan.FromHours(19), TimeSpan.FromHours(21)), // 19h às 21h
                AttendanceType.Curso => (TimeSpan.FromHours(14), TimeSpan.FromHours(17)), // 14h às 17h
                _ => (TimeSpan.FromHours(19), TimeSpan.FromHours(21))
            };
        }

        private static DayOfWeek[] GetAppropriateDays(AttendanceType type)
        {
            return type switch
            {
                AttendanceType.Kardecismo => new[] { DayOfWeek.Tuesday, DayOfWeek.Thursday, DayOfWeek.Sunday },
                AttendanceType.Umbanda => new[] { DayOfWeek.Friday, DayOfWeek.Saturday },
                AttendanceType.Palestra => new[] { DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Saturday },
                AttendanceType.Curso => new[] { DayOfWeek.Saturday, DayOfWeek.Sunday },
                _ => new[] { DayOfWeek.Tuesday, DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday, DayOfWeek.Sunday }
            };
        }

        private static (TimeSpan MinStart, TimeSpan MaxEnd) GetAllowedTimeRange(AttendanceType type)
        {
            return type switch
            {
                AttendanceType.Kardecismo => (TimeSpan.FromHours(18), TimeSpan.FromHours(22)),
                AttendanceType.Umbanda => (TimeSpan.FromHours(19), TimeSpan.FromHours(23)),
                AttendanceType.Palestra => (TimeSpan.FromHours(14), TimeSpan.FromHours(22)),
                AttendanceType.Curso => (TimeSpan.FromHours(8), TimeSpan.FromHours(18)),
                _ => (TimeSpan.FromHours(14), TimeSpan.FromHours(22))
            };
        }

        private static (TimeSpan MinDuration, TimeSpan MaxDuration) GetDurationLimits(AttendanceType type)
        {
            return type switch
            {
                AttendanceType.Kardecismo => (TimeSpan.FromHours(1.5), TimeSpan.FromHours(3)),
                AttendanceType.Umbanda => (TimeSpan.FromHours(2), TimeSpan.FromHours(4)),
                AttendanceType.Palestra => (TimeSpan.FromHours(1), TimeSpan.FromHours(3)),
                AttendanceType.Curso => (TimeSpan.FromHours(2), TimeSpan.FromHours(8)),
                _ => (TimeSpan.FromHours(1), TimeSpan.FromHours(4))
            };
        }
    }
}