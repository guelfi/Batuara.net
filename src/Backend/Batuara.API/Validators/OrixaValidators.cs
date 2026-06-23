using Batuara.Application.Orixas.Models;
using FluentValidation;

namespace Batuara.API.Validators
{
    public class CreateOrixaRequestValidator : AbstractValidator<CreateOrixaRequest>
    {
        public CreateOrixaRequestValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .MaximumLength(100);

            RuleFor(x => x.Description)
                .NotEmpty()
                .MaximumLength(10000);

            RuleFor(x => x.Characteristics)
                .NotEmpty();

            RuleFor(x => x.Colors)
                .NotEmpty();

            RuleFor(x => x.Elements)
                .NotEmpty();

            RuleFor(x => x.ImageUrl)
                .MaximumLength(500)
                .When(x => x.ImageUrl != null);
        }
    }

    public class UpdateOrixaRequestValidator : AbstractValidator<UpdateOrixaRequest>
    {
        public UpdateOrixaRequestValidator()
        {
            RuleFor(x => x.Name)
                .MaximumLength(100)
                .When(x => x.Name != null);

            RuleFor(x => x.Description)
                .MaximumLength(10000)
                .When(x => x.Description != null);

            RuleFor(x => x.ImageUrl)
                .MaximumLength(500)
                .When(x => x.ImageUrl != null);
        }
    }
}
