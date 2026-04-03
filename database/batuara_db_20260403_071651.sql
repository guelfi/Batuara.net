--
-- PostgreSQL database dump
--

\restrict xmovt1cDsuHG31Qps4OGozCFbPvcsX6JMaq9Icm5mE0drIQ8UALLi9QEfv3dlzb

-- Dumped from database version 15.17
-- Dumped by pg_dump version 15.17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: batuara; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA batuara;


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: generate_recurring_attendances_2026(text, text, date, date, integer, integer, interval, interval, integer, boolean, integer, text, text, date[]); Type: PROCEDURE; Schema: batuara; Owner: -
--

CREATE PROCEDURE batuara.generate_recurring_attendances_2026(IN p_title text, IN p_description text, IN p_start_date date, IN p_end_date date, IN p_weekday integer, IN p_interval integer, IN p_start interval, IN p_end interval, IN p_type integer, IN p_requires_registration boolean, IN p_max_capacity integer, IN p_timezone text, IN p_observations text, IN p_exclusions date[])
    LANGUAGE plpgsql
    AS $$
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


--
-- Name: seed_local_date_timestamptz(date, text); Type: FUNCTION; Schema: batuara; Owner: -
--

CREATE FUNCTION batuara.seed_local_date_timestamptz(p_date date, p_timezone text) RETURNS timestamp with time zone
    LANGUAGE sql IMMUTABLE
    AS $$
    SELECT (p_date::timestamp AT TIME ZONE p_timezone);
$$;


--
-- Name: seed_upsert_attendance_2026(date, interval, interval, integer, text, text, boolean, integer, text); Type: PROCEDURE; Schema: batuara; Owner: -
--

CREATE PROCEDURE batuara.seed_upsert_attendance_2026(IN p_date date, IN p_start interval, IN p_end interval, IN p_type integer, IN p_description text, IN p_observations text, IN p_requires_registration boolean, IN p_max_capacity integer, IN p_timezone text)
    LANGUAGE plpgsql
    AS $$
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


--
-- Name: seed_upsert_event_2026(text, text, date, interval, interval, integer, text, text, boolean); Type: PROCEDURE; Schema: batuara; Owner: -
--

CREATE PROCEDURE batuara.seed_upsert_event_2026(IN p_title text, IN p_description text, IN p_date date, IN p_start interval, IN p_end interval, IN p_type integer, IN p_location text, IN p_timezone text, IN p_is_active boolean)
    LANGUAGE plpgsql
    AS $$
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


--
-- Name: seed_validate_interval(interval, interval); Type: PROCEDURE; Schema: batuara; Owner: -
--

CREATE PROCEDURE batuara.seed_validate_interval(IN p_start interval, IN p_end interval)
    LANGUAGE plpgsql
    AS $$
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


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: CalendarAttendances; Type: TABLE; Schema: batuara; Owner: -
--

CREATE TABLE batuara."CalendarAttendances" (
    "Id" integer NOT NULL,
    "Date" timestamp with time zone NOT NULL,
    "StartTime" interval NOT NULL,
    "EndTime" interval NOT NULL,
    "Type" integer NOT NULL,
    "Description" character varying(500),
    "Observations" character varying(1000),
    "RequiresRegistration" boolean DEFAULT false NOT NULL,
    "MaxCapacity" integer,
    "CreatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "IsActive" boolean DEFAULT true NOT NULL,
    CONSTRAINT "CK_seed_calendar_Attendances_MaxCapacity_Positive" CHECK ((("MaxCapacity" IS NULL) OR ("MaxCapacity" > 0))),
    CONSTRAINT "CK_seed_calendar_Attendances_Type_Valid" CHECK ((("Type" >= 1) AND ("Type" <= 4)))
);


--
-- Name: CalendarAttendances_Id_seq; Type: SEQUENCE; Schema: batuara; Owner: -
--

ALTER TABLE batuara."CalendarAttendances" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME batuara."CalendarAttendances_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ContactMessages; Type: TABLE; Schema: batuara; Owner: -
--

CREATE TABLE batuara."ContactMessages" (
    "Id" integer NOT NULL,
    "Name" character varying(150) NOT NULL,
    "Email" character varying(150) NOT NULL,
    "Phone" character varying(40),
    "Subject" character varying(180) NOT NULL,
    "Message" character varying(4000) NOT NULL,
    "Status" character varying(20) NOT NULL,
    "AdminNotes" character varying(2000),
    "ReceivedAt" timestamp with time zone NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "IsActive" boolean NOT NULL
);


--
-- Name: ContactMessages_Id_seq; Type: SEQUENCE; Schema: batuara; Owner: -
--

ALTER TABLE batuara."ContactMessages" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME batuara."ContactMessages_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: Events; Type: TABLE; Schema: batuara; Owner: -
--

CREATE TABLE batuara."Events" (
    "Id" integer NOT NULL,
    "Title" character varying(200) NOT NULL,
    "Description" character varying(2000) NOT NULL,
    "Date" timestamp with time zone NOT NULL,
    "StartTime" interval,
    "EndTime" interval,
    "Type" integer NOT NULL,
    "ImageUrl" character varying(500),
    "Location" character varying(300),
    "CreatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "IsActive" boolean DEFAULT true NOT NULL,
    CONSTRAINT "CK_seed_calendar_Events_Type_Valid" CHECK ((("Type" >= 1) AND ("Type" <= 5)))
);


--
-- Name: Events_Id_seq; Type: SEQUENCE; Schema: batuara; Owner: -
--

ALTER TABLE batuara."Events" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME batuara."Events_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: Guides; Type: TABLE; Schema: batuara; Owner: -
--

CREATE TABLE batuara."Guides" (
    "Id" integer NOT NULL,
    "Name" character varying(150) NOT NULL,
    "Description" character varying(8000) NOT NULL,
    "PhotoUrl" character varying(500),
    "Specialties" jsonb NOT NULL,
    "EntryDate" timestamp with time zone NOT NULL,
    "Email" character varying(150),
    "Phone" character varying(40),
    "Whatsapp" character varying(40),
    "DisplayOrder" integer DEFAULT 1 NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "IsActive" boolean DEFAULT true NOT NULL
);


--
-- Name: Guides_Id_seq; Type: SEQUENCE; Schema: batuara; Owner: -
--

ALTER TABLE batuara."Guides" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME batuara."Guides_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: HouseMemberContributions; Type: TABLE; Schema: batuara; Owner: -
--

CREATE TABLE batuara."HouseMemberContributions" (
    "Id" integer NOT NULL,
    "HouseMemberId" integer NOT NULL,
    "ReferenceMonth" timestamp with time zone NOT NULL,
    "DueDate" timestamp with time zone NOT NULL,
    "Amount" numeric(10,2) NOT NULL,
    "Status" character varying(20) NOT NULL,
    "PaidAt" timestamp with time zone,
    "Notes" character varying(1000),
    "CreatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "IsActive" boolean NOT NULL
);


--
-- Name: HouseMemberContributions_Id_seq; Type: SEQUENCE; Schema: batuara; Owner: -
--

ALTER TABLE batuara."HouseMemberContributions" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME batuara."HouseMemberContributions_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: HouseMembers; Type: TABLE; Schema: batuara; Owner: -
--

CREATE TABLE batuara."HouseMembers" (
    "Id" integer NOT NULL,
    "FullName" character varying(180) NOT NULL,
    "BirthDate" timestamp with time zone NOT NULL,
    "EntryDate" timestamp with time zone NOT NULL,
    "HeadOrixaFront" character varying(100) NOT NULL,
    "HeadOrixaBack" character varying(100) NOT NULL,
    "HeadOrixaRonda" character varying(100) NOT NULL,
    "Email" character varying(150) NOT NULL,
    "MobilePhone" character varying(40) NOT NULL,
    "ZipCode" character varying(20) NOT NULL,
    "Street" character varying(200) NOT NULL,
    "Number" character varying(20) NOT NULL,
    "Complement" character varying(120),
    "District" character varying(120) NOT NULL,
    "City" character varying(120) NOT NULL,
    "State" character varying(2) NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "IsActive" boolean DEFAULT true NOT NULL
);


--
-- Name: HouseMembers_Id_seq; Type: SEQUENCE; Schema: batuara; Owner: -
--

ALTER TABLE batuara."HouseMembers" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME batuara."HouseMembers_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: Orixas; Type: TABLE; Schema: batuara; Owner: -
--

CREATE TABLE batuara."Orixas" (
    "Id" integer NOT NULL,
    "Name" character varying(100) NOT NULL,
    "Description" character varying(5000) NOT NULL,
    "Origin" character varying(1000) NOT NULL,
    "BatuaraTeaching" character varying(5000) NOT NULL,
    "ImageUrl" character varying(500),
    "DisplayOrder" integer DEFAULT 0 NOT NULL,
    "Characteristics" jsonb NOT NULL,
    "Colors" jsonb NOT NULL,
    "Elements" jsonb NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "IsActive" boolean DEFAULT true NOT NULL,
    CONSTRAINT "CK_seed_publicwebsite_Orixas_DisplayOrder_Positive" CHECK (("DisplayOrder" > 0))
);


--
-- Name: Orixas_Id_seq; Type: SEQUENCE; Schema: batuara; Owner: -
--

ALTER TABLE batuara."Orixas" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME batuara."Orixas_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: SiteSettings; Type: TABLE; Schema: batuara; Owner: -
--

CREATE TABLE batuara."SiteSettings" (
    "Id" integer NOT NULL,
    "Address" character varying(500) NOT NULL,
    "Email" character varying(200) NOT NULL,
    "Phone" character varying(50) NOT NULL,
    "Instagram" character varying(50) NOT NULL,
    "AboutText" character varying(20000) NOT NULL,
    "InstagramUrl" character varying(500),
    "PixKey" character varying(200),
    "CreatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "IsActive" boolean DEFAULT true NOT NULL,
    "BankAccount" character varying(40),
    "BankAccountType" character varying(40),
    "BankAgency" character varying(40),
    "BankName" character varying(120),
    "City" character varying(120) DEFAULT ''::character varying NOT NULL,
    "CompanyDocument" character varying(30),
    "Complement" character varying(120),
    "District" character varying(120) DEFAULT ''::character varying NOT NULL,
    "FacebookUrl" character varying(500),
    "HistoryHtml" character varying(50000),
    "HistorySubtitle" character varying(500),
    "HistoryTitle" character varying(200) DEFAULT ''::character varying NOT NULL,
    "InstitutionalEmail" character varying(200) DEFAULT ''::character varying NOT NULL,
    "MapEmbedUrl" character varying(1000),
    "Number" character varying(20) DEFAULT ''::character varying NOT NULL,
    "PixCity" character varying(100),
    "PixPayload" character varying(500),
    "PixRecipientName" character varying(200),
    "PrimaryPhone" character varying(50) DEFAULT ''::character varying NOT NULL,
    "ReferenceNotes" character varying(1000),
    "SecondaryPhone" character varying(50),
    "ServiceHours" character varying(500),
    "State" character varying(2) DEFAULT ''::character varying NOT NULL,
    "Street" character varying(200) DEFAULT ''::character varying NOT NULL,
    "WhatsappNumber" character varying(50),
    "WhatsappUrl" character varying(500),
    "YoutubeUrl" character varying(500),
    "ZipCode" character varying(20) DEFAULT ''::character varying NOT NULL,
    "HistoryMissionText" character varying(2000)
);


