using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Batuara.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBingoPhoneVerification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CodeDeliveryError",
                schema: "batuara",
                table: "BingoTabs",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CodeDeliveryStatus",
                schema: "batuara",
                table: "BingoTabs",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CodeLastSentAt",
                schema: "batuara",
                table: "BingoTabs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CodeMessageId",
                schema: "batuara",
                table: "BingoTabs",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CodeSendCount",
                schema: "batuara",
                table: "BingoTabs",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "CodeWindowStartedAt",
                schema: "batuara",
                table: "BingoTabs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PhoneVerifiedAt",
                schema: "batuara",
                table: "BingoTabs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReminderDeliveryError",
                schema: "batuara",
                table: "BingoTabs",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReminderDeliveryStatus",
                schema: "batuara",
                table: "BingoTabs",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReminderMessageId",
                schema: "batuara",
                table: "BingoTabs",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReminderSentAt",
                schema: "batuara",
                table: "BingoTabs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "VerificationAttempts",
                schema: "batuara",
                table: "BingoTabs",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "VerificationCodeExpiresAt",
                schema: "batuara",
                table: "BingoTabs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VerificationCodeHash",
                schema: "batuara",
                table: "BingoTabs",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_BingoTabs_CodeMessageId",
                schema: "batuara",
                table: "BingoTabs",
                column: "CodeMessageId");

            migrationBuilder.CreateIndex(
                name: "IX_BingoTabs_ReminderMessageId",
                schema: "batuara",
                table: "BingoTabs",
                column: "ReminderMessageId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_BingoTabs_CodeMessageId",
                schema: "batuara",
                table: "BingoTabs");

            migrationBuilder.DropIndex(
                name: "IX_BingoTabs_ReminderMessageId",
                schema: "batuara",
                table: "BingoTabs");

            migrationBuilder.DropColumn(
                name: "CodeDeliveryError",
                schema: "batuara",
                table: "BingoTabs");

            migrationBuilder.DropColumn(
                name: "CodeDeliveryStatus",
                schema: "batuara",
                table: "BingoTabs");

            migrationBuilder.DropColumn(
                name: "CodeLastSentAt",
                schema: "batuara",
                table: "BingoTabs");

            migrationBuilder.DropColumn(
                name: "CodeMessageId",
                schema: "batuara",
                table: "BingoTabs");

            migrationBuilder.DropColumn(
                name: "CodeSendCount",
                schema: "batuara",
                table: "BingoTabs");

            migrationBuilder.DropColumn(
                name: "CodeWindowStartedAt",
                schema: "batuara",
                table: "BingoTabs");

            migrationBuilder.DropColumn(
                name: "PhoneVerifiedAt",
                schema: "batuara",
                table: "BingoTabs");

            migrationBuilder.DropColumn(
                name: "ReminderDeliveryError",
                schema: "batuara",
                table: "BingoTabs");

            migrationBuilder.DropColumn(
                name: "ReminderDeliveryStatus",
                schema: "batuara",
                table: "BingoTabs");

            migrationBuilder.DropColumn(
                name: "ReminderMessageId",
                schema: "batuara",
                table: "BingoTabs");

            migrationBuilder.DropColumn(
                name: "ReminderSentAt",
                schema: "batuara",
                table: "BingoTabs");

            migrationBuilder.DropColumn(
                name: "VerificationAttempts",
                schema: "batuara",
                table: "BingoTabs");

            migrationBuilder.DropColumn(
                name: "VerificationCodeExpiresAt",
                schema: "batuara",
                table: "BingoTabs");

            migrationBuilder.DropColumn(
                name: "VerificationCodeHash",
                schema: "batuara",
                table: "BingoTabs");
        }
    }
}
