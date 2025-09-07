using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Batuara.Domain.Entities;

namespace Batuara.Domain.Services
{
    public class EventDomainService : IEventDomainService
    {
        public bool HasTimeConflict(Event existingEvent, Event newEvent)
        {
            if (!existingEvent.IsActive || !newEvent.IsActive || existingEvent.Id == newEvent.Id)
                return false;

            // Se as datas são diferentes, não há conflito
            if (existingEvent.EventDate.Date.Date != newEvent.EventDate.Date.Date)
                return false;

            // Se algum dos eventos é o dia todo, há conflito
            if (existingEvent.EventDate.IsAllDay || newEvent.EventDate.IsAllDay)
                return true;

            // Se algum dos eventos não tem horário definido, não há conflito
            if (!existingEvent.EventDate.HasTimeRange || !newEvent.EventDate.HasTimeRange)
                return false;

            // Verifica sobreposição de horários
            var existingStart = existingEvent.EventDate.StartTime!.Value;
            var existingEnd = existingEvent.EventDate.EndTime!.Value;
            var newStart = newEvent.EventDate.StartTime!.Value;
            var newEnd = newEvent.EventDate.EndTime!.Value;

            return (newStart < existingEnd && newEnd > existingStart);
        }

        public async Task<bool> CanScheduleEventAsync(Event eventToSchedule, IEnumerable<Event> existingEvents)
        {
            await Task.CompletedTask; // Para manter a assinatura async

            var businessRulesValidation = ValidateEventBusinessRules(eventToSchedule);
            if (!businessRulesValidation.IsValid)
                return false;

            // Verifica conflitos de horário
            foreach (var existingEvent in existingEvents)
            {
                if (HasTimeConflict(existingEvent, eventToSchedule))
                    return false;
            }

            return true;
        }

        public DateTime GetNextAvailableDate(EventType eventType, IEnumerable<Event> existingEvents)
        {
            var startDate = DateTime.Today.AddDays(1); // Começar a partir de amanhã
            var preferredDays = GetPreferredDaysForEventType(eventType);
            
            for (int i = 0; i < 365; i++) // Procurar por até 1 ano
            {
                var candidateDate = startDate.AddDays(i);
                
                // Verificar se é um dia preferido para este tipo de evento
                if (!preferredDays.Contains(candidateDate.DayOfWeek))
                    continue;

                // Verificar se não há conflitos
                var hasConflict = existingEvents.Any(e => 
                    e.IsActive && 
                    e.EventDate.Date.Date == candidateDate.Date &&
                    (e.EventDate.IsAllDay || IsSpecialEvent(e)));

                if (!hasConflict)
                    return candidateDate;
            }

            return startDate.AddDays(7); // Fallback para próxima semana
        }

        public (bool IsValid, string[] Errors) ValidateEventBusinessRules(Event eventEntity)
        {
            var errors = new List<string>();

            // Regra: Eventos não podem ser agendados no passado
            if (eventEntity.EventDate.Date <= DateTime.Today)
            {
                errors.Add("Eventos não podem ser agendados no passado");
            }

            // Regra: Eventos devem ser agendados com pelo menos 24h de antecedência
            if (eventEntity.EventDate.Date < DateTime.Today.AddDays(1) && !IsSpecialEvent(eventEntity))
            {
                errors.Add("Eventos devem ser agendados com pelo menos 24 horas de antecedência");
            }

            // Regra: Festas devem ter duração mínima
            if (eventEntity.Type == EventType.Festa && eventEntity.EventDate.HasTimeRange)
            {
                var duration = eventEntity.EventDate.EndTime!.Value - eventEntity.EventDate.StartTime!.Value;
                if (duration < TimeSpan.FromHours(2))
                {
                    errors.Add("Festas devem ter duração mínima de 2 horas");
                }
            }

            // Regra: Palestras devem ter horário definido
            if (eventEntity.Type == EventType.Palestra && !eventEntity.EventDate.HasTimeRange)
            {
                errors.Add("Palestras devem ter horário de início e fim definidos");
            }

            // Regra: Eventos aos domingos devem ser após 14h (para não conflitar com atendimentos)
            if (eventEntity.EventDate.Date.DayOfWeek == DayOfWeek.Sunday && 
                eventEntity.EventDate.StartTime.HasValue && 
                eventEntity.EventDate.StartTime.Value < TimeSpan.FromHours(14))
            {
                errors.Add("Eventos aos domingos devem ser agendados após 14h");
            }

            return (IsValid: errors.Count == 0, Errors: errors.ToArray());
        }

        public IEnumerable<DateTime> SuggestAlternativeDates(Event eventEntity, IEnumerable<Event> existingEvents, int maxSuggestions = 5)
        {
            var suggestions = new List<DateTime>();
            var originalDate = eventEntity.EventDate.Date;
            var preferredDays = GetPreferredDaysForEventType(eventEntity.Type);

            // Sugerir datas próximas à data original
            for (int i = 1; i <= 30 && suggestions.Count < maxSuggestions; i++)
            {
                var candidateDate = originalDate.AddDays(i);
                
                if (!preferredDays.Contains(candidateDate.DayOfWeek))
                    continue;

                var testEvent = new Event(
                    eventEntity.Title,
                    eventEntity.Description,
                    new Domain.ValueObjects.EventDate(candidateDate, eventEntity.EventDate.StartTime, eventEntity.EventDate.EndTime),
                    eventEntity.Type,
                    eventEntity.Location,
                    eventEntity.ImageUrl
                );

                if (CanScheduleEventAsync(testEvent, existingEvents).Result)
                {
                    suggestions.Add(candidateDate);
                }
            }

            return suggestions;
        }

        public bool IsSpecialEvent(Event eventEntity)
        {
            return eventEntity.Type == EventType.Festa || 
                   eventEntity.Type == EventType.Celebracao ||
                   eventEntity.Title.ToLower().Contains("festa") ||
                   eventEntity.Title.ToLower().Contains("celebração") ||
                   eventEntity.Title.ToLower().Contains("aniversário");
        }

        public TimeSpan GetEstimatedDuration(EventType eventType)
        {
            return eventType switch
            {
                EventType.Festa => TimeSpan.FromHours(4),
                EventType.Celebracao => TimeSpan.FromHours(3),
                EventType.Palestra => TimeSpan.FromHours(2),
                EventType.Bazar => TimeSpan.FromHours(6),
                EventType.Evento => TimeSpan.FromHours(2),
                _ => TimeSpan.FromHours(2)
            };
        }

        private static DayOfWeek[] GetPreferredDaysForEventType(EventType eventType)
        {
            return eventType switch
            {
                EventType.Festa => new[] { DayOfWeek.Saturday, DayOfWeek.Sunday },
                EventType.Celebracao => new[] { DayOfWeek.Saturday, DayOfWeek.Sunday },
                EventType.Palestra => new[] { DayOfWeek.Tuesday, DayOfWeek.Thursday, DayOfWeek.Saturday },
                EventType.Bazar => new[] { DayOfWeek.Saturday, DayOfWeek.Sunday },
                EventType.Evento => new[] { DayOfWeek.Tuesday, DayOfWeek.Thursday, DayOfWeek.Saturday, DayOfWeek.Sunday },
                _ => new[] { DayOfWeek.Saturday, DayOfWeek.Sunday }
            };
        }
    }
}