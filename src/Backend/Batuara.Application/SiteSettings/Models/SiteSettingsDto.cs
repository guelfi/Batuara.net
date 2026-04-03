namespace Batuara.Application.SiteSettings.Models
{
    public class SiteSettingsDto
    {
        public string Address { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Instagram { get; set; } = string.Empty;
        public string HistoryTitle { get; set; } = string.Empty;
        public string? HistorySubtitle { get; set; }
        public string? HistoryHtml { get; set; }
        public string? HistoryMissionText { get; set; }
        public string InstitutionalEmail { get; set; } = string.Empty;
        public string PrimaryPhone { get; set; } = string.Empty;
        public string? SecondaryPhone { get; set; }
        public string? WhatsappNumber { get; set; }
        public string? ServiceHours { get; set; }
        public string Street { get; set; } = string.Empty;
        public string Number { get; set; } = string.Empty;
        public string? Complement { get; set; }
        public string District { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public string? ReferenceNotes { get; set; }
        public string? MapEmbedUrl { get; set; }
        public string? FacebookUrl { get; set; }
        public string? InstagramUrl { get; set; }
        public string? YoutubeUrl { get; set; }
        public string? WhatsappUrl { get; set; }
        public string? PixKey { get; set; }
        public string? PixPayload { get; set; }
        public string? PixRecipientName { get; set; }
        public string? PixCity { get; set; }
        public string? BankName { get; set; }
        public string? BankAgency { get; set; }
        public string? BankAccount { get; set; }
        public string? BankAccountType { get; set; }
        public string? CompanyDocument { get; set; }
        public string AboutText { get; set; } = string.Empty;
    }
}
