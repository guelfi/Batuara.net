using Batuara.Application.Guides.Models;
using FluentValidation;

namespace Batuara.API.Validators
{
    public class CreateGuideRequestValidator : AbstractValidator<CreateGuideRequest>
    {
        public CreateGuideRequestValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
            RuleFor(x => x.Description).NotEmpty().MaximumLength(5000);
            RuleFor(x => x.PhotoUrl).MaximumLength(500).When(x => x.PhotoUrl != null);
            RuleFor(x => x.Specialties).NotEmpty();
            RuleForEach(x => x.Specialties).NotEmpty().MaximumLength(120);
            RuleFor(x => x.DisplayOrder).GreaterThan(0);
            RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
            RuleFor(x => x.Phone).MaximumLength(50).When(x => x.Phone != null);
            RuleFor(x => x.Whatsapp).MaximumLength(50).When(x => x.Whatsapp != null);
        }
    }

    public class UpdateGuideRequestValidator : AbstractValidator<UpdateGuideRequest>
    {
        public UpdateGuideRequestValidator()
        {
            Include(new CreateGuideRequestValidator());
        }
    }
}
