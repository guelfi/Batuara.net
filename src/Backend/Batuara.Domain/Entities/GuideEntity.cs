using Batuara.Domain.Common;

namespace Batuara.Domain.Entities
{
    public class GuideEntity : BaseEntity, IAggregateRoot
    {
        public string Name { get; private set; } = string.Empty;
        public string Description { get; private set; } = string.Empty;
        public List<string> Specialties { get; private set; } = new();
        public int DisplayOrder { get; private set; }
        public string? Comida { get; private set; }
        public string? Fruta { get; private set; }
        public string? DiaDaSemana { get; private set; }
        public string? Cor { get; private set; }
        public string? Saudacao { get; private set; }

        private GuideEntity()
        {
        }

        public GuideEntity(
            string name,
            string description,
            IEnumerable<string> specialties,
            int displayOrder,
            string? comida = null,
            string? fruta = null,
            string? diaDaSemana = null,
            string? cor = null,
            string? saudacao = null)
        {
            UpdateContent(name, description, specialties, displayOrder);
            UpdateExtendedInfo(comida, fruta, diaDaSemana, cor, saudacao);
        }

        public void UpdateContent(
            string name,
            string description,
            IEnumerable<string> specialties,
            int displayOrder)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Guide name cannot be empty", nameof(name));

            if (string.IsNullOrWhiteSpace(description))
                throw new ArgumentException("Guide description cannot be empty", nameof(description));

            var normalizedSpecialties = specialties
                .Where(item => !string.IsNullOrWhiteSpace(item))
                .Select(item => item.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            if (normalizedSpecialties.Count == 0)
                throw new ArgumentException("Guide specialties cannot be empty", nameof(specialties));

            if (displayOrder <= 0)
                throw new ArgumentException("Display order must be greater than zero", nameof(displayOrder));

            Name = name.Trim();
            Description = description.Trim();
            Specialties = normalizedSpecialties;
            DisplayOrder = displayOrder;
            UpdateTimestamp();
        }

        public void UpdateExtendedInfo(string? comida, string? fruta, string? diaDaSemana, string? cor, string? saudacao)
        {
            Comida = string.IsNullOrWhiteSpace(comida) ? null : comida.Trim();
            Fruta = string.IsNullOrWhiteSpace(fruta) ? null : fruta.Trim();
            DiaDaSemana = string.IsNullOrWhiteSpace(diaDaSemana) ? null : diaDaSemana.Trim();
            Cor = string.IsNullOrWhiteSpace(cor) ? null : cor.Trim();
            Saudacao = string.IsNullOrWhiteSpace(saudacao) ? null : saudacao.Trim();
            UpdateTimestamp();
        }

        public void Activate()
        {
            IsActive = true;
            UpdateTimestamp();
        }

        public void Deactivate()
        {
            SetInactive();
        }
    }
}
