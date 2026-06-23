using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Batuara.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddOrixasAndGuideSchemaChange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Email",
                schema: "batuara",
                table: "Guides");

            migrationBuilder.DropColumn(
                name: "EntryDate",
                schema: "batuara",
                table: "Guides");

            migrationBuilder.DropColumn(
                name: "Phone",
                schema: "batuara",
                table: "Guides");

            migrationBuilder.DropColumn(
                name: "PhotoUrl",
                schema: "batuara",
                table: "Guides");

            migrationBuilder.DropColumn(
                name: "Whatsapp",
                schema: "batuara",
                table: "Guides");

            migrationBuilder.AddColumn<string>(
                name: "Comida",
                schema: "batuara",
                table: "Orixas",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DiaDaSemana",
                schema: "batuara",
                table: "Orixas",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Fruta",
                schema: "batuara",
                table: "Orixas",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Saudacao",
                schema: "batuara",
                table: "Orixas",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Comida",
                schema: "batuara",
                table: "Guides",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Cor",
                schema: "batuara",
                table: "Guides",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DiaDaSemana",
                schema: "batuara",
                table: "Guides",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Fruta",
                schema: "batuara",
                table: "Guides",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Saudacao",
                schema: "batuara",
                table: "Guides",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Comida",
                schema: "batuara",
                table: "Orixas");

            migrationBuilder.DropColumn(
                name: "DiaDaSemana",
                schema: "batuara",
                table: "Orixas");

            migrationBuilder.DropColumn(
                name: "Fruta",
                schema: "batuara",
                table: "Orixas");

            migrationBuilder.DropColumn(
                name: "Saudacao",
                schema: "batuara",
                table: "Orixas");

            migrationBuilder.DropColumn(
                name: "Comida",
                schema: "batuara",
                table: "Guides");

            migrationBuilder.DropColumn(
                name: "Cor",
                schema: "batuara",
                table: "Guides");

            migrationBuilder.DropColumn(
                name: "DiaDaSemana",
                schema: "batuara",
                table: "Guides");

            migrationBuilder.DropColumn(
                name: "Fruta",
                schema: "batuara",
                table: "Guides");

            migrationBuilder.DropColumn(
                name: "Saudacao",
                schema: "batuara",
                table: "Guides");

            migrationBuilder.AddColumn<string>(
                name: "Email",
                schema: "batuara",
                table: "Guides",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EntryDate",
                schema: "batuara",
                table: "Guides",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                schema: "batuara",
                table: "Guides",
                type: "character varying(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhotoUrl",
                schema: "batuara",
                table: "Guides",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Whatsapp",
                schema: "batuara",
                table: "Guides",
                type: "character varying(40)",
                maxLength: 40,
                nullable: true);
        }
    }
}
