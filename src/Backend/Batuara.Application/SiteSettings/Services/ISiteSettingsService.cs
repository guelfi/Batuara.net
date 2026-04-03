using Batuara.Application.SiteSettings.Models;

namespace Batuara.Application.SiteSettings.Services
{
    public interface ISiteSettingsService
    {
        Task<SiteSettingsDto> GetPublicAsync();
        Task<SiteSettingsDto> GetAsync();
        Task<SiteSettingsDto> UpdateAsync(UpdateSiteSettingsRequest request);
    }
}
