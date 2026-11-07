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
            RuleFor(x => x.Method).IsInEnum();
        }
    }

    public class BingoPayOneRequestValidator : AbstractValidator<BingoPayOneRequest>
    {
        public BingoPayOneRequestValidator()
        {
            RuleFor(x => x.Method).IsInEnum();
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