--
-- Name: SiteSettings_Id_seq; Type: SEQUENCE; Schema: batuara; Owner: -
--

ALTER TABLE batuara."SiteSettings" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME batuara."SiteSettings_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: SpiritualContents; Type: TABLE; Schema: batuara; Owner: -
--

CREATE TABLE batuara."SpiritualContents" (
    "Id" integer NOT NULL,
    "Title" character varying(200) NOT NULL,
    "Content" character varying(10000) NOT NULL,
    "Type" integer NOT NULL,
    "Category" integer NOT NULL,
    "Source" character varying(200) NOT NULL,
    "DisplayOrder" integer DEFAULT 0 NOT NULL,
    "IsFeatured" boolean DEFAULT false NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "IsActive" boolean DEFAULT true NOT NULL,
    CONSTRAINT "CK_seed_publicwebsite_SpiritualContents_Category_Valid" CHECK ((("Category" >= 1) AND ("Category" <= 4))),
    CONSTRAINT "CK_seed_publicwebsite_SpiritualContents_Type_Valid" CHECK ((("Type" >= 1) AND ("Type" <= 5)))
);


--
-- Name: SpiritualContents_Id_seq; Type: SEQUENCE; Schema: batuara; Owner: -
--

ALTER TABLE batuara."SpiritualContents" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME batuara."SpiritualContents_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: UmbandaLines; Type: TABLE; Schema: batuara; Owner: -
--

CREATE TABLE batuara."UmbandaLines" (
    "Id" integer NOT NULL,
    "Name" character varying(100) NOT NULL,
    "Description" character varying(5000) NOT NULL,
    "Characteristics" character varying(3000) NOT NULL,
    "BatuaraInterpretation" character varying(5000) NOT NULL,
    "DisplayOrder" integer DEFAULT 0 NOT NULL,
    "Entities" jsonb NOT NULL,
    "WorkingDays" jsonb NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "UpdatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "IsActive" boolean DEFAULT true NOT NULL,
    CONSTRAINT "CK_seed_publicwebsite_UmbandaLines_DisplayOrder_Positive" CHECK (("DisplayOrder" > 0))
);


--
-- Name: UmbandaLines_Id_seq; Type: SEQUENCE; Schema: batuara; Owner: -
--

ALTER TABLE batuara."UmbandaLines" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME batuara."UmbandaLines_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: batuara; Owner: -
--

CREATE TABLE batuara.refresh_tokens (
    id integer NOT NULL,
    token text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_by_ip character varying(50) NOT NULL,
    revoked_at timestamp with time zone,
    revoked_by_ip character varying(50),
    replaced_by_token character varying(255),
    user_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    "ReasonRevoked" text
);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: batuara; Owner: -
--

ALTER TABLE batuara.refresh_tokens ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME batuara.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: batuara; Owner: -
--

CREATE TABLE batuara.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    name character varying(100) NOT NULL,
    role integer NOT NULL,
    is_active boolean NOT NULL,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: batuara; Owner: -
--

ALTER TABLE batuara.users ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME batuara.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: __EFMigrationsHistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL
);


--
-- Data for Name: CalendarAttendances; Type: TABLE DATA; Schema: batuara; Owner: -
--

COPY batuara."CalendarAttendances" ("Id", "Date", "StartTime", "EndTime", "Type", "Description", "Observations", "RequiresRegistration", "MaxCapacity", "CreatedAt", "UpdatedAt", "IsActive") FROM stdin;
1	2026-04-07 00:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água	f	\N	2026-04-02 14:37:36.978051+00	2026-04-02 14:37:36.978051+00	t
2	2026-04-03 00:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas	f	\N	2026-04-02 14:37:36.97859+00	2026-04-02 14:37:36.97859+00	t
3	2026-04-05 00:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	\N	t	30	2026-04-02 14:37:36.978595+00	2026-04-02 14:37:36.978595+00	t
6	2026-01-06 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
7	2026-01-13 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
8	2026-01-27 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
9	2026-02-03 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
10	2026-02-10 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
11	2026-02-24 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
12	2026-03-03 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
13	2026-03-10 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
14	2026-03-17 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
15	2026-03-24 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
16	2026-03-31 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
17	2026-04-07 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
18	2026-04-14 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
19	2026-04-21 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
20	2026-04-28 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
21	2026-05-05 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
22	2026-05-12 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
23	2026-05-19 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
24	2026-05-26 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
25	2026-06-02 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
26	2026-06-09 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
27	2026-06-16 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
28	2026-06-23 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
29	2026-06-30 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
30	2026-07-07 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
31	2026-07-14 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
32	2026-07-21 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
33	2026-07-28 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
34	2026-08-04 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
35	2026-08-11 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
36	2026-08-18 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
37	2026-08-25 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
38	2026-09-01 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
39	2026-09-08 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
40	2026-09-15 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
41	2026-09-22 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
42	2026-09-29 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
43	2026-10-06 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
44	2026-10-13 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
45	2026-10-20 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
46	2026-10-27 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
47	2026-11-03 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
48	2026-11-10 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
49	2026-11-17 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
50	2026-11-24 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
51	2026-12-01 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
52	2026-12-15 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
53	2026-12-22 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
54	2026-12-29 03:00:00+00	20:00:00	22:00:00	2	Gira de Umbanda	Usar roupas brancas. Gira aberta ao público.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
55	2026-01-01 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
56	2026-01-08 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
57	2026-01-15 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
58	2026-01-22 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
59	2026-01-29 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
60	2026-02-05 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
61	2026-02-12 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
62	2026-02-19 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
63	2026-02-26 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
64	2026-03-05 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
65	2026-03-12 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
66	2026-03-19 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
67	2026-03-26 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
68	2026-04-30 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
69	2026-05-07 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
70	2026-05-14 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
71	2026-05-21 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
72	2026-05-28 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
73	2026-06-04 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
74	2026-06-11 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
75	2026-06-18 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
76	2026-06-25 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
77	2026-07-02 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
78	2026-07-09 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
79	2026-07-16 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
80	2026-07-23 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
81	2026-07-30 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
82	2026-08-06 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
83	2026-08-13 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
84	2026-08-20 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
85	2026-08-27 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
86	2026-09-03 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
87	2026-09-10 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
88	2026-09-17 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
89	2026-09-24 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
90	2026-10-01 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
91	2026-10-08 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
92	2026-10-15 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
93	2026-10-22 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
94	2026-10-29 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
95	2026-11-05 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
96	2026-11-12 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
97	2026-11-19 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
98	2026-11-26 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
99	2026-12-03 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
100	2026-12-10 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
101	2026-12-17 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
102	2026-12-24 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
103	2026-12-31 03:00:00+00	19:00:00	21:00:00	1	Atendimento Kardecista	Trazer água. Atendimento espiritual e passes.	f	\N	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
104	2026-01-04 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
105	2026-01-18 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
106	2026-02-01 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
107	2026-02-15 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
108	2026-03-01 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
109	2026-03-15 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
110	2026-03-29 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
111	2026-04-12 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
112	2026-04-26 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
113	2026-05-10 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
114	2026-05-24 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
115	2026-06-07 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
116	2026-06-21 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
117	2026-07-05 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
118	2026-07-19 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
119	2026-08-02 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
120	2026-08-16 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
121	2026-08-30 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
122	2026-09-13 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
123	2026-09-27 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
124	2026-10-11 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
125	2026-10-25 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
126	2026-11-08 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
127	2026-11-22 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
128	2026-12-06 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
129	2026-12-20 03:00:00+00	14:00:00	17:00:00	4	Curso de Desenvolvimento Mediúnico	Inscrição obrigatória. Trazer caderno e caneta.	t	30	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
\.


--
-- Data for Name: ContactMessages; Type: TABLE DATA; Schema: batuara; Owner: -
--

COPY batuara."ContactMessages" ("Id", "Name", "Email", "Phone", "Subject", "Message", "Status", "AdminNotes", "ReceivedAt", "CreatedAt", "UpdatedAt", "IsActive") FROM stdin;
1	QA Público	qa-publico@batuara.test	11999990000	Teste integração	Mensagem automática de validação.	Archived	Registro de validação automatizada arquivado.	2026-04-03 00:07:51.223026+00	2026-04-03 00:07:51.222913+00	2026-04-03 00:23:17.806076+00	t
2	Smoke Test	smoke-test@batuara.local	11999990099	Validação automatizada	Mensagem criada pelo roteiro de integração.	Archived	Mensagem arquivada pelo roteiro de integração.	2026-04-03 00:25:43.670251+00	2026-04-03 00:25:43.670139+00	2026-04-03 00:25:43.754073+00	t
\.


--
-- Data for Name: Events; Type: TABLE DATA; Schema: batuara; Owner: -
--

