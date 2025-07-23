using System;
using System.Linq;
using Batuara.Domain.Entities;

namespace Batuara.Domain.Specifications
{
    public class ActiveUmbandaLinesSpecification : BaseSpecification<UmbandaLine>
    {
        public ActiveUmbandaLinesSpecification() : base(ul => ul.IsActive)
        {
        }
    }

    public class UmbandaLinesByDisplayOrderSpecification : BaseSpecification<UmbandaLine>
    {
        public UmbandaLinesByDisplayOrderSpecification() 
            : base(ul => ul.IsActive)
        {
        }
    }

    public class UmbandaLineByNameSpecification : BaseSpecification<UmbandaLine>
    {
        public UmbandaLineByNameSpecification(string name) 
            : base(ul => ul.IsActive && ul.Name.ToLower() == name.ToLower())
        {
        }
    }

    public class UmbandaLinesByEntitySpecification : BaseSpecification<UmbandaLine>
    {
        public UmbandaLinesByEntitySpecification(string entity) 
            : base(ul => ul.IsActive && ul.Entities.Contains(entity))
        {
        }
    }

    public class UmbandaLinesByWorkingDaySpecification : BaseSpecification<UmbandaLine>
    {
        public UmbandaLinesByWorkingDaySpecification(DayOfWeek dayOfWeek) 
            : base(ul => ul.IsActive && ul.WorksOnDay(dayOfWeek))
        {
        }
    }

    public class UmbandaLinesSearchSpecification : BaseSpecification<UmbandaLine>
    {
        public UmbandaLinesSearchSpecification(string searchTerm) 
            : base(ul => ul.IsActive && 
                        (ul.Name.ToLower().Contains(searchTerm.ToLower()) ||
                         ul.Description.ToLower().Contains(searchTerm.ToLower()) ||
                         ul.Characteristics.ToLower().Contains(searchTerm.ToLower()) ||
                         ul.BatuaraInterpretation.ToLower().Contains(searchTerm.ToLower())))
        {
        }
    }

    public class TodayWorkingLinesSpecification : BaseSpecification<UmbandaLine>
    {
        public TodayWorkingLinesSpecification() 
            : base(ul => ul.IsActive && ul.WorksOnDay(DateTime.Today.DayOfWeek))
        {
        }
    }
}