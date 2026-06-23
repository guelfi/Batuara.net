BEGIN;

-- =============================================
-- 1. REMOVER Linhas de Umbanda antigas (sem subtítulo da apostila)
-- =============================================
DELETE FROM batuara."UmbandaLines" WHERE "Name" = 'Linha de Oxalá';
DELETE FROM batuara."UmbandaLines" WHERE "Name" = 'Linha de Yemanjá';
DELETE FROM batuara."UmbandaLines" WHERE "Name" = 'Linha dos Caboclos';

-- =============================================
-- 2. MANTER apenas orações confirmadas na apostila:
--    - Pai Nosso da Umbanda (já existe)
--    - Oração de Caritas / Prece de Cáritas (já existe)
-- Remover os demais
-- =============================================
DELETE FROM batuara."SpiritualContents"
WHERE "Title" NOT IN ('Pai Nosso da Umbanda', 'Oração de Caritas');

COMMIT;
