using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Batuara.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddReasonRevokedToRefreshToken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ReasonRevoked",
                schema: "batuara",
                table: "refresh_tokens",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReasonRevoked",
                schema: "batuara",
                table: "refresh_tokens");
        }
    }
}
