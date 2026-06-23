using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Batuara.Infrastructure.Data.Migrations
{
    public partial class UnifyDescriptionFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // --- Orixas: mesclar Origin + BatuaraTeaching em Description, depois dropar ---
            migrationBuilder.Sql(@"
                UPDATE ""Orixas""
                SET ""Description"" = CONCAT_WS(E'\n\n', NULLIF(TRIM(""Description""), ''), NULLIF(TRIM(""Origin""), ''), NULLIF(TRIM(""BatuaraTeaching""), ''))
                WHERE ""Origin"" IS NOT NULL OR ""BatuaraTeaching"" IS NOT NULL;
            ");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Orixas",
                type: "character varying(10000)",
                maxLength: 10000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(5000)",
                oldMaxLength: 5000);

            migrationBuilder.DropColumn(name: "Origin", table: "Orixas");
            migrationBuilder.DropColumn(name: "BatuaraTeaching", table: "Orixas");

            // --- UmbandaLines: mesclar Characteristics + BatuaraInterpretation em Description, depois dropar ---
            migrationBuilder.Sql(@"
                UPDATE ""UmbandaLines""
                SET ""Description"" = CONCAT_WS(E'\n\n', NULLIF(TRIM(""Description""), ''), NULLIF(TRIM(""Characteristics""), ''), NULLIF(TRIM(""BatuaraInterpretation""), ''))
                WHERE ""Characteristics"" IS NOT NULL OR ""BatuaraInterpretation"" IS NOT NULL;
            ");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "UmbandaLines",
                type: "character varying(15000)",
                maxLength: 15000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(5000)",
                oldMaxLength: 5000);

            migrationBuilder.DropColumn(name: "Characteristics", table: "UmbandaLines");
            migrationBuilder.DropColumn(name: "BatuaraInterpretation", table: "UmbandaLines");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Orixas: recriar colunas (sem dados originais — irreversível)
            migrationBuilder.AddColumn<string>(
                name: "Origin",
                table: "Orixas",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BatuaraTeaching",
                table: "Orixas",
                type: "character varying(5000)",
                maxLength: 5000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Orixas",
                type: "character varying(5000)",
                maxLength: 5000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(10000)",
                oldMaxLength: 10000);

            // UmbandaLines: recriar colunas (sem dados originais — irreversível)
            migrationBuilder.AddColumn<string>(
                name: "Characteristics",
                table: "UmbandaLines",
                type: "character varying(3000)",
                maxLength: 3000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BatuaraInterpretation",
                table: "UmbandaLines",
                type: "character varying(5000)",
                maxLength: 5000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "UmbandaLines",
                type: "character varying(5000)",
                maxLength: 5000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(15000)",
                oldMaxLength: 15000);
        }
    }
}
