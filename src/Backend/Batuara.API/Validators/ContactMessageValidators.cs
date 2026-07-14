using Batuara.Application.ContactMessages.Models;
using FluentValidation;

namespace Batuara.API.Validators
{
    public class CreateContactMessageRequestValidator : AbstractValidator<CreateContactMessageRequest>
    {
        public CreateContactMessageRequestValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
            RuleFor(x => x.Email).EmailAddress().MaximumLength(200).When(x => !string.IsNullOrWhiteSpace(x.Email));
            RuleFor(x => x.Phone).MaximumLength(50).When(x => x.Phone != null);
            RuleFor(x => x.Phone).NotEmpty().When(x => x.WantsWhatsAppResponse).WithMessage("Telefone é obrigatório para receber resposta por WhatsApp.");
            RuleFor(x => x.Subject).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Message).NotEmpty().MaximumLength(5000);
        }
    }

    public class UpdateContactMessageStatusRequestValidator : AbstractValidator<UpdateContactMessageStatusRequest>
    {
        public UpdateContactMessageStatusRequestValidator()
        {
            RuleFor(x => x.AdminNotes).MaximumLength(2000).When(x => x.AdminNotes != null);
        }
    }

    public class SendContactWhatsAppResponseRequestValidator : AbstractValidator<SendContactWhatsAppResponseRequest>
    {
        public SendContactWhatsAppResponseRequestValidator()
        {
            RuleFor(x => x.ResponseText).NotEmpty().MaximumLength(2000);
        }
    }
}
