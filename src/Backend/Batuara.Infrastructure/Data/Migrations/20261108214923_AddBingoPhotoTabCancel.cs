using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Batuara.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBingoPhotoTabCancel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CancelReason",
                schema: "batuara",
                table: "BingoPhotoTabs",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CancelledAt",
                schema: "batuara",
                table: "BingoPhotoTabs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CancelledByName",
                schema: "batuara",
                table: "BingoPhotoTabs",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CancelReason",
                schema: "batuara",
                table: "BingoPhotoTabs");

            migrationBuilder.DropColumn(
                name: "CancelledAt",
                schema: "batuara",
                table: "BingoPhotoTabs");

            migrationBuilder.DropColumn(
                name: "CancelledByName",
                schema: "batuara",
                table: "BingoPhotoTabs");
        }
    }
}
