using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Batuara.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddMemberBroadcastOptIn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "WhatsAppOptIn",
                schema: "batuara",
                table: "HouseMembers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "WhatsAppOptInAt",
                schema: "batuara",
                table: "HouseMembers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhatsAppOptInSource",
                schema: "batuara",
                table: "HouseMembers",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "MemberBroadcastDeliveries",
                schema: "batuara",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Campaign = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    HouseMemberId = table.Column<int>(type: "integer", nullable: false),
                    PhoneE164 = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    TemplateName = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    WhatsAppMessageId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Error = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MemberBroadcastDeliveries", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MemberBroadcastDeliveries_Campaign_HouseMemberId",
                schema: "batuara",
                table: "MemberBroadcastDeliveries",
                columns: new[] { "Campaign", "HouseMemberId" },
                unique: true,
                filter: "\"Status\" = 'Sent'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MemberBroadcastDeliveries",
                schema: "batuara");

            migrationBuilder.DropColumn(
                name: "WhatsAppOptIn",
                schema: "batuara",
                table: "HouseMembers");

            migrationBuilder.DropColumn(
                name: "WhatsAppOptInAt",
                schema: "batuara",
                table: "HouseMembers");

            migrationBuilder.DropColumn(
                name: "WhatsAppOptInSource",
                schema: "batuara",
                table: "HouseMembers");
        }
    }
}
