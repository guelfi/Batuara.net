using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Batuara.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBingoTableSeating : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PartySize",
                schema: "batuara",
                table: "BingoTabs",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<int>(
                name: "Capacity",
                schema: "batuara",
                table: "BingoTables",
                type: "integer",
                nullable: false,
                defaultValue: 4);

            migrationBuilder.AddColumn<bool>(
                name: "IsExclusive",
                schema: "batuara",
                table: "BingoTables",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 1,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 2,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 3,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 4,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 5,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 6,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 7,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 8,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 9,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 10,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 11,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 12,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 13,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 14,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 15,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 16,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 17,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 18,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 19,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 20,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 21,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 22,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 23,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 24,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 25,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 26,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 27,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 28,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 29,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 30,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 31,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 32,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 33,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 34,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 35,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 36,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 37,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 38,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 39,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 40,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 41,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 42,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 43,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 44,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 45,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 46,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 47,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 48,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 49,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 50,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 51,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 52,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 53,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 54,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 55,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 56,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 57,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 58,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 59,
                column: "Capacity",
                value: 4);

            migrationBuilder.UpdateData(
                schema: "batuara",
                table: "BingoTables",
                keyColumn: "Id",
                keyValue: 60,
                column: "Capacity",
                value: 4);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PartySize",
                schema: "batuara",
                table: "BingoTabs");

            migrationBuilder.DropColumn(
                name: "Capacity",
                schema: "batuara",
                table: "BingoTables");

            migrationBuilder.DropColumn(
                name: "IsExclusive",
                schema: "batuara",
                table: "BingoTables");
        }
    }
}
