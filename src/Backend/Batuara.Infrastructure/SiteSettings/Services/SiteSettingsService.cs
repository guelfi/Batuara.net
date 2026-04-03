using Batuara.Application.SiteSettings.Models;
using Batuara.Application.SiteSettings.Services;
using Batuara.Domain.Entities;
using Batuara.Domain.ValueObjects;
using Batuara.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text;
using System.Text.RegularExpressions;

namespace Batuara.Infrastructure.SiteSettings.Services
{
    public class SiteSettingsService : ISiteSettingsService
    {
        private readonly BatuaraDbContext _dbContext;
        private readonly ILogger<SiteSettingsService> _logger;

        public SiteSettingsService(BatuaraDbContext dbContext, ILogger<SiteSettingsService> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<SiteSettingsDto> GetPublicAsync()
        {
            var entity = await GetOrCreateAsync();
            return Map(entity);
        }

        public async Task<SiteSettingsDto> GetAsync()
        {
            var entity = await GetOrCreateAsync();
            return Map(entity);
        }

        public async Task<SiteSettingsDto> UpdateAsync(UpdateSiteSettingsRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            var entity = await GetOrCreateAsync();

            var hasPresentationChange =
                request.HistoryTitle != null ||
                request.HistorySubtitle != null ||
                request.HistoryHtml != null ||
                request.HistoryMissionText != null ||
                request.AboutText != null;

            if (hasPresentationChange)
            {
                entity.UpdatePresentation(
                    request.AboutText ?? entity.AboutText,
                    NormalizeRequiredHistoryTitle(request.HistoryTitle, entity.HistoryTitle),
                    NormalizeOptionalHistoryValue(request.HistorySubtitle, entity.HistorySubtitle),
                    request.HistoryHtml != null ? SanitizeHistoryHtml(request.HistoryHtml) : entity.HistoryHtml,
                    NormalizeOptionalHistoryValue(request.HistoryMissionText, entity.HistoryMissionText));
            }

            var hasSocialChange =
                request.FacebookUrl != null ||
                request.InstagramUrl != null ||
                request.YoutubeUrl != null ||
                request.WhatsappUrl != null;

            if (hasSocialChange)
            {
                entity.UpdateSocialLinks(
                    request.FacebookUrl ?? entity.FacebookUrl,
                    request.InstagramUrl ?? entity.InstagramUrl,
                    request.YoutubeUrl ?? entity.YoutubeUrl,
                    request.WhatsappUrl ?? entity.WhatsappUrl);
            }

            var hasInstitutionalChange =
                request.InstitutionalEmail != null ||
                request.PrimaryPhone != null ||
                request.SecondaryPhone != null ||
                request.WhatsappNumber != null ||
                request.ServiceHours != null ||
                request.Street != null ||
                request.Number != null ||
                request.Complement != null ||
                request.District != null ||
                request.City != null ||
                request.State != null ||
                request.ZipCode != null ||
                request.ReferenceNotes != null ||
                request.MapEmbedUrl != null;

            if (hasInstitutionalChange)
            {
                entity.UpdateInstitutionalInfo(
                    request.InstitutionalEmail ?? entity.InstitutionalEmail,
                    request.PrimaryPhone ?? entity.PrimaryPhone,
                    request.SecondaryPhone ?? entity.SecondaryPhone,
                    request.WhatsappNumber ?? entity.WhatsappNumber,
                    request.ServiceHours ?? entity.ServiceHours,
                    request.Street ?? entity.Street,
                    request.Number ?? entity.Number,
                    request.Complement ?? entity.Complement,
                    request.District ?? entity.District,
                    request.City ?? entity.City,
                    request.State ?? entity.State,
                    request.ZipCode ?? entity.ZipCode,
                    request.ReferenceNotes ?? entity.ReferenceNotes,
                    request.MapEmbedUrl ?? entity.MapEmbedUrl);
            }

            var hasLegacyContactChange =
                request.Address != null ||
                request.Email != null ||
                request.Phone != null ||
                request.Instagram != null;

            if (hasLegacyContactChange)
            {
                var existing = entity.ContactInfo;
                var instagram = request.Instagram ?? existing.Instagram;
                instagram = NormalizeInstagram(instagram);

                var updated = new ContactInfo(
                    request.Address ?? existing.Address,
                    request.Email ?? existing.Email,
                    request.Phone ?? existing.Phone,
                    instagram);

                entity.UpdateContactInfo(updated);
            }

            var hasDonationChange =
                request.PixKey != null ||
                request.PixPayload != null ||
                request.PixRecipientName != null ||
                request.PixCity != null ||
                request.BankName != null ||
                request.BankAgency != null ||
                request.BankAccount != null ||
                request.BankAccountType != null ||
                request.CompanyDocument != null;

            if (hasDonationChange)
            {
                var pixKey = request.PixKey ?? entity.PixKey;
                var pixRecipientName = request.PixRecipientName ?? entity.PixRecipientName ?? "Casa Batuara";
                var pixCity = request.PixCity ?? entity.PixCity ?? entity.City;
                var pixPayload = request.PixPayload ?? GeneratePixPayload(pixKey, pixRecipientName, pixCity);

                entity.UpdateDonationInfo(
                    pixKey,
                    pixPayload,
                    pixRecipientName,
                    pixCity,
                    request.BankName ?? entity.BankName,
                    request.BankAgency ?? entity.BankAgency,
                    request.BankAccount ?? entity.BankAccount,
                    request.BankAccountType ?? entity.BankAccountType,
                    request.CompanyDocument ?? entity.CompanyDocument);
            }

            await _dbContext.SaveChangesAsync();
            return Map(entity);
        }

        private async Task<Batuara.Domain.Entities.SiteSettings> GetOrCreateAsync()
        {
            var entity = await _dbContext.SiteSettings
                .OrderBy(s => s.Id)
                .FirstOrDefaultAsync();

            if (entity != null)
                return entity;

            _logger.LogInformation("No SiteSettings found. Creating default SiteSettings.");

            var defaultEntity = CreateDefault();
            _dbContext.SiteSettings.Add(defaultEntity);
            await _dbContext.SaveChangesAsync();
            return defaultEntity;
        }

        private static string NormalizeInstagram(string instagram)
        {
            instagram = instagram.Trim();
            if (instagram.StartsWith("@"))
            {
                instagram = instagram[1..];
            }
            return instagram;
        }

        private static Batuara.Domain.Entities.SiteSettings CreateDefault()
        {
            var contactInfo = new ContactInfo(
                "Av.Brigadeiro Faria Lima, 2750 - Jardim Cocaia, Guarulhos - SP, 07130-000",
                "contato@casabatuara.org.br",
                "(11) 1234-5678",
                "casadecaridade.batuara");

            var aboutText = GetDefaultAboutText();
            var missionText = GetDefaultMissionText();

            var siteSettings = new Batuara.Domain.Entities.SiteSettings(
                contactInfo,
                aboutText,
                GetDefaultInstagramUrl(),
                "contato@casabatuara.org.br");

            siteSettings.UpdatePresentation(
                aboutText,
                GetDefaultHistoryTitle(),
                GetDefaultHistorySubtitle(),
                $"<p>{aboutText.Replace("\n\n", "</p><p>").Replace("\n", "<br />")}</p>",
                missionText);

            siteSettings.UpdateInstitutionalInfo(
                contactInfo.Email,
                contactInfo.Phone,
                null,
                null,
                "Segunda a sexta, das 19h às 22h",
                "Av. Brigadeiro Faria Lima",
                "2750",
                null,
                "Jardim Cocaia",
                "Guarulhos",
                "SP",
                "07130-000",
                "Próximo ao acesso principal do bairro",
                null);

            siteSettings.UpdateDonationInfo(
                "contato@casabatuara.org.br",
                GeneratePixPayload("contato@casabatuara.org.br", "Casa Batuara", "Guarulhos"),
                "Casa Batuara",
                "Guarulhos",
                "Banco do Brasil",
                "1234-5",
                "98765-4",
                "Conta Corrente",
                "00.000.000/0001-00");

            return siteSettings;
        }

        private static SiteSettingsDto Map(Batuara.Domain.Entities.SiteSettings entity)
        {
            var street = string.IsNullOrWhiteSpace(entity.Street) ? GetDefaultStreet() : entity.Street;
            var number = string.IsNullOrWhiteSpace(entity.Number) ? GetDefaultNumber() : entity.Number;
            var district = string.IsNullOrWhiteSpace(entity.District) ? GetDefaultDistrict() : entity.District;
            var city = string.IsNullOrWhiteSpace(entity.City) ? GetDefaultCity() : entity.City;
            var state = string.IsNullOrWhiteSpace(entity.State) ? GetDefaultState() : entity.State;
            var zipCode = string.IsNullOrWhiteSpace(entity.ZipCode) ? GetDefaultZipCode() : entity.ZipCode;
            var institutionalEmail = string.IsNullOrWhiteSpace(entity.InstitutionalEmail) ? GetDefaultInstitutionalEmail() : entity.InstitutionalEmail;
            var primaryPhone = string.IsNullOrWhiteSpace(entity.PrimaryPhone) ? entity.ContactInfo.Phone : entity.PrimaryPhone;
            var instagramHandle = string.IsNullOrWhiteSpace(entity.ContactInfo.Instagram) ? GetDefaultInstagramHandle() : entity.ContactInfo.Instagram;
            var instagramUrl = string.IsNullOrWhiteSpace(entity.InstagramUrl)
                ? GetDefaultInstagramUrl()
                : NormalizeInstagramProfileUrl(entity.InstagramUrl) ?? GetDefaultInstagramUrl();
            var mapEmbedUrl = string.IsNullOrWhiteSpace(entity.MapEmbedUrl) ? GetDefaultMapEmbedUrl() : entity.MapEmbedUrl;
            var address = $"{street}, {number} - {district}, {city} - {state}, {zipCode}";

            return new SiteSettingsDto
            {
                Address = address,
                Email = string.IsNullOrWhiteSpace(entity.ContactInfo.Email) ? institutionalEmail : entity.ContactInfo.Email,
                Phone = primaryPhone,
                Instagram = instagramHandle,
                HistoryTitle = string.IsNullOrWhiteSpace(entity.HistoryTitle)
                    ? GetDefaultHistoryTitle()
                    : entity.HistoryTitle,
                HistorySubtitle = string.IsNullOrWhiteSpace(entity.HistorySubtitle)
                    ? GetDefaultHistorySubtitle()
                    : entity.HistorySubtitle,
                HistoryHtml = string.IsNullOrWhiteSpace(entity.HistoryHtml)
                    ? $"<p>{GetDefaultAboutText().Replace("\n\n", "</p><p>").Replace("\n", "<br />")}</p>"
                    : entity.HistoryHtml,
                HistoryMissionText = string.IsNullOrWhiteSpace(entity.HistoryMissionText)
                    ? GetDefaultMissionText()
                    : entity.HistoryMissionText,
                InstitutionalEmail = institutionalEmail,
                PrimaryPhone = primaryPhone,
                SecondaryPhone = entity.SecondaryPhone,
                WhatsappNumber = entity.WhatsappNumber,
                ServiceHours = entity.ServiceHours,
                Street = street,
                Number = number,
                Complement = entity.Complement,
                District = district,
                City = city,
                State = state,
                ZipCode = zipCode,
                ReferenceNotes = entity.ReferenceNotes,
                MapEmbedUrl = mapEmbedUrl,
                FacebookUrl = entity.FacebookUrl,
                InstagramUrl = instagramUrl,
                YoutubeUrl = entity.YoutubeUrl,
                WhatsappUrl = entity.WhatsappUrl,
                PixKey = entity.PixKey,
                PixPayload = entity.PixPayload,
                PixRecipientName = entity.PixRecipientName,
                PixCity = entity.PixCity,
                BankName = entity.BankName,
                BankAgency = entity.BankAgency,
                BankAccount = entity.BankAccount,
                BankAccountType = entity.BankAccountType,
                CompanyDocument = entity.CompanyDocument,
                AboutText = string.IsNullOrWhiteSpace(entity.AboutText)
                    ? GetDefaultAboutText()
                    : entity.AboutText
            };
        }

        private static string GetDefaultAboutText()
        {
            return
                "A Casa de Caridade Batuara nasceu do desejo de servir a Espiritualidade através da caridade e do amor ao próximo. " +
                "Fundada em 23/04/1973 por Armando Augusto Nunes Filho (Dinho) e Ciro na Cidade de Guarulhos com base na Sabedoria Ancestral dos Orixás e no Conhecimento dos Guias, Entidades e Mentores, nossa casa é um lar espiritual para todos que buscam a luz, a paz e a elevação da alma.\n\n" +
                "Trabalhamos com a Umbanda e a Doutrina Espírita, unindo a ciência, a filosofia e a religião em uma só prática. Nosso lema \"Fora da caridade não há salvação\" guia todas as nossas ações e nos lembra constantemente de nossa missão principal: servir com amor e humildade.\n\n" +
                "Oferecemos assistência espiritual gratuita, orientação, consolação e ensinamentos para todos que nos procuram, independentemente de sua condição social, raça ou credo religioso. Aqui, todos são bem-vindos e tratados como irmãos. Nossa comunidade se fortalece através da união, do respeito mútuo e da prática constante da caridade em todas as suas formas.";
        }

        private static string GetDefaultHistoryTitle()
        {
            return "Nossa História";
        }

        private static string GetDefaultHistorySubtitle()
        {
            return "Uma jornada de fé, caridade e amor ao próximo";
        }

        private static string GetDefaultInstitutionalEmail()
        {
            return "contato@casabatuara.org.br";
        }

        private static string GetDefaultInstagramHandle()
        {
            return "casadecaridade.batuara";
        }

        private static string GetDefaultInstagramUrl()
        {
            return "https://www.instagram.com/casadecaridade.batuara";
        }

        private static string GetDefaultStreet()
        {
            return "Av. Brigadeiro Faria Lima";
        }

        private static string GetDefaultNumber()
        {
            return "2750";
        }

        private static string GetDefaultDistrict()
        {
            return "Jardim Cocaia";
        }

        private static string GetDefaultCity()
        {
            return "Guarulhos";
        }

        private static string GetDefaultState()
        {
            return "SP";
        }

        private static string GetDefaultZipCode()
        {
            return "07130-000";
        }

        private static string GetDefaultMapEmbedUrl()
        {
            return "https://maps.google.com/maps?q=Av.%20Brigadeiro%20Faria%20Lima%2C%202750%20-%20Jardim%20Cocaia%2C%20Guarulhos%20-%20SP%2C%2007130-000&z=17&output=embed";
        }

        private static string? NormalizeInstagramProfileUrl(string? instagramUrl)
        {
            if (string.IsNullOrWhiteSpace(instagramUrl))
                return null;

            var trimmed = instagramUrl.Trim();
            var queryIndex = trimmed.IndexOfAny(['?', '#']);
            if (queryIndex >= 0)
                trimmed = trimmed[..queryIndex];

            return trimmed.TrimEnd('/');
        }

        private static string GetDefaultMissionText()
        {
            return "Promover a caridade, o amor fraterno e a elevação espiritual através da Sabedoria Ancestral dos Orixás, Guias, Entidades e Mentores, oferecendo assistência espiritual gratuita a todos que buscam a LUZ.";
        }

        private static string NormalizeRequiredHistoryTitle(string? requestedValue, string? currentValue)
        {
            if (!string.IsNullOrWhiteSpace(requestedValue))
                return requestedValue.Trim();

            if (!string.IsNullOrWhiteSpace(currentValue))
                return currentValue.Trim();

            return GetDefaultHistoryTitle();
        }

        private static string? NormalizeOptionalHistoryValue(string? requestedValue, string? currentValue)
        {
            if (!string.IsNullOrWhiteSpace(requestedValue))
                return requestedValue.Trim();

            if (!string.IsNullOrWhiteSpace(currentValue))
                return currentValue.Trim();

            return null;
        }

        private static string? SanitizeHistoryHtml(string? html)
        {
            if (string.IsNullOrWhiteSpace(html))
                return null;

            var sanitized = html;
            sanitized = Regex.Replace(sanitized, "<script.*?</script>", string.Empty, RegexOptions.IgnoreCase | RegexOptions.Singleline);
            sanitized = Regex.Replace(sanitized, "<style.*?</style>", string.Empty, RegexOptions.IgnoreCase | RegexOptions.Singleline);
            sanitized = Regex.Replace(sanitized, "on\\w+\\s*=\\s*\".*?\"", string.Empty, RegexOptions.IgnoreCase | RegexOptions.Singleline);
            sanitized = Regex.Replace(sanitized, "on\\w+\\s*=\\s*'.*?'", string.Empty, RegexOptions.IgnoreCase | RegexOptions.Singleline);
            sanitized = Regex.Replace(sanitized, "javascript:", string.Empty, RegexOptions.IgnoreCase);
            sanitized = Regex.Replace(sanitized, "<iframe.*?</iframe>", string.Empty, RegexOptions.IgnoreCase | RegexOptions.Singleline);
            return sanitized.Trim();
        }

        private static string? GeneratePixPayload(string? pixKey, string recipientName, string city)
        {
            if (string.IsNullOrWhiteSpace(pixKey))
                return null;

            var merchantName = NormalizePixValue(recipientName, 25);
            var merchantCity = NormalizePixValue(city, 15);
            var merchantAccount = FormatPixField("00", "br.gov.bcb.pix") + FormatPixField("01", pixKey.Trim());
            var payload = new StringBuilder();
            payload.Append("000201");
            payload.Append(FormatPixField("26", merchantAccount.ToString()));
            payload.Append("52040000");
            payload.Append("5303986");
            payload.Append("5802BR");
            payload.Append(FormatPixField("59", merchantName));
            payload.Append(FormatPixField("60", merchantCity));
            payload.Append("62070503***");
            payload.Append("6304");
            var withoutCrc = payload.ToString();
            var crc = CalculatePixCrc16(withoutCrc);
            return withoutCrc + crc;
        }

        private static string FormatPixField(string id, string value)
        {
            return $"{id}{value.Length:00}{value}";
        }

        private static string NormalizePixValue(string value, int maxLength)
        {
            var normalized = new string(value
                .Normalize(NormalizationForm.FormD)
                .Where(c => char.GetUnicodeCategory(c) != System.Globalization.UnicodeCategory.NonSpacingMark)
                .ToArray())
                .Normalize(NormalizationForm.FormC)
                .ToUpperInvariant();

            normalized = Regex.Replace(normalized, "[^A-Z0-9 ]", string.Empty);
            if (normalized.Length > maxLength)
                normalized = normalized[..maxLength];

            return string.IsNullOrWhiteSpace(normalized) ? "BATUARA" : normalized;
        }

        private static string CalculatePixCrc16(string payload)
        {
            const ushort polynomial = 0x1021;
            ushort result = 0xFFFF;

            foreach (var character in Encoding.ASCII.GetBytes(payload))
            {
                result ^= (ushort)(character << 8);
                for (var bit = 0; bit < 8; bit++)
                {
                    result = (result & 0x8000) != 0
                        ? (ushort)((result << 1) ^ polynomial)
                        : (ushort)(result << 1);
                }
            }

            return result.ToString("X4");
        }
    }
}
