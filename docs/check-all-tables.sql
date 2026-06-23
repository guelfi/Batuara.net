SELECT tablename FROM pg_tables WHERE schemaname = 'batuara' ORDER BY tablename;
SELECT COUNT(*) AS site_settings FROM batuara."SiteSettings";
SELECT COUNT(*) AS orixas FROM batuara."Orixas";
SELECT COUNT(*) AS guides FROM batuara."Guides";
SELECT COUNT(*) AS umbanda_lines FROM batuara."UmbandaLines";
SELECT COUNT(*) AS spiritual_contents FROM batuara."SpiritualContents";
SELECT COUNT(*) AS events FROM batuara."Events";
SELECT COUNT(*) AS users FROM batuara."Users";
SELECT COUNT(*) AS house_members FROM batuara."HouseMembers";
