-- Importar apenas SiteSettings e CalendarAttendances da produção
-- Orixas e Guides JÁ estão corretos no banco local (dados sanados com novos campos)
-- Executar como batuara_user no banco batuara_db

BEGIN;

-- Limpar tabelas que serão reimportadas da produção
TRUNCATE batuara."SiteSettings" RESTART IDENTITY CASCADE;
TRUNCATE batuara."CalendarAttendances" RESTART IDENTITY CASCADE;
TRUNCATE batuara."Events" RESTART IDENTITY CASCADE;
TRUNCATE batuara."SpiritualContents" RESTART IDENTITY CASCADE;
TRUNCATE batuara."UmbandaLines" RESTART IDENTITY CASCADE;
TRUNCATE batuara."ContactMessages" RESTART IDENTITY CASCADE;

COMMIT;
