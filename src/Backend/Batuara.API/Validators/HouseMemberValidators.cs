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
            RuleFor(x => x.HeadOrixaFront).MaximumLength(100).When(x => x.HeadOrixaFront != null);
            RuleFor(x => x.HeadOrixaBack).MaximumLength(100).When(x => x.HeadOrixaBack != null);
            RuleFor(x => x.HeadOrixaRonda).MaximumLength(100).When(x => x.HeadOrixaRonda != null);
            RuleFor(x => x.Email).EmailAddress().MaximumLength(200).When(x => !string.IsNullOrWhiteSpace(x.Email));
            RuleFor(x => x.MobilePhone).MaximumLength(50).When(x => x.MobilePhone != null);
            RuleFor(x => x.ZipCode).MaximumLength(20).When(x => x.ZipCode != null);
            RuleFor(x => x.Street).MaximumLength(300).When(x => x.Street != null);
            RuleFor(x => x.Number).MaximumLength(20).When(x => x.Number != null);
            RuleFor(x => x.Complement).MaximumLength(120).When(x => x.Complement != null);
            RuleFor(x => x.District).MaximumLength(120).When(x => x.District != null);
            RuleFor(x => x.City).MaximumLength(120).When(x => x.City != null);
            RuleFor(x => x.State).MaximumLength(10).When(x => x.State != null);
            RuleFor(x => x.BirthDate).NotEmpty().LessThan(DateTime.UtcNow.Date);
            RuleFor(x => x.EntryDate).LessThanOrEqualTo(DateTime.UtcNow.Date.AddYears(1)).When(x => x.EntryDate.HasValue);
            RuleFor(x => x.SmallParent).MaximumLength(200).When(x => x.SmallParent != null);
            RuleFor(x => x.ReligiousLeader).MaximumLength(200).When(x => x.ReligiousLeader != null);
            RuleFor(x => x.Notes).MaximumLength(2000).When(x => x.Notes != null);
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
