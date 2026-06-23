SELECT COUNT(*) AS total_orixas FROM batuara."Orixas";
SELECT COUNT(*) AS total_guides FROM batuara."Guides";
SELECT "Name", "Saudacao", "Fruta", "Comida", "DiaDaSemana" FROM batuara."Orixas" ORDER BY "DisplayOrder";
SELECT "Name", "Saudacao", "Cor", "Fruta", "Comida", "DiaDaSemana" FROM batuara."Guides" ORDER BY "DisplayOrder";