COPY batuara."Events" ("Id", "Title", "Description", "Date", "StartTime", "EndTime", "Type", "ImageUrl", "Location", "CreatedAt", "UpdatedAt", "IsActive") FROM stdin;
1	Festa de Yemanjá	Celebração em honra à nossa querida Mãe Yemanjá, com gira especial e oferendas ao mar.	2026-04-17 00:00:00+00	19:00:00	22:00:00	1	\N	Casa de Caridade Batuara	2026-04-02 14:37:36.840772+00	2026-04-02 14:37:36.840772+00	t
2	Palestra: Os Orixás na Umbanda	Palestra educativa sobre os Orixás e seus ensinamentos na tradição umbandista.	2026-04-10 00:00:00+00	19:30:00	21:00:00	5	\N	Casa de Caridade Batuara	2026-04-02 14:37:36.841007+00	2026-04-02 14:37:36.841007+00	t
3	Bazar Beneficente	Bazar com roupas, livros e artesanatos para arrecadar fundos para as obras da casa.	2026-04-14 00:00:00+00	14:00:00	18:00:00	4	\N	Casa de Caridade Batuara	2026-04-02 14:37:36.841008+00	2026-04-02 14:37:36.841008+00	t
17	São Sebastião	Dia dedicado a São Sebastião, protetor contra as epidemias. Data importante no calendário espírita.	2026-01-20 03:00:00+00	09:00:00	18:00:00	3	\N	Casa de Caridade Batuara	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
18	Dia de Oxóssi	Celebração do dia de Oxóssi, Orixá da mata, da fartura e do conhecimento. Gira especial com ofertas de caça e beers.	2026-01-20 03:00:00+00	19:00:00	22:00:00	1	\N	Casa de Caridade Batuara	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
19	Dia de Iemanjá (潮) / Natal de Iemanjá	Dia de Iemanjá (潮): Celebração do dia de Iemanjá, mãe de todos os Orixás. Cerimônia especial com gira de água.\r\n\r\nNatal de Iemanjá: Celebração do 'Natal' de Iemanjá. Uma das datas mais importantes para os seguidores de Umbanda e Candomblé.	2026-02-02 03:00:00+00	19:00:00	23:00:00	1	\N	Casa de Caridade Batuara	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
20	Aniversário de Iemanjá	Comemoração do aniversário de Iemanjá, mãe querida de todos os filhos. Gira especial com oferendas ao mar.	2026-04-23 03:00:00+00	19:00:00	23:00:00	1	\N	Casa de Caridade Batuara	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
21	Dia de Todos os Santos	Celebração do Dia de Todos os Santos. Feriado religioso que coincide com a Linha de Oxalá.	2026-05-01 03:00:00+00	09:00:00	18:00:00	3	\N	Casa de Caridade Batuara	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
22	Dia do Trabalho	Feriado nacional. Casa fechada para atendimento espiritual.	2026-05-01 03:00:00+00	\N	\N	3	\N	Casa fechada	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	f
23	Festa Junina de São João	Celebração de São João com bingo, quadrilha, comidas típicas e muito forró. Momento de fraternidade e alegria.	2026-06-24 03:00:00+00	19:00:00	23:00:00	1	\N	Casa de Caridade Batuara	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
24	Dia de Ogum	Celebração do dia de Ogum, Orixá guerreiro, senhor do ferro e das estradas. Gira especial com ofertas de ferro.	2026-07-27 03:00:00+00	19:00:00	22:00:00	1	\N	Casa de Caridade Batuara	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
25	Dia de Nanã	Celebração do dia de Nanã, Orixá anciã, senhora da sabedoria e dos mistérios da vida e morte.	2026-08-15 03:00:00+00	19:00:00	22:00:00	1	\N	Casa de Caridade Batuara	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
26	Dia de Oxum	Celebração do dia de Oxum, Orixá do amor, da beleza e das águas doces. Gira especial com oferendas douradas.	2026-08-16 03:00:00+00	19:00:00	22:00:00	1	\N	Casa de Caridade Batuara	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
27	Dia de Obaluaê	Celebração do dia de Obaluaê, Orixá da cura e das doenças. Gira especial com preces pela saúde.	2026-10-31 03:00:00+00	19:00:00	22:00:00	1	\N	Casa de Caridade Batuara	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
28	Natal de Iansã / Natal de Logun Edé	Natal de Iansã: Celebração do Natal de Iansã. Data importante para os filhos desta Orixá guerreira.\r\n\r\nNatal de Logun Edé: Celebração do Natal de Logun Edé, Orixá da união entre força e amor.	2026-12-08 03:00:00+00	19:00:00	22:00:00	1	\N	Casa de Caridade Batuara	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
29	Natal	Celebração do Natal de Cristo. Feriado religioso. Momento de paz, fraternidade e reflexão.	2026-12-25 03:00:00+00	09:00:00	12:00:00	3	\N	Casa de Caridade Batuara	2026-04-02 18:34:49.818539+00	2026-04-02 18:34:49.818539+00	t
30	Evento QA Visual 2026 Editado	Evento criado durante a validação visual automatizada do AdminDashboard.	2026-12-20 00:00:00+00	19:00:00	21:00:00	2	\N	Casa de Caridade Batuara	2026-04-02 20:54:38.103896+00	2026-04-02 20:57:17.948963+00	f
31	Evento QA Visual 2026 R2	Evento temporário para validação visual automatizada.	2026-11-19 00:00:00+00	19:00:00	21:00:00	2	\N	Casa Batuara QA	2026-04-02 21:10:23.52271+00	2026-04-02 21:12:35.276911+00	f
\.


--
-- Data for Name: Guides; Type: TABLE DATA; Schema: batuara; Owner: -
--

COPY batuara."Guides" ("Id", "Name", "Description", "PhotoUrl", "Specialties", "EntryDate", "Email", "Phone", "Whatsapp", "DisplayOrder", "CreatedAt", "UpdatedAt", "IsActive") FROM stdin;
2	Guia QA Data	Validação de datas	\N	["QA"]	2026-04-01 00:00:00+00	guia.data@batuara.test	\N	\N	98	2026-04-03 00:22:28.824295+00	2026-04-03 00:23:17.535461+00	f
1	Guia QA Automação	Cadastro temporário para validação	\N	["Validação", "QA"]	2026-04-01 00:00:00+00	guia.qa@batuara.test	11999990001	11999990002	99	2026-04-03 00:07:51.373823+00	2026-04-03 00:23:17.549519+00	f
3	Guia Smoke Test	Cadastro temporário para validação da API.	\N	["Integração", "QA"]	2026-04-01 00:00:00+00	guia.smoke@batuara.local	\N	\N	97	2026-04-03 00:25:43.690296+00	2026-04-03 00:25:43.765009+00	f
\.


--
-- Data for Name: HouseMemberContributions; Type: TABLE DATA; Schema: batuara; Owner: -
--

COPY batuara."HouseMemberContributions" ("Id", "HouseMemberId", "ReferenceMonth", "DueDate", "Amount", "Status", "PaidAt", "Notes", "CreatedAt", "UpdatedAt", "IsActive") FROM stdin;
1	1	2026-04-01 00:00:00+00	2026-04-10 00:00:00+00	50.00	Paid	2026-04-05 00:00:00+00	Pago em validação	2026-04-03 00:07:51.570614+00	2026-04-03 00:07:51.570971+00	t
2	2	2026-04-01 00:00:00+00	2026-04-10 00:00:00+00	50.00	Paid	2026-04-05 00:00:00+00	Pago	2026-04-03 00:22:28.984482+00	2026-04-03 00:22:28.984851+00	t
3	3	2026-04-01 00:00:00+00	2026-04-10 00:00:00+00	50.00	Paid	2026-04-05 00:00:00+00	Pago no roteiro automatizado.	2026-04-03 00:25:43.711336+00	2026-04-03 00:25:43.711346+00	t
\.


--
-- Data for Name: HouseMembers; Type: TABLE DATA; Schema: batuara; Owner: -
--

COPY batuara."HouseMembers" ("Id", "FullName", "BirthDate", "EntryDate", "HeadOrixaFront", "HeadOrixaBack", "HeadOrixaRonda", "Email", "MobilePhone", "ZipCode", "Street", "Number", "Complement", "District", "City", "State", "CreatedAt", "UpdatedAt", "IsActive") FROM stdin;
1	Filho QA Automação	1990-01-10 00:00:00+00	2024-06-01 00:00:00+00	Oxóssi	Ogum	Iansã	filho.qa@batuara.test	11999990003	07000-000	Rua Teste	10	Sala 1	Centro	Guarulhos	SP	2026-04-03 00:07:51.565047+00	2026-04-03 00:23:17.636826+00	f
3	Filho Smoke Test	1991-02-10 00:00:00+00	2024-06-01 00:00:00+00	Oxóssi	Ogum	Iansã	filho.smoke@batuara.local	11999990098	07000-000	Rua de Integração	50	\N	Centro	Guarulhos	SP	2026-04-03 00:25:43.711073+00	2026-04-03 09:15:32.902456+00	f
2	Filho QA Data	1990-01-10 00:00:00+00	2024-06-01 00:00:00+00	Oxóssi	Ogum	Iansã	filho.data@batuara.test	11999990010	07000-000	Rua Teste	10	\N	Centro	Guarulhos	SP	2026-04-03 00:22:28.978482+00	2026-04-03 09:15:40.895619+00	f
\.


--
-- Data for Name: Orixas; Type: TABLE DATA; Schema: batuara; Owner: -
--

