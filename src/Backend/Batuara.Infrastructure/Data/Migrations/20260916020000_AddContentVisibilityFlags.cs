using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Batuara.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddContentVisibilityFlags : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "OrixasVisibility",
                schema: "batuara",
                table: "SiteSettings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "GuidesVisibility",
                schema: "batuara",
                table: "SiteSettings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "UmbandaLinesVisibility",
                schema: "batuara",
                table: "SiteSettings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PrayersVisibility",
                schema: "batuara",
                table: "SiteSettings",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OrixasVisibility",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "GuidesVisibility",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "UmbandaLinesVisibility",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "PrayersVisibility",
                schema: "batuara",
                table: "SiteSettings");
        }
    }
}
