using System.Security.Claims;
using Batuara.Application.HouseMembers.Services;
using Batuara.Application.MemberAuth.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Batuara.API.Controllers
{
    [ApiController]
    [Authorize(Roles = "Member")]
    [Route("api/members/me")]
    public class MemberSelfServiceController : ControllerBase
    {
        private readonly IHouseMemberService _houseMemberService;

        public MemberSelfServiceController(IHouseMemberService houseMemberService)
        {
            _houseMemberService = houseMemberService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMe()
        {
            var houseMemberId = GetHouseMemberId();
            var member = await _houseMemberService.GetSelfProfileAsync(houseMemberId);
            return member == null ? NotFound(new { success = false, message = "Cadastro não encontrado." }) : Ok(new { success = true, data = member });
        }

        [HttpPut]
        public async Task<IActionResult> UpdateMe([FromBody] MemberSelfUpdateRequest request)
        {
            var houseMemberId = GetHouseMemberId();
            var result = await _houseMemberService.UpdateSelfProfileAsync(houseMemberId, request);
            if (result.Member != null)
            {
                return Ok(new { success = true, data = result.Member });
            }

            return result.Conflict
                ? Conflict(new { success = false, errors = result.Errors })
                : BadRequest(new { success = false, errors = result.Errors });
        }

        [HttpPost("contributions")]
        public async Task<IActionResult> AddContribution([FromBody] MemberContributionRequest request)
        {
            var houseMemberId = GetHouseMemberId();
            var result = await _houseMemberService.AddSelfContributionAsync(houseMemberId, request);
            return result.Member == null
                ? BadRequest(new { success = false, errors = result.Errors })
                : Ok(new { success = true, data = result.Member });
        }

        private int GetHouseMemberId()
        {
            var value = User.FindFirst("houseMemberId")?.Value
                ?? throw new UnauthorizedAccessException("houseMemberId claim is missing.");
            return int.Parse(value);
        }
    }
}
