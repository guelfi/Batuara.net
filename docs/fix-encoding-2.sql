SET search_path = batuara;
SET client_encoding = 'UTF8';

UPDATE "CalendarAttendances" SET "Description" = E'Trabalhos de Firma\u00e7\u00e3o da Casa'   WHERE "Id" = 53;
UPDATE "CalendarAttendances" SET "Description" = E'Festa de Ox\u00f3ssi'                       WHERE "Id" = 54;
UPDATE "CalendarAttendances" SET "Description" = E'Festa de Iemanj\u00e1 / Amaci'              WHERE "Id" = 56;
UPDATE "CalendarAttendances" SET "Description" = E'Festa de Boiadeiro e Sauda\u00e7\u00e3o a Xang\u00f4 Menino' WHERE "Id" = 78;
UPDATE "CalendarAttendances" SET "Description" = E'Festa de Nan\u00e3'                         WHERE "Id" = 84;
UPDATE "CalendarAttendances" SET "Description" = E'Festa de Obalua\u00ea'                      WHERE "Id" = 87;
UPDATE "CalendarAttendances" SET "Description" = E'Festa de Er\u00ea - Dia 1'                  WHERE "Id" = 92;
UPDATE "CalendarAttendances" SET "Description" = E'Festa de Er\u00ea - Dia 2'                  WHERE "Id" = 93;
UPDATE "CalendarAttendances" SET "Description" = E'Festa de Er\u00ea - Dia 3'                  WHERE "Id" = 94;
UPDATE "CalendarAttendances" SET "Description" = E'Festa de Xang\u00f4'                        WHERE "Id" = 95;
UPDATE "CalendarAttendances" SET "Description" = E'Festa de Ians\u00e3'                        WHERE "Id" = 104;
UPDATE "CalendarAttendances" SET "Description" = E'Festa de Oxal\u00e1'                        WHERE "Id" = 105;

UPDATE "Events" SET "Title" = E'Trabalhos de Firma\u00e7\u00e3o da Casa'   WHERE "Id" = 1;
UPDATE "Events" SET "Title" = E'Festa de Ox\u00f3ssi'                       WHERE "Id" = 2;
UPDATE "Events" SET "Title" = E'Festa de Iemanj\u00e1 / Amaci'              WHERE "Id" = 3;
UPDATE "Events" SET "Title" = E'Festa de Boiadeiro e Sauda\u00e7\u00e3o a Xang\u00f4 Menino' WHERE "Id" = 11;
UPDATE "Events" SET "Title" = E'Festa de Nan\u00e3'                         WHERE "Id" = 14;
UPDATE "Events" SET "Title" = E'Festa de Obalua\u00ea'                      WHERE "Id" = 16;
UPDATE "Events" SET "Title" = E'Festa de Er\u00ea - Dia 1'                  WHERE "Id" = 17;
UPDATE "Events" SET "Title" = E'Festa de Er\u00ea - Dia 2'                  WHERE "Id" = 18;
UPDATE "Events" SET "Title" = E'Festa de Er\u00ea - Dia 3'                  WHERE "Id" = 19;
UPDATE "Events" SET "Title" = E'Festa de Xang\u00f4'                        WHERE "Id" = 20;
UPDATE "Events" SET "Title" = E'Festa de Ians\u00e3'                        WHERE "Id" = 22;
UPDATE "Events" SET "Title" = E'Festa de Oxal\u00e1'                        WHERE "Id" = 23;

SELECT "Id", "Description" FROM "CalendarAttendances" WHERE "Id" IN (53,54,56,78,84,87,92,93,94,95,104,105) ORDER BY "Id";
SELECT "Id", "Title" FROM "Events" WHERE "Id" IN (1,2,3,11,14,16,17,18,19,20,22,23) ORDER BY "Id";
