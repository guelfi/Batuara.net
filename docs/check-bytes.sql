SET search_path = batuara;
SET client_encoding = 'UTF8';

SELECT
  "Id",
  octet_length("Description") AS bytes,
  length("Description") AS chars,
  "Description"
FROM "CalendarAttendances"
WHERE "Id" = 78;
