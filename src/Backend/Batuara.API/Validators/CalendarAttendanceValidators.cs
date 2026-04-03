using Batuara.Application.Calendar.Models;
using FluentValidation;

namespace Batuara.API.Validators
{
    public class CreateCalendarAttendanceRequestValidator : AbstractValidator<CreateCalendarAttendanceRequest>
    {
        public CreateCalendarAttendanceRequestValidator()
        {
            RuleFor(x => x.Date)
                .NotEqual(default(DateTime));

            RuleFor(x => x)
                .Must(x => x.StartTime.HasValue && x.EndTime.HasValue && x.StartTime < x.EndTime)
                .WithMessage("StartTime must be before EndTime");

            RuleFor(x => x.MaxCapacity)
                .GreaterThan(0)
                .LessThanOrEqualTo(200)
                .When(x => x.MaxCapacity.HasValue);

            RuleFor(x => x.Description)
                .MaximumLength(500)
                .When(x => x.Description != null);

            RuleFor(x => x.Observations)
                .MaximumLength(1000)
                .When(x => x.Observations != null);
        }
    }

    public class UpdateCalendarAttendanceRequestValidator : AbstractValidator<UpdateCalendarAttendanceRequest>
    {
        public UpdateCalendarAttendanceRequestValidator()
        {
            RuleFor(x => x)
                .Must(x => !(x.StartTime.HasValue && x.EndTime.HasValue) || x.StartTime < x.EndTime)
                .WithMessage("StartTime must be before EndTime");

            RuleFor(x => x.MaxCapacity)
                .GreaterThan(0)
                .LessThanOrEqualTo(200)
                .When(x => x.MaxCapacity.HasValue);

            RuleFor(x => x.Description)
                .MaximumLength(500)
                .When(x => x.Description != null);

            RuleFor(x => x.Observations)
                .MaximumLength(1000)
                .When(x => x.Observations != null);
        }
    }
}
