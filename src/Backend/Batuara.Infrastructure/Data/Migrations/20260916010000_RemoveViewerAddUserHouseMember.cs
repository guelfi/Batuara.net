using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Batuara.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveViewerAddUserHouseMember : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // a) Old Viewer (3) → Editor (2)
            migrationBuilder.Sql(@"
                UPDATE batuara.users SET role = 2 WHERE role = 3;
            ");

            // b) Old Member (4) → Member (3)
            migrationBuilder.Sql(@"
                UPDATE batuara.users SET role = 3 WHERE role = 4;
            ");

            // c) Add nullable house_member_id (FK after backfill)
            migrationBuilder.AddColumn<int>(
                name: "house_member_id",
                schema: "batuara",
                table: "users",
                type: "integer",
                nullable: true);

            // d) Backfill from email match (case insensitive)
            migrationBuilder.Sql(@"
                UPDATE batuara.users u
                SET house_member_id = hm.""Id""
                FROM batuara.""HouseMembers"" hm
                WHERE u.house_member_id IS NULL
                  AND hm.""Email"" IS NOT NULL
                  AND lower(u.email) = lower(hm.""Email"");
            ");

            // Known Equipe mappings when email match failed (only if HouseMember exists)
            migrationBuilder.Sql(@"
                UPDATE batuara.users SET house_member_id = 57
                WHERE house_member_id IS NULL
                  AND lower(email) IN ('guelfi@msn.com', 'admin@batuara.org.br')
                  AND EXISTS (SELECT 1 FROM batuara.""HouseMembers"" WHERE ""Id"" = 57);

                UPDATE batuara.users SET house_member_id = 103
                WHERE house_member_id IS NULL
                  AND lower(email) = 'douglas@batuara.org.br'
                  AND EXISTS (SELECT 1 FROM batuara.""HouseMembers"" WHERE ""Id"" = 103);

                UPDATE batuara.users SET house_member_id = 68
                WHERE house_member_id IS NULL
                  AND lower(email) = 'madalena@batuara.org.br'
                  AND EXISTS (SELECT 1 FROM batuara.""HouseMembers"" WHERE ""Id"" = 68);

                UPDATE batuara.users SET house_member_id = 114
                WHERE house_member_id IS NULL
                  AND lower(email) = 'pepe@batuara.org.br'
                  AND EXISTS (SELECT 1 FROM batuara.""HouseMembers"" WHERE ""Id"" = 114);

                UPDATE batuara.users SET house_member_id = 30
                WHERE house_member_id IS NULL
                  AND lower(email) IN ('thaisy@batuara.org.br', 'taisy@batuara.org.br')
                  AND EXISTS (SELECT 1 FROM batuara.""HouseMembers"" WHERE ""Id"" = 30);

                UPDATE batuara.users SET house_member_id = 49
                WHERE house_member_id IS NULL
                  AND lower(email) = 'carol@batuara.org.br'
                  AND EXISTS (SELECT 1 FROM batuara.""HouseMembers"" WHERE ""Id"" = 49);
            ");

            migrationBuilder.CreateIndex(
                name: "IX_users_house_member_id",
                schema: "batuara",
                table: "users",
                column: "house_member_id");

            migrationBuilder.AddForeignKey(
                name: "FK_users_HouseMembers_house_member_id",
                schema: "batuara",
                table: "users",
                column: "house_member_id",
                principalSchema: "batuara",
                principalTable: "HouseMembers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_users_HouseMembers_house_member_id",
                schema: "batuara",
                table: "users");

            migrationBuilder.DropIndex(
                name: "IX_users_house_member_id",
                schema: "batuara",
                table: "users");

            migrationBuilder.DropColumn(
                name: "house_member_id",
                schema: "batuara",
                table: "users");

            // Reverse role renumber: Member (3) → Member (4)
            // Note: cannot restore former Viewer rows that were converted to Editor
            migrationBuilder.Sql(@"
                UPDATE batuara.users SET role = 4 WHERE role = 3;
            ");
        }
    }
}
