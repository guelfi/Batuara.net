-- ORIXÁS
SELECT "DisplayOrder" AS ord, "Name", "Saudacao", "DiaDaSemana", "Fruta", "Comida", "Colors", "Elements"
FROM batuara."Orixas" ORDER BY "DisplayOrder";

-- GUIAS
SELECT "DisplayOrder" AS ord, "Name", "Saudacao", "DiaDaSemana", "Cor", "Fruta", "Comida", "Specialties"
FROM batuara."Guides" ORDER BY "DisplayOrder";

-- LINHAS DE UMBANDA
SELECT "DisplayOrder" AS ord, "Name", "WorkingDays"
FROM batuara."UmbandaLines" ORDER BY "DisplayOrder";

-- ORAÇÕES E PONTOS
SELECT "DisplayOrder" AS ord, "Title", "Type", "Category", "IsFeatured", LEFT("Content", 60) AS inicio
FROM batuara."SpiritualContents" ORDER BY "DisplayOrder";
