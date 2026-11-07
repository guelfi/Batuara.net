using Batuara.Application.Bingo.Models;
using Batuara.Application.Bingo.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Batuara.API.Filters
{
    public class BingoExceptionFilterAttribute : ExceptionFilterAttribute
    {
        public override void OnException(ExceptionContext context)
        {
            var (status, message) = context.Exception switch
            {
                BingoException ex => (MapStatus(ex.Kind), ex.Message),
                UnauthorizedAccessException ex => (StatusCodes.Status401Unauthorized, ex.Message),
                _ => (0, string.Empty)
            };

            if (status == 0)
            {
                return;
            }

            context.Result = new ObjectResult(new { success = false, message, errors = new[] { message } })
            {
                StatusCode = status
            };
            context.ExceptionHandled = true;
        }

        private static int MapStatus(BingoErrorKind kind) => kind switch
        {
            BingoErrorKind.Validation => StatusCodes.Status400BadRequest,
            BingoErrorKind.NotFound => StatusCodes.Status404NotFound,
            BingoErrorKind.Conflict => StatusCodes.Status409Conflict,
            BingoErrorKind.Unauthorized => StatusCodes.Status401Unauthorized,
            BingoErrorKind.Forbidden => StatusCodes.Status403Forbidden,
            BingoErrorKind.TooManyRequests => StatusCodes.Status429TooManyRequests,
            _ => StatusCodes.Status400BadRequest
        };
    }

    [AttributeUsage(AttributeTargets.Method)]
    public sealed class BingoSkipWaiterAccessAttribute : Attribute
    {
    }

    public class BingoWaiterAccessFilter : IAsyncActionFilter
    {
        private readonly IBingoWaiterService _waiterService;

        public BingoWaiterAccessFilter(IBingoWaiterService waiterService)
        {
            _waiterService = waiterService;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var endpoint = context.HttpContext.GetEndpoint();
            if (endpoint?.Metadata.GetMetadata<IAllowAnonymous>() == null
                && endpoint?.Metadata.GetMetadata<BingoSkipWaiterAccessAttribute>() == null)
            {
                var claim = context.HttpContext.User.FindFirst("houseMemberId")?.Value;
                if (!int.TryParse(claim, out var houseMemberId))
                {
                    throw new BingoException(BingoErrorKind.Unauthorized, "Sessão inválida.");
                }

                await _waiterService.EnsureAccessAsync(houseMemberId, context.HttpContext.RequestAborted);
            }

            await next();
        }
    }
}
