using Batuara.Application.ContactMessages.Models;
using FluentValidation;

namespace Batuara.API.Validators
{
    public class CreateContactMessageRequestValidator : AbstractValidator<CreateContactMessageRequest>
    {
        public CreateContactMessageRequestValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
            RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(200);
            RuleFor(x => x.Phone).MaximumLength(50).When(x => x.Phone != null);
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
}
