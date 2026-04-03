using Batuara.Application.SpiritualContents.Models;
using FluentValidation;

namespace Batuara.API.Validators
{
    public class CreateSpiritualContentRequestValidator : AbstractValidator<CreateSpiritualContentRequest>
    {
        public CreateSpiritualContentRequestValidator()
        {
            RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Content).NotEmpty().MaximumLength(10000);
            RuleFor(x => x.Source).NotEmpty().MaximumLength(200);
        }
    }

    public class UpdateSpiritualContentRequestValidator : AbstractValidator<UpdateSpiritualContentRequest>
    {
        public UpdateSpiritualContentRequestValidator()
        {
            RuleFor(x => x.Title).MaximumLength(200).When(x => x.Title != null);
            RuleFor(x => x.Content).MaximumLength(10000).When(x => x.Content != null);
            RuleFor(x => x.Source).MaximumLength(200).When(x => x.Source != null);
        }
    }
}
