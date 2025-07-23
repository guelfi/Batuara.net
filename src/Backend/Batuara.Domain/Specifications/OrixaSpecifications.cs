using System;
using System.Linq;
using Batuara.Domain.Entities;

namespace Batuara.Domain.Specifications
{
    public class ActiveOrixasSpecification : BaseSpecification<Orixa>
    {
        public ActiveOrixasSpecification() : base(o => o.IsActive)
        {
        }
    }

    public class OrixasByDisplayOrderSpecification : BaseSpecification<Orixa>
    {
        public OrixasByDisplayOrderSpecification() 
            : base(o => o.IsActive)
        {
        }
    }

    public class OrixaByNameSpecification : BaseSpecification<Orixa>
    {
        public OrixaByNameSpecification(string name) 
            : base(o => o.IsActive && o.Name.ToLower() == name.ToLower())
        {
        }
    }

    public class OrixasByColorSpecification : BaseSpecification<Orixa>
    {
        public OrixasByColorSpecification(string color) 
            : base(o => o.IsActive && o.Colors.Contains(color))
        {
        }
    }

    public class OrixasByElementSpecification : BaseSpecification<Orixa>
    {
        public OrixasByElementSpecification(string element) 
            : base(o => o.IsActive && o.Elements.Contains(element))
        {
        }
    }

    public class OrixasSearchSpecification : BaseSpecification<Orixa>
    {
        public OrixasSearchSpecification(string searchTerm) 
            : base(o => o.IsActive && 
                       (o.Name.ToLower().Contains(searchTerm.ToLower()) ||
                        o.Description.ToLower().Contains(searchTerm.ToLower()) ||
                        o.BatuaraTeaching.ToLower().Contains(searchTerm.ToLower())))
        {
        }
    }

    public class FeaturedOrixasSpecification : BaseSpecification<Orixa>
    {
        public FeaturedOrixasSpecification() 
            : base(o => o.IsActive && o.DisplayOrder <= 5) // Top 5 as featured
        {
        }
    }
}