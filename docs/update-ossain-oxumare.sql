BEGIN;

-- Ossain: Verde, Ewé ó!, Quinta-feira, Fruta = Goiaba (mesma de Oxóssi), Comida = Acaçá
UPDATE batuara."Orixas"
SET
    "Saudacao"   = 'Ewé ó!',
    "DiaDaSemana" = 'Quinta-feira',
    "Fruta"      = 'Goiaba',
    "Comida"     = 'Acaçá',
    "Colors"     = '["Verde"]'::jsonb,
    "UpdatedAt"  = NOW()
WHERE "Name" = 'Ossain';

-- Oxumarê: Arco-íris, Arrobobói Oxumarê!, Terça-feira, Fruta = Maracujá, Comida = Batata-doce com dendê
UPDATE batuara."Orixas"
SET
    "Saudacao"   = 'Arrobobói Oxumarê!',
    "DiaDaSemana" = 'Terça-feira',
    "Fruta"      = 'Maracujá',
    "Comida"     = 'Batata-doce com dendê',
    "Colors"     = '["Arco-íris"]'::jsonb,
    "UpdatedAt"  = NOW()
WHERE "Name" = 'Oxumarê';

COMMIT;

-- Verificação
SELECT "Name", "Saudacao", "DiaDaSemana", "Colors", "Fruta", "Comida"
FROM batuara."Orixas"
WHERE "Name" IN ('Ossain', 'Oxumarê');
