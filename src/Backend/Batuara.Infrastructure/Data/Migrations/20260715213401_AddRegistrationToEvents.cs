using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Batuara.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddRegistrationToEvents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MaxCapacity",
                schema: "batuara",
                table: "Events",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "RequiresRegistration",
                schema: "batuara",
                table: "Events",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql(@"
                INSERT INTO batuara.""Events"" (
                    ""Title"", ""Description"", ""Date"", ""StartTime"", ""EndTime"", ""Type"", 
                    ""Location"", ""ImageUrl"", ""card_color"", ""IsActive"", ""CreatedAt"", ""UpdatedAt"",
                    ""RequiresRegistration"", ""MaxCapacity""
                )
                SELECT 
                    ""Description"", COALESCE(""Observations"", ''), ""Date"", ""StartTime"", ""EndTime"",
                    CASE ""Type""
                        WHEN 3 THEN 5 -- Palestra: 3 (Attendance) -> 5 (Event)
                        WHEN 4 THEN 6 -- Curso: 4 (Attendance) -> 6 (Event)
                        WHEN 5 THEN 1 -- Festa: 5 (Attendance) -> 1 (Event)
                    END,
                    'Casa de Caridade Caboclo Batuara', NULL, NULL, ""IsActive"", ""CreatedAt"", ""UpdatedAt"",
                    ""RequiresRegistration"", ""MaxCapacity""
                FROM batuara.""CalendarAttendances"" 
                WHERE ""Type"" IN (3, 4, 5);

                DELETE FROM batuara.""CalendarAttendances"" WHERE ""Type"" IN (3, 4, 5);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO batuara.""CalendarAttendances"" (
                    ""Date"", ""StartTime"", ""EndTime"", ""Type"", ""Description"", ""Observations"", 
                    ""RequiresRegistration"", ""MaxCapacity"", ""CreatedAt"", ""UpdatedAt"", ""IsActive""
                )
                SELECT 
                    ""Date"", ""StartTime"", ""EndTime"",
                    CASE ""Type""
                        WHEN 5 THEN 3 -- Palestra: 5 (Event) -> 3 (Attendance)
                        WHEN 6 THEN 4 -- Curso: 6 (Event) -> 4 (Attendance)
                        WHEN 1 THEN 5 -- Festa: 1 (Event) -> 5 (Attendance)
                    END,
                    ""Title"", ""Description"", ""RequiresRegistration"", ""MaxCapacity"", ""CreatedAt"", ""UpdatedAt"", ""IsActive""
                FROM batuara.""Events""
                WHERE ""Type"" IN (1, 5, 6) 
                  AND ""Location"" = 'Casa de Caridade Caboclo Batuara' 
                  AND ""ImageUrl"" IS NULL 
                  AND ""card_color"" IS NULL;

                DELETE FROM batuara.""Events"" 
                WHERE ""Type"" IN (1, 5, 6) 
                  AND ""Location"" = 'Casa de Caridade Caboclo Batuara' 
                  AND ""ImageUrl"" IS NULL 
                  AND ""card_color"" IS NULL;
            ");

            migrationBuilder.DropColumn(
                name: "MaxCapacity",
                schema: "batuara",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "RequiresRegistration",
                schema: "batuara",
                table: "Events");
        }
    }
}
