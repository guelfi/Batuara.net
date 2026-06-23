-- =============================================================================
-- Migration equivalente: AddOrixasAndGuideSchemaChange
-- Aplica as alterações de schema sem precisar do dotnet ef
-- =============================================================================

BEGIN;

-- DROP colunas obsoletas de Guides
ALTER TABLE batuara."Guides" DROP COLUMN IF EXISTS "Email";
ALTER TABLE batuara."Guides" DROP COLUMN IF EXISTS "EntryDate";
ALTER TABLE batuara."Guides" DROP COLUMN IF EXISTS "Phone";
ALTER TABLE batuara."Guides" DROP COLUMN IF EXISTS "PhotoUrl";
ALTER TABLE batuara."Guides" DROP COLUMN IF EXISTS "Whatsapp";

-- ADD colunas novas em Orixas
ALTER TABLE batuara."Orixas" ADD COLUMN IF NOT EXISTS "Comida" character varying(200);
ALTER TABLE batuara."Orixas" ADD COLUMN IF NOT EXISTS "DiaDaSemana" character varying(200);
ALTER TABLE batuara."Orixas" ADD COLUMN IF NOT EXISTS "Fruta" character varying(200);
ALTER TABLE batuara."Orixas" ADD COLUMN IF NOT EXISTS "Saudacao" character varying(200);

-- ADD colunas novas em Guides
ALTER TABLE batuara."Guides" ADD COLUMN IF NOT EXISTS "Comida" character varying(200);
ALTER TABLE batuara."Guides" ADD COLUMN IF NOT EXISTS "Cor" character varying(100);
ALTER TABLE batuara."Guides" ADD COLUMN IF NOT EXISTS "DiaDaSemana" character varying(200);
ALTER TABLE batuara."Guides" ADD COLUMN IF NOT EXISTS "Fruta" character varying(200);
ALTER TABLE batuara."Guides" ADD COLUMN IF NOT EXISTS "Saudacao" character varying(200);

-- Registrar no histórico do EF Core para não reaplicar
INSERT INTO batuara."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260622015724_AddOrixasAndGuideSchemaChange', '8.0.0')
ON CONFLICT DO NOTHING;

COMMIT;
