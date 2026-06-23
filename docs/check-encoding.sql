SET search_path = batuara;

SELECT
  'CalendarAttendances' AS tabela,
  "Id" AS id,
  "Date"::date AS data,
  "Description" AS texto
FROM "CalendarAttendances"
WHERE "Description" LIKE '%?%' OR "Description" LIKE '%â%' OR "Description" LIKE '%Ã%'
   OR "Observations" LIKE '%?%' OR "Observations" LIKE '%â%' OR "Observations" LIKE '%Ã%'

UNION ALL

SELECT
  'Events' AS tabela,
  "Id" AS id,
  "Date"::date AS data,
  "Title" AS texto
FROM "Events"
WHERE "Title" LIKE '%?%' OR "Title" LIKE '%â%' OR "Title" LIKE '%Ã%'
   OR "Description" LIKE '%?%' OR "Description" LIKE '%â%' OR "Description" LIKE '%Ã%'

UNION ALL

SELECT
  'Orixas' AS tabela,
  "Id" AS id,
  NULL::date AS data,
  "Name" AS texto
FROM "Orixas"
WHERE "Name" LIKE '%?%' OR "Name" LIKE '%â%' OR "Name" LIKE '%Ã%'
   OR "Description" LIKE '%?%' OR "Description" LIKE '%â%' OR "Description" LIKE '%Ã%'
   OR "Saudacao" LIKE '%?%' OR "Comida" LIKE '%?%' OR "Fruta" LIKE '%?%'

UNION ALL

SELECT
  'GuideEntities' AS tabela,
  "Id" AS id,
  NULL::date AS data,
  "Name" AS texto
FROM "Guides"
WHERE "Name" LIKE '%?%' OR "Name" LIKE '%â%' OR "Name" LIKE '%Ã%'
   OR "Description" LIKE '%?%' OR "Description" LIKE '%â%' OR "Description" LIKE '%Ã%'

UNION ALL

SELECT
  'UmbandaLines' AS tabela,
  "Id" AS id,
  NULL::date AS data,
  "Name" AS texto
FROM "UmbandaLines"
WHERE "Name" LIKE '%?%' OR "Description" LIKE '%?%'
   OR "Name" LIKE '%â%' OR "Description" LIKE '%â%'

UNION ALL

SELECT
  'SpiritualContents' AS tabela,
  "Id" AS id,
  NULL::date AS data,
  "Title" AS texto
FROM "SpiritualContents"
WHERE "Title" LIKE '%?%' OR "Content" LIKE '%?%'
   OR "Title" LIKE '%â%' OR "Content" LIKE '%â%'

ORDER BY 1, 3, 2;
