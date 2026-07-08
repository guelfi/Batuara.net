using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Batuara.Infrastructure.Data.Migrations
{
    public partial class AddRecurringContributionAndWhatsAppContact : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsRecurring",
                schema: "batuara",
                table: "HouseMemberContributions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AllowWhatsAppReminder",
                schema: "batuara",
                table: "HouseMemberContributions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReminderSentAt",
                schema: "batuara",
                table: "HouseMemberContributions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReminderLastAttemptAt",
                schema: "batuara",
                table: "HouseMemberContributions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ReminderAttemptCount",
                schema: "batuara",
                table: "HouseMemberContributions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_HouseMemberContributions_Status_AllowWhatsAppReminder_DueDate_ReminderSentAt",
                schema: "batuara",
                table: "HouseMemberContributions",
                columns: new[] { "Status", "AllowWhatsAppReminder", "DueDate", "ReminderSentAt" });

            migrationBuilder.AddColumn<bool>(
                name: "WantsWhatsAppResponse",
                schema: "batuara",
                table: "ContactMessages",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "WhatsAppResponseSentAt",
                schema: "batuara",
                table: "ContactMessages",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhatsAppResponseText",
                schema: "batuara",
                table: "ContactMessages",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ContactMessages_WantsWhatsAppResponse_WhatsAppResponseSentAt",
                schema: "batuara",
                table: "ContactMessages",
                columns: new[] { "WantsWhatsAppResponse", "WhatsAppResponseSentAt" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_HouseMemberContributions_Status_AllowWhatsAppReminder_DueDate_ReminderSentAt",
                schema: "batuara",
                table: "HouseMemberContributions");

            migrationBuilder.DropIndex(
                name: "IX_ContactMessages_WantsWhatsAppResponse_WhatsAppResponseSentAt",
                schema: "batuara",
                table: "ContactMessages");

            migrationBuilder.DropColumn(name: "IsRecurring", schema: "batuara", table: "HouseMemberContributions");
            migrationBuilder.DropColumn(name: "AllowWhatsAppReminder", schema: "batuara", table: "HouseMemberContributions");
            migrationBuilder.DropColumn(name: "ReminderSentAt", schema: "batuara", table: "HouseMemberContributions");
            migrationBuilder.DropColumn(name: "ReminderLastAttemptAt", schema: "batuara", table: "HouseMemberContributions");
            migrationBuilder.DropColumn(name: "ReminderAttemptCount", schema: "batuara", table: "HouseMemberContributions");
            migrationBuilder.DropColumn(name: "WantsWhatsAppResponse", schema: "batuara", table: "ContactMessages");
            migrationBuilder.DropColumn(name: "WhatsAppResponseSentAt", schema: "batuara", table: "ContactMessages");
            migrationBuilder.DropColumn(name: "WhatsAppResponseText", schema: "batuara", table: "ContactMessages");
        }
    }
}
