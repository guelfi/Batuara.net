SELECT 'CalendarAttendances' AS tabela, COUNT(*) AS registros FROM batuara."CalendarAttendances"
UNION ALL SELECT 'Events', COUNT(*) FROM batuara."Events"
UNION ALL SELECT 'SiteSettings', COUNT(*) FROM batuara."SiteSettings"
UNION ALL SELECT 'SpiritualContents', COUNT(*) FROM batuara."SpiritualContents"
UNION ALL SELECT 'UmbandaLines', COUNT(*) FROM batuara."UmbandaLines"
UNION ALL SELECT 'Orixas', COUNT(*) FROM batuara."Orixas"
UNION ALL SELECT 'Guides', COUNT(*) FROM batuara."Guides"
ORDER BY tabela;

SELECT LEFT("HistoryTitle",30) AS historia, LEFT("HistoryHtml",60) AS html FROM batuara."SiteSettings" LIMIT 1;
