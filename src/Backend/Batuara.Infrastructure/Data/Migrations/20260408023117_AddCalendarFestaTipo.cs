using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Batuara.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCalendarFestaTipo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Atualiza constraint de Type em CalendarAttendances para permitir Festa=5
            migrationBuilder.Sql(
                @"ALTER TABLE batuara.""CalendarAttendances"" 
                  DROP CONSTRAINT IF EXISTS ""CK_seed_calendar_Attendances_Type_Valid"";
                  ALTER TABLE batuara.""CalendarAttendances"" 
                  ADD CONSTRAINT ""CK_seed_calendar_Attendances_Type_Valid"" 
                  CHECK (""Type"" >= 1 AND ""Type"" <= 5);");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                @"ALTER TABLE batuara.""CalendarAttendances"" 
                  DROP CONSTRAINT IF EXISTS ""CK_seed_calendar_Attendances_Type_Valid"";
                  ALTER TABLE batuara.""CalendarAttendances"" 
                  ADD CONSTRAINT ""CK_seed_calendar_Attendances_Type_Valid"" 
                  CHECK (""Type"" >= 1 AND ""Type"" <= 4);");
        }
    }
}
