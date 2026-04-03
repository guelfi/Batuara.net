using Batuara.Application.SiteSettings.Models;
using FluentValidation;

namespace Batuara.API.Validators
{
    public class UpdateSiteSettingsRequestValidator : AbstractValidator<UpdateSiteSettingsRequest>
    {
        public UpdateSiteSettingsRequestValidator()
        {
            RuleFor(x => x.Address).MaximumLength(500).When(x => x.Address != null);
            RuleFor(x => x.Email).EmailAddress().MaximumLength(200).When(x => !string.IsNullOrWhiteSpace(x.Email));
            RuleFor(x => x.Phone).MaximumLength(50).When(x => x.Phone != null);
            RuleFor(x => x.Instagram).MaximumLength(50).When(x => x.Instagram != null);
            RuleFor(x => x.HistoryTitle).MaximumLength(200).When(x => x.HistoryTitle != null);
            RuleFor(x => x.HistorySubtitle).MaximumLength(500).When(x => x.HistorySubtitle != null);
            RuleFor(x => x.HistoryHtml).MaximumLength(50000).When(x => x.HistoryHtml != null);
            RuleFor(x => x.HistoryMissionText).MaximumLength(2000).When(x => x.HistoryMissionText != null);
            RuleFor(x => x.InstitutionalEmail).EmailAddress().MaximumLength(200).When(x => !string.IsNullOrWhiteSpace(x.InstitutionalEmail));
            RuleFor(x => x.PrimaryPhone).MaximumLength(50).When(x => x.PrimaryPhone != null);
            RuleFor(x => x.SecondaryPhone).MaximumLength(50).When(x => x.SecondaryPhone != null);
            RuleFor(x => x.WhatsappNumber).MaximumLength(50).When(x => x.WhatsappNumber != null);
            RuleFor(x => x.ServiceHours).MaximumLength(500).When(x => x.ServiceHours != null);
            RuleFor(x => x.Street).MaximumLength(200).When(x => x.Street != null);
            RuleFor(x => x.Number).MaximumLength(20).When(x => x.Number != null);
            RuleFor(x => x.Complement).MaximumLength(120).When(x => x.Complement != null);
            RuleFor(x => x.District).MaximumLength(120).When(x => x.District != null);
            RuleFor(x => x.City).MaximumLength(120).When(x => x.City != null);
            RuleFor(x => x.State).Length(2).When(x => x.State != null);
            RuleFor(x => x.ZipCode).MaximumLength(20).When(x => x.ZipCode != null);
            RuleFor(x => x.ReferenceNotes).MaximumLength(1000).When(x => x.ReferenceNotes != null);
            RuleFor(x => x.MapEmbedUrl).MaximumLength(1000).When(x => x.MapEmbedUrl != null);
            RuleFor(x => x.FacebookUrl).MaximumLength(500).When(x => x.FacebookUrl != null);
            RuleFor(x => x.InstagramUrl).MaximumLength(500).When(x => x.InstagramUrl != null);
            RuleFor(x => x.YoutubeUrl).MaximumLength(500).When(x => x.YoutubeUrl != null);
            RuleFor(x => x.WhatsappUrl).MaximumLength(500).When(x => x.WhatsappUrl != null);
            RuleFor(x => x.PixKey).MaximumLength(200).When(x => x.PixKey != null);
            RuleFor(x => x.PixPayload).MaximumLength(500).When(x => x.PixPayload != null);
            RuleFor(x => x.PixRecipientName).MaximumLength(200).When(x => x.PixRecipientName != null);
            RuleFor(x => x.PixCity).MaximumLength(100).When(x => x.PixCity != null);
            RuleFor(x => x.BankName).MaximumLength(120).When(x => x.BankName != null);
            RuleFor(x => x.BankAgency).MaximumLength(40).When(x => x.BankAgency != null);
            RuleFor(x => x.BankAccount).MaximumLength(40).When(x => x.BankAccount != null);
            RuleFor(x => x.BankAccountType).MaximumLength(40).When(x => x.BankAccountType != null);
            RuleFor(x => x.CompanyDocument).MaximumLength(30).When(x => x.CompanyDocument != null);
            RuleFor(x => x.AboutText).MaximumLength(20000).When(x => x.AboutText != null);
        }
    }
}
