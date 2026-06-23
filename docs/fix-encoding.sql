SET search_path = batuara;

-- ============================================================
-- CORRECAO DE ENCODING - CalendarAttendances
-- ============================================================

UPDATE "CalendarAttendances" SET "Description" = 'Trabalhos de Firmação da Casa'   WHERE "Id" = 53;
UPDATE "CalendarAttendances" SET "Description" = 'Festa de Oxóssi'                  WHERE "Id" = 54;
UPDATE "CalendarAttendances" SET "Description" = 'Festa de Iemanjá / Amaci'         WHERE "Id" = 56;
UPDATE "CalendarAttendances" SET "Description" = 'Sexta Santa'                      WHERE "Id" = 65;
UPDATE "CalendarAttendances" SET "Description" = 'Festa de Boiadeiro e Saudação a Xangô Menino' WHERE "Id" = 78;
UPDATE "CalendarAttendances" SET "Description" = 'Festa de Nanã'                    WHERE "Id" = 84;
UPDATE "CalendarAttendances" SET "Description" = 'Festa de Obaluaê'                 WHERE "Id" = 87;
UPDATE "CalendarAttendances" SET "Description" = 'Festa de Erê - Dia 1'             WHERE "Id" = 92;
UPDATE "CalendarAttendances" SET "Description" = 'Festa de Erê - Dia 2'             WHERE "Id" = 93;
UPDATE "CalendarAttendances" SET "Description" = 'Festa de Erê - Dia 3'             WHERE "Id" = 94;
UPDATE "CalendarAttendances" SET "Description" = 'Festa de Xangô'                   WHERE "Id" = 95;
UPDATE "CalendarAttendances" SET "Description" = 'Festa de Iansã'                   WHERE "Id" = 104;
UPDATE "CalendarAttendances" SET "Description" = 'Festa de Oxalá'                   WHERE "Id" = 105;

-- ============================================================
-- CORRECAO DE ENCODING - Events
-- ============================================================

UPDATE "Events" SET "Title" = 'Trabalhos de Firmação da Casa'   WHERE "Id" = 1;
UPDATE "Events" SET "Title" = 'Festa de Oxóssi'                  WHERE "Id" = 2;
UPDATE "Events" SET "Title" = 'Festa de Iemanjá / Amaci'         WHERE "Id" = 3;
UPDATE "Events" SET "Title" = 'Festa dos Malandros'              WHERE "Id" = 4;
UPDATE "Events" SET "Title" = 'Sexta Santa'                      WHERE "Id" = 5;
UPDATE "Events" SET "Title" = 'Festa de Ogum / Iao'              WHERE "Id" = 6;
UPDATE "Events" SET "Title" = 'Bazar'                            WHERE "Id" = 8;
UPDATE "Events" SET "Title" = 'Festa dos Ciganos'                WHERE "Id" = 10;
UPDATE "Events" SET "Title" = 'Festa de Boiadeiro e Saudação a Xangô Menino' WHERE "Id" = 11;
UPDATE "Events" SET "Title" = 'Festa dos Marinheiros'            WHERE "Id" = 13;
UPDATE "Events" SET "Title" = 'Festa de Nanã'                    WHERE "Id" = 14;
UPDATE "Events" SET "Title" = 'Festa dos Baianos'                WHERE "Id" = 15;
UPDATE "Events" SET "Title" = 'Festa de Obaluaê'                 WHERE "Id" = 16;
UPDATE "Events" SET "Title" = 'Festa de Erê - Dia 1'             WHERE "Id" = 17;
UPDATE "Events" SET "Title" = 'Festa de Erê - Dia 2'             WHERE "Id" = 18;
UPDATE "Events" SET "Title" = 'Festa de Erê - Dia 3'             WHERE "Id" = 19;
UPDATE "Events" SET "Title" = 'Festa de Xangô'                   WHERE "Id" = 20;
UPDATE "Events" SET "Title" = 'Festa de Oxum'                    WHERE "Id" = 21;
UPDATE "Events" SET "Title" = 'Festa de Iansã'                   WHERE "Id" = 22;
UPDATE "Events" SET "Title" = 'Festa de Oxalá'                   WHERE "Id" = 23;

-- Verificacao final
SELECT 'CalendarAttendances' AS tabela, "Id", "Description" FROM "CalendarAttendances"
WHERE "Id" IN (53,54,56,65,78,84,87,92,93,94,95,104,105)
ORDER BY "Id";

SELECT 'Events' AS tabela, "Id", "Title" FROM "Events"
WHERE "Id" IN (1,2,3,4,5,6,8,10,11,13,14,15,16,17,18,19,20,21,22,23)
ORDER BY "Id";
