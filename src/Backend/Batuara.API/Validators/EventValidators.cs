using Batuara.Application.Events.Models;
using FluentValidation;

namespace Batuara.API.Validators
{
    public class CreateEventRequestValidator : AbstractValidator<CreateEventRequest>
    {
        public CreateEventRequestValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty()
                .MaximumLength(200);

            RuleFor(x => x.Description)
                .NotEmpty()
                .MaximumLength(2000);

            RuleFor(x => x.Date)
                .NotEqual(default(DateTime));

            RuleFor(x => x.Location)
                .MaximumLength(200)
                .When(x => x.Location != null);

            RuleFor(x => x.ImageUrl)
                .MaximumLength(1000)
                .When(x => x.ImageUrl != null);

            RuleFor(x => x)
                .Must(x => !(x.StartTime.HasValue && x.EndTime.HasValue) || x.StartTime < x.EndTime)
                .WithMessage("StartTime must be before EndTime");
        }
    }

    public class UpdateEventRequestValidator : AbstractValidator<UpdateEventRequest>
    {
        public UpdateEventRequestValidator()
        {
            RuleFor(x => x.Title)
                .MaximumLength(200)
                .When(x => x.Title != null);

            RuleFor(x => x.Description)
                .MaximumLength(2000)
                .When(x => x.Description != null);

            RuleFor(x => x.Location)
                .MaximumLength(200)
                .When(x => x.Location != null);

            RuleFor(x => x.ImageUrl)
                .MaximumLength(1000)
                .When(x => x.ImageUrl != null);

            RuleFor(x => x)
                .Must(x => !(x.StartTime.HasValue && x.EndTime.HasValue) || x.StartTime < x.EndTime)
                .WithMessage("StartTime must be before EndTime");
        }
    }
}
