BEGIN;

-- Migration 1: AddPixQrCodeBase64
ALTER TABLE batuara."SiteSettings" ADD COLUMN IF NOT EXISTS "PixQrCodeBase64" text;

INSERT INTO batuara."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260522223141_AddPixQrCodeBase64', '8.0.0')
ON CONFLICT DO NOTHING;

-- Migration 2: AddOrixasAndGuideSchemaChange
ALTER TABLE batuara."Guides" DROP COLUMN IF EXISTS "Email";
ALTER TABLE batuara."Guides" DROP COLUMN IF EXISTS "EntryDate";
ALTER TABLE batuara."Guides" DROP COLUMN IF EXISTS "Phone";
ALTER TABLE batuara."Guides" DROP COLUMN IF EXISTS "PhotoUrl";
ALTER TABLE batuara."Guides" DROP COLUMN IF EXISTS "Whatsapp";

ALTER TABLE batuara."Orixas" ADD COLUMN IF NOT EXISTS "Comida" character varying(200);
ALTER TABLE batuara."Orixas" ADD COLUMN IF NOT EXISTS "DiaDaSemana" character varying(200);
ALTER TABLE batuara."Orixas" ADD COLUMN IF NOT EXISTS "Fruta" character varying(200);
ALTER TABLE batuara."Orixas" ADD COLUMN IF NOT EXISTS "Saudacao" character varying(200);

ALTER TABLE batuara."Guides" ADD COLUMN IF NOT EXISTS "Comida" character varying(200);
ALTER TABLE batuara."Guides" ADD COLUMN IF NOT EXISTS "Cor" character varying(100);
ALTER TABLE batuara."Guides" ADD COLUMN IF NOT EXISTS "DiaDaSemana" character varying(200);
ALTER TABLE batuara."Guides" ADD COLUMN IF NOT EXISTS "Fruta" character varying(200);
ALTER TABLE batuara."Guides" ADD COLUMN IF NOT EXISTS "Saudacao" character varying(200);

INSERT INTO batuara."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260622015724_AddOrixasAndGuideSchemaChange', '8.0.0')
ON CONFLICT DO NOTHING;

COMMIT;
