using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Batuara.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "batuara");

            migrationBuilder.CreateTable(
                name: "CalendarAttendances",
                schema: "batuara",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Observations = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    RequiresRegistration = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    MaxCapacity = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CalendarAttendances", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Events",
                schema: "batuara",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "interval", nullable: true),
                    EndTime = table.Column<TimeSpan>(type: "interval", nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Location = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Events", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Orixas",
                schema: "batuara",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: false),
                    Origin = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    BatuaraTeaching = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    Characteristics = table.Column<string>(type: "jsonb", nullable: false),
                    Colors = table.Column<string>(type: "jsonb", nullable: false),
                    Elements = table.Column<string>(type: "jsonb", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orixas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SpiritualContents",
                schema: "batuara",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Content = table.Column<string>(type: "character varying(10000)", maxLength: 10000, nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    Source = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    IsFeatured = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpiritualContents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UmbandaLines",
                schema: "batuara",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: false),
                    Characteristics = table.Column<string>(type: "character varying(3000)", maxLength: 3000, nullable: false),
                    BatuaraInterpretation = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    Entities = table.Column<string>(type: "jsonb", nullable: false),
                    WorkingDays = table.Column<string>(type: "jsonb", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UmbandaLines", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CalendarAttendances_IsActive",
                schema: "batuara",
                table: "CalendarAttendances",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_CalendarAttendances_IsActive_Type",
                schema: "batuara",
                table: "CalendarAttendances",
                columns: new[] { "IsActive", "Type" });

            migrationBuilder.CreateIndex(
                name: "IX_CalendarAttendances_Type",
                schema: "batuara",
                table: "CalendarAttendances",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_Events_IsActive",
                schema: "batuara",
                table: "Events",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Events_IsActive_Type",
                schema: "batuara",
                table: "Events",
                columns: new[] { "IsActive", "Type" });

            migrationBuilder.CreateIndex(
                name: "IX_Events_Type",
                schema: "batuara",
                table: "Events",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_Orixas_DisplayOrder",
                schema: "batuara",
                table: "Orixas",
                column: "DisplayOrder");

            migrationBuilder.CreateIndex(
                name: "IX_Orixas_IsActive",
                schema: "batuara",
                table: "Orixas",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Orixas_IsActive_DisplayOrder",
                schema: "batuara",
                table: "Orixas",
                columns: new[] { "IsActive", "DisplayOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_Orixas_Name",
                schema: "batuara",
                table: "Orixas",
                column: "Name",
                unique: true,
                filter: "\"IsActive\" = true");

            migrationBuilder.CreateIndex(
                name: "IX_Orixas_Name_Description",
                schema: "batuara",
                table: "Orixas",
                columns: new[] { "Name", "Description" });

            migrationBuilder.CreateIndex(
                name: "IX_SpiritualContents_Category",
                schema: "batuara",
                table: "SpiritualContents",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_SpiritualContents_DisplayOrder",
                schema: "batuara",
                table: "SpiritualContents",
                column: "DisplayOrder");

            migrationBuilder.CreateIndex(
                name: "IX_SpiritualContents_IsActive",
                schema: "batuara",
                table: "SpiritualContents",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_SpiritualContents_IsActive_Category",
                schema: "batuara",
                table: "SpiritualContents",
                columns: new[] { "IsActive", "Category" });

            migrationBuilder.CreateIndex(
                name: "IX_SpiritualContents_IsActive_Category_DisplayOrder",
                schema: "batuara",
                table: "SpiritualContents",
                columns: new[] { "IsActive", "Category", "DisplayOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_SpiritualContents_IsActive_Category_Type",
                schema: "batuara",
                table: "SpiritualContents",
                columns: new[] { "IsActive", "Category", "Type" });

            migrationBuilder.CreateIndex(
                name: "IX_SpiritualContents_IsActive_IsFeatured",
                schema: "batuara",
                table: "SpiritualContents",
                columns: new[] { "IsActive", "IsFeatured" });

            migrationBuilder.CreateIndex(
                name: "IX_SpiritualContents_IsActive_Type",
                schema: "batuara",
                table: "SpiritualContents",
                columns: new[] { "IsActive", "Type" });

            migrationBuilder.CreateIndex(
                name: "IX_SpiritualContents_IsFeatured",
                schema: "batuara",
                table: "SpiritualContents",
                column: "IsFeatured");

            migrationBuilder.CreateIndex(
                name: "IX_SpiritualContents_Title_Category_Type",
                schema: "batuara",
                table: "SpiritualContents",
                columns: new[] { "Title", "Category", "Type" },
                unique: true,
                filter: "\"IsActive\" = true");

            migrationBuilder.CreateIndex(
                name: "IX_SpiritualContents_Title_Content",
                schema: "batuara",
                table: "SpiritualContents",
                columns: new[] { "Title", "Content" });

            migrationBuilder.CreateIndex(
                name: "IX_SpiritualContents_Type",
                schema: "batuara",
                table: "SpiritualContents",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_UmbandaLines_DisplayOrder",
                schema: "batuara",
                table: "UmbandaLines",
                column: "DisplayOrder");

            migrationBuilder.CreateIndex(
                name: "IX_UmbandaLines_IsActive",
                schema: "batuara",
                table: "UmbandaLines",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_UmbandaLines_IsActive_DisplayOrder",
                schema: "batuara",
                table: "UmbandaLines",
                columns: new[] { "IsActive", "DisplayOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_UmbandaLines_Name",
                schema: "batuara",
                table: "UmbandaLines",
                column: "Name",
                unique: true,
                filter: "\"IsActive\" = true");

            migrationBuilder.CreateIndex(
                name: "IX_UmbandaLines_Name_Description",
                schema: "batuara",
                table: "UmbandaLines",
                columns: new[] { "Name", "Description" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CalendarAttendances",
                schema: "batuara");

            migrationBuilder.DropTable(
                name: "Events",
                schema: "batuara");

            migrationBuilder.DropTable(
                name: "Orixas",
                schema: "batuara");

            migrationBuilder.DropTable(
                name: "SpiritualContents",
                schema: "batuara");

            migrationBuilder.DropTable(
                name: "UmbandaLines",
                schema: "batuara");
        }
    }
}
