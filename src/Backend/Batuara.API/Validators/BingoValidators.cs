using Batuara.Application.Bingo.Models;
using Batuara.Application.Common.PhoneNumbers;
using FluentValidation;

namespace Batuara.API.Validators
{
    public class BingoCreateTabRequestValidator : AbstractValidator<BingoCreateTabRequest>
    {
        public BingoCreateTabRequestValidator()
        {
            RuleFor(x => x.CustomerName).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Phone)
                .NotEmpty()
                .Must(IsBrazilMobile).WithMessage("Informe um celular válido com DDD.");
            RuleFor(x => x.Mesa).InclusiveBetween(1, 999);
            RuleFor(x => x.PartySize).InclusiveBetween(1, 20).WithMessage("Informe de 1 a 20 pessoas.");
        }

        private static bool IsBrazilMobile(string? phone)
        {
            var normalized = PhoneNumberNormalizer.NormalizeBrazilMobile(phone ?? string.Empty);
            return normalized.Length == 13 && normalized.StartsWith("55", StringComparison.Ordinal) && normalized[4] == '9';
        }
    }

    public class BingoAddItemsRequestValidator : AbstractValidator<BingoAddItemsRequest>
    {
        public BingoAddItemsRequestValidator()
        {
            RuleFor(x => x.Items).NotEmpty().Must(x => x == null || x.Count <= 50);
            RuleForEach(x => x.Items).ChildRules(line =>
            {
                line.RuleFor(l => l.MenuItemId).GreaterThan(0);
                line.RuleFor(l => l.Quantity).InclusiveBetween(1, 20).WithMessage("A quantidade deve ser de 1 a 20.");
            });
        }
    }

    public class BingoChangeTableRequestValidator : AbstractValidator<BingoChangeTableRequest>
    {
        public BingoChangeTableRequestValidator()
        {
            RuleFor(x => x.Mesa).InclusiveBetween(1, 999);
        }
    }

    public class BingoPayRequestValidator : AbstractValidator<BingoPayRequest>
    {
        public BingoPayRequestValidator()
        {
            RuleFor(x => x.TabIds).NotEmpty().Must(x => x == null || x.Count <= 50);
            RuleFor(x => x.PaymentMethodId).GreaterThan(0);
        }
    }

    public class BingoAdminPayRequestValidator : AbstractValidator<BingoAdminPayRequest>
    {
        public BingoAdminPayRequestValidator()
        {
            RuleFor(x => x.TabIds).NotEmpty().Must(x => x == null || x.Count <= 50);
            RuleFor(x => x.PaymentMethodId).GreaterThan(0);
            RuleFor(x => x.Note).MaximumLength(200);
        }
    }

    public class BingoMenuItemRequestValidator : AbstractValidator<BingoMenuItemRequest>
    {
        public BingoMenuItemRequestValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
            RuleFor(x => x.UnitPrice).InclusiveBetween(0m, 9999m);
            RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0).When(x => x.SortOrder.HasValue);
        }
    }

    public class BingoTablesRequestValidator : AbstractValidator<BingoTablesRequest>
    {
        public BingoTablesRequestValidator()
        {
            RuleFor(x => x.Quantidade).InclusiveBetween(1, 200);
        }
    }

    public class BingoTableSettingsRequestValidator : AbstractValidator<BingoTableSettingsRequest>
    {
        public BingoTableSettingsRequestValidator()
        {
            RuleFor(x => x.Mesas).NotEmpty().WithMessage("Informe ao menos uma mesa.");
            RuleForEach(x => x.Mesas).ChildRules(m =>
            {
                m.RuleFor(t => t.Numero).InclusiveBetween(1, 999);
                m.RuleFor(t => t.Lugares).InclusiveBetween(1, Batuara.Domain.Entities.BingoTable.MaxCapacity)
                    .WithMessage($"Os lugares da mesa devem ser de 1 a {Batuara.Domain.Entities.BingoTable.MaxCapacity}.");
            });
            RuleFor(x => x.Mesas)
                .Must(l => l.Select(t => t.Numero).Distinct().Count() == l.Count)
                .WithMessage("Há mesas repetidas na lista.");
        }
    }

    public class BingoAddWaiterRequestValidator : AbstractValidator<BingoAddWaiterRequest>
    {
        public BingoAddWaiterRequestValidator()
        {
            RuleFor(x => x.HouseMemberId).GreaterThan(0);
        }
    }

    public class BingoCreateEventRequestValidator : AbstractValidator<BingoCreateEventRequest>
    {
        public BingoCreateEventRequestValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
            RuleFor(x => x.EventDate).NotEqual(default(DateTime));
        }
    }
}
