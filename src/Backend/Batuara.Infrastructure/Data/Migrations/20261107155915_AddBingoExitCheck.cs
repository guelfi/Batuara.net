using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Batuara.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBingoExitCheck : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ExitCheckedAt",
                schema: "batuara",
                table: "BingoTabs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExitCheckedByName",
                schema: "batuara",
                table: "BingoTabs",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExitCheckedAt",
                schema: "batuara",
                table: "BingoTabs");

            migrationBuilder.DropColumn(
                name: "ExitCheckedByName",
                schema: "batuara",
                table: "BingoTabs");
        }
    }
}
