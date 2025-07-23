-- Casa de Caridade Batuara - Database Schema
-- Generated from Entity Framework Core Migration
-- PostgreSQL Database Schema

-- Create schema
CREATE SCHEMA IF NOT EXISTS batuara;

-- Create CalendarAttendances table
CREATE TABLE batuara."CalendarAttendances" (
    "Id" SERIAL PRIMARY KEY,
    "Date" TIMESTAMP WITH TIME ZONE NOT NULL,
    "StartTime" INTERVAL NOT NULL,
    "EndTime" INTERVAL NOT NULL,
    "Type" INTEGER NOT NULL,
    "Description" VARCHAR(500),
    "Observations" VARCHAR(1000),
    "RequiresRegistration" BOOLEAN NOT NULL DEFAULT FALSE,
    "MaxCapacity" INTEGER,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create Events table
CREATE TABLE batuara."Events" (
    "Id" SERIAL PRIMARY KEY,
    "Title" VARCHAR(200) NOT NULL,
    "Description" VARCHAR(2000) NOT NULL,
    "Date" TIMESTAMP WITH TIME ZONE NOT NULL,
    "StartTime" INTERVAL,
    "EndTime" INTERVAL,
    "Type" INTEGER NOT NULL,
    "ImageUrl" VARCHAR(500),
    "Location" VARCHAR(300),
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create Orixas table
CREATE TABLE batuara."Orixas" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(5000) NOT NULL,
    "Origin" VARCHAR(1000) NOT NULL,
    "BatuaraTeaching" VARCHAR(5000) NOT NULL,
    "ImageUrl" VARCHAR(500),
    "DisplayOrder" INTEGER NOT NULL DEFAULT 0,
    "Characteristics" JSONB NOT NULL,
    "Colors" JSONB NOT NULL,
    "Elements" JSONB NOT NULL,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create SpiritualContents table
CREATE TABLE batuara."SpiritualContents" (
    "Id" SERIAL PRIMARY KEY,
    "Title" VARCHAR(200) NOT NULL,
    "Content" VARCHAR(10000) NOT NULL,
    "Type" INTEGER NOT NULL,
    "Category" INTEGER NOT NULL,
    "Source" VARCHAR(200) NOT NULL,
    "DisplayOrder" INTEGER NOT NULL DEFAULT 0,
    "IsFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create UmbandaLines table
CREATE TABLE batuara."UmbandaLines" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(5000) NOT NULL,
    "Characteristics" VARCHAR(3000) NOT NULL,
    "BatuaraInterpretation" VARCHAR(5000) NOT NULL,
    "DisplayOrder" INTEGER NOT NULL DEFAULT 0,
    "Entities" JSONB NOT NULL,
    "WorkingDays" JSONB NOT NULL,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create indexes for CalendarAttendances
CREATE INDEX "IX_CalendarAttendances_IsActive" ON batuara."CalendarAttendances" ("IsActive");
CREATE INDEX "IX_CalendarAttendances_Type" ON batuara."CalendarAttendances" ("Type");
CREATE INDEX "IX_CalendarAttendances_IsActive_Type" ON batuara."CalendarAttendances" ("IsActive", "Type");

-- Create indexes for Events
CREATE INDEX "IX_Events_IsActive" ON batuara."Events" ("IsActive");
CREATE INDEX "IX_Events_Type" ON batuara."Events" ("Type");
CREATE INDEX "IX_Events_IsActive_Type" ON batuara."Events" ("IsActive", "Type");

-- Create indexes for Orixas
CREATE INDEX "IX_Orixas_IsActive" ON batuara."Orixas" ("IsActive");
CREATE INDEX "IX_Orixas_DisplayOrder" ON batuara."Orixas" ("DisplayOrder");
CREATE INDEX "IX_Orixas_IsActive_DisplayOrder" ON batuara."Orixas" ("IsActive", "DisplayOrder");
CREATE INDEX "IX_Orixas_Name_Description" ON batuara."Orixas" ("Name", "Description");
CREATE UNIQUE INDEX "IX_Orixas_Name" ON batuara."Orixas" ("Name") WHERE "IsActive" = TRUE;

-- Create indexes for SpiritualContents
CREATE INDEX "IX_SpiritualContents_IsActive" ON batuara."SpiritualContents" ("IsActive");
CREATE INDEX "IX_SpiritualContents_Category" ON batuara."SpiritualContents" ("Category");
CREATE INDEX "IX_SpiritualContents_Type" ON batuara."SpiritualContents" ("Type");
CREATE INDEX "IX_SpiritualContents_DisplayOrder" ON batuara."SpiritualContents" ("DisplayOrder");
CREATE INDEX "IX_SpiritualContents_IsFeatured" ON batuara."SpiritualContents" ("IsFeatured");
CREATE INDEX "IX_SpiritualContents_IsActive_Category" ON batuara."SpiritualContents" ("IsActive", "Category");
CREATE INDEX "IX_SpiritualContents_IsActive_Type" ON batuara."SpiritualContents" ("IsActive", "Type");
CREATE INDEX "IX_SpiritualContents_IsActive_IsFeatured" ON batuara."SpiritualContents" ("IsActive", "IsFeatured");
CREATE INDEX "IX_SpiritualContents_IsActive_Category_Type" ON batuara."SpiritualContents" ("IsActive", "Category", "Type");
CREATE INDEX "IX_SpiritualContents_IsActive_Category_DisplayOrder" ON batuara."SpiritualContents" ("IsActive", "Category", "DisplayOrder");
CREATE INDEX "IX_SpiritualContents_Title_Content" ON batuara."SpiritualContents" ("Title", "Content");
CREATE UNIQUE INDEX "IX_SpiritualContents_Title_Category_Type" ON batuara."SpiritualContents" ("Title", "Category", "Type") WHERE "IsActive" = TRUE;

-- Create indexes for UmbandaLines
CREATE INDEX "IX_UmbandaLines_IsActive" ON batuara."UmbandaLines" ("IsActive");
CREATE INDEX "IX_UmbandaLines_DisplayOrder" ON batuara."UmbandaLines" ("DisplayOrder");
CREATE INDEX "IX_UmbandaLines_IsActive_DisplayOrder" ON batuara."UmbandaLines" ("IsActive", "DisplayOrder");
CREATE INDEX "IX_UmbandaLines_Name_Description" ON batuara."UmbandaLines" ("Name", "Description");
CREATE UNIQUE INDEX "IX_UmbandaLines_Name" ON batuara."UmbandaLines" ("Name") WHERE "IsActive" = TRUE;

-- Comments for documentation
COMMENT ON SCHEMA batuara IS 'Schema principal da Casa de Caridade Batuara';

COMMENT ON TABLE batuara."Events" IS 'Tabela de eventos e festas da casa';
COMMENT ON COLUMN batuara."Events"."Type" IS 'Tipo do evento: 1=Festa, 2=Evento, 3=Celebração, 4=Bazar, 5=Palestra';

COMMENT ON TABLE batuara."CalendarAttendances" IS 'Tabela de calendário de atendimentos';
COMMENT ON COLUMN batuara."CalendarAttendances"."Type" IS 'Tipo de atendimento: 1=Kardecismo, 2=Umbanda, 3=Palestra, 4=Curso';

COMMENT ON TABLE batuara."Orixas" IS 'Tabela de informações sobre os Orixás conforme ensinamentos da Casa Batuara';
COMMENT ON COLUMN batuara."Orixas"."BatuaraTeaching" IS 'Ensinamentos específicos da Casa Batuara sobre o Orixá';
COMMENT ON COLUMN batuara."Orixas"."Characteristics" IS 'Características do Orixá armazenadas em formato JSON';
COMMENT ON COLUMN batuara."Orixas"."Colors" IS 'Cores associadas ao Orixá armazenadas em formato JSON';
COMMENT ON COLUMN batuara."Orixas"."Elements" IS 'Elementos associados ao Orixá armazenados em formato JSON';

COMMENT ON TABLE batuara."UmbandaLines" IS 'Tabela de linhas da Umbanda conforme interpretação da Casa Batuara';
COMMENT ON COLUMN batuara."UmbandaLines"."BatuaraInterpretation" IS 'Interpretação específica da Casa Batuara sobre a linha';
COMMENT ON COLUMN batuara."UmbandaLines"."Entities" IS 'Entidades da linha armazenadas em formato JSON';
COMMENT ON COLUMN batuara."UmbandaLines"."WorkingDays" IS 'Dias de trabalho da linha armazenados em formato JSON';

COMMENT ON TABLE batuara."SpiritualContents" IS 'Tabela de conteúdos espirituais (orações, ensinamentos, doutrinas)';
COMMENT ON COLUMN batuara."SpiritualContents"."Type" IS 'Tipo de conteúdo: 1=Oração, 2=Ensinamento, 3=Doutrina, 4=Ponto Cantado, 5=Ritual';
COMMENT ON COLUMN batuara."SpiritualContents"."Category" IS 'Categoria: 1=Umbanda, 2=Kardecismo, 3=Geral, 4=Orixás';
COMMENT ON COLUMN batuara."SpiritualContents"."Source" IS 'Fonte do conteúdo (ex: Apostila Batuara 2024)';