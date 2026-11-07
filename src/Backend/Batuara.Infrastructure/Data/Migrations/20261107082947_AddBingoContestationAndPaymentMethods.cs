using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Batuara.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBingoContestationAndPaymentMethods : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "AmountPaid",
                schema: "batuara",
                table: "BingoTabs",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaidByName",
                schema: "batuara",
                table: "BingoTabs",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaidNote",
                schema: "batuara",
                table: "BingoTabs",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PaymentMethodId",
                schema: "batuara",
                table: "BingoTabs",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethodName",
                schema: "batuara",
                table: "BingoTabs",
                type: "character varying(60)",
                maxLength: 60,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CancelReason",
                schema: "batuara",
                table: "BingoOrderItems",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CancelledAt",
                schema: "batuara",
                table: "BingoOrderItems",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CancelledByName",
                schema: "batuara",
                table: "BingoOrderItems",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContestNote",
                schema: "batuara",
                table: "BingoOrderItems",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ContestedAt",
                schema: "batuara",
                table: "BingoOrderItems",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeliveredByName",
                schema: "batuara",
                table: "BingoOrderItems",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ResolvedAt",
                schema: "batuara",
                table: "BingoOrderItems",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResolvedByName",
                schema: "batuara",
                table: "BingoOrderItems",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BingoPaymentMethods",
                schema: "batuara",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BingoPaymentMethods", x => x.Id);
                });

            migrationBuilder.Sql(@"CREATE UNIQUE INDEX IF NOT EXISTS ""IX_BingoPaymentMethods_Name_Lower"" ON batuara.""BingoPaymentMethods"" (lower(""Name""));
INSERT INTO batuara.""BingoPaymentMethods"" (""Name"", ""SortOrder"") VALUES ('Dinheiro', 1), ('Pix', 2), ('Cartão de crédito', 3), ('Cartão de débito', 4) ON CONFLICT DO NOTHING;
UPDATE batuara.""BingoOrderItems"" i SET ""DeliveredByName"" = hm.""FullName"" FROM batuara.""HouseMembers"" hm WHERE i.""DeliveredByName"" IS NULL AND i.""DeliveredByHouseMemberId"" = hm.""Id"";
UPDATE batuara.""BingoTabs"" t SET ""AmountPaid"" = COALESCE((SELECT SUM(i.""UnitPrice"" * i.""Quantity"") FROM batuara.""BingoOrderItems"" i WHERE i.""TabId"" = t.""Id"" AND i.""Status"" <> 'Cancelled'), 0) WHERE t.""Status"" = 'Paid' AND t.""AmountPaid"" IS NULL;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BingoPaymentMethods",
                schema: "batuara");

            migrationBuilder.DropColumn(
                name: "AmountPaid",
                schema: "batuara",
                table: "BingoTabs");

            migrationBuilder.DropColumn(
                name: "PaidByName",
                schema: "batuara",
                table: "BingoTabs");

            migrationBuilder.DropColumn(
                name: "PaidNote",
                schema: "batuara",
                table: "BingoTabs");

            migrationBuilder.DropColumn(
                name: "PaymentMethodId",
                schema: "batuara",
                table: "BingoTabs");

            migrationBuilder.DropColumn(
                name: "PaymentMethodName",
                schema: "batuara",
                table: "BingoTabs");

            migrationBuilder.DropColumn(
                name: "CancelReason",
                schema: "batuara",
                table: "BingoOrderItems");

            migrationBuilder.DropColumn(
                name: "CancelledAt",
                schema: "batuara",
                table: "BingoOrderItems");

            migrationBuilder.DropColumn(
                name: "CancelledByName",
                schema: "batuara",
                table: "BingoOrderItems");

            migrationBuilder.DropColumn(
                name: "ContestNote",
                schema: "batuara",
                table: "BingoOrderItems");

            migrationBuilder.DropColumn(
                name: "ContestedAt",
                schema: "batuara",
                table: "BingoOrderItems");

            migrationBuilder.DropColumn(
                name: "DeliveredByName",
                schema: "batuara",
                table: "BingoOrderItems");

            migrationBuilder.DropColumn(
                name: "ResolvedAt",
                schema: "batuara",
                table: "BingoOrderItems");

            migrationBuilder.DropColumn(
                name: "ResolvedByName",
                schema: "batuara",
                table: "BingoOrderItems");
        }
    }
}
