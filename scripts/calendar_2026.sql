-- ================================================================
-- CALENDÁRIO 2026 - SQL de substituição
-- CalendarAttendances + Events
-- Gerado por generate_calendar_2026.py
-- ================================================================

BEGIN;

-- Backup das tabelas antes da substituição
CREATE TABLE IF NOT EXISTS batuara."CalendarAttendances_backup_pre2026" AS
  SELECT * FROM batuara."CalendarAttendances";
CREATE TABLE IF NOT EXISTS batuara."Events_backup_pre2026" AS
  SELECT * FROM batuara."Events";

-- ================================================================
-- PARTE 1: CalendarAttendances
-- Total de registros: 103
-- ================================================================
TRUNCATE TABLE batuara."CalendarAttendances" RESTART IDENTITY CASCADE;

INSERT INTO batuara."CalendarAttendances"
  ("Date", "StartTime", "EndTime", "Type", "Description", "Observations",
   "RequiresRegistration", "MaxCapacity", "IsActive", "CreatedAt", "UpdatedAt")
VALUES
  ('2026-01-07 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-01-14 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-01-21 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-01-28 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-02-04 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-02-11 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-02-18 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-02-25 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-03-04 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-03-11 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-03-18 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-03-25 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-04-01 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-04-08 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-04-15 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-04-22 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-04-29 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-05-06 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-05-13 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-05-20 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-05-27 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-06-03 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-06-10 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-06-17 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-06-24 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-07-01 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-07-08 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-07-15 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-07-22 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-07-29 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-08-05 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-08-12 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-08-19 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-08-26 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-09-02 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-09-09 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-09-16 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-09-23 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-09-30 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-10-07 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-10-14 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-10-21 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-10-28 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-11-04 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-11-11 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-11-18 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-11-25 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-12-02 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-12-09 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-12-16 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-12-23 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-12-30 03:00:00+00', '20:00:00', '22:00:00', 1, 'Atendimento Kardecista', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-01-16 03:00:00+00', '20:00:00', '22:00:00', 2, 'Trabalhos de Firmação da Casa', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-01-24 03:00:00+00', '20:00:00', '23:00:00', 5, 'Festa de Oxóssi', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-01-30 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Normal', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-02-07 03:00:00+00', '20:00:00', '23:00:00', 5, 'Festa de Iemanjá / Amaci', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-02-13 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Cancelada - Carnaval', 'Gira cancelada devido ao Carnaval', false, NULL, false, NOW(), NOW()),
  ('2026-02-20 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Normal', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-02-27 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Normal', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-02-28 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Normal', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-03-06 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Normal', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-03-13 03:00:00+00', '20:00:00', '23:00:00', 5, 'Festa dos Malandros', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-03-20 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Normal', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-03-27 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Normal', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-04-03 03:00:00+00', '15:00:00', '17:00:00', 2, 'Sexta Santa', 'Cerimônia especial - início às 15h00', false, NULL, true, NOW(), NOW()),
  ('2026-04-10 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Normal', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-04-17 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Normal', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-04-25 03:00:00+00', '20:00:00', '23:00:00', 5, 'Festa de Ogum / Iao', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-05-01 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Cancelada', 'Gira cancelada', false, NULL, false, NOW(), NOW()),
  ('2026-05-08 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Normal', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-05-15 03:00:00+00', '20:00:00', '23:00:00', 5, 'Festa dos Pretos Velhos', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-05-22 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Normal', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-05-29 03:00:00+00', '20:00:00', '23:00:00', 5, 'Festa dos Ciganos', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-06-05 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Normal', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-06-13 03:00:00+00', '20:00:00', '23:00:00', 5, 'Festa de Esquerda', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-06-19 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Normal', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-06-26 03:00:00+00', '20:00:00', '23:00:00', 5, 'Festa de Boiadeiro e Saudação a Xangô Menino', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-07-03 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Normal', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-07-10 03:00:00+00', '20:00:00', '23:00:00', 5, 'Festa dos Marinheiros', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-07-17 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Normal', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-07-24 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Normal', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-07-31 03:00:00+00', '20:00:00', '23:00:00', 5, 'Festa de Nanã', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-08-07 03:00:00+00', '20:00:00', '23:00:00', 5, 'Festa dos Baianos', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-08-14 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Normal', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-08-21 03:00:00+00', '20:00:00', '23:00:00', 5, 'Festa de Obaluaê', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-08-28 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Normal', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-09-04 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Normal', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-09-11 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Normal', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-09-18 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Normal', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-09-25 03:00:00+00', '20:00:00', '23:00:00', 5, 'Festa de Erê - Dia 1', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-09-26 03:00:00+00', '20:00:00', '23:00:00', 5, 'Festa de Erê - Dia 2', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-09-27 03:00:00+00', '20:00:00', '23:00:00', 5, 'Festa de Erê - Dia 3', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-10-02 03:00:00+00', '20:00:00', '23:00:00', 5, 'Festa de Xangô', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-10-09 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Normal', 'Feriado na segunda-feira', false, NULL, true, NOW(), NOW()),
  ('2026-10-16 03:00:00+00', '20:00:00', '23:00:00', 5, 'Festa de Oxum', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-10-23 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Normal', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-10-30 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Normal', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-11-06 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Normal', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-11-13 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Normal', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-11-20 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Cancelada', 'Gira cancelada', false, NULL, false, NOW(), NOW()),
  ('2026-11-27 03:00:00+00', '20:00:00', '22:00:00', 2, 'Gira Normal', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-12-05 03:00:00+00', '20:00:00', '23:00:00', 5, 'Festa de Iansã', NULL, false, NULL, true, NOW(), NOW()),
  ('2026-12-11 03:00:00+00', '20:00:00', '23:00:00', 5, 'Festa de Oxalá', NULL, false, NULL, true, NOW(), NOW());

-- ================================================================
-- PARTE 2: Events (Festas e Eventos - sem giras)
-- Total de registros: 21
-- ================================================================
TRUNCATE TABLE batuara."Events" RESTART IDENTITY CASCADE;

INSERT INTO batuara."Events"
  ("Title", "Description", "Date", "StartTime", "EndTime", "Type",
   "ImageUrl", "Location", "IsActive", "CreatedAt", "UpdatedAt")
VALUES
  ('Trabalhos de Firmação da Casa', 'Cerimônia especial de firmação da casa espiritual.', '2026-01-16 03:00:00+00', NULL, NULL, 1, NULL, NULL, true, NOW(), NOW()),
  ('Festa de Oxóssi', 'Celebração em homenagem ao Orixá Oxóssi, senhor das matas.', '2026-01-24 03:00:00+00', NULL, NULL, 1, NULL, NULL, true, NOW(), NOW()),
  ('Festa de Iemanjá / Amaci', 'Celebração de Iemanjá com ritual de amaci.', '2026-02-07 03:00:00+00', NULL, NULL, 1, NULL, NULL, true, NOW(), NOW()),
  ('Festa dos Malandros', 'Celebração em homenagem aos Malandros da Umbanda.', '2026-03-13 03:00:00+00', NULL, NULL, 1, NULL, NULL, true, NOW(), NOW()),
  ('Sexta Santa', 'Cerimônia especial de Sexta Santa. Início às 15h00.', '2026-04-03 03:00:00+00', '15:00:00', '17:00:00', 3, NULL, NULL, true, NOW(), NOW()),
  ('Festa de Ogum / Iao', 'Celebração em homenagem ao Orixá Ogum e seus filhos.', '2026-04-25 03:00:00+00', NULL, NULL, 1, NULL, NULL, true, NOW(), NOW()),
  ('Festa dos Pretos Velhos', 'Homenagem aos Pretos Velhos, mestres da sabedoria.', '2026-05-15 03:00:00+00', NULL, NULL, 1, NULL, NULL, true, NOW(), NOW()),
  ('Festa dos Ciganos', 'Celebração em homenagem aos Ciganos da Umbanda.', '2026-05-29 03:00:00+00', NULL, NULL, 1, NULL, NULL, true, NOW(), NOW()),
  ('Festa de Esquerda', 'Gira de Esquerda com os Exus e Pombas Giras.', '2026-06-13 03:00:00+00', NULL, NULL, 1, NULL, NULL, true, NOW(), NOW()),
  ('Festa de Boiadeiro e Saudação a Xangô Menino', 'Celebração dos Boiadeiros e saudação a Xangô Menino.', '2026-06-26 03:00:00+00', NULL, NULL, 1, NULL, NULL, true, NOW(), NOW()),
  ('Festa dos Marinheiros', 'Celebração em homenagem aos Marinheiros da Umbanda.', '2026-07-10 03:00:00+00', NULL, NULL, 1, NULL, NULL, true, NOW(), NOW()),
  ('Festa de Nanã', 'Celebração em homenagem à Orixá Nanã Buruquê.', '2026-07-31 03:00:00+00', NULL, NULL, 1, NULL, NULL, true, NOW(), NOW()),
  ('Festa dos Baianos', 'Celebração em homenagem aos Baianos da Umbanda.', '2026-08-07 03:00:00+00', NULL, NULL, 1, NULL, NULL, true, NOW(), NOW()),
  ('Festa de Obaluaê', 'Celebração em homenagem ao Orixá Obaluaê, senhor das doenças.', '2026-08-21 03:00:00+00', NULL, NULL, 1, NULL, NULL, true, NOW(), NOW()),
  ('Festa de Erê - Dia 1', 'Festa de Erê - primeiro dia de celebração.', '2026-09-25 03:00:00+00', NULL, NULL, 1, NULL, NULL, true, NOW(), NOW()),
  ('Festa de Erê - Dia 2', 'Festa de Erê - segundo dia de celebração.', '2026-09-26 03:00:00+00', NULL, NULL, 1, NULL, NULL, true, NOW(), NOW()),
  ('Festa de Erê - Dia 3', 'Festa de Erê - terceiro e último dia de celebração.', '2026-09-27 03:00:00+00', NULL, NULL, 1, NULL, NULL, true, NOW(), NOW()),
  ('Festa de Xangô', 'Celebração em homenagem ao Orixá Xangô, senhor da justiça.', '2026-10-02 03:00:00+00', NULL, NULL, 1, NULL, NULL, true, NOW(), NOW()),
  ('Festa de Oxum', 'Celebração em homenagem à Orixá Oxum, senhora das águas doces.', '2026-10-16 03:00:00+00', NULL, NULL, 1, NULL, NULL, true, NOW(), NOW()),
  ('Festa de Iansã', 'Celebração em homenagem à Orixá Iansã, senhora dos ventos.', '2026-12-05 03:00:00+00', NULL, NULL, 1, NULL, NULL, true, NOW(), NOW()),
  ('Festa de Oxalá', 'Celebração em homenagem ao Orixá Oxalá, pai da criação.', '2026-12-11 03:00:00+00', NULL, NULL, 1, NULL, NULL, true, NOW(), NOW());

COMMIT;

-- Resumo: 103 registros em CalendarAttendances, 21 em Events
