using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Batuara.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBingoItemRetrieval : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "RetrievedAt",
                schema: "batuara",
                table: "BingoOrderItems",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RetrievedByHouseMemberId",
                schema: "batuara",
                table: "BingoOrderItems",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RetrievedAt",
                schema: "batuara",
                table: "BingoOrderItems");

            migrationBuilder.DropColumn(
                name: "RetrievedByHouseMemberId",
                schema: "batuara",
                table: "BingoOrderItems");
        }
    }
}
