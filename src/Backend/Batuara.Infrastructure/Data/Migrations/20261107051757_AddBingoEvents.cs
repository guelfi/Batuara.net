using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Batuara.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBingoEvents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BingoEvents",
                schema: "batuara",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    EventDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    IsTest = table.Column<bool>(type: "boolean", nullable: false),
                    CloseAllRequested = table.Column<bool>(type: "boolean", nullable: false),
                    OpenedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ClosedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BingoEvents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BingoMenuItems",
                schema: "batuara",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EventId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    IsAvailable = table.Column<bool>(type: "boolean", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BingoMenuItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BingoMenuItems_BingoEvents_EventId",
                        column: x => x.EventId,
                        principalSchema: "batuara",
                        principalTable: "BingoEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BingoTables",
                schema: "batuara",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EventId = table.Column<int>(type: "integer", nullable: false),
                    Number = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BingoTables", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BingoTables_BingoEvents_EventId",
                        column: x => x.EventId,
                        principalSchema: "batuara",
                        principalTable: "BingoEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BingoTabs",
                schema: "batuara",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EventId = table.Column<int>(type: "integer", nullable: false),
                    TableNumber = table.Column<int>(type: "integer", nullable: false),
                    CustomerName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    PaymentMethod = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    PaidAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PaidByHouseMemberId = table.Column<int>(type: "integer", nullable: true),
                    LinkSentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LinkLastAttemptAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BingoTabs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BingoTabs_BingoEvents_EventId",
                        column: x => x.EventId,
                        principalSchema: "batuara",
                        principalTable: "BingoEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BingoWaiters",
                schema: "batuara",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EventId = table.Column<int>(type: "integer", nullable: false),
                    HouseMemberId = table.Column<int>(type: "integer", nullable: false),
                    LastSeenAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BingoWaiters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BingoWaiters_BingoEvents_EventId",
                        column: x => x.EventId,
                        principalSchema: "batuara",
                        principalTable: "BingoEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BingoWaiters_HouseMembers_HouseMemberId",
                        column: x => x.HouseMemberId,
                        principalSchema: "batuara",
                        principalTable: "HouseMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BingoOrderItems",
                schema: "batuara",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TabId = table.Column<Guid>(type: "uuid", nullable: false),
                    MenuItemId = table.Column<int>(type: "integer", nullable: false),
                    ItemName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    DeliveredByHouseMemberId = table.Column<int>(type: "integer", nullable: true),
                    DeliveredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BingoOrderItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BingoOrderItems_BingoMenuItems_MenuItemId",
                        column: x => x.MenuItemId,
                        principalSchema: "batuara",
                        principalTable: "BingoMenuItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BingoOrderItems_BingoTabs_TabId",
                        column: x => x.TabId,
                        principalSchema: "batuara",
                        principalTable: "BingoTabs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                schema: "batuara",
                table: "BingoEvents",
                columns: new[] { "Id", "CloseAllRequested", "ClosedAt", "CreatedAt", "EventDate", "IsActive", "IsTest", "Name", "OpenedAt", "Status", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, false, null, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 11, 7, 0, 0, 0, 0, DateTimeKind.Utc), true, false, "Bingo 07/11/2026", null, "Draft", new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, false, null, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, true, "Teste", null, "Draft", new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.InsertData(
                schema: "batuara",
                table: "BingoMenuItems",
                columns: new[] { "Id", "CreatedAt", "EventId", "IsActive", "IsAvailable", "Name", "SortOrder", "UnitPrice", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, true, "Água", 1, 5m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, true, "Cachorro-quente", 2, 10m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, true, "Cartela avulsa", 3, 7m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 4, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, true, "Cartelas para todas rodadas - qtd. 10", 4, 50m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 5, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, true, "Cerveja Heineken", 5, 7m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 6, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, true, "Cervejas diversas", 6, 5m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 7, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, true, "Churrasco de carne", 7, 12m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 8, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, true, "Churrasco de frango", 8, 10m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 9, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, true, "Churrasco de linguiça", 9, 10m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 10, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, true, "Fatia de bolo", 10, 5m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 11, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, true, "Fatia de cuscuz paulista", 11, 5m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 12, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, true, "Mousse de chocolate", 12, 5m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 13, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, true, "Porção de batata frita", 13, 15m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 14, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, true, "Porção de calabresa acebolada", 14, 15m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 15, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, true, "Refrigerante", 15, 8m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 16, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, true, "Salada", 16, 7m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 17, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, true, "Água", 1, 5m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 18, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, true, "Cachorro-quente", 2, 10m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 19, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, true, "Cartela avulsa", 3, 7m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 20, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, true, "Cartelas para todas rodadas - qtd. 10", 4, 50m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 21, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, true, "Cerveja Heineken", 5, 7m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 22, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, true, "Cervejas diversas", 6, 5m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 23, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, true, "Churrasco de carne", 7, 12m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 24, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, true, "Churrasco de frango", 8, 10m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 25, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, true, "Churrasco de linguiça", 9, 10m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 26, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, true, "Fatia de bolo", 10, 5m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 27, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, true, "Fatia de cuscuz paulista", 11, 5m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 28, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, true, "Mousse de chocolate", 12, 5m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 29, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, true, "Porção de batata frita", 13, 15m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 30, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, true, "Porção de calabresa acebolada", 14, 15m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 31, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, true, "Refrigerante", 15, 8m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 32, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, true, "Salada", 16, 7m, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.InsertData(
                schema: "batuara",
                table: "BingoTables",
                columns: new[] { "Id", "CreatedAt", "EventId", "IsActive", "Number", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 1, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 2, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 3, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 4, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 4, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 5, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 5, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 6, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 6, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 7, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 7, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 8, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 8, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 9, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 9, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 10, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 10, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 11, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 11, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 12, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 12, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 13, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 13, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 14, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 14, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 15, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 15, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 16, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 16, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 17, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 17, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 18, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 18, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 19, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 19, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 20, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 20, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 21, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 21, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 22, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 22, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 23, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 23, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 24, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 24, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 25, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 25, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 26, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 26, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 27, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 27, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 28, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 28, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 29, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 29, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 30, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, true, 30, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 31, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 1, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 32, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 2, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 33, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 3, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 34, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 4, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 35, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 5, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 36, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 6, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 37, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 7, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 38, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 8, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 39, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 9, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 40, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 10, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 41, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 11, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 42, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 12, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 43, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 13, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 44, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 14, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 45, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 15, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 46, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 16, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 47, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 17, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 48, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 18, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 49, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 19, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 50, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 20, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 51, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 21, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 52, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 22, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 53, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 23, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 54, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 24, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 55, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 25, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 56, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 26, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 57, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 27, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 58, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 28, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 59, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 29, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 60, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc), 2, true, 30, new DateTime(2026, 11, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_BingoEvents_SingleOpen",
                schema: "batuara",
                table: "BingoEvents",
                column: "Status",
                unique: true,
                filter: "\"Status\" = 'Open'");

            migrationBuilder.CreateIndex(
                name: "IX_BingoMenuItems_EventId_SortOrder",
                schema: "batuara",
                table: "BingoMenuItems",
                columns: new[] { "EventId", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_BingoOrderItems_MenuItemId",
                schema: "batuara",
                table: "BingoOrderItems",
                column: "MenuItemId");

            migrationBuilder.CreateIndex(
                name: "IX_BingoOrderItems_Status",
                schema: "batuara",
                table: "BingoOrderItems",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_BingoOrderItems_TabId",
                schema: "batuara",
                table: "BingoOrderItems",
                column: "TabId");

            migrationBuilder.CreateIndex(
                name: "IX_BingoTables_EventId_Number",
                schema: "batuara",
                table: "BingoTables",
                columns: new[] { "EventId", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BingoTabs_EventId_Status",
                schema: "batuara",
                table: "BingoTabs",
                columns: new[] { "EventId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_BingoTabs_Phone",
                schema: "batuara",
                table: "BingoTabs",
                column: "Phone");

            migrationBuilder.CreateIndex(
                name: "IX_BingoWaiters_EventId_HouseMemberId",
                schema: "batuara",
                table: "BingoWaiters",
                columns: new[] { "EventId", "HouseMemberId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BingoWaiters_HouseMemberId",
                schema: "batuara",
                table: "BingoWaiters",
                column: "HouseMemberId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BingoOrderItems",
                schema: "batuara");

            migrationBuilder.DropTable(
                name: "BingoTables",
                schema: "batuara");

            migrationBuilder.DropTable(
                name: "BingoWaiters",
                schema: "batuara");

            migrationBuilder.DropTable(
                name: "BingoMenuItems",
                schema: "batuara");

            migrationBuilder.DropTable(
                name: "BingoTabs",
                schema: "batuara");

            migrationBuilder.DropTable(
                name: "BingoEvents",
                schema: "batuara");
        }
    }
}
