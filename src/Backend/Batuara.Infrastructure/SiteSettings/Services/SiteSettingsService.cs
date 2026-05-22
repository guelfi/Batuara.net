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
                request.CompanyDocument != null ||
                request.PixQrCodeBase64 != null;

            if (hasDonationChange)
            {
                var pixKey = request.PixKey ?? entity.PixKey;
                var pixRecipientName = request.PixRecipientName ?? entity.PixRecipientName ?? "Casa Batuara";
                var pixCity = request.PixCity ?? entity.PixCity ?? entity.City;
                
                string? pixPayload = null;
                if (request.PixPayload != null)
                {
                    pixPayload = string.IsNullOrWhiteSpace(request.PixPayload) ? null : request.PixPayload.Trim();
                }
                else
                {
                    pixPayload = (request.PixKey != null || request.PixRecipientName != null || request.PixCity != null)
                        ? GeneratePixPayload(pixKey, pixRecipientName, pixCity)
                        : entity.PixPayload;
                }

                string? pixQrCodeBase64 = request.PixQrCodeBase64 != null
                    ? (string.IsNullOrWhiteSpace(request.PixQrCodeBase64) ? null : request.PixQrCodeBase64.Trim())
                    : entity.PixQrCodeBase64;

                entity.UpdateDonationInfo(
                    pixKey,
                    pixPayload,
                    pixRecipientName,
                    pixCity,
                    request.BankName ?? entity.BankName,
                    request.BankAgency ?? entity.BankAgency,
                    request.BankAccount ?? entity.BankAccount,
                    request.BankAccountType ?? entity.BankAccountType,
                    request.CompanyDocument ?? entity.CompanyDocument,
                    pixQrCodeBase64);
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
                "08.488.544/0001-56",
                "00020126360014BR.GOV.BCB.PIX0114084885440001565204000053039865802BR5924Casa de Caridade Batuara6009Sao Paulo62070503***6304554C",
                "Casa de Caridade Batuara",
                "Sao Paulo",
                "Banco do Brasil",
                "1234-5",
                "98765-4",
                "Conta Corrente",
                "08.488.544/0001-56",
                "data:image/png;base64,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q5587GUjlear2bF49Xp+LXa+QyElROAkChOAEKiOAEIKfx3iHuV7sk17/R49/BeVvydjrd0POt+b3zeeDQrPiue2vPhzd9SOj8WKx8PVk4AQqI4AQiJ4gQgpMXub+us65qVfs09dOKN13td8+bvHd9ixWcpzdcbf+14LVZ8pdctpfdbSuaTlROAkChOAEKiOAEIKfvnnKw9dttqj2/t6XX/1vjeM4LBnj+vtvO15tdSOz/N6t87P23PZ02snACERHECEBLFCUBIXfc5J80bvu6/NP3S/rxnBKW841n5Wf1pbc9P7Xi10vhL4y3Nxxu/xYqvBCsnACFRnACERHECENJid+ZUugdue/zS65o3Xq12/1Y+Fisezeq/0/FonZ4/re34S/sfCCsnACFRnACERHECEFLX/W2dxbtnt9qX9leq2+K3+vfyxq/Vzqft/kqva9Z8lY5vseIbCCsnACFRnACERHECENJi9x3iltJ0vXtyb7y1+/NqO59StefPq7S/tuer7fi0NueblROAkChOAEKiOAEIKfyZU9t7Zs0ar3RPXsoav+35Ks3HG79ub13XrHi9/de+rnnbWzqdn1YSPysnACFRnACERHECEFL4v63TSvfIltI9dNt79Nr9W/1ppfFbauen1c7XUjv+UtHmdyCsnACERHECEBLFCUBIXX/m1DZrT+7dg2ve/r39WWrP54stH80br6Xt8aznR/O2L8HKCUBIFCcAIVGcAIQUdd9npOnwS/fE3j2+NZ43Hy/veN750ErnR/POpoke3xvv9Fq+t1/t8b1lfs37uubt33p+tNb2fHrzL50PzWpfe79W/6z+WfkBiJgUJwAhUZwAhMSpk/N9TrX30F6bv+YdPz/e8Wpljdfifd3SdjxKecejefPxjle6v/bzuT8sXlZOAEKiOAEIieIEICS+z0kp7c+75257j++9XpuVv1Yajzd/S9vz643HMtj51sTKCUBIFCcAIVGcAIQUzhwpQHL8//L+vT8Wbf8Waf/2v1Z5Pj2fNY83q34vP4vVg5QQgJIoTgJAoTgBCCn/mVDqH+r33b11v/xafZcWn1e7fO541P0ttn7Xie1nt66aXxue9rsWKx8vKycoJQEgUJwAhUZwAhMSpk/N9TrX30F6bv+YdPz/e8Wpljdfifd3SdjxKecejefPxjle6v/bzuT8sXlZOAEKiOAEIieIEICS+z0kp7c+75257j++9XpuVv1Yajzd/S9vz643HMtj51sTKCUBIFCcAIVGcAIQEDhwpQHL8//L+vT8Wbf8Waf/2v1Z5Pj2fNY83q34vP4vVg5QQgJIoTgJAoTgBCCn/mVDqH+r33b11v/xafZcWn1e7fO541P0ttn7Xie1nt66aXxue9rsWKx8vKycoJQEgUJwAhUZwAhMSpk/N9TrX30F6bv+YdPz/e8Wpljdfifd3SdjxKecejefPxjle6v/bzuT8sXlZOAEKiOAEIieIEICS+z0kp7c+75257j++9XpuVv1Yajzd/S9vz643HMtj51sTKCUBIFCcAIVGcAIQEDhwB4FMoTgBCojgBCIniBCAkihOAkChOAEKiOAEIieIEICSKE4CQKE4AQqI4AQiJ4gQgJIoTgJAoTgBCojgBCIniBCAkihOAkChOAEKiOAEIieIEICSKE4CQKE4AQqI4AQiJ4gQgJIoTgJAoTgBCojgBCIniBCAkihOAkChOAEKiOAEIieIEICSKE4CQKE4AQqI4AQiJ4gQgJIoTgJAoTgBCojgBCIniBCCk/wP1N2f0R+xV/gAAAABJRU5ErkJggg==");

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
                PixQrCodeBase64 = entity.PixQrCodeBase64,
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
