using Batuara.Domain.Common;

namespace Batuara.Domain.Entities
{
    /// <summary>Registro de atividade exibido no card "Atividade Recente" do dashboard.</summary>
    public class ActivityLog : BaseEntity
    {
        public string UserName { get; private set; } = string.Empty;
        public string? UserId { get; private set; }
        public string Action { get; private set; } = string.Empty;
        public string EntityType { get; private set; } = string.Empty;
        public string? EntityId { get; private set; }
        public string? Details { get; private set; }

        private ActivityLog() { }

        public ActivityLog(string userName, string? userId, string action, string entityType, string? entityId = null, string? details = null)
        {
            UserName = userName;
            UserId = userId;
            Action = action;
            EntityType = entityType;
            EntityId = entityId;
            Details = details;
        }
    }
}
