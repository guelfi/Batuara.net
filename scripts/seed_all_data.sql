-- Casa de Caridade Batuara - Script Principal de Seed Data
-- Este script popula o banco de dados com todos os dados específicos da Casa Batuara

-- Verificar se o schema existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'batuara') THEN
        RAISE EXCEPTION 'Schema batuara não existe. Execute primeiro o script de criação do schema.';
    END IF;
END $$;

-- Limpar dados existentes (se necessário)
-- TRUNCATE batuara."SpiritualContents" RESTART IDENTITY CASCADE;
-- TRUNCATE batuara."UmbandaLines" RESTART IDENTITY CASCADE;
-- TRUNCATE batuara."Orixas" RESTART IDENTITY CASCADE;

-- Executar scripts de seed data na ordem correta

-- 1. Seed dos Orixás
\i seed_orixas_data.sql

-- 2. Seed das Linhas da Umbanda
\i seed_umbanda_lines_data.sql

-- 3. Seed dos Conteúdos Espirituais
\i seed_spiritual_content_data.sql

-- Verificar dados inseridos
SELECT 'Orixás inseridos:' as info, COUNT(*) as total FROM batuara."Orixas" WHERE "IsActive" = true
UNION ALL
SELECT 'Linhas da Umbanda inseridas:', COUNT(*) FROM batuara."UmbandaLines" WHERE "IsActive" = true
UNION ALL
SELECT 'Conteúdos Espirituais inseridos:', COUNT(*) FROM batuara."SpiritualContents" WHERE "IsActive" = true;

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Seed data da Casa de Caridade Batuara inserido com sucesso!';
    RAISE NOTICE 'Dados baseados na Apostila Batuara 2024 e ensinamentos específicos da casa.';
END $$;