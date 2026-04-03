using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Batuara.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class ContentManagementModules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BankAccount",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankAccountType",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankAgency",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankName",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "City",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(120)",
                maxLength: 120,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CompanyDocument",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Complement",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "District",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(120)",
                maxLength: 120,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FacebookUrl",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HistoryHtml",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(50000)",
                maxLength: 50000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HistoryImageUrl",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HistorySubtitle",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HistoryTitle",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "HistoryVideoUrl",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InstitutionalEmail",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "MapEmbedUrl",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Number",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PixCity",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PixPayload",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PixRecipientName",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PrimaryPhone",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ReferenceNotes",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SecondaryPhone",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ServiceHours",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "State",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(2)",
                maxLength: 2,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Street",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "WhatsappNumber",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhatsappUrl",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "YoutubeUrl",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ZipCode",
                schema: "batuara",
                table: "SiteSettings",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "ContactMessages",
                schema: "batuara",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Phone = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    Subject = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false),
                    Message = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    AdminNotes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ReceivedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactMessages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Guides",
                schema: "batuara",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    PhotoUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Specialties = table.Column<string>(type: "jsonb", nullable: false),
                    EntryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    Phone = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    Whatsapp = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Guides", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HouseMembers",
                schema: "batuara",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FullName = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false),
                    BirthDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EntryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    HeadOrixaFront = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    HeadOrixaBack = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    HeadOrixaRonda = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    MobilePhone = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    ZipCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Street = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Number = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Complement = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    District = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    City = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    State = table.Column<string>(type: "character varying(2)", maxLength: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HouseMembers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HouseMemberContributions",
                schema: "batuara",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    HouseMemberId = table.Column<int>(type: "integer", nullable: false),
                    ReferenceMonth = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    PaidAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HouseMemberContributions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HouseMemberContributions_HouseMembers_HouseMemberId",
                        column: x => x.HouseMemberId,
                        principalSchema: "batuara",
                        principalTable: "HouseMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ContactMessages_Email",
                schema: "batuara",
                table: "ContactMessages",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_ContactMessages_Status_ReceivedAt",
                schema: "batuara",
                table: "ContactMessages",
                columns: new[] { "Status", "ReceivedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Guides_IsActive_DisplayOrder",
                schema: "batuara",
                table: "Guides",
                columns: new[] { "IsActive", "DisplayOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_Guides_Name",
                schema: "batuara",
                table: "Guides",
                column: "Name",
                filter: "\"IsActive\" = true");

            migrationBuilder.CreateIndex(
                name: "IX_HouseMemberContributions_HouseMemberId_ReferenceMonth",
                schema: "batuara",
                table: "HouseMemberContributions",
                columns: new[] { "HouseMemberId", "ReferenceMonth" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HouseMembers_Email",
                schema: "batuara",
                table: "HouseMembers",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_HouseMembers_FullName_IsActive",
                schema: "batuara",
                table: "HouseMembers",
                columns: new[] { "FullName", "IsActive" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContactMessages",
                schema: "batuara");

            migrationBuilder.DropTable(
                name: "Guides",
                schema: "batuara");

            migrationBuilder.DropTable(
                name: "HouseMemberContributions",
                schema: "batuara");

            migrationBuilder.DropTable(
                name: "HouseMembers",
                schema: "batuara");

            migrationBuilder.DropColumn(
                name: "BankAccount",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "BankAccountType",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "BankAgency",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "BankName",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "City",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "CompanyDocument",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "Complement",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "District",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "FacebookUrl",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "HistoryHtml",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "HistoryImageUrl",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "HistorySubtitle",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "HistoryTitle",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "HistoryVideoUrl",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "InstitutionalEmail",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "MapEmbedUrl",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "Number",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "PixCity",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "PixPayload",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "PixRecipientName",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "PrimaryPhone",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "ReferenceNotes",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "SecondaryPhone",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "ServiceHours",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "State",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "Street",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "WhatsappNumber",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "WhatsappUrl",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "YoutubeUrl",
                schema: "batuara",
                table: "SiteSettings");

            migrationBuilder.DropColumn(
                name: "ZipCode",
                schema: "batuara",
                table: "SiteSettings");
        }
    }
}
