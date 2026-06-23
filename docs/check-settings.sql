SELECT "HistoryTitle", "HistorySubtitle", LEFT("HistoryHtml", 100) AS html_preview, "HistoryMissionText" FROM batuara."SiteSettings" LIMIT 1;
SELECT COUNT(*) AS user_count FROM batuara.users;
