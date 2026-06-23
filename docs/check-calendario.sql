-- Eventos na tabela Events
SELECT "Id", "Title", "Date", "Type", "IsActive"
FROM batuara."Events"
ORDER BY "Date" DESC
LIMIT 30;

-- Eventos no Calendário
SELECT "Id", "Date", "Type", "Description", "IsActive"
FROM batuara."CalendarAttendances"
ORDER BY "Date" DESC
LIMIT 30;

-- Tipos distintos em cada tabela
SELECT DISTINCT "Type", COUNT(*) FROM batuara."Events" GROUP BY "Type" ORDER BY "Type";
SELECT DISTINCT "Type", COUNT(*) FROM batuara."CalendarAttendances" GROUP BY "Type" ORDER BY "Type";
