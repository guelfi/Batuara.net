using System;
using Batuara.Domain.Entities;
using Batuara.Domain.Enums;

namespace Batuara.Domain.Specifications
{
    public class ActiveSpiritualContentSpecification : BaseSpecification<SpiritualContent>
    {
        public ActiveSpiritualContentSpecification() : base(sc => sc.IsActive)
        {
        }
    }

    public class SpiritualContentByTypeSpecification : BaseSpecification<SpiritualContent>
    {
        public SpiritualContentByTypeSpecification(SpiritualContentType type) 
            : base(sc => sc.IsActive && sc.Type == type)
        {
        }
    }

    public class SpiritualContentByCategorySpecification : BaseSpecification<SpiritualContent>
    {
        public SpiritualContentByCategorySpecification(SpiritualCategory category) 
            : base(sc => sc.IsActive && (sc.Category == category || sc.Category == SpiritualCategory.General))
        {
        }
    }

    public class SpiritualContentBySourceSpecification : BaseSpecification<SpiritualContent>
    {
        public SpiritualContentBySourceSpecification(string source) 
            : base(sc => sc.IsActive && sc.Source.ToLower().Contains(source.ToLower()))
        {
        }
    }

    public class FeaturedSpiritualContentSpecification : BaseSpecification<SpiritualContent>
    {
        public FeaturedSpiritualContentSpecification() 
            : base(sc => sc.IsActive && sc.IsFeatured)
        {
        }
    }

    public class SpiritualContentSearchSpecification : BaseSpecification<SpiritualContent>
    {
        public SpiritualContentSearchSpecification(string searchTerm) 
            : base(sc => sc.IsActive && 
                        (sc.Title.ToLower().Contains(searchTerm.ToLower()) ||
                         sc.Content.ToLower().Contains(searchTerm.ToLower())))
        {
        }
    }

    public class PrayersSpecification : BaseSpecification<SpiritualContent>
    {
        public PrayersSpecification() 
            : base(sc => sc.IsActive && sc.Type == SpiritualContentType.Prayer)
        {
        }
    }

    public class TeachingsSpecification : BaseSpecification<SpiritualContent>
    {
        public TeachingsSpecification() 
            : base(sc => sc.IsActive && sc.Type == SpiritualContentType.Teaching)
        {
        }
    }

    public class UmbandaPrayersSpecification : BaseSpecification<SpiritualContent>
    {
        public UmbandaPrayersSpecification() 
            : base(sc => sc.IsActive && 
                        sc.Type == SpiritualContentType.Prayer && 
                        (sc.Category == SpiritualCategory.Umbanda || sc.Category == SpiritualCategory.General))
        {
        }
    }

    public class KardecismoPrayersSpecification : BaseSpecification<SpiritualContent>
    {
        public KardecismoPrayersSpecification() 
            : base(sc => sc.IsActive && 
                        sc.Type == SpiritualContentType.Prayer && 
                        (sc.Category == SpiritualCategory.Kardecismo || sc.Category == SpiritualCategory.General))
        {
        }
    }

    public class BatuaraSourceContentSpecification : BaseSpecification<SpiritualContent>
    {
        public BatuaraSourceContentSpecification() 
            : base(sc => sc.IsActive && sc.Source.ToLower().Contains("batuara"))
        {
        }
    }
}