COPY batuara."Orixas" ("Id", "Name", "Description", "Origin", "BatuaraTeaching", "ImageUrl", "DisplayOrder", "Characteristics", "Colors", "Elements", "CreatedAt", "UpdatedAt", "IsActive") FROM stdin;
2	Yemanjá	Yemanjá é a mãe de todos os Orixás e rainha dos mares. Representa a maternidade, a fertilidade, a proteção e o amor maternal. É a grande mãe que acolhe e protege todos os seus filhos.	Yemanjá tem origem na tradição Yorubá, onde é conhecida como Yemoja. É a divindade dos rios e mares, mãe de muitos Orixás e protetora das mulheres e crianças.	A Casa Batuara tem especial devoção à Yemanjá, nossa mãe querida. Ela nos ensina o amor incondicional de mãe, a proteção aos necessitados e a importância da família espiritual. Yemanjá nos mostra que o amor maternal é a força mais poderosa do universo, capaz de curar, proteger e transformar. Em nossa casa, ela é celebrada como a mãe que nunca abandona seus filhos.	\N	2	["Maternidade", "Proteção", "Fertilidade", "Amor maternal", "Cura", "Acolhimento", "Generosidade", "Compaixão"]	["Azul", "Branco", "Azul marinho", "Prata"]	["Água", "Mar", "Rios", "Conchas"]	2026-04-02 14:36:08.320269+00	2026-04-02 14:36:08.320269+00	t
1	Oxalá	Oxalá tem origem na tradição Yorubá da África, onde é conhecido como Obatalá.	Oxalá tem origem na tradição Yorubá da África, onde é conhecido como Obatalá. É considerado o criador da humanidade e o pai de todos os Orixás.	Na Casa Batuara, Oxalá é reverenciado como o grande pai, aquele que nos ensina a humildade, a paciência e o amor incondicional. Seus ensinamentos nos mostram que através da paz interior e da pureza de coração podemos alcançar a elevação espiritual.	https://batuara.net/assets/orixas/oxala.jpg	1	["Paciência", "Sabedoria", "Pureza", "Paz", "Criação", "Paternidade", "Humildade", "Amor incondicional"]	["Branco", "Azul claro"]	["Ar", "Éter", "Luz"]	2026-04-02 14:36:08.319981+00	2026-04-02 18:32:28.981706+00	t
5	Iemanjá	Iemanjá tem origem na tradição Yorubá, onde é conhecida como Yemoja.	Iemanjá tem origem na tradição Yorubá, onde é conhecida como Yemoja. É a divindade dos rios e mares, mãe de muitos Orixás e protetora das mulheres e crianças.	A Casa Batuara tem especial devoção à Iemanjá, nossa mãe querida. Ela nos ensina o amor incondicional de mãe, a proteção aos necessitados e a importância da família espiritual.	https://batuara.net/assets/orixas/iemanja.jpg	2	["Maternidade", "Proteção", "Fertilidade", "Amor maternal", "Cura", "Acolhimento", "Generosidade", "Compaixão"]	["Azul", "Branco", "Azul marinho", "Prata"]	["Água", "Mar", "Rios", "Conchas"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
6	Nanã	Nanã é uma das mais antigas Orixás femininas, conhecida como senhora da sabedoria ancestral e dos mistérios da vida e morte.	Nanã é uma das mais antigas Orixás femininas, conhecida como senhora da sabedoria ancestral e dos mistérios da vida e morte.	Na Casa Batuara, Nanã é reverenciada como a anciã sábia, aquela que guarda os segredos da vida e da morte, ensinando-nos a respeitar todos os ciclos da existência.	https://batuara.net/assets/orixas/nana.jpg	3	["Sabedoria", "Tradição", "Paciência", "Mistério", "Respeito aos antepassados"]	["Lilás", "Roxo"]	["Água", "Lama", "Terra"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
7	Oxum	Oxum é a Orixá das águas doces, dos rios e cachoeiras, conhecida como a senhora do ouro e do amor.	Oxum é a Orixá das águas doces, dos rios e cachoeiras, conhecida como a senhora do ouro e do amor.	Na Casa Batuara, Oxum é muito querida por suas qualidades de amor, beleza e fertilidade. Ela nos ensina a valorizar a doçura da vida e a beleza interior.	https://batuara.net/assets/orixas/oxum.jpg	4	["Amor", "Beleza", "Fertilidade", "Doçura", "Prosperidade"]	["Dourado", "Amarelo"]	["Água doce", "Ouro", "Rios"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
4	Ogum	Ogum é uma das divindades mais antigas da tradição Yorubá, conhecido como o senhor do ferro e da guerra.	Ogum é uma das divindades mais antigas da tradição Yorubá, conhecido como o senhor do ferro e da guerra.	A Casa Batuara ensina que Ogum é o grande trabalhador, aquele que nos mostra a importância do esforço e da dedicação para alcançar nossos objetivos.	https://batuara.net/assets/orixas/ogum.jpg	5	["Trabalho", "Perseverança", "Coragem", "Determinação", "Proteção", "Liderança", "Honestidade", "Força de vontade"]	["Azul escuro", "Vermelho", "Verde escuro"]	["Ferro", "Metal", "Terra", "Fogo"]	2026-04-02 14:36:08.320278+00	2026-04-02 18:32:28.981706+00	t
8	Oxóssi	Oxóssi é o Orixá caçador, senhor das matas e da fartura, conhecido por sua sabedoria e conexão com a natureza.	Oxóssi é o Orixá caçador, senhor das matas e da fartura, conhecido por sua sabedoria e conexão com a natureza.	Na Casa Batuara, Oxóssi é reverenciado como o provedor, aquele que nos ensina a buscar o conhecimento e a viver em harmonia com a natureza.	https://batuara.net/assets/orixas/oxossi.jpg	6	["Sabedoria", "Conhecimento", "Prosperidade", "Caça", "Natureza", "Fartura"]	["Verde", "Azul"]	["Mata", "Terra", "Arco"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
9	Xangô	Xangô é o Orixá da justiça, do fogo e do trovão, conhecido como o rei poderoso que pune os injustos e protege os oprimidos.	Xangô é o Orixá da justiça, do fogo e do trovão, conhecido como o rei poderoso que pune os injustos e protege os oprimidos.	A Casa Batuara ensina que Xangô é a personificação da justiça divina, nos mostrando que toda ação tem consequências e que a verdade sempre prevalece.	https://batuara.net/assets/orixas/xango.jpg	7	["Justiça", "Equilíbrio", "Autoridade", "Fogo", "Trovão", "Determinação"]	["Marrom", "Vermelho", "Branco"]	["Fogo", "Pedra", "Trovão"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
3	Iansã	Iansã, conhecida como Oyá na tradição Yorubá, é a divindade dos ventos e tempestades.	Iansã, conhecida como Oyá na tradição Yorubá, é a divindade dos ventos e tempestades. É esposa de Xangô e uma das mais respeitadas guerreiras entre os Orixás.	Na Casa Batuara, Iansã é reverenciada como a guerreira da luz, aquela que nos ensina a coragem para enfrentar as adversidades da vida.	https://batuara.net/assets/orixas/iansa.jpg	8	["Coragem", "Justiça", "Determinação", "Liderança", "Proteção", "Transformação", "Força", "Independência"]	["Amarelo", "Vermelho", "Coral", "Dourado"]	["Vento", "Tempestade", "Raio", "Fogo"]	2026-04-02 14:36:08.32027+00	2026-04-02 18:32:28.981706+00	t
10	Obaluaê	Obaluaê é o Orixá da cura e das doenças, também conhecido como Omolu.	Obaluaê é o Orixá da cura e das doenças, também conhecido como Omolu. É considerado o médico dos Orixás e senhor da vida e da morte.	Na Casa Batuara, Obaluaê é reverenciado como o grande curador, aquele que nos ensina que a saúde é o maior bem e que devemos cuidar do corpo e da alma.	https://batuara.net/assets/orixas/obaluae.jpg	9	["Cura", "Saúde", "Doenças", "Renovação", "Ciclo da vida"]	["Roxo", "Preto", "Vermelho"]	["Terra", "Lama", "Palha"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
11	Exu	Exu é o Orixá mensageiro, guardião dos caminhos e das encruzilhadas.	Exu é o Orixá mensageiro, guardião dos caminhos e das encruzilhadas. É o comunicador entre os mundos espiritual e material.	Na Casa Batuara, Exu é reverenciado como o mensageiro essencial, aquele que abre os caminhos e permite a comunicação entre o céu e a terra.	https://batuara.net/assets/orixas/exu.jpg	10	["Comunicação", "Caminhos", "Encruzilhadas", "Movimento", "Equilíbrio"]	["Vermelho", "Preto"]	["Terra", "Tridente"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
12	Pomba Gira	Pomba Gira é uma entidade feminina associada a Exu, senhora das encruzilhadas e dos mistérios femininos.	Pomba Gira é uma entidade feminina associada a Exu, senhora das encruzilhadas e dos mistérios femininos.	Na Casa Batuara, Pomba Gira é reverenciada como a guardiã dos mistérios femininos, ensinando-nos sobre a dualidade e o poder da energia feminina.	https://batuara.net/assets/orixas/pomba-gira.jpg	11	["Mistério", "Feminilidade", "Amor", "Encantamento", "Dualidade"]	["Preto", "Vermelho", "Rosa"]	["Terra", "Tridente"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
13	Ossain	Ossain é o Orixá das folhas e ervas medicinais, senhor do conhecimento das plantas curativas.	Ossain é o Orixá das folhas e ervas medicinais, senhor do conhecimento das plantas curativas.	Na Casa Batuara, Ossain é reverenciado como o mestre das ervas, ensinando-nos sobre as propriedades medicinais das plantas e a cura natural.	https://batuara.net/assets/orixas/ossain.jpg	12	["Cura", "Ervas", "Medicina", "Conhecimento ancestral", "Natureza"]	["Verde", "Marrom"]	["Ervas", "Terra", "Folhas"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
14	Oxumarê	Oxumarê é o Orixá da transformação, do movimento e da renovação.	Oxumarê é o Orixá da transformação, do movimento e da renovação. Representa o arco-íris e a serpente.	Na Casa Batuara, Oxumarê é reverenciado como o renovador, aquele que nos ensina que toda situação pode ser transformada e que a esperança sempre retorna.	https://batuara.net/assets/orixas/oxumare.jpg	13	["Renovação", "Transformação", "Movimento", "Esperança", "Equilíbrio"]	["Amarelo", "Verde", "Arco-íris"]	["Água", "Serpente", "Arco-íris"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
15	Logun Edé	Logun Edé é a fusão de Oxóssi e Oxum, representando a harmonia entre os opostos.	Logun Edé é a fusão de Oxóssi e Oxum, representando a harmonia entre os opostos. É Orixá da juventude, da sorte e das boas vendas.	Na Casa Batuara, Logun Edé é reverenciado como a união perfeita entre força e amor, ensina-nos que a prosperidade vem da harmonia entre os opostos.	https://batuara.net/assets/orixas/logun-ede.jpg	14	["União", "Prosperidade", "Juventude", "Sorte", "Harmonia"]	["Verde", "Dourado", "Azul"]	["Mata", "Rio", "Juventude"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
\.


--
-- Data for Name: SiteSettings; Type: TABLE DATA; Schema: batuara; Owner: -
--

