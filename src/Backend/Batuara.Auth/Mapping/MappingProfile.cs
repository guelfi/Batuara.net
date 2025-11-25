using AutoMapper;
using Batuara.Auth.DTOs;
using Batuara.Auth.Models;

namespace Batuara.Auth.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User mappings
            CreateMap<User, UserDto>();
            CreateMap<CreateUserDto, User>();
            
            // UserActivity mappings
            CreateMap<UserActivity, UserActivityDto>();
            
            // UserPreferences mappings
            CreateMap<UserPreferences, UserPreferencesDto>();
            CreateMap<UpdateUserPreferencesDto, UserPreferences>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}