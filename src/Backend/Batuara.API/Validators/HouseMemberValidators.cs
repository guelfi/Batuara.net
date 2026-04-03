using Batuara.Application.HouseMembers.Models;
using FluentValidation;

namespace Batuara.API.Validators
{
    public class HouseMemberContributionInputValidator : AbstractValidator<HouseMemberContributionInput>
    {
        public HouseMemberContributionInputValidator()
        {
            RuleFor(x => x.ReferenceMonth).NotEmpty();
            RuleFor(x => x.DueDate).NotEmpty();
            RuleFor(x => x.Amount).GreaterThan(0);
            RuleFor(x => x.Notes).MaximumLength(1000).When(x => x.Notes != null);
        }
    }

    public class CreateHouseMemberRequestValidator : AbstractValidator<CreateHouseMemberRequest>
    {
        public CreateHouseMemberRequestValidator()
        {
            RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
            RuleFor(x => x.HeadOrixaFront).NotEmpty().MaximumLength(100);
            RuleFor(x => x.HeadOrixaBack).NotEmpty().MaximumLength(100);
            RuleFor(x => x.HeadOrixaRonda).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(200);
            RuleFor(x => x.MobilePhone).NotEmpty().MaximumLength(50);
            RuleFor(x => x.ZipCode).NotEmpty().MaximumLength(20);
            RuleFor(x => x.Street).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Number).NotEmpty().MaximumLength(20);
            RuleFor(x => x.Complement).MaximumLength(120).When(x => x.Complement != null);
            RuleFor(x => x.District).NotEmpty().MaximumLength(120);
            RuleFor(x => x.City).NotEmpty().MaximumLength(120);
            RuleFor(x => x.State).NotEmpty().Length(2);
            RuleFor(x => x.BirthDate).LessThan(DateTime.UtcNow.Date);
            RuleFor(x => x.EntryDate).LessThanOrEqualTo(DateTime.UtcNow.Date.AddYears(1));
            RuleForEach(x => x.Contributions).SetValidator(new HouseMemberContributionInputValidator());
        }
    }

    public class UpdateHouseMemberRequestValidator : AbstractValidator<UpdateHouseMemberRequest>
    {
        public UpdateHouseMemberRequestValidator()
        {
            Include(new CreateHouseMemberRequestValidator());
        }
    }
}
