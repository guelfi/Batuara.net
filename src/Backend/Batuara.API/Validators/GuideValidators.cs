using Batuara.Application.Guides.Models;
using FluentValidation;

namespace Batuara.API.Validators
{
    public class CreateGuideRequestValidator : AbstractValidator<CreateGuideRequest>
    {
        public CreateGuideRequestValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
            RuleFor(x => x.Description).NotEmpty().MaximumLength(8000);
            RuleFor(x => x.Specialties).NotEmpty();
            RuleForEach(x => x.Specialties).NotEmpty().MaximumLength(120);
            RuleFor(x => x.DisplayOrder).GreaterThan(0);
            RuleFor(x => x.Comida).MaximumLength(200).When(x => x.Comida != null);
            RuleFor(x => x.Fruta).MaximumLength(200).When(x => x.Fruta != null);
            RuleFor(x => x.DiaDaSemana).MaximumLength(200).When(x => x.DiaDaSemana != null);
            RuleFor(x => x.Cor).MaximumLength(100).When(x => x.Cor != null);
            RuleFor(x => x.Saudacao).MaximumLength(200).When(x => x.Saudacao != null);
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
