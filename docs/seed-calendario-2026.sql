-- Seed validado para Eventos e Atendimentos recorrentes de 2026
\set ON_ERROR_STOP on
BEGIN;
SET LOCAL search_path TO batuara, public;
SET LOCAL client_min_messages TO NOTICE;
CREATE INDEX IF NOT EXISTS "IX_seed_calendar_Events_Date" ON batuara."Events" ("Date");
CREATE INDEX IF NOT EXISTS "IX_seed_calendar_Events_Type_Date" ON batuara."Events" ("Type", "Date");
CREATE INDEX IF NOT EXISTS "IX_seed_calendar_Attendances_Date" ON batuara."CalendarAttendances" ("Date");
CREATE INDEX IF NOT EXISTS "IX_seed_calendar_Attendances_Type_Date" ON batuara."CalendarAttendances" ("Type", "Date");
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_seed_calendar_Events_Type_Valid') THEN
        ALTER TABLE batuara."Events" ADD CONSTRAINT "CK_seed_calendar_Events_Type_Valid" CHECK ("Type" BETWEEN 1 AND 5);
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_seed_calendar_Attendances_Type_Valid') THEN
        ALTER TABLE batuara."CalendarAttendances" ADD CONSTRAINT "CK_seed_calendar_Attendances_Type_Valid" CHECK ("Type" BETWEEN 1 AND 4);
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_seed_calendar_Attendances_MaxCapacity_Positive') THEN
        ALTER TABLE batuara."CalendarAttendances" ADD CONSTRAINT "CK_seed_calendar_Attendances_MaxCapacity_Positive" CHECK ("MaxCapacity" IS NULL OR "MaxCapacity" > 0);
    END IF;
END $$;
CREATE OR REPLACE FUNCTION batuara.seed_local_date_timestamptz(p_date date, p_timezone text) RETURNS timestamptz LANGUAGE sql IMMUTABLE AS $$
    SELECT (p_date::timestamp AT TIME ZONE p_timezone);
$$;
CREATE OR REPLACE PROCEDURE batuara.seed_validate_interval(p_start interval, p_end interval) LANGUAGE plpgsql AS $$
BEGIN
    IF p_start IS NULL AND p_end IS NULL THEN
        RETURN;
    END IF;
    IF p_start IS NULL OR p_end IS NULL THEN
        RAISE EXCEPTION 'Horário inválido: início e fim devem ser informados juntos';
    END IF;
    IF p_end <= p_start THEN
        RAISE EXCEPTION 'Horário inválido: fim (%) deve ser maior que início (%)', p_end, p_start;
    END IF;
