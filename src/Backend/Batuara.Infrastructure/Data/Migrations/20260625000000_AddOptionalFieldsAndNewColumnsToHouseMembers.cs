using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Batuara.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddOptionalFieldsAndNewColumnsToHouseMembers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Tornar campos obrigatórios em nullable
            migrationBuilder.AlterColumn<string>(
                name: "State",
                schema: "batuara",
                table: "HouseMembers",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2)",
                oldMaxLength: 2);

            migrationBuilder.AlterColumn<string>(
                name: "Street",
                schema: "batuara",
                table: "HouseMembers",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "Number",
                schema: "batuara",
                table: "HouseMembers",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "MobilePhone",
                schema: "batuara",
                table: "HouseMembers",
                type: "character varying(40)",
                maxLength: 40,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(40)",
                oldMaxLength: 40);

            migrationBuilder.AlterColumn<string>(
                name: "HeadOrixaRonda",
                schema: "batuara",
                table: "HouseMembers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "HeadOrixaFront",
                schema: "batuara",
                table: "HouseMembers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "HeadOrixaBack",
                schema: "batuara",
                table: "HouseMembers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                schema: "batuara",
                table: "HouseMembers",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(150)",
                oldMaxLength: 150);

            migrationBuilder.AlterColumn<DateTime>(
                name: "EntryDate",
                schema: "batuara",
                table: "HouseMembers",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<string>(
                name: "District",
                schema: "batuara",
                table: "HouseMembers",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(120)",
                oldMaxLength: 120);

            migrationBuilder.AlterColumn<string>(
                name: "City",
                schema: "batuara",
                table: "HouseMembers",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(120)",
                oldMaxLength: 120);

            migrationBuilder.AlterColumn<string>(
                name: "ZipCode",
                schema: "batuara",
                table: "HouseMembers",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            // Adicionar novos campos
            migrationBuilder.AddColumn<DateTime>(
                name: "AmaciDate",
                schema: "batuara",
                table: "HouseMembers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "YaoDate",
                schema: "batuara",
                table: "HouseMembers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SmallParent",
                schema: "batuara",
                table: "HouseMembers",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReligiousLeader",
                schema: "batuara",
                table: "HouseMembers",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                schema: "batuara",
                table: "HouseMembers",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "AmaciDate", schema: "batuara", table: "HouseMembers");
            migrationBuilder.DropColumn(name: "YaoDate", schema: "batuara", table: "HouseMembers");
            migrationBuilder.DropColumn(name: "SmallParent", schema: "batuara", table: "HouseMembers");
            migrationBuilder.DropColumn(name: "ReligiousLeader", schema: "batuara", table: "HouseMembers");
            migrationBuilder.DropColumn(name: "Notes", schema: "batuara", table: "HouseMembers");

            migrationBuilder.AlterColumn<string>(name: "State", schema: "batuara", table: "HouseMembers", type: "character varying(2)", maxLength: 2, nullable: false, defaultValue: "", oldClrType: typeof(string), oldType: "character varying(10)", oldMaxLength: 10, oldNullable: true);
            migrationBuilder.AlterColumn<string>(name: "Street", schema: "batuara", table: "HouseMembers", type: "character varying(200)", maxLength: 200, nullable: false, defaultValue: "", oldClrType: typeof(string), oldType: "character varying(300)", oldMaxLength: 300, oldNullable: true);
            migrationBuilder.AlterColumn<string>(name: "Number", schema: "batuara", table: "HouseMembers", type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "", oldClrType: typeof(string), oldType: "character varying(20)", oldMaxLength: 20, oldNullable: true);
            migrationBuilder.AlterColumn<string>(name: "MobilePhone", schema: "batuara", table: "HouseMembers", type: "character varying(40)", maxLength: 40, nullable: false, defaultValue: "", oldClrType: typeof(string), oldType: "character varying(40)", oldMaxLength: 40, oldNullable: true);
            migrationBuilder.AlterColumn<string>(name: "HeadOrixaRonda", schema: "batuara", table: "HouseMembers", type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: "", oldClrType: typeof(string), oldType: "character varying(100)", oldMaxLength: 100, oldNullable: true);
            migrationBuilder.AlterColumn<string>(name: "HeadOrixaFront", schema: "batuara", table: "HouseMembers", type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: "", oldClrType: typeof(string), oldType: "character varying(100)", oldMaxLength: 100, oldNullable: true);
            migrationBuilder.AlterColumn<string>(name: "HeadOrixaBack", schema: "batuara", table: "HouseMembers", type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: "", oldClrType: typeof(string), oldType: "character varying(100)", oldMaxLength: 100, oldNullable: true);
            migrationBuilder.AlterColumn<string>(name: "Email", schema: "batuara", table: "HouseMembers", type: "character varying(150)", maxLength: 150, nullable: false, defaultValue: "", oldClrType: typeof(string), oldType: "character varying(150)", oldMaxLength: 150, oldNullable: true);
            migrationBuilder.AlterColumn<DateTime>(name: "EntryDate", schema: "batuara", table: "HouseMembers", type: "timestamp with time zone", nullable: false, defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), oldClrType: typeof(DateTime), oldType: "timestamp with time zone", oldNullable: true);
            migrationBuilder.AlterColumn<string>(name: "District", schema: "batuara", table: "HouseMembers", type: "character varying(120)", maxLength: 120, nullable: false, defaultValue: "", oldClrType: typeof(string), oldType: "character varying(120)", oldMaxLength: 120, oldNullable: true);
            migrationBuilder.AlterColumn<string>(name: "City", schema: "batuara", table: "HouseMembers", type: "character varying(120)", maxLength: 120, nullable: false, defaultValue: "", oldClrType: typeof(string), oldType: "character varying(120)", oldMaxLength: 120, oldNullable: true);
            migrationBuilder.AlterColumn<string>(name: "ZipCode", schema: "batuara", table: "HouseMembers", type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "", oldClrType: typeof(string), oldType: "character varying(20)", oldMaxLength: 20, oldNullable: true);
        }
    }
}
