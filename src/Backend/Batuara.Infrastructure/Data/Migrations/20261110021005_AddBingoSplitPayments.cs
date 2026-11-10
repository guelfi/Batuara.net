using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Batuara.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBingoSplitPayments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PaymentsJson",
                schema: "batuara",
                table: "BingoTabs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentsJson",
                schema: "batuara",
                table: "BingoPhotoTabs",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PaymentsJson",
                schema: "batuara",
                table: "BingoTabs");

            migrationBuilder.DropColumn(
                name: "PaymentsJson",
                schema: "batuara",
                table: "BingoPhotoTabs");
        }
    }
}
