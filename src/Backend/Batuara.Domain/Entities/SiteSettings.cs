using Batuara.Domain.Common;
using Batuara.Domain.ValueObjects;

namespace Batuara.Domain.Entities
{
    public class SiteSettings : BaseEntity, IAggregateRoot
    {
        public ContactInfo ContactInfo { get; private set; } = null!;
        public string AboutText { get; private set; } = string.Empty;
        public string HistoryTitle { get; private set; } = "Nossa História";
        public string? HistorySubtitle { get; private set; }
        public string? HistoryHtml { get; private set; }
        public string? HistoryMissionText { get; private set; }
        public string InstitutionalEmail { get; private set; } = string.Empty;
        public string PrimaryPhone { get; private set; } = string.Empty;
        public string? SecondaryPhone { get; private set; }
        public string? WhatsappNumber { get; private set; }
        public string? ServiceHours { get; private set; }
        public string Street { get; private set; } = string.Empty;
        public string Number { get; private set; } = string.Empty;
        public string? Complement { get; private set; }
        public string District { get; private set; } = string.Empty;
        public string City { get; private set; } = string.Empty;
        public string State { get; private set; } = string.Empty;
        public string ZipCode { get; private set; } = string.Empty;
        public string? ReferenceNotes { get; private set; }
        public string? MapEmbedUrl { get; private set; }
        public string? FacebookUrl { get; private set; }
        public string? InstagramUrl { get; private set; }
        public string? YoutubeUrl { get; private set; }
        public string? WhatsappUrl { get; private set; }
        public string? PixKey { get; private set; }
        public string? PixPayload { get; private set; }
        public string? PixRecipientName { get; private set; }
        public string? PixCity { get; private set; }
        public string? BankName { get; private set; }
        public string? BankAgency { get; private set; }
        public string? BankAccount { get; private set; }
        public string? BankAccountType { get; private set; }
        public string? CompanyDocument { get; private set; }

        private SiteSettings()
        {
        }

        public SiteSettings(ContactInfo contactInfo, string aboutText, string? instagramUrl = null, string? pixKey = null)
        {
            if (contactInfo == null)
                throw new ArgumentNullException(nameof(contactInfo));

            if (string.IsNullOrWhiteSpace(aboutText))
                throw new ArgumentException("About text cannot be empty", nameof(aboutText));

            ContactInfo = contactInfo;
            AboutText = aboutText;
            HistoryHtml = aboutText;
            HistoryTitle = "Nossa História";
            InstitutionalEmail = contactInfo.Email;
            PrimaryPhone = contactInfo.Phone;
            Street = contactInfo.Address;
            Number = "S/N";
            District = "Centro";
            City = "Blumenau";
            State = "SC";
            ZipCode = "89000-000";
            UpdateSocialLinks(null, instagramUrl, null, null);
            UpdateDonationInfo(pixKey, null, null, null, null, null, null, null);
        }

        public void UpdatePresentation(
            string aboutText,
            string historyTitle,
            string? historySubtitle,
            string? historyHtml,
            string? historyMissionText)
        {
            if (string.IsNullOrWhiteSpace(aboutText))
                throw new ArgumentException("About text cannot be empty", nameof(aboutText));

            if (string.IsNullOrWhiteSpace(historyTitle))
                throw new ArgumentException("History title cannot be empty", nameof(historyTitle));

            AboutText = aboutText.Trim();
            HistoryTitle = historyTitle.Trim();
            HistorySubtitle = NormalizeOptional(historySubtitle);
            HistoryHtml = NormalizeOptional(historyHtml);
            HistoryMissionText = NormalizeOptional(historyMissionText);
            UpdateTimestamp();
        }