COPY batuara."SiteSettings" ("Id", "Address", "Email", "Phone", "Instagram", "AboutText", "InstagramUrl", "PixKey", "CreatedAt", "UpdatedAt", "IsActive", "BankAccount", "BankAccountType", "BankAgency", "BankName", "City", "CompanyDocument", "Complement", "District", "FacebookUrl", "HistoryHtml", "HistorySubtitle", "HistoryTitle", "InstitutionalEmail", "MapEmbedUrl", "Number", "PixCity", "PixPayload", "PixRecipientName", "PrimaryPhone", "ReferenceNotes", "SecondaryPhone", "ServiceHours", "State", "Street", "WhatsappNumber", "WhatsappUrl", "YoutubeUrl", "ZipCode", "HistoryMissionText") FROM stdin;
1	Av.Brigadeiro Faria Lima, 2750 - Jardim Cocaia, Guarulhos - SP, 07130-000	contato@casabatuara.org.br	(11) 1234-5678	casadecaridade.batuara	A Casa de Caridade Caboclo Batuara nasceu do desejo de servir a Espiritualidade através da caridade e do amor ao próximo. Fundada em 23/04/1973 por Armando Augusto Nunes Filho (Dinho) e Ciro na Cidade de Guarulhos com base na Sabedoria Ancestral dos Orixás e no Conhecimento dos Guias, Entidades e Mentores, nossa casa é um lar espiritual para todos que buscam a luz, a paz e a elevação da alma.\n\nTrabalhamos com a Umbanda e a Doutrina Espírita, unindo a ciência, a filosofia e a religião em uma só prática. Nosso lema "Fora da caridade não há salvação" guia todas as nossas ações e nos lembra constantemente de nossa missão principal: servir com amor e humildade.\n\nOferecemos assistência espiritual gratuita, orientação, consolação e ensinamentos para todos que nos procuram, independentemente de sua condição social, raça ou credo religioso. Aqui, todos são bem-vindos e tratados como irmãos. Nossa comunidade se fortalece através da união, do respeito mútuo e da prática constante da caridade em todas as suas formas.	https://www.instagram.com/casadecaridade.batuara?igsh=ejU1dWozbTZlYXM4	contato@casabatuara.org.br	2026-04-02 13:19:11.868065+00	2026-04-03 10:08:03.881005+00	t	\N	\N	\N	\N		\N	\N		\N	<p class="MuiTypography-root MuiTypography-body1 css-ds7uh7" style="margin-right: 0px; margin-bottom: 24px; margin-left: 0px; font-family: Roboto, &quot;Helvetica Neue&quot;, Arial, sans-serif; line-height: 1.8; font-size: 1.1rem; text-align: justify; letter-spacing: normal; background-color: rgb(250, 250, 250);">A <b>Casa de Caridade Caboclo Batuara</b> nasceu do desejo de servir a Espiritualidade através da caridade e do amor ao próximo. Fundada em 23/04/1973 por Armando Augusto Nunes Filho (Dinho) e Ciro na Cidade de Guarulhos com base na Sabedoria Ancestral dos Orixás e no Conhecimento dos Guias, Entidades e Mentores, nossa casa é um lar espiritual para todos que buscam a luz, a paz e a elevação da alma.</p><blockquote style="margin-right: 0px; margin-bottom: 24px; margin-left: 0px; font-family: Roboto, &quot;Helvetica Neue&quot;, Arial, sans-serif; line-height: 1.8; font-size: 1.1rem; text-align: justify; letter-spacing: normal; background-color: rgb(250, 250, 250);">Trabalhamos com a Umbanda e a Doutrina Espírita, unindo a ciência, a filosofia e a religião em uma só prática. Nosso lema "Fora da caridade não há salvação" guia todas as nossas ações e nos lembra constantemente de nossa missão principal: servir com amor e humildade.</blockquote><p class="MuiTypography-root MuiTypography-body1 css-bm69r4" style="margin-right: 0px; margin-bottom: 0px; margin-left: 0px; font-family: Roboto, &quot;Helvetica Neue&quot;, Arial, sans-serif; line-height: 1.8; font-size: 1.1rem; text-align: justify; letter-spacing: normal; background-color: rgb(250, 250, 250);">Oferecemos assistência espiritual gratuita, orientação, consolação e ensinamentos para todos que nos procuram, independentemente de sua condição social, raça ou credo religioso. Aqui, todos são bem-vindos e tratados como irmãos. Nossa comunidade se fortalece através da união, do respeito mútuo e da prática constante da caridade em todas as suas formas.</p>	Uma Jornada de Fé, Caridade e Amor ao próximo.	Nossa História		\N		\N	\N	\N		\N	\N	\N			\N	\N	\N		Promover a caridade, o amor fraterno e a elevação espiritual através da Sabedoria Ancestral dos Orixás, Guias, Entidades e Mentores, oferecendo assistência espiritual gratuita a todos que buscam a LUZ.
\.


--
-- Data for Name: SpiritualContents; Type: TABLE DATA; Schema: batuara; Owner: -
--

COPY batuara."SpiritualContents" ("Id", "Title", "Content", "Type", "Category", "Source", "DisplayOrder", "IsFeatured", "CreatedAt", "UpdatedAt", "IsActive") FROM stdin;
3	Os Orixás na Visão da Casa Batuara	Os Orixás são manifestações divinas, aspectos de Deus que se apresentam para nos ensinar e orientar. Cada Orixá representa virtudes e qualidades que devemos desenvolver em nós mesmos.\r\n\r\nNa Casa Batuara, compreendemos os Orixás como:\r\n\r\nOXALÁ - O Pai Criador, que nos ensina a paz, a paciência e a sabedoria.\r\nYEMANJÁ - A Mãe Universal, que nos ensina o amor incondicional e a proteção.\r\nIANSÃ - A Guerreira da Justiça, que nos ensina a coragem e a determinação.\r\nOGUM - O Trabalhador Incansável, que nos ensina a perseverança e a honestidade.\r\n\r\nCada Orixá tem seus ensinamentos específicos, mas todos nos conduzem ao mesmo objetivo: a evolução espiritual através do amor e da caridade.	3	4	Apostila Batuara 2024	3	t	2026-04-02 14:36:08.524449+00	2026-04-02 14:36:08.524449+00	t
4	Oração de Caritas	Deus, nosso Pai, que sois todo poder e bondade,\nDai força àquele que passa pela provação,\nDai luz àquele que procura a verdade,\nPonde no coração do homem a compaixão e a caridade.\n\nDeus! Dai ao viajor a estrela guia,\nAo aflito a consolação,\nAo doente o repouso.\n\nPai! Dai ao culpado o arrependimento,\nAo espírito a verdade,\nÀ criança o guia,\nAo órfão o pai.\n\nSenhor! Que a vossa bondade se estenda sobre tudo o que criastes.\nPiedade, Senhor, para aqueles que vos não conhecem,\nEsperança para aqueles que sofrem.\n\nQue a vossa bondade permita aos espíritos consoladores\nDerramarem por toda parte a paz, a esperança e a fé.	1	2	Apostila Batuara 2024	3	t	2026-04-02 14:36:08.524449+00	2026-04-02 14:36:08.524449+00	t
5	Oração a Oxalá	Salve Oxalá, Pai de todos os Orixás,\nSenhor da paz e da harmonia,\nQue vossa luz ilumine nossos caminhos,\nE vossa sabedoria guie nossos passos.\n\nOxalá, Pai da criação,\nDai-nos força para vencer as dificuldades,\nPaciência para suportar as provações,\nE amor para perdoar as ofensas.\n\nQue vossa benção esteja sempre conosco,\nProtegendo nossa família e nossos irmãos.	1	4	Apostila Batuara 2024	4	t	2026-04-02 14:36:08.524449+00	2026-04-02 14:36:08.52445+00	t
6	Oração do Médium	Senhor Jesus, que sois o caminho, a verdade e a vida,\nIluminai-me para que eu possa ser um instrumento de vossa paz.\n\nQue os espíritos de luz me assistam nesta tarefa sagrada,\nE que eu possa transmitir apenas palavras de consolação,\nEsperança e amor aos corações aflitos.\n\nAfastai de mim toda vaidade e orgulho,\nPara que eu seja apenas um canal humilde\nDe vossa infinita misericórdia.	1	2	Apostila Batuara 2024	5	f	2026-04-02 14:36:08.52445+00	2026-04-02 14:36:08.52445+00	t
1	Pai Nosso da Umbanda	Pai nosso que estais no infinito,\r\nSantificado seja o vosso reino de luz.\r\nVenha a nós a vossa paz,\r\nSeja feita a vossa vontade,\r\nAssim na Terra como no infinito.\r\n\r\nO pão nosso de cada dia nos dai hoje,\r\nPerdoai as nossas dívidas,\r\nAssim como nós perdoamos aos nossos devedores.\r\nNão nos deixeis cair em tentação,\r\nMas livrai-nos de todo mal.\r\n\r\nPorque vosso é o reino,\r\nO poder e a glória,\r\nPara todo o sempre.\r\nSaravá!	1	1	Apostila Batuara 2024	1	t	2026-04-02 14:36:08.52365+00	2026-04-02 18:32:28.981706+00	t
2	A Caridade Segundo os Ensinamentos da Casa Batuara	A caridade é o fundamento de toda a nossa doutrina. Não se trata apenas de dar esmolas ou ajudar materialmente, mas sim de amar verdadeiramente ao próximo como a nós mesmos.\r\n\r\nA verdadeira caridade começa no coração. É preciso ter compaixão, compreensão e amor por todos os seres, independentemente de sua condição social, raça ou religião.\r\n\r\nNa Casa Batuara, praticamos a caridade de várias formas:\r\n- Através da assistência espiritual gratuita\r\n- Do atendimento aos necessitados\r\n- Da orientação e consolação aos aflitos\r\n- Do ensino da doutrina espírita e umbandista\r\n- Da promoção da fraternidade entre todos\r\n\r\nLembrem-se sempre: "Fora da caridade não há salvação".	2	3	Apostila Batuara 2024	2	t	2026-04-02 14:36:08.524446+00	2026-04-02 18:32:28.981706+00	t
7	Pai Nosso de Oxalá	Pai nosso que estais no infinito,\r\nTodo poder é vosso,\r\nSantificado seja o vosso nome,\r\nVenha a nós a vossa paz,\r\nPois só na paz podemos encontrar a luz.\r\n\r\nEu sou vosso filho (a) e busco vossa orientação,\r\nConcedei-me a sabedoria para seguir pelo caminho do bem,\r\nA paciência para aceitar o que não posso mudar,\r\nE a coragem para mudar o que posso.\r\n\r\nGuiai-me pela estrada da caridade,\r\nPara que eu possa servir aos meus irmãos,\r\nE assim encontrar a verdadeira paz,\r\nQue só vossa luz pode proporcionar.\r\n\r\nEpa babá! Oxalá!	1	4	Apostila Batuara 2024	3	f	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
8	Canto a Iemanjá	Iemanjá, mãe querida,\r\nRainha do mar e das águas,\r\nAcolhei-me em vossos braços,\r\nComo uma criança que volta para casa.\r\n\r\nÓ doce mãe, dai-me vossa bênção,\r\nPara viver com amor e esperança,\r\nQue vossa luz me guie,\r\nNas horas de escuridão.\r\n\r\nOdocya, Odocya, Odocya!\r\nMãe Iemanjá, abraça-me!\r\nEu sou seu filho (a),\r\nE volto para os seus braços!\r\n\r\nSalve Iemanjá!	4	1	Apostila Batuara 2024	4	t	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
\.


--
-- Data for Name: UmbandaLines; Type: TABLE DATA; Schema: batuara; Owner: -
--

