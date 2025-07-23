using AutoMapper;
using Batuara.Application.Auth.Models;
using Batuara.Domain.Entities;

namespace Batuara.Application.Common.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Auth mappings
            CreateMap<User, UserDto>();
        }
    }
}