        public void UpdateInstitutionalInfo(
            string institutionalEmail,
            string primaryPhone,
            string? secondaryPhone,
            string? whatsappNumber,
            string? serviceHours,
            string street,
            string number,
            string? complement,
            string district,
            string city,
            string state,
            string zipCode,
            string? referenceNotes,
            string? mapEmbedUrl)
        {
            InstitutionalEmail = Require(institutionalEmail, nameof(institutionalEmail));
            PrimaryPhone = Require(primaryPhone, nameof(primaryPhone));
            SecondaryPhone = NormalizeOptional(secondaryPhone);
            WhatsappNumber = NormalizeOptional(whatsappNumber);
            ServiceHours = NormalizeOptional(serviceHours);
            Street = Require(street, nameof(street));
            Number = Require(number, nameof(number));
            Complement = NormalizeOptional(complement);
            District = Require(district, nameof(district));
            City = Require(city, nameof(city));
            State = Require(state, nameof(state));
            ZipCode = Require(zipCode, nameof(zipCode));
            ReferenceNotes = NormalizeOptional(referenceNotes);
            MapEmbedUrl = NormalizeOptional(mapEmbedUrl);
            ContactInfo = new ContactInfo(BuildAddressLine(), InstitutionalEmail, PrimaryPhone, ExtractInstagramHandle() ?? string.Empty);
            UpdateTimestamp();
        }

        public void UpdateSocialLinks(string? facebookUrl, string? instagramUrl, string? youtubeUrl, string? whatsappUrl)
        {
            FacebookUrl = NormalizeOptional(facebookUrl);
            InstagramUrl = string.IsNullOrWhiteSpace(instagramUrl) ? null : instagramUrl.Trim();
            YoutubeUrl = NormalizeOptional(youtubeUrl);
            WhatsappUrl = NormalizeOptional(whatsappUrl);
            ContactInfo = new ContactInfo(BuildAddressLine(), InstitutionalEmail, PrimaryPhone, ExtractInstagramHandle() ?? string.Empty);
            UpdateTimestamp();
        }

        public void UpdateDonationInfo(
            string? pixKey,
            string? pixPayload,
            string? pixRecipientName,
            string? pixCity,
            string? bankName,
            string? bankAgency,
            string? bankAccount,
            string? bankAccountType,
            string? companyDocument = null)
        {
            PixKey = string.IsNullOrWhiteSpace(pixKey) ? null : pixKey.Trim();
            PixPayload = NormalizeOptional(pixPayload);
            PixRecipientName = NormalizeOptional(pixRecipientName);
            PixCity = NormalizeOptional(pixCity);
            BankName = NormalizeOptional(bankName);
            BankAgency = NormalizeOptional(bankAgency);
            BankAccount = NormalizeOptional(bankAccount);
            BankAccountType = NormalizeOptional(bankAccountType);
            CompanyDocument = NormalizeOptional(companyDocument);
            UpdateTimestamp();
        }

        public void UpdateContactInfo(ContactInfo contactInfo)
        {
            if (contactInfo == null)
                throw new ArgumentNullException(nameof(contactInfo));

            ContactInfo = contactInfo;
            InstitutionalEmail = contactInfo.Email;
            PrimaryPhone = contactInfo.Phone;
            Street = contactInfo.Address;
            UpdateTimestamp();
        }

        public void UpdateAboutText(string aboutText)
        {
            UpdatePresentation(aboutText, HistoryTitle, HistorySubtitle, HistoryHtml, HistoryMissionText);
        }

        public void UpdateInstagramUrl(string? instagramUrl)
        {
            UpdateSocialLinks(FacebookUrl, instagramUrl, YoutubeUrl, WhatsappUrl);
        }

        public void UpdatePixKey(string? pixKey)
        {
            UpdateDonationInfo(pixKey, PixPayload, PixRecipientName, PixCity, BankName, BankAgency, BankAccount, BankAccountType, CompanyDocument);
        }

        private string BuildAddressLine()
        {
            var complementSuffix = string.IsNullOrWhiteSpace(Complement) ? string.Empty : $", {Complement}";
            return $"{Street}, {Number}{complementSuffix} - {District}, {City}/{State} - {ZipCode}";
        }

        private string? ExtractInstagramHandle()
        {
            if (string.IsNullOrWhiteSpace(InstagramUrl))
                return null;

            var trimmed = InstagramUrl.Trim().TrimEnd('/');
            var markerIndex = trimmed.LastIndexOf('/');
            var handleCandidate = markerIndex >= 0 && markerIndex < trimmed.Length - 1
                ? trimmed[(markerIndex + 1)..]
                : trimmed;

            var queryIndex = handleCandidate.IndexOfAny(['?', '#']);
            if (queryIndex >= 0)
                handleCandidate = handleCandidate[..queryIndex];

            return handleCandidate.Trim().Trim('@');
        }

        private static string Require(string value, string paramName)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("Value cannot be empty", paramName);

            return value.Trim();
        }

        private static string? NormalizeOptional(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }
    }
}
