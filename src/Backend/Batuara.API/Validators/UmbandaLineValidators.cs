using Batuara.Application.UmbandaLines.Models;
using FluentValidation;

namespace Batuara.API.Validators
{
    public class CreateUmbandaLineRequestValidator : AbstractValidator<CreateUmbandaLineRequest>
    {
        public CreateUmbandaLineRequestValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Description).NotEmpty().MaximumLength(5000);
            RuleFor(x => x.Characteristics).NotEmpty().MaximumLength(3000);
            RuleFor(x => x.BatuaraInterpretation).NotEmpty().MaximumLength(5000);
            RuleFor(x => x.Entities).NotEmpty();
        }
    }

    public class UpdateUmbandaLineRequestValidator : AbstractValidator<UpdateUmbandaLineRequest>
    {
        public UpdateUmbandaLineRequestValidator()
        {
            RuleFor(x => x.Name).MaximumLength(100).When(x => x.Name != null);
            RuleFor(x => x.Description).MaximumLength(5000).When(x => x.Description != null);
            RuleFor(x => x.Characteristics).MaximumLength(3000).When(x => x.Characteristics != null);
            RuleFor(x => x.BatuaraInterpretation).MaximumLength(5000).When(x => x.BatuaraInterpretation != null);
        }
    }
}
