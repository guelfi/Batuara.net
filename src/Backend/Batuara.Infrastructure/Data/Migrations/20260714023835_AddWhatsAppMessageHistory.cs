using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Batuara.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddWhatsAppMessageHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Email",
                schema: "batuara",
                table: "ContactMessages",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(150)",
                oldMaxLength: 150);

            migrationBuilder.CreateTable(
                name: "WhatsAppMessages",
                schema: "batuara",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ContactMessageId = table.Column<int>(type: "integer", nullable: false),
                    MessageId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SenderPhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    RecipientPhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Body = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: false),
                    IsFromMe = table.Column<bool>(type: "boolean", nullable: false),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WhatsAppMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WhatsAppMessages_ContactMessages_ContactMessageId",
                        column: x => x.ContactMessageId,
                        principalSchema: "batuara",
                        principalTable: "ContactMessages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WhatsAppMessages_ContactMessageId",
                schema: "batuara",
                table: "WhatsAppMessages",
                column: "ContactMessageId");

            migrationBuilder.CreateIndex(
                name: "IX_WhatsAppMessages_MessageId",
                schema: "batuara",
                table: "WhatsAppMessages",
                column: "MessageId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WhatsAppMessages_SenderPhone",
                schema: "batuara",
                table: "WhatsAppMessages",
                column: "SenderPhone");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WhatsAppMessages",
                schema: "batuara");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                schema: "batuara",
                table: "ContactMessages",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
        }
    }
}