END;
$$;
CREATE OR REPLACE PROCEDURE batuara.seed_upsert_event_2026(p_title text, p_description text, p_date date, p_start interval, p_end interval, p_type integer, p_location text, p_timezone text, p_is_active boolean) LANGUAGE plpgsql AS $$
BEGIN
    CALL batuara.seed_validate_interval(p_start, p_end);
    IF p_type NOT BETWEEN 1 AND 5 THEN
        RAISE EXCEPTION 'Tipo de evento inválido para %: %', p_title, p_type;
    END IF;
    IF EXISTS (SELECT 1 FROM batuara."Events" WHERE "Title" = p_title AND (("Date" AT TIME ZONE p_timezone)::date = p_date)) THEN
        UPDATE batuara."Events"
           SET "Description" = p_description,
               "Date" = batuara.seed_local_date_timestamptz(p_date, p_timezone),
               "StartTime" = p_start,
               "EndTime" = p_end,
               "Type" = p_type,
               "Location" = p_location,
               "IsActive" = p_is_active,
               "UpdatedAt" = timezone('UTC', now())
         WHERE "Title" = p_title
           AND (("Date" AT TIME ZONE p_timezone)::date = p_date);
    ELSE
        INSERT INTO batuara."Events" ("Title", "Description", "Date", "StartTime", "EndTime", "Type", "ImageUrl", "Location", "IsActive", "CreatedAt", "UpdatedAt")
        VALUES (p_title, p_description, batuara.seed_local_date_timestamptz(p_date, p_timezone), p_start, p_end, p_type, NULL, p_location, p_is_active, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
    RAISE NOTICE 'Evento sincronizado: % em %', p_title, p_date;
END;
$$;
CREATE OR REPLACE PROCEDURE batuara.seed_upsert_attendance_2026(p_date date, p_start interval, p_end interval, p_type integer, p_description text, p_observations text, p_requires_registration boolean, p_max_capacity integer, p_timezone text) LANGUAGE plpgsql AS $$
BEGIN
    CALL batuara.seed_validate_interval(p_start, p_end);
    IF p_type NOT BETWEEN 1 AND 4 THEN
        RAISE EXCEPTION 'Tipo de atendimento inválido para %: %', p_description, p_type;
    END IF;
    IF p_max_capacity IS NOT NULL AND p_max_capacity <= 0 THEN
        RAISE EXCEPTION 'Capacidade máxima inválida para %: %', p_description, p_max_capacity;
    END IF;
    IF EXISTS (
        SELECT 1
          FROM batuara."Events"
         WHERE "IsActive" = true
           AND (("Date" AT TIME ZONE p_timezone)::date = p_date)
           AND "StartTime" IS NOT NULL
           AND "EndTime" IS NOT NULL
           AND "StartTime" < p_end
           AND "EndTime" > p_start
    ) THEN
        RAISE NOTICE 'Atendimento ignorado por conflito com evento ativo em %', p_date;
        RETURN;
    END IF;
    IF EXISTS (SELECT 1 FROM batuara."CalendarAttendances" WHERE "Type" = p_type AND (("Date" AT TIME ZONE p_timezone)::date = p_date) AND "StartTime" = p_start AND "EndTime" = p_end) THEN
        UPDATE batuara."CalendarAttendances"
           SET "Description" = p_description,
               "Observations" = p_observations,
               "RequiresRegistration" = p_requires_registration,
               "MaxCapacity" = p_max_capacity,
               "IsActive" = true,
               "UpdatedAt" = timezone('UTC', now())
         WHERE "Type" = p_type
           AND (("Date" AT TIME ZONE p_timezone)::date = p_date)
           AND "StartTime" = p_start
           AND "EndTime" = p_end;
    ELSE
        INSERT INTO batuara."CalendarAttendances" ("Date", "StartTime", "EndTime", "Type", "Description", "Observations", "RequiresRegistration", "MaxCapacity", "IsActive", "CreatedAt", "UpdatedAt")
        VALUES (batuara.seed_local_date_timestamptz(p_date, p_timezone), p_start, p_end, p_type, p_description, p_observations, p_requires_registration, p_max_capacity, true, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
    RAISE NOTICE 'Atendimento sincronizado: % em %', p_description, p_date;
END;
$$;
CREATE OR REPLACE PROCEDURE batuara.generate_recurring_attendances_2026(p_title text, p_description text, p_start_date date, p_end_date date, p_weekday integer, p_interval integer, p_start interval, p_end interval, p_type integer, p_requires_registration boolean, p_max_capacity integer, p_timezone text, p_observations text, p_exclusions date[]) LANGUAGE plpgsql AS $$
DECLARE
    v_date date := p_start_date;
    v_occurrence integer := 0;
BEGIN
    IF p_interval <= 0 THEN
        RAISE EXCEPTION 'Intervalo de recorrência inválido: %', p_interval;
    END IF;
    WHILE v_date <= p_end_date LOOP
        IF ((EXTRACT(ISODOW FROM v_date)::int - 1) = p_weekday) THEN
            IF (v_occurrence % p_interval = 0) AND NOT (v_date = ANY(COALESCE(p_exclusions, ARRAY[]::date[]))) THEN
                CALL batuara.seed_upsert_attendance_2026(v_date, p_start, p_end, p_type, p_title, p_observations, p_requires_registration, p_max_capacity, p_timezone);
            END IF;
            v_occurrence := v_occurrence + 1;
        END IF;
        v_date := v_date + 1;
    END LOOP;
END;
$$;
DO $$
BEGIN
    IF to_regclass('batuara."Events"') IS NULL OR to_regclass('batuara."CalendarAttendances"') IS NULL THEN
        RAISE EXCEPTION 'Tabelas obrigatórias para o seed do calendário não foram encontradas no schema batuara';
    END IF;
    RAISE NOTICE 'Sincronizando evento: São Sebastião';
    CALL batuara.seed_upsert_event_2026('São Sebastião', 'Dia dedicado a São Sebastião, protetor contra as epidemias. Data importante no calendário espírita.', DATE '2026-01-20', make_interval(hours => 9, mins => 0), make_interval(hours => 18, mins => 0), 3, 'Casa de Caridade Batuara', 'America/Sao_Paulo', true);
    RAISE NOTICE 'Sincronizando evento: Dia de Oxóssi';
    CALL batuara.seed_upsert_event_2026('Dia de Oxóssi', 'Celebração do dia de Oxóssi, Orixá da mata, da fartura e do conhecimento. Gira especial com ofertas de caça e beers.', DATE '2026-01-20', make_interval(hours => 19, mins => 0), make_interval(hours => 22, mins => 0), 1, 'Casa de Caridade Batuara', 'America/Sao_Paulo', true);
    RAISE NOTICE 'Sincronizando evento: Dia de Iemanjá (潮) / Natal de Iemanjá';
    CALL batuara.seed_upsert_event_2026('Dia de Iemanjá (潮) / Natal de Iemanjá', 'Dia de Iemanjá (潮): Celebração do dia de Iemanjá, mãe de todos os Orixás. Cerimônia especial com gira de água.

Natal de Iemanjá: Celebração do ''Natal'' de Iemanjá. Uma das datas mais importantes para os seguidores de Umbanda e Candomblé.', DATE '2026-02-02', make_interval(hours => 19, mins => 0), make_interval(hours => 23, mins => 0), 1, 'Casa de Caridade Batuara', 'America/Sao_Paulo', true);
    RAISE NOTICE 'Sincronizando evento: Aniversário de Iemanjá';
    CALL batuara.seed_upsert_event_2026('Aniversário de Iemanjá', 'Comemoração do aniversário de Iemanjá, mãe querida de todos os filhos. Gira especial com oferendas ao mar.', DATE '2026-04-23', make_interval(hours => 19, mins => 0), make_interval(hours => 23, mins => 0), 1, 'Casa de Caridade Batuara', 'America/Sao_Paulo', true);
    RAISE NOTICE 'Sincronizando evento: Dia de Todos os Santos';
    CALL batuara.seed_upsert_event_2026('Dia de Todos os Santos', 'Celebração do Dia de Todos os Santos. Feriado religioso que coincide com a Linha de Oxalá.', DATE '2026-05-01', make_interval(hours => 9, mins => 0), make_interval(hours => 18, mins => 0), 3, 'Casa de Caridade Batuara', 'America/Sao_Paulo', true);
    RAISE NOTICE 'Sincronizando evento: Dia do Trabalho';
    CALL batuara.seed_upsert_event_2026('Dia do Trabalho', 'Feriado nacional. Casa fechada para atendimento espiritual.', DATE '2026-05-01', NULL, NULL, 3, 'Casa fechada', 'America/Sao_Paulo', false);
    RAISE NOTICE 'Sincronizando evento: Festa Junina de São João';
    CALL batuara.seed_upsert_event_2026('Festa Junina de São João', 'Celebração de São João com bingo, quadrilha, comidas típicas e muito forró. Momento de fraternidade e alegria.', DATE '2026-06-24', make_interval(hours => 19, mins => 0), make_interval(hours => 23, mins => 0), 1, 'Casa de Caridade Batuara', 'America/Sao_Paulo', true);
    RAISE NOTICE 'Sincronizando evento: Dia de Ogum';
    CALL batuara.seed_upsert_event_2026('Dia de Ogum', 'Celebração do dia de Ogum, Orixá guerreiro, senhor do ferro e das estradas. Gira especial com ofertas de ferro.', DATE '2026-07-27', make_interval(hours => 19, mins => 0), make_interval(hours => 22, mins => 0), 1, 'Casa de Caridade Batuara', 'America/Sao_Paulo', true);
    RAISE NOTICE 'Sincronizando evento: Dia de Nanã';
    CALL batuara.seed_upsert_event_2026('Dia de Nanã', 'Celebração do dia de Nanã, Orixá anciã, senhora da sabedoria e dos mistérios da vida e morte.', DATE '2026-08-15', make_interval(hours => 19, mins => 0), make_interval(hours => 22, mins => 0), 1, 'Casa de Caridade Batuara', 'America/Sao_Paulo', true);
    RAISE NOTICE 'Sincronizando evento: Dia de Oxum';
    CALL batuara.seed_upsert_event_2026('Dia de Oxum', 'Celebração do dia de Oxum, Orixá do amor, da beleza e das águas doces. Gira especial com oferendas douradas.', DATE '2026-08-16', make_interval(hours => 19, mins => 0), make_interval(hours => 22, mins => 0), 1, 'Casa de Caridade Batuara', 'America/Sao_Paulo', true);
    RAISE NOTICE 'Sincronizando evento: Dia de Obaluaê';
    CALL batuara.seed_upsert_event_2026('Dia de Obaluaê', 'Celebração do dia de Obaluaê, Orixá da cura e das doenças. Gira especial com preces pela saúde.', DATE '2026-10-31', make_interval(hours => 19, mins => 0), make_interval(hours => 22, mins => 0), 1, 'Casa de Caridade Batuara', 'America/Sao_Paulo', true);
    RAISE NOTICE 'Sincronizando evento: Natal de Iansã / Natal de Logun Edé';
    CALL batuara.seed_upsert_event_2026('Natal de Iansã / Natal de Logun Edé', 'Natal de Iansã: Celebração do Natal de Iansã. Data importante para os filhos desta Orixá guerreira.

Natal de Logun Edé: Celebração do Natal de Logun Edé, Orixá da união entre força e amor.', DATE '2026-12-08', make_interval(hours => 19, mins => 0), make_interval(hours => 22, mins => 0), 1, 'Casa de Caridade Batuara', 'America/Sao_Paulo', true);
    RAISE NOTICE 'Sincronizando evento: Natal';
    CALL batuara.seed_upsert_event_2026('Natal', 'Celebração do Natal de Cristo. Feriado religioso. Momento de paz, fraternidade e reflexão.', DATE '2026-12-25', make_interval(hours => 9, mins => 0), make_interval(hours => 12, mins => 0), 3, 'Casa de Caridade Batuara', 'America/Sao_Paulo', true);
    RAISE NOTICE 'Gerando recorrência: Gira de Umbanda';
    CALL batuara.generate_recurring_attendances_2026('Gira de Umbanda', 'Atendimento semanal de Umbanda às terças-feiras.', DATE '2026-01-06', DATE '2026-12-29', 1, 1, make_interval(hours => 20, mins => 0), make_interval(hours => 22, mins => 0), 2, false, NULL, 'America/Sao_Paulo', 'Usar roupas brancas. Gira aberta ao público.', ARRAY[DATE '2026-02-17']::date[]);
    RAISE NOTICE 'Gerando recorrência: Atendimento Kardecista';
    CALL batuara.generate_recurring_attendances_2026('Atendimento Kardecista', 'Atendimento kardecista semanal às quintas-feiras.', DATE '2026-01-01', DATE '2026-12-31', 3, 1, make_interval(hours => 19, mins => 0), make_interval(hours => 21, mins => 0), 1, false, NULL, 'America/Sao_Paulo', 'Trazer água. Atendimento espiritual e passes.', ARRAY[DATE '2026-04-02']::date[]);
    RAISE NOTICE 'Gerando recorrência: Curso de Desenvolvimento Mediúnico';
    CALL batuara.generate_recurring_attendances_2026('Curso de Desenvolvimento Mediúnico', 'Curso quinzenal de desenvolvimento mediúnico aos domingos.', DATE '2026-01-04', DATE '2026-12-27', 6, 2, make_interval(hours => 14, mins => 0), make_interval(hours => 17, mins => 0), 4, true, 30, 'America/Sao_Paulo', 'Inscrição obrigatória. Trazer caderno e caneta.', ARRAY[DATE '2026-04-05', DATE '2026-12-27']::date[]);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Falha no seed do calendário 2026: %', SQLERRM;
    RAISE;
END $$;
COMMIT;
