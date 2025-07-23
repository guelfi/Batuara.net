using System;
using System.Collections.Generic;
using System.Linq;
using Batuara.Domain.Common;

namespace Batuara.Domain.Entities
{
    public class UmbandaLine : BaseEntity, IAggregateRoot
    {
        public string Name { get; private set; } = string.Empty;
        public string Description { get; private set; } = string.Empty;
        public string Characteristics { get; private set; } = string.Empty;
        public string BatuaraInterpretation { get; private set; } = string.Empty;
        public int DisplayOrder { get; private set; }

        private readonly List<string> _entities = new();
        private readonly List<string> _workingDays = new();

        public IReadOnlyList<string> Entities => _entities.AsReadOnly();
        public IReadOnlyList<string> WorkingDays => _workingDays.AsReadOnly();

        private UmbandaLine() { } // For EF Core

        public UmbandaLine(
            string name,
            string description,
            string characteristics,
            string batuaraInterpretation,
            IEnumerable<string> entities,
            IEnumerable<string>? workingDays = null,
            int displayOrder = 0)
        {
            ValidateUmbandaLine(name, description, characteristics, batuaraInterpretation, entities);
            
            Name = name;
            Description = description;
            Characteristics = characteristics;
            BatuaraInterpretation = batuaraInterpretation;
            DisplayOrder = displayOrder;
            
            _entities.AddRange(entities);
            if (workingDays != null)
                _workingDays.AddRange(workingDays);
        }

        private static void ValidateUmbandaLine(
            string name,
            string description,
            string characteristics,
            string batuaraInterpretation,
            IEnumerable<string> entities)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Umbanda line name cannot be empty", nameof(name));

            if (name.Length > 100)
                throw new ArgumentException("Umbanda line name cannot exceed 100 characters", nameof(name));

            if (string.IsNullOrWhiteSpace(description))
                throw new ArgumentException("Umbanda line description cannot be empty", nameof(description));

            if (description.Length > 5000)
                throw new ArgumentException("Umbanda line description cannot exceed 5000 characters", nameof(description));

            if (string.IsNullOrWhiteSpace(characteristics))
                throw new ArgumentException("Umbanda line characteristics cannot be empty", nameof(characteristics));

            if (characteristics.Length > 3000)
                throw new ArgumentException("Umbanda line characteristics cannot exceed 3000 characters", nameof(characteristics));

            if (string.IsNullOrWhiteSpace(batuaraInterpretation))
                throw new ArgumentException("Batuara interpretation cannot be empty", nameof(batuaraInterpretation));

            if (batuaraInterpretation.Length > 5000)
                throw new ArgumentException("Batuara interpretation cannot exceed 5000 characters", nameof(batuaraInterpretation));

            if (entities == null || !entities.Any())
                throw new ArgumentException("Umbanda line must have at least one entity", nameof(entities));
        }

        public void UpdateBasicInfo(string name, string description, string characteristics, int displayOrder)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Umbanda line name cannot be empty", nameof(name));

            if (string.IsNullOrWhiteSpace(description))
                throw new ArgumentException("Umbanda line description cannot be empty", nameof(description));

            if (string.IsNullOrWhiteSpace(characteristics))
                throw new ArgumentException("Umbanda line characteristics cannot be empty", nameof(characteristics));

            Name = name;
            Description = description;
            Characteristics = characteristics;
            DisplayOrder = displayOrder;
            UpdateTimestamp();
        }

        public void UpdateBatuaraInterpretation(string batuaraInterpretation)
        {
            if (string.IsNullOrWhiteSpace(batuaraInterpretation))
                throw new ArgumentException("Batuara interpretation cannot be empty", nameof(batuaraInterpretation));

            if (batuaraInterpretation.Length > 5000)
                throw new ArgumentException("Batuara interpretation cannot exceed 5000 characters", nameof(batuaraInterpretation));

            BatuaraInterpretation = batuaraInterpretation;
            UpdateTimestamp();
        }

        public void UpdateEntities(IEnumerable<string> entities)
        {
            if (entities == null || !entities.Any())
                throw new ArgumentException("Umbanda line must have at least one entity", nameof(entities));

            _entities.Clear();
            _entities.AddRange(entities.Where(e => !string.IsNullOrWhiteSpace(e)));
            UpdateTimestamp();
        }

        public void UpdateWorkingDays(IEnumerable<string> workingDays)
        {
            _workingDays.Clear();
            if (workingDays != null)
                _workingDays.AddRange(workingDays.Where(d => !string.IsNullOrWhiteSpace(d)));
            UpdateTimestamp();
        }

        public bool WorksOnDay(DayOfWeek dayOfWeek)
        {
            if (!_workingDays.Any())
                return false;

            var dayName = dayOfWeek switch
            {
                DayOfWeek.Sunday => "Domingo",
                DayOfWeek.Monday => "Segunda-feira",
                DayOfWeek.Tuesday => "Terça-feira",
                DayOfWeek.Wednesday => "Quarta-feira",
                DayOfWeek.Thursday => "Quinta-feira",
                DayOfWeek.Friday => "Sexta-feira",
                DayOfWeek.Saturday => "Sábado",
                _ => string.Empty
            };

            return _workingDays.Any(d => d.Contains(dayName, StringComparison.OrdinalIgnoreCase));
        }

        public string GetPrimaryEntity()
        {
            return _entities.FirstOrDefault() ?? string.Empty;
        }
    }
}