COPY batuara."UmbandaLines" ("Id", "Name", "Description", "Characteristics", "BatuaraInterpretation", "DisplayOrder", "Entities", "WorkingDays", "CreatedAt", "UpdatedAt", "IsActive") FROM stdin;
1	Linha de Oxalá	A Linha de Oxalá é a linha da paz, da fé e da elevação espiritual. Trabalha com a energia da criação, da purificação e da conexão com o divino.	Entidades desta linha trabalham com energias de paz, harmonia, fé, purificação espiritual e elevação da consciência. São espíritos de grande luz que auxiliam na cura espiritual e no desenvolvimento mediúnico.	Na Casa Batuara, a Linha de Oxalá é considerada a linha mestra, aquela que rege todas as outras. Nossos guias desta linha nos ensinam que a verdadeira força está na humildade e no amor. Eles trabalham principalmente na cura espiritual, no desenvolvimento da mediunidade e na orientação para a evolução espiritual. São espíritos de grande elevação que nos ajudam a compreender os ensinamentos de Jesus.	1	["Pai João de Oxalá", "Vovô Benedito", "Pai Francisco", "Vovó Maria Conga", "Caboclo Pena Branca"]	["Domingo", "Quinta-feira"]	2026-04-02 14:36:08.485323+00	2026-04-02 14:36:08.485323+00	t
2	Linha de Yemanjá	A Linha de Yemanjá trabalha com as energias do amor maternal, da proteção, da cura emocional e da purificação através das águas.	Entidades desta linha são conhecidas por seu amor maternal, proteção às famílias, cura de traumas emocionais e limpeza espiritual. Trabalham especialmente com mulheres, crianças e questões familiares.	Na Casa Batuara, a Linha de Yemanjá é muito querida e respeitada. Nossos guias desta linha são verdadeiras mães espirituais que acolhem a todos com amor incondicional. Eles trabalham principalmente na cura emocional, na proteção das famílias e na orientação para as mães. Ensinam-nos que o amor de mãe é a força mais poderosa para a cura e transformação.	2	["Mãe Yara", "Sereia do Mar", "Cabocla Jurema", "Vovó Cambinda", "Mãe Oxum"]	["Sábado", "Segunda-feira"]	2026-04-02 14:36:08.485519+00	2026-04-02 14:36:08.485519+00	t
3	Linha dos Caboclos	A Linha dos Caboclos trabalha com as energias da natureza, da cura através das ervas, da força e da conexão com os elementos naturais.	Os Caboclos são espíritos de índios que trabalham com a força da natureza, conhecimento das ervas medicinais, proteção e cura. São guerreiros da luz que defendem a justiça e protegem os necessitados.	Na Casa Batuara, os Caboclos são nossos grandes protetores e curadores. Eles nos ensinam o respeito pela natureza e o uso das plantas para a cura. Nossos Caboclos trabalham com muita força e determinação, sempre prontos a defender seus filhos e a promover a justiça. Eles nos orientam sobre a importância de viver em harmonia com a natureza e de usar seus recursos com sabedoria e gratidão.	3	["Caboclo Pena Verde", "Cabocla Jurema", "Caboclo Sete Flechas", "Cabocla Jandira", "Caboclo Tupinambá"]	["Terça-feira", "Quinta-feira"]	2026-04-02 14:36:08.48552+00	2026-04-02 14:36:08.48552+00	t
4	Linha de Oxalá (Linha da Fé)	Regida por Oxalá, o Pai maior e luz divina. Esta linha trabalha com a iluminação espiritual, fortalecimento da fé e promoção da paz interior através da caridade.	Iluminação, fé, equilíbrio, paz, caridade	Regida por Oxalá. Entidades em destaque: Cristos, Anjos, Espíritos elevados, Guias da luz.	1	["Cristos", "Anjos", "Espíritos elevados", "Guias da luz"]	["Domingo", "Sexta-feira"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
5	Linha de Ogum (Linha da Lei e da Ordem)	Linha regida por Ogum, focada na manutenção da lei e ordem espiritual. Atua na quebra de demandas negativas e proteção através da força e justiça.	Quebra de demandas, justiça, força, desobsessão	Regida por Ogum. Entidades em destaque: Caboclos guerreiros, Soldados espirituais.	2	["Caboclos guerreiros", "Soldados espirituais"]	["Segunda-feira", "Quinta-feira"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
6	Linha de Oxóssi (Linha do Conhecimento)	Regida por Oxóssi, esta linha trabalha com a sabedoria ancestral, cura através da natureza e abertura de caminhos para o conhecimento espiritual.	Sabedoria, cura, abertura de caminhos, natureza	Regida por Oxóssi. Entidades em destaque: Caboclos caçadores, Mestres do conhecimento.	3	["Caboclos caçadores", "Mestres do conhecimento"]	["Terça-feira", "Quinta-feira"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
7	Linha de Xangô (Linha da Justiça)	Linha regida por Xangô, focada na aplicação da justiça divina e equilíbrio espiritual através da sabedoria ancestral dos Pretos-Velhos juristas.	Justiça, equilíbrio, sabedoria ancestral	Regida por Xangô. Entidades em destaque: Pretos-Velhos juristas, Juízes espirituais.	4	["Pretos-Velhos juristas", "Juízes espirituais"]	["Segunda-feira", "Quarta-feira"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
8	Linha de Iemanjá (Linha do Amor e da Geração)	Regida por Iemanjá, mãe de todos os Orixás. Esta linha trabalha com as emoções, proteção familiar, gestação e acolhimento maternal.	Emoções, família, gestação, acolhimento	Regida por Iemanjá. Entidades em destaque: Marinheiros, Iabás, Mães espirituais.	5	["Marinheiros", "Iabás", "Mães espirituais"]	["Sábado", "Segunda-feira"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
9	Linha de Iansã (Linha das Almas e Espíritos)	Linha regida por Iansã, senhora dos ventos e das almas. Trabalha com espíritos em trânsito, auxiliando no desencarne e purificação energética.	Desencarne, passagem, purificação energética	Regida por Iansã. Entidades em destaque: Eguns, Espíritos em trânsito, Mensageiros.	6	["Eguns", "Espíritos em trânsito", "Mensageiros"]	["Quarta-feira", "Domingo"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
10	Linha de Exu (Linha da Comunicação e Movimento)	Regida por Exu e Pomba Gira, esta linha trabalha como comunicadora entre os mundos espiritual e material, abrindo caminhos e oferecendo proteção.	Comunicação entre mundos, abertura de caminhos, proteção	Regida por Exu e Pomba Gira. Entidades em destaque: Exus, Pombas Giras, Guardiões.	7	["Exus", "Pombas Giras", "Guardiões"]	["Segunda-feira", "Quarta-feira"]	2026-04-02 18:32:28.981706+00	2026-04-02 18:32:28.981706+00	t
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: batuara; Owner: -
--

COPY batuara.refresh_tokens (id, token, expires_at, created_by_ip, revoked_at, revoked_by_ip, replaced_by_token, user_id, created_at, updated_at, "ReasonRevoked") FROM stdin;
5	MgkPnK9XXPjurcscIWNRylp2TLiwfxQssWPHhSXNAZk=	2026-04-09 01:56:13.875596+00	172.18.0.1	\N	\N	\N	2	2026-04-02 01:56:13.875836+00	2026-04-02 01:56:13.875836+00	\N
6	iI2niLdLEYcJ7xsHrGM5UPuzB6hgLuyRDdAbhSWX/VQ=	2026-04-09 02:00:38.613623+00	172.18.0.1	\N	\N	\N	2	2026-04-02 02:00:38.613627+00	2026-04-02 02:00:38.613627+00	\N
7	2/SeOhOJwoZH5vzMPkYGw+HJPMSLuOK7Jk+rtlA5XTI=	2026-04-09 03:34:44.371302+00	172.18.0.1	\N	\N	\N	2	2026-04-02 03:34:44.371362+00	2026-04-02 03:34:44.371362+00	\N
8	Kz6MgwdT7IeDtrVBgogTybPHd17p1TR6r27dp1Yaa30=	2026-04-09 20:52:20.507356+00	172.18.0.1	\N	\N	\N	2	2026-04-02 20:52:20.507635+00	2026-04-02 20:52:20.507635+00	\N
9	dF2xmxgVNkjWMbfBitgJiBvp25uH77oMTRasr/XAZgE=	2026-04-09 20:59:47.033469+00	172.18.0.1	\N	\N	\N	2	2026-04-02 20:59:47.033471+00	2026-04-02 20:59:47.033471+00	\N
10	lZsIVnY1xybThlHoFvu0Gl2z7HXVYq0qv5JK0M9LpxM=	2026-04-10 00:07:50.790115+00	172.18.0.1	\N	\N	\N	2	2026-04-03 00:07:50.792267+00	2026-04-03 00:07:50.792269+00	\N
11	bRSEio5LE7J/vylhJgIpcPEqk00uojw+OFkHrf/Qu3k=	2026-04-10 00:10:16.674869+00	172.18.0.1	\N	\N	\N	2	2026-04-03 00:10:16.674873+00	2026-04-03 00:10:16.674873+00	\N
12	+eL0VjDKfr8q6V0fsW8gqL8ha2yzZr81ZWloPR73+CE=	2026-04-10 00:22:28.46368+00	172.18.0.1	\N	\N	\N	2	2026-04-03 00:22:28.463868+00	2026-04-03 00:22:28.463868+00	\N
13	9+1oxISetauSH0QDA1zT8zZcoEqXx3dffUIHdNM1d5I=	2026-04-10 00:23:17.406234+00	172.18.0.1	\N	\N	\N	2	2026-04-03 00:23:17.406239+00	2026-04-03 00:23:17.406239+00	\N
14	+3Z+TveAMLNNAQJyuEpifckSZS2UK3RgBE/wU56JHRQ=	2026-04-10 00:25:43.564451+00	172.18.0.1	\N	\N	\N	2	2026-04-03 00:25:43.564455+00	2026-04-03 00:25:43.564455+00	\N
15	FEAjU4B4MB9B726nZqL4+A9mGOFMJTHY0c+aR2qHPNY=	2026-04-10 02:07:45.892481+00	172.18.0.1	\N	\N	\N	2	2026-04-03 02:07:45.892644+00	2026-04-03 02:07:45.892644+00	\N
16	3ku4PjKW4TnwdGEuaY5Rb8uZPU0ZABMPmThVZw1pH2E=	2026-04-10 03:43:11.839249+00	172.18.0.1	\N	\N	\N	2	2026-04-03 03:43:11.839753+00	2026-04-03 03:43:11.839753+00	\N
17	nyKsqc64KTnu3X76OPzMo/5lgSwAjX1TgmYAH5M4Og8=	2026-04-10 03:58:55.281455+00	172.18.0.1	\N	\N	\N	2	2026-04-03 03:58:55.281645+00	2026-04-03 03:58:55.281645+00	\N
18	4gvsnYWsfb4jV5k+UMaLBdsGDKrTDKIuYL0+nDhWle4=	2026-04-10 04:55:30.686491+00	172.18.0.1	\N	\N	\N	2	2026-04-03 04:55:30.686695+00	2026-04-03 04:55:30.686695+00	\N
19	fONooBlHWu6eSH1WMIkMjBXcEAsHlSCH71Gc4wVAqzw=	2026-04-10 04:57:08.760266+00	172.18.0.1	\N	\N	\N	2	2026-04-03 04:57:08.760279+00	2026-04-03 04:57:08.760279+00	\N
20	mN6kpTpku7crn6vdODvap9vE1oLcgjAL0MDUc9yL4Io=	2026-04-10 04:57:47.987724+00	172.18.0.1	\N	\N	\N	2	2026-04-03 04:57:47.987725+00	2026-04-03 04:57:47.987725+00	\N
21	+TjZz8CPhp2v8Ru/nTLALXKXk6OXiyrexkhZg7zHVac=	2026-04-10 05:13:00.746955+00	172.18.0.1	\N	\N	\N	2	2026-04-03 05:13:00.74715+00	2026-04-03 05:13:00.747151+00	\N
22	89dMnWYEy7iiPI0j6YEHOdSES92tmn0PNyUfkZwMqM8=	2026-04-10 05:14:49.631831+00	172.18.0.1	\N	\N	\N	2	2026-04-03 05:14:49.631836+00	2026-04-03 05:14:49.631836+00	\N
23	BpUyBa8BFJDXTGn3WF0/WAcFDG3ycJBbsOhVZhyklgg=	2026-04-10 05:17:23.745404+00	172.18.0.1	\N	\N	\N	2	2026-04-03 05:17:23.745552+00	2026-04-03 05:17:23.745552+00	\N
24	nOUpM/QIdos6DOJhryk8S2bu/2THu7YqOwcHhGAo6wY=	2026-04-10 06:01:50.264108+00	172.18.0.1	\N	\N	\N	2	2026-04-03 06:01:50.264347+00	2026-04-03 06:01:50.264347+00	\N
25	7ALH13Rh1EnUD9uAP6bP5qDyv6gtZuWVCCpQyg9Fk90=	2026-04-10 06:01:55.893854+00	172.18.0.1	\N	\N	\N	2	2026-04-03 06:01:55.893857+00	2026-04-03 06:01:55.893857+00	\N
26	Zx1a7gRP1e3Pe3o7KTsa+WF4m7whc9yLKrZq5YAAsb0=	2026-04-10 06:52:38.044363+00	172.18.0.1	\N	\N	\N	2	2026-04-03 06:52:38.044403+00	2026-04-03 06:52:38.044403+00	\N
27	bQHrRFoK4CQFowkx4wVZvWzyL+rbgHHc57qlbDSD+R4=	2026-04-10 07:54:03.977127+00	172.18.0.1	\N	\N	\N	2	2026-04-03 07:54:03.977282+00	2026-04-03 07:54:03.977282+00	\N
28	URsV9XJb2+n+29a9+8Ci1J0Z95oxYmRAaiBNQEbQY84=	2026-04-10 07:54:15.184131+00	172.18.0.1	\N	\N	\N	2	2026-04-03 07:54:15.184134+00	2026-04-03 07:54:15.184134+00	\N
29	+aJr7mHbQSj4hkU54eWv4mDtoVxlAtqXalThcLOZzsg=	2026-04-10 08:13:53.330649+00	172.18.0.1	\N	\N	\N	2	2026-04-03 08:13:53.331516+00	2026-04-03 08:13:53.331516+00	\N
30	xOW0yx5Neo8EGMMivPZUstfneua/0DrIGbCoIVJm/rY=	2026-04-10 08:31:23.952644+00	172.18.0.1	\N	\N	\N	2	2026-04-03 08:31:23.95266+00	2026-04-03 08:31:23.95266+00	\N
31	45szANHQYqN+9zaHCc0Pjqc1Jpy2PN2ISzg1bopTOZk=	2026-04-10 08:32:10.334725+00	172.18.0.1	\N	\N	\N	2	2026-04-03 08:32:10.334731+00	2026-04-03 08:32:10.334731+00	\N
32	82AVfA/gTgxBB/KjgiaZ++RQAH73f93IouX4VD6hedg=	2026-04-10 08:37:54.196208+00	172.18.0.1	\N	\N	\N	2	2026-04-03 08:37:54.196213+00	2026-04-03 08:37:54.196213+00	\N
33	h2VWMzJFs54ElWGks8G3K5dxYk3O7380daopuPWHt3o=	2026-04-10 08:52:35.784927+00	172.18.0.1	\N	\N	\N	2	2026-04-03 08:52:35.784943+00	2026-04-03 08:52:35.784943+00	\N
34	WGlYHkPzaTJbLfStxL6wMxr6J/tb86tB8vU4HWK33zk=	2026-04-10 08:56:54.592913+00	172.18.0.1	\N	\N	\N	2	2026-04-03 08:56:54.592934+00	2026-04-03 08:56:54.592935+00	\N
35	+Bh62LrZ/qxGy2xfCXV7iDGqNhtlVZa4X+Bf1ilGqEc=	2026-04-10 08:59:44.955676+00	172.18.0.1	\N	\N	\N	2	2026-04-03 08:59:44.95569+00	2026-04-03 08:59:44.95569+00	\N
36	HivFHJxb5XzroWQleJBiFYopYVPBJrt6yAPshKCNYK8=	2026-04-10 09:11:24.941005+00	172.18.0.1	\N	\N	\N	2	2026-04-03 09:11:24.941009+00	2026-04-03 09:11:24.941009+00	\N
37	4dBYA+gQmjIAOa8kPfepVKXCP0DUAuSuB4Fi3Csxulk=	2026-04-10 09:13:13.915548+00	172.18.0.1	\N	\N	\N	2	2026-04-03 09:13:13.915553+00	2026-04-03 09:13:13.915553+00	\N
38	DJbBGzTa2xTOkMzCd3jnbAu6cP3/ADtdYfpjruQsSc8=	2026-04-10 09:24:38.312349+00	172.18.0.1	\N	\N	\N	2	2026-04-03 09:24:38.312558+00	2026-04-03 09:24:38.312558+00	\N
39	TPHIvmO55/Ra1vBRGm3piGCqRzo6oLSdED/QNBdP0Tk=	2026-04-10 09:25:17.272175+00	172.18.0.1	\N	\N	\N	2	2026-04-03 09:25:17.272177+00	2026-04-03 09:25:17.272177+00	\N
40	w4Qd6QgTqmHejHI/QF0tPFlctZNA7osnbwWdHGy8LTk=	2026-04-10 09:25:49.829423+00	172.18.0.1	\N	\N	\N	2	2026-04-03 09:25:49.829427+00	2026-04-03 09:25:49.829427+00	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: batuara; Owner: -
--

COPY batuara.users (id, email, password_hash, name, role, is_active, last_login_at, created_at, updated_at) FROM stdin;
2	admin@batuara.org.br	$2b$12$eNh1F4AB8lQh6UQLl5Zjl.FOtOrwvFkT9rsNuEcFwCneUXCRIyvUa	Marco Guelfi	1	t	2026-04-03 09:25:49.829428+00	2026-04-02 01:55:54.884702+00	2026-04-03 09:25:49.830612+00
\.


--
-- Data for Name: __EFMigrationsHistory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."__EFMigrationsHistory" ("MigrationId", "ProductVersion") FROM stdin;
20250719202440_InitialCreate	8.0.8
20250723040014_UpdateModel	8.0.8
20251119035519_MakeRevokeFieldsNullable	8.0.8
20251119040325_AddReasonRevokedToRefreshToken	8.0.8
20260401234426_AddSiteSettings	9.0.14
20260402235355_ContentManagementModules	9.0.14
20260403014603_AddHistoryMissionTextToSiteSettings	9.0.14
20260403043437_RemoveHistoryMediaFromSiteSettings	9.0.14
\.


--
-- Name: CalendarAttendances_Id_seq; Type: SEQUENCE SET; Schema: batuara; Owner: -
--

SELECT pg_catalog.setval('batuara."CalendarAttendances_Id_seq"', 129, true);


--
-- Name: ContactMessages_Id_seq; Type: SEQUENCE SET; Schema: batuara; Owner: -
--

SELECT pg_catalog.setval('batuara."ContactMessages_Id_seq"', 2, true);


--
-- Name: Events_Id_seq; Type: SEQUENCE SET; Schema: batuara; Owner: -
--

SELECT pg_catalog.setval('batuara."Events_Id_seq"', 31, true);


--
-- Name: Guides_Id_seq; Type: SEQUENCE SET; Schema: batuara; Owner: -
--

SELECT pg_catalog.setval('batuara."Guides_Id_seq"', 3, true);


--
-- Name: HouseMemberContributions_Id_seq; Type: SEQUENCE SET; Schema: batuara; Owner: -
--

SELECT pg_catalog.setval('batuara."HouseMemberContributions_Id_seq"', 3, true);


--
-- Name: HouseMembers_Id_seq; Type: SEQUENCE SET; Schema: batuara; Owner: -
--

SELECT pg_catalog.setval('batuara."HouseMembers_Id_seq"', 3, true);


--
-- Name: Orixas_Id_seq; Type: SEQUENCE SET; Schema: batuara; Owner: -
--

SELECT pg_catalog.setval('batuara."Orixas_Id_seq"', 18, true);


--
-- Name: SiteSettings_Id_seq; Type: SEQUENCE SET; Schema: batuara; Owner: -
--

SELECT pg_catalog.setval('batuara."SiteSettings_Id_seq"', 1, true);


--
-- Name: SpiritualContents_Id_seq; Type: SEQUENCE SET; Schema: batuara; Owner: -
--

SELECT pg_catalog.setval('batuara."SpiritualContents_Id_seq"', 8, true);


--
-- Name: UmbandaLines_Id_seq; Type: SEQUENCE SET; Schema: batuara; Owner: -
--

SELECT pg_catalog.setval('batuara."UmbandaLines_Id_seq"', 10, true);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: batuara; Owner: -
--

SELECT pg_catalog.setval('batuara.refresh_tokens_id_seq', 40, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: batuara; Owner: -
--

SELECT pg_catalog.setval('batuara.users_id_seq', 2, true);


--
-- Name: CalendarAttendances PK_CalendarAttendances; Type: CONSTRAINT; Schema: batuara; Owner: -
--

ALTER TABLE ONLY batuara."CalendarAttendances"
    ADD CONSTRAINT "PK_CalendarAttendances" PRIMARY KEY ("Id");


--
-- Name: ContactMessages PK_ContactMessages; Type: CONSTRAINT; Schema: batuara; Owner: -
--

ALTER TABLE ONLY batuara."ContactMessages"
    ADD CONSTRAINT "PK_ContactMessages" PRIMARY KEY ("Id");


--
-- Name: Events PK_Events; Type: CONSTRAINT; Schema: batuara; Owner: -
--

ALTER TABLE ONLY batuara."Events"
    ADD CONSTRAINT "PK_Events" PRIMARY KEY ("Id");


--
-- Name: Guides PK_Guides; Type: CONSTRAINT; Schema: batuara; Owner: -
--

ALTER TABLE ONLY batuara."Guides"
    ADD CONSTRAINT "PK_Guides" PRIMARY KEY ("Id");


--
-- Name: HouseMemberContributions PK_HouseMemberContributions; Type: CONSTRAINT; Schema: batuara; Owner: -
--

ALTER TABLE ONLY batuara."HouseMemberContributions"
    ADD CONSTRAINT "PK_HouseMemberContributions" PRIMARY KEY ("Id");


--
-- Name: HouseMembers PK_HouseMembers; Type: CONSTRAINT; Schema: batuara; Owner: -
--

ALTER TABLE ONLY batuara."HouseMembers"
    ADD CONSTRAINT "PK_HouseMembers" PRIMARY KEY ("Id");


--
-- Name: Orixas PK_Orixas; Type: CONSTRAINT; Schema: batuara; Owner: -
--

ALTER TABLE ONLY batuara."Orixas"
    ADD CONSTRAINT "PK_Orixas" PRIMARY KEY ("Id");


--
-- Name: SiteSettings PK_SiteSettings; Type: CONSTRAINT; Schema: batuara; Owner: -
--

ALTER TABLE ONLY batuara."SiteSettings"
    ADD CONSTRAINT "PK_SiteSettings" PRIMARY KEY ("Id");


--
-- Name: SpiritualContents PK_SpiritualContents; Type: CONSTRAINT; Schema: batuara; Owner: -
--

ALTER TABLE ONLY batuara."SpiritualContents"
    ADD CONSTRAINT "PK_SpiritualContents" PRIMARY KEY ("Id");


--
-- Name: UmbandaLines PK_UmbandaLines; Type: CONSTRAINT; Schema: batuara; Owner: -
--

ALTER TABLE ONLY batuara."UmbandaLines"
    ADD CONSTRAINT "PK_UmbandaLines" PRIMARY KEY ("Id");


--
-- Name: refresh_tokens PK_refresh_tokens; Type: CONSTRAINT; Schema: batuara; Owner: -
--

ALTER TABLE ONLY batuara.refresh_tokens
    ADD CONSTRAINT "PK_refresh_tokens" PRIMARY KEY (id);


--
-- Name: users PK_users; Type: CONSTRAINT; Schema: batuara; Owner: -
--

ALTER TABLE ONLY batuara.users
    ADD CONSTRAINT "PK_users" PRIMARY KEY (id);


--
-- Name: __EFMigrationsHistory PK___EFMigrationsHistory; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."__EFMigrationsHistory"
    ADD CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId");


--
-- Name: IX_CalendarAttendances_IsActive; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_CalendarAttendances_IsActive" ON batuara."CalendarAttendances" USING btree ("IsActive");


--
-- Name: IX_CalendarAttendances_IsActive_Type; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_CalendarAttendances_IsActive_Type" ON batuara."CalendarAttendances" USING btree ("IsActive", "Type");


--
-- Name: IX_CalendarAttendances_Type; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_CalendarAttendances_Type" ON batuara."CalendarAttendances" USING btree ("Type");


--
-- Name: IX_ContactMessages_Email; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_ContactMessages_Email" ON batuara."ContactMessages" USING btree ("Email");


--
-- Name: IX_ContactMessages_Status_ReceivedAt; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_ContactMessages_Status_ReceivedAt" ON batuara."ContactMessages" USING btree ("Status", "ReceivedAt");


--
-- Name: IX_Events_IsActive; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_Events_IsActive" ON batuara."Events" USING btree ("IsActive");


--
-- Name: IX_Events_IsActive_Type; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_Events_IsActive_Type" ON batuara."Events" USING btree ("IsActive", "Type");


--
-- Name: IX_Events_Type; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_Events_Type" ON batuara."Events" USING btree ("Type");


--
-- Name: IX_Guides_IsActive_DisplayOrder; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_Guides_IsActive_DisplayOrder" ON batuara."Guides" USING btree ("IsActive", "DisplayOrder");


--
-- Name: IX_Guides_Name; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_Guides_Name" ON batuara."Guides" USING btree ("Name") WHERE ("IsActive" = true);


--
-- Name: IX_HouseMemberContributions_HouseMemberId_ReferenceMonth; Type: INDEX; Schema: batuara; Owner: -
--

CREATE UNIQUE INDEX "IX_HouseMemberContributions_HouseMemberId_ReferenceMonth" ON batuara."HouseMemberContributions" USING btree ("HouseMemberId", "ReferenceMonth");


--
-- Name: IX_HouseMembers_Email; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_HouseMembers_Email" ON batuara."HouseMembers" USING btree ("Email");


--
-- Name: IX_HouseMembers_FullName_IsActive; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_HouseMembers_FullName_IsActive" ON batuara."HouseMembers" USING btree ("FullName", "IsActive");


--
-- Name: IX_Orixas_DisplayOrder; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_Orixas_DisplayOrder" ON batuara."Orixas" USING btree ("DisplayOrder");


--
-- Name: IX_Orixas_IsActive; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_Orixas_IsActive" ON batuara."Orixas" USING btree ("IsActive");


--
-- Name: IX_Orixas_IsActive_DisplayOrder; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_Orixas_IsActive_DisplayOrder" ON batuara."Orixas" USING btree ("IsActive", "DisplayOrder");


--
-- Name: IX_Orixas_Name; Type: INDEX; Schema: batuara; Owner: -
--

CREATE UNIQUE INDEX "IX_Orixas_Name" ON batuara."Orixas" USING btree ("Name") WHERE ("IsActive" = true);


--
-- Name: IX_Orixas_Name_Description; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_Orixas_Name_Description" ON batuara."Orixas" USING btree ("Name", "Description");


--
-- Name: IX_SpiritualContents_Category; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_SpiritualContents_Category" ON batuara."SpiritualContents" USING btree ("Category");


--
-- Name: IX_SpiritualContents_DisplayOrder; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_SpiritualContents_DisplayOrder" ON batuara."SpiritualContents" USING btree ("DisplayOrder");


--
-- Name: IX_SpiritualContents_IsActive; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_SpiritualContents_IsActive" ON batuara."SpiritualContents" USING btree ("IsActive");


--
-- Name: IX_SpiritualContents_IsActive_Category; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_SpiritualContents_IsActive_Category" ON batuara."SpiritualContents" USING btree ("IsActive", "Category");


--
-- Name: IX_SpiritualContents_IsActive_Category_DisplayOrder; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_SpiritualContents_IsActive_Category_DisplayOrder" ON batuara."SpiritualContents" USING btree ("IsActive", "Category", "DisplayOrder");


--
-- Name: IX_SpiritualContents_IsActive_Category_Type; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_SpiritualContents_IsActive_Category_Type" ON batuara."SpiritualContents" USING btree ("IsActive", "Category", "Type");


--
-- Name: IX_SpiritualContents_IsActive_IsFeatured; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_SpiritualContents_IsActive_IsFeatured" ON batuara."SpiritualContents" USING btree ("IsActive", "IsFeatured");


--
-- Name: IX_SpiritualContents_IsActive_Type; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_SpiritualContents_IsActive_Type" ON batuara."SpiritualContents" USING btree ("IsActive", "Type");


--
-- Name: IX_SpiritualContents_IsFeatured; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_SpiritualContents_IsFeatured" ON batuara."SpiritualContents" USING btree ("IsFeatured");


--
-- Name: IX_SpiritualContents_Title_Category_Type; Type: INDEX; Schema: batuara; Owner: -
--

CREATE UNIQUE INDEX "IX_SpiritualContents_Title_Category_Type" ON batuara."SpiritualContents" USING btree ("Title", "Category", "Type") WHERE ("IsActive" = true);


--
-- Name: IX_SpiritualContents_Title_Content; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_SpiritualContents_Title_Content" ON batuara."SpiritualContents" USING btree ("Title", "Content");


--
-- Name: IX_SpiritualContents_Type; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_SpiritualContents_Type" ON batuara."SpiritualContents" USING btree ("Type");


--
-- Name: IX_UmbandaLines_DisplayOrder; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_UmbandaLines_DisplayOrder" ON batuara."UmbandaLines" USING btree ("DisplayOrder");


--
-- Name: IX_UmbandaLines_IsActive; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_UmbandaLines_IsActive" ON batuara."UmbandaLines" USING btree ("IsActive");


--
-- Name: IX_UmbandaLines_IsActive_DisplayOrder; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_UmbandaLines_IsActive_DisplayOrder" ON batuara."UmbandaLines" USING btree ("IsActive", "DisplayOrder");


--
-- Name: IX_UmbandaLines_Name; Type: INDEX; Schema: batuara; Owner: -
--

CREATE UNIQUE INDEX "IX_UmbandaLines_Name" ON batuara."UmbandaLines" USING btree ("Name") WHERE ("IsActive" = true);


--
-- Name: IX_UmbandaLines_Name_Description; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_UmbandaLines_Name_Description" ON batuara."UmbandaLines" USING btree ("Name", "Description");


--
-- Name: IX_refresh_tokens_token; Type: INDEX; Schema: batuara; Owner: -
--

CREATE UNIQUE INDEX "IX_refresh_tokens_token" ON batuara.refresh_tokens USING btree (token);


--
-- Name: IX_refresh_tokens_user_id; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_refresh_tokens_user_id" ON batuara.refresh_tokens USING btree (user_id);


--
-- Name: IX_seed_calendar_Attendances_Date; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_seed_calendar_Attendances_Date" ON batuara."CalendarAttendances" USING btree ("Date");


--
-- Name: IX_seed_calendar_Attendances_Type_Date; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_seed_calendar_Attendances_Type_Date" ON batuara."CalendarAttendances" USING btree ("Type", "Date");


--
-- Name: IX_seed_calendar_Events_Date; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_seed_calendar_Events_Date" ON batuara."Events" USING btree ("Date");


--
-- Name: IX_seed_calendar_Events_Type_Date; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_seed_calendar_Events_Type_Date" ON batuara."Events" USING btree ("Type", "Date");


--
-- Name: IX_seed_publicwebsite_Orixas_DisplayOrder; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_seed_publicwebsite_Orixas_DisplayOrder" ON batuara."Orixas" USING btree ("DisplayOrder");


--
-- Name: IX_seed_publicwebsite_SpiritualContents_DisplayOrder; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_seed_publicwebsite_SpiritualContents_DisplayOrder" ON batuara."SpiritualContents" USING btree ("DisplayOrder");


--
-- Name: IX_seed_publicwebsite_UmbandaLines_DisplayOrder; Type: INDEX; Schema: batuara; Owner: -
--

CREATE INDEX "IX_seed_publicwebsite_UmbandaLines_DisplayOrder" ON batuara."UmbandaLines" USING btree ("DisplayOrder");


--
-- Name: IX_users_email; Type: INDEX; Schema: batuara; Owner: -
--

CREATE UNIQUE INDEX "IX_users_email" ON batuara.users USING btree (email);


--
-- Name: HouseMemberContributions FK_HouseMemberContributions_HouseMembers_HouseMemberId; Type: FK CONSTRAINT; Schema: batuara; Owner: -
--

ALTER TABLE ONLY batuara."HouseMemberContributions"
    ADD CONSTRAINT "FK_HouseMemberContributions_HouseMembers_HouseMemberId" FOREIGN KEY ("HouseMemberId") REFERENCES batuara."HouseMembers"("Id") ON DELETE CASCADE;


--
-- Name: refresh_tokens FK_refresh_tokens_users_user_id; Type: FK CONSTRAINT; Schema: batuara; Owner: -
--

ALTER TABLE ONLY batuara.refresh_tokens
    ADD CONSTRAINT "FK_refresh_tokens_users_user_id" FOREIGN KEY (user_id) REFERENCES batuara.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict xmovt1cDsuHG31Qps4OGozCFbPvcsX6JMaq9Icm5mE0drIQ8UALLi9QEfv3dlzb

