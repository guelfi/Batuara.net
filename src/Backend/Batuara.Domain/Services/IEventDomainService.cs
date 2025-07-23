using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Batuara.Domain.Entities;

namespace Batuara.Domain.Services
{
    public interface IEventDomainService
    {
        /// <summary>
        /// Verifica se há conflito de horário entre eventos
        /// </summary>
        bool HasTimeConflict(Event existingEvent, Event newEvent);

        /// <summary>
        /// Verifica se um evento pode ser agendado na data especificada
        /// </summary>
        Task<bool> CanScheduleEventAsync(Event eventToSchedule, IEnumerable<Event> existingEvents);

        /// <summary>
        /// Calcula a próxima data disponível para um tipo de evento
        /// </summary>
        DateTime GetNextAvailableDate(EventType eventType, IEnumerable<Event> existingEvents);

        /// <summary>
        /// Valida se um evento está dentro das regras de negócio da casa
        /// </summary>
        (bool IsValid, string[] Errors) ValidateEventBusinessRules(Event eventEntity);

        /// <summary>
        /// Sugere horários alternativos para um evento em caso de conflito
        /// </summary>
        IEnumerable<DateTime> SuggestAlternativeDates(Event eventEntity, IEnumerable<Event> existingEvents, int maxSuggestions = 5);

        /// <summary>
        /// Verifica se um evento é considerado especial (festa, celebração importante)
        /// </summary>
        bool IsSpecialEvent(Event eventEntity);

        /// <summary>
        /// Calcula a duração estimada de um evento baseado no tipo
        /// </summary>
        TimeSpan GetEstimatedDuration(EventType eventType);
    }
}