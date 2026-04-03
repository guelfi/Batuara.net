using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Batuara.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveHistoryMediaFromSiteSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HistoryImageUrl",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "HistoryVideoUrl",
                schema: "batuara",
                table: "SiteSettings");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "HistoryImageUrl",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HistoryVideoUrl",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }
    }
}
