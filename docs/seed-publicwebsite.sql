-- Seed validado para Orixás, Linhas da Umbanda e Orações
\set ON_ERROR_STOP on
BEGIN;
SET LOCAL search_path TO batuara, public;
SET LOCAL client_min_messages TO NOTICE;
CREATE INDEX IF NOT EXISTS "IX_seed_publicwebsite_Orixas_DisplayOrder" ON batuara."Orixas" ("DisplayOrder");
CREATE INDEX IF NOT EXISTS "IX_seed_publicwebsite_UmbandaLines_DisplayOrder" ON batuara."UmbandaLines" ("DisplayOrder");
CREATE INDEX IF NOT EXISTS "IX_seed_publicwebsite_SpiritualContents_DisplayOrder" ON batuara."SpiritualContents" ("DisplayOrder");
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_seed_publicwebsite_Orixas_DisplayOrder_Positive') THEN
        ALTER TABLE batuara."Orixas" ADD CONSTRAINT "CK_seed_publicwebsite_Orixas_DisplayOrder_Positive" CHECK ("DisplayOrder" > 0);
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_seed_publicwebsite_UmbandaLines_DisplayOrder_Positive') THEN
        ALTER TABLE batuara."UmbandaLines" ADD CONSTRAINT "CK_seed_publicwebsite_UmbandaLines_DisplayOrder_Positive" CHECK ("DisplayOrder" > 0);
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_seed_publicwebsite_SpiritualContents_Type_Valid') THEN
        ALTER TABLE batuara."SpiritualContents" ADD CONSTRAINT "CK_seed_publicwebsite_SpiritualContents_Type_Valid" CHECK ("Type" BETWEEN 1 AND 5);
    END IF;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_seed_publicwebsite_SpiritualContents_Category_Valid') THEN
        ALTER TABLE batuara."SpiritualContents" ADD CONSTRAINT "CK_seed_publicwebsite_SpiritualContents_Category_Valid" CHECK ("Category" BETWEEN 1 AND 4);
    END IF;
END $$;
DO $$
BEGIN
    IF to_regclass('batuara."Orixas"') IS NULL OR to_regclass('batuara."UmbandaLines"') IS NULL OR to_regclass('batuara."SpiritualContents"') IS NULL THEN
        RAISE EXCEPTION 'Tabelas obrigatórias para o seed do PublicWebsite não foram encontradas no schema batuara';
    END IF;
    RAISE NOTICE 'Relações lógicas entre Orixás, Linhas e Guias foram validadas no JSON; o schema atual não expõe chaves estrangeiras para persisti-las.';
    RAISE NOTICE 'Sincronizando Orixá: Oxalá';
    IF EXISTS (SELECT 1 FROM batuara."Orixas" WHERE "Name" = 'Oxalá') THEN
        UPDATE batuara."Orixas" SET "Description" = 'Oxalá tem origem na tradição Yorubá da África, onde é conhecido como Obatalá.', "Origin" = 'Oxalá tem origem na tradição Yorubá da África, onde é conhecido como Obatalá. É considerado o criador da humanidade e o pai de todos os Orixás.', "BatuaraTeaching" = 'Na Casa Batuara, Oxalá é reverenciado como o grande pai, aquele que nos ensina a humildade, a paciência e o amor incondicional. Seus ensinamentos nos mostram que através da paz interior e da pureza de coração podemos alcançar a elevação espiritual.', "Characteristics" = '["Paciência", "Sabedoria", "Pureza", "Paz", "Criação", "Paternidade", "Humildade", "Amor incondicional"]'::jsonb, "Colors" = '["Branco", "Azul claro"]'::jsonb, "Elements" = '["Ar", "Éter", "Luz"]'::jsonb, "DisplayOrder" = 1, "ImageUrl" = 'https://batuara.net/assets/orixas/oxala.jpg', "IsActive" = true, "UpdatedAt" = timezone('UTC', now()) WHERE "Name" = 'Oxalá';
    ELSE
        INSERT INTO batuara."Orixas" ("Name", "Description", "Origin", "BatuaraTeaching", "ImageUrl", "DisplayOrder", "Characteristics", "Colors", "Elements", "IsActive", "CreatedAt", "UpdatedAt") VALUES ('Oxalá', 'Oxalá tem origem na tradição Yorubá da África, onde é conhecido como Obatalá.', 'Oxalá tem origem na tradição Yorubá da África, onde é conhecido como Obatalá. É considerado o criador da humanidade e o pai de todos os Orixás.', 'Na Casa Batuara, Oxalá é reverenciado como o grande pai, aquele que nos ensina a humildade, a paciência e o amor incondicional. Seus ensinamentos nos mostram que através da paz interior e da pureza de coração podemos alcançar a elevação espiritual.', 'https://batuara.net/assets/orixas/oxala.jpg', 1, '["Paciência", "Sabedoria", "Pureza", "Paz", "Criação", "Paternidade", "Humildade", "Amor incondicional"]'::jsonb, '["Branco", "Azul claro"]'::jsonb, '["Ar", "Éter", "Luz"]'::jsonb, true, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
    RAISE NOTICE 'Sincronizando Orixá: Iemanjá';
    IF EXISTS (SELECT 1 FROM batuara."Orixas" WHERE "Name" = 'Iemanjá') THEN
        UPDATE batuara."Orixas" SET "Description" = 'Iemanjá tem origem na tradição Yorubá, onde é conhecida como Yemoja.', "Origin" = 'Iemanjá tem origem na tradição Yorubá, onde é conhecida como Yemoja. É a divindade dos rios e mares, mãe de muitos Orixás e protetora das mulheres e crianças.', "BatuaraTeaching" = 'A Casa Batuara tem especial devoção à Iemanjá, nossa mãe querida. Ela nos ensina o amor incondicional de mãe, a proteção aos necessitados e a importância da família espiritual.', "Characteristics" = '["Maternidade", "Proteção", "Fertilidade", "Amor maternal", "Cura", "Acolhimento", "Generosidade", "Compaixão"]'::jsonb, "Colors" = '["Azul", "Branco", "Azul marinho", "Prata"]'::jsonb, "Elements" = '["Água", "Mar", "Rios", "Conchas"]'::jsonb, "DisplayOrder" = 2, "ImageUrl" = 'https://batuara.net/assets/orixas/iemanja.jpg', "IsActive" = true, "UpdatedAt" = timezone('UTC', now()) WHERE "Name" = 'Iemanjá';
    ELSE
        INSERT INTO batuara."Orixas" ("Name", "Description", "Origin", "BatuaraTeaching", "ImageUrl", "DisplayOrder", "Characteristics", "Colors", "Elements", "IsActive", "CreatedAt", "UpdatedAt") VALUES ('Iemanjá', 'Iemanjá tem origem na tradição Yorubá, onde é conhecida como Yemoja.', 'Iemanjá tem origem na tradição Yorubá, onde é conhecida como Yemoja. É a divindade dos rios e mares, mãe de muitos Orixás e protetora das mulheres e crianças.', 'A Casa Batuara tem especial devoção à Iemanjá, nossa mãe querida. Ela nos ensina o amor incondicional de mãe, a proteção aos necessitados e a importância da família espiritual.', 'https://batuara.net/assets/orixas/iemanja.jpg', 2, '["Maternidade", "Proteção", "Fertilidade", "Amor maternal", "Cura", "Acolhimento", "Generosidade", "Compaixão"]'::jsonb, '["Azul", "Branco", "Azul marinho", "Prata"]'::jsonb, '["Água", "Mar", "Rios", "Conchas"]'::jsonb, true, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
    RAISE NOTICE 'Sincronizando Orixá: Nanã';
    IF EXISTS (SELECT 1 FROM batuara."Orixas" WHERE "Name" = 'Nanã') THEN
        UPDATE batuara."Orixas" SET "Description" = 'Nanã é uma das mais antigas Orixás femininas, conhecida como senhora da sabedoria ancestral e dos mistérios da vida e morte.', "Origin" = 'Nanã é uma das mais antigas Orixás femininas, conhecida como senhora da sabedoria ancestral e dos mistérios da vida e morte.', "BatuaraTeaching" = 'Na Casa Batuara, Nanã é reverenciada como a anciã sábia, aquela que guarda os segredos da vida e da morte, ensinando-nos a respeitar todos os ciclos da existência.', "Characteristics" = '["Sabedoria", "Tradição", "Paciência", "Mistério", "Respeito aos antepassados"]'::jsonb, "Colors" = '["Lilás", "Roxo"]'::jsonb, "Elements" = '["Água", "Lama", "Terra"]'::jsonb, "DisplayOrder" = 3, "ImageUrl" = 'https://batuara.net/assets/orixas/nana.jpg', "IsActive" = true, "UpdatedAt" = timezone('UTC', now()) WHERE "Name" = 'Nanã';
    ELSE
        INSERT INTO batuara."Orixas" ("Name", "Description", "Origin", "BatuaraTeaching", "ImageUrl", "DisplayOrder", "Characteristics", "Colors", "Elements", "IsActive", "CreatedAt", "UpdatedAt") VALUES ('Nanã', 'Nanã é uma das mais antigas Orixás femininas, conhecida como senhora da sabedoria ancestral e dos mistérios da vida e morte.', 'Nanã é uma das mais antigas Orixás femininas, conhecida como senhora da sabedoria ancestral e dos mistérios da vida e morte.', 'Na Casa Batuara, Nanã é reverenciada como a anciã sábia, aquela que guarda os segredos da vida e da morte, ensinando-nos a respeitar todos os ciclos da existência.', 'https://batuara.net/assets/orixas/nana.jpg', 3, '["Sabedoria", "Tradição", "Paciência", "Mistério", "Respeito aos antepassados"]'::jsonb, '["Lilás", "Roxo"]'::jsonb, '["Água", "Lama", "Terra"]'::jsonb, true, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
    RAISE NOTICE 'Sincronizando Orixá: Oxum';
    IF EXISTS (SELECT 1 FROM batuara."Orixas" WHERE "Name" = 'Oxum') THEN
        UPDATE batuara."Orixas" SET "Description" = 'Oxum é a Orixá das águas doces, dos rios e cachoeiras, conhecida como a senhora do ouro e do amor.', "Origin" = 'Oxum é a Orixá das águas doces, dos rios e cachoeiras, conhecida como a senhora do ouro e do amor.', "BatuaraTeaching" = 'Na Casa Batuara, Oxum é muito querida por suas qualidades de amor, beleza e fertilidade. Ela nos ensina a valorizar a doçura da vida e a beleza interior.', "Characteristics" = '["Amor", "Beleza", "Fertilidade", "Doçura", "Prosperidade"]'::jsonb, "Colors" = '["Dourado", "Amarelo"]'::jsonb, "Elements" = '["Água doce", "Ouro", "Rios"]'::jsonb, "DisplayOrder" = 4, "ImageUrl" = 'https://batuara.net/assets/orixas/oxum.jpg', "IsActive" = true, "UpdatedAt" = timezone('UTC', now()) WHERE "Name" = 'Oxum';
    ELSE
        INSERT INTO batuara."Orixas" ("Name", "Description", "Origin", "BatuaraTeaching", "ImageUrl", "DisplayOrder", "Characteristics", "Colors", "Elements", "IsActive", "CreatedAt", "UpdatedAt") VALUES ('Oxum', 'Oxum é a Orixá das águas doces, dos rios e cachoeiras, conhecida como a senhora do ouro e do amor.', 'Oxum é a Orixá das águas doces, dos rios e cachoeiras, conhecida como a senhora do ouro e do amor.', 'Na Casa Batuara, Oxum é muito querida por suas qualidades de amor, beleza e fertilidade. Ela nos ensina a valorizar a doçura da vida e a beleza interior.', 'https://batuara.net/assets/orixas/oxum.jpg', 4, '["Amor", "Beleza", "Fertilidade", "Doçura", "Prosperidade"]'::jsonb, '["Dourado", "Amarelo"]'::jsonb, '["Água doce", "Ouro", "Rios"]'::jsonb, true, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
    RAISE NOTICE 'Sincronizando Orixá: Ogum';
    IF EXISTS (SELECT 1 FROM batuara."Orixas" WHERE "Name" = 'Ogum') THEN
        UPDATE batuara."Orixas" SET "Description" = 'Ogum é uma das divindades mais antigas da tradição Yorubá, conhecido como o senhor do ferro e da guerra.', "Origin" = 'Ogum é uma das divindades mais antigas da tradição Yorubá, conhecido como o senhor do ferro e da guerra.', "BatuaraTeaching" = 'A Casa Batuara ensina que Ogum é o grande trabalhador, aquele que nos mostra a importância do esforço e da dedicação para alcançar nossos objetivos.', "Characteristics" = '["Trabalho", "Perseverança", "Coragem", "Determinação", "Proteção", "Liderança", "Honestidade", "Força de vontade"]'::jsonb, "Colors" = '["Azul escuro", "Vermelho", "Verde escuro"]'::jsonb, "Elements" = '["Ferro", "Metal", "Terra", "Fogo"]'::jsonb, "DisplayOrder" = 5, "ImageUrl" = 'https://batuara.net/assets/orixas/ogum.jpg', "IsActive" = true, "UpdatedAt" = timezone('UTC', now()) WHERE "Name" = 'Ogum';
    ELSE
        INSERT INTO batuara."Orixas" ("Name", "Description", "Origin", "BatuaraTeaching", "ImageUrl", "DisplayOrder", "Characteristics", "Colors", "Elements", "IsActive", "CreatedAt", "UpdatedAt") VALUES ('Ogum', 'Ogum é uma das divindades mais antigas da tradição Yorubá, conhecido como o senhor do ferro e da guerra.', 'Ogum é uma das divindades mais antigas da tradição Yorubá, conhecido como o senhor do ferro e da guerra.', 'A Casa Batuara ensina que Ogum é o grande trabalhador, aquele que nos mostra a importância do esforço e da dedicação para alcançar nossos objetivos.', 'https://batuara.net/assets/orixas/ogum.jpg', 5, '["Trabalho", "Perseverança", "Coragem", "Determinação", "Proteção", "Liderança", "Honestidade", "Força de vontade"]'::jsonb, '["Azul escuro", "Vermelho", "Verde escuro"]'::jsonb, '["Ferro", "Metal", "Terra", "Fogo"]'::jsonb, true, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
    RAISE NOTICE 'Sincronizando Orixá: Oxóssi';
    IF EXISTS (SELECT 1 FROM batuara."Orixas" WHERE "Name" = 'Oxóssi') THEN
        UPDATE batuara."Orixas" SET "Description" = 'Oxóssi é o Orixá caçador, senhor das matas e da fartura, conhecido por sua sabedoria e conexão com a natureza.', "Origin" = 'Oxóssi é o Orixá caçador, senhor das matas e da fartura, conhecido por sua sabedoria e conexão com a natureza.', "BatuaraTeaching" = 'Na Casa Batuara, Oxóssi é reverenciado como o provedor, aquele que nos ensina a buscar o conhecimento e a viver em harmonia com a natureza.', "Characteristics" = '["Sabedoria", "Conhecimento", "Prosperidade", "Caça", "Natureza", "Fartura"]'::jsonb, "Colors" = '["Verde", "Azul"]'::jsonb, "Elements" = '["Mata", "Terra", "Arco"]'::jsonb, "DisplayOrder" = 6, "ImageUrl" = 'https://batuara.net/assets/orixas/oxossi.jpg', "IsActive" = true, "UpdatedAt" = timezone('UTC', now()) WHERE "Name" = 'Oxóssi';
    ELSE
        INSERT INTO batuara."Orixas" ("Name", "Description", "Origin", "BatuaraTeaching", "ImageUrl", "DisplayOrder", "Characteristics", "Colors", "Elements", "IsActive", "CreatedAt", "UpdatedAt") VALUES ('Oxóssi', 'Oxóssi é o Orixá caçador, senhor das matas e da fartura, conhecido por sua sabedoria e conexão com a natureza.', 'Oxóssi é o Orixá caçador, senhor das matas e da fartura, conhecido por sua sabedoria e conexão com a natureza.', 'Na Casa Batuara, Oxóssi é reverenciado como o provedor, aquele que nos ensina a buscar o conhecimento e a viver em harmonia com a natureza.', 'https://batuara.net/assets/orixas/oxossi.jpg', 6, '["Sabedoria", "Conhecimento", "Prosperidade", "Caça", "Natureza", "Fartura"]'::jsonb, '["Verde", "Azul"]'::jsonb, '["Mata", "Terra", "Arco"]'::jsonb, true, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
    RAISE NOTICE 'Sincronizando Orixá: Xangô';
    IF EXISTS (SELECT 1 FROM batuara."Orixas" WHERE "Name" = 'Xangô') THEN
        UPDATE batuara."Orixas" SET "Description" = 'Xangô é o Orixá da justiça, do fogo e do trovão, conhecido como o rei poderoso que pune os injustos e protege os oprimidos.', "Origin" = 'Xangô é o Orixá da justiça, do fogo e do trovão, conhecido como o rei poderoso que pune os injustos e protege os oprimidos.', "BatuaraTeaching" = 'A Casa Batuara ensina que Xangô é a personificação da justiça divina, nos mostrando que toda ação tem consequências e que a verdade sempre prevalece.', "Characteristics" = '["Justiça", "Equilíbrio", "Autoridade", "Fogo", "Trovão", "Determinação"]'::jsonb, "Colors" = '["Marrom", "Vermelho", "Branco"]'::jsonb, "Elements" = '["Fogo", "Pedra", "Trovão"]'::jsonb, "DisplayOrder" = 7, "ImageUrl" = 'https://batuara.net/assets/orixas/xango.jpg', "IsActive" = true, "UpdatedAt" = timezone('UTC', now()) WHERE "Name" = 'Xangô';
    ELSE
        INSERT INTO batuara."Orixas" ("Name", "Description", "Origin", "BatuaraTeaching", "ImageUrl", "DisplayOrder", "Characteristics", "Colors", "Elements", "IsActive", "CreatedAt", "UpdatedAt") VALUES ('Xangô', 'Xangô é o Orixá da justiça, do fogo e do trovão, conhecido como o rei poderoso que pune os injustos e protege os oprimidos.', 'Xangô é o Orixá da justiça, do fogo e do trovão, conhecido como o rei poderoso que pune os injustos e protege os oprimidos.', 'A Casa Batuara ensina que Xangô é a personificação da justiça divina, nos mostrando que toda ação tem consequências e que a verdade sempre prevalece.', 'https://batuara.net/assets/orixas/xango.jpg', 7, '["Justiça", "Equilíbrio", "Autoridade", "Fogo", "Trovão", "Determinação"]'::jsonb, '["Marrom", "Vermelho", "Branco"]'::jsonb, '["Fogo", "Pedra", "Trovão"]'::jsonb, true, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
    RAISE NOTICE 'Sincronizando Orixá: Iansã';
    IF EXISTS (SELECT 1 FROM batuara."Orixas" WHERE "Name" = 'Iansã') THEN
        UPDATE batuara."Orixas" SET "Description" = 'Iansã, conhecida como Oyá na tradição Yorubá, é a divindade dos ventos e tempestades.', "Origin" = 'Iansã, conhecida como Oyá na tradição Yorubá, é a divindade dos ventos e tempestades. É esposa de Xangô e uma das mais respeitadas guerreiras entre os Orixás.', "BatuaraTeaching" = 'Na Casa Batuara, Iansã é reverenciada como a guerreira da luz, aquela que nos ensina a coragem para enfrentar as adversidades da vida.', "Characteristics" = '["Coragem", "Justiça", "Determinação", "Liderança", "Proteção", "Transformação", "Força", "Independência"]'::jsonb, "Colors" = '["Amarelo", "Vermelho", "Coral", "Dourado"]'::jsonb, "Elements" = '["Vento", "Tempestade", "Raio", "Fogo"]'::jsonb, "DisplayOrder" = 8, "ImageUrl" = 'https://batuara.net/assets/orixas/iansa.jpg', "IsActive" = true, "UpdatedAt" = timezone('UTC', now()) WHERE "Name" = 'Iansã';
    ELSE
        INSERT INTO batuara."Orixas" ("Name", "Description", "Origin", "BatuaraTeaching", "ImageUrl", "DisplayOrder", "Characteristics", "Colors", "Elements", "IsActive", "CreatedAt", "UpdatedAt") VALUES ('Iansã', 'Iansã, conhecida como Oyá na tradição Yorubá, é a divindade dos ventos e tempestades.', 'Iansã, conhecida como Oyá na tradição Yorubá, é a divindade dos ventos e tempestades. É esposa de Xangô e uma das mais respeitadas guerreiras entre os Orixás.', 'Na Casa Batuara, Iansã é reverenciada como a guerreira da luz, aquela que nos ensina a coragem para enfrentar as adversidades da vida.', 'https://batuara.net/assets/orixas/iansa.jpg', 8, '["Coragem", "Justiça", "Determinação", "Liderança", "Proteção", "Transformação", "Força", "Independência"]'::jsonb, '["Amarelo", "Vermelho", "Coral", "Dourado"]'::jsonb, '["Vento", "Tempestade", "Raio", "Fogo"]'::jsonb, true, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
    RAISE NOTICE 'Sincronizando Orixá: Obaluaê';
    IF EXISTS (SELECT 1 FROM batuara."Orixas" WHERE "Name" = 'Obaluaê') THEN
        UPDATE batuara."Orixas" SET "Description" = 'Obaluaê é o Orixá da cura e das doenças, também conhecido como Omolu.', "Origin" = 'Obaluaê é o Orixá da cura e das doenças, também conhecido como Omolu. É considerado o médico dos Orixás e senhor da vida e da morte.', "BatuaraTeaching" = 'Na Casa Batuara, Obaluaê é reverenciado como o grande curador, aquele que nos ensina que a saúde é o maior bem e que devemos cuidar do corpo e da alma.', "Characteristics" = '["Cura", "Saúde", "Doenças", "Renovação", "Ciclo da vida"]'::jsonb, "Colors" = '["Roxo", "Preto", "Vermelho"]'::jsonb, "Elements" = '["Terra", "Lama", "Palha"]'::jsonb, "DisplayOrder" = 9, "ImageUrl" = 'https://batuara.net/assets/orixas/obaluae.jpg', "IsActive" = true, "UpdatedAt" = timezone('UTC', now()) WHERE "Name" = 'Obaluaê';
    ELSE
        INSERT INTO batuara."Orixas" ("Name", "Description", "Origin", "BatuaraTeaching", "ImageUrl", "DisplayOrder", "Characteristics", "Colors", "Elements", "IsActive", "CreatedAt", "UpdatedAt") VALUES ('Obaluaê', 'Obaluaê é o Orixá da cura e das doenças, também conhecido como Omolu.', 'Obaluaê é o Orixá da cura e das doenças, também conhecido como Omolu. É considerado o médico dos Orixás e senhor da vida e da morte.', 'Na Casa Batuara, Obaluaê é reverenciado como o grande curador, aquele que nos ensina que a saúde é o maior bem e que devemos cuidar do corpo e da alma.', 'https://batuara.net/assets/orixas/obaluae.jpg', 9, '["Cura", "Saúde", "Doenças", "Renovação", "Ciclo da vida"]'::jsonb, '["Roxo", "Preto", "Vermelho"]'::jsonb, '["Terra", "Lama", "Palha"]'::jsonb, true, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
    RAISE NOTICE 'Sincronizando Orixá: Exu';
    IF EXISTS (SELECT 1 FROM batuara."Orixas" WHERE "Name" = 'Exu') THEN
        UPDATE batuara."Orixas" SET "Description" = 'Exu é o Orixá mensageiro, guardião dos caminhos e das encruzilhadas.', "Origin" = 'Exu é o Orixá mensageiro, guardião dos caminhos e das encruzilhadas. É o comunicador entre os mundos espiritual e material.', "BatuaraTeaching" = 'Na Casa Batuara, Exu é reverenciado como o mensageiro essencial, aquele que abre os caminhos e permite a comunicação entre o céu e a terra.', "Characteristics" = '["Comunicação", "Caminhos", "Encruzilhadas", "Movimento", "Equilíbrio"]'::jsonb, "Colors" = '["Vermelho", "Preto"]'::jsonb, "Elements" = '["Terra", "Tridente"]'::jsonb, "DisplayOrder" = 10, "ImageUrl" = 'https://batuara.net/assets/orixas/exu.jpg', "IsActive" = true, "UpdatedAt" = timezone('UTC', now()) WHERE "Name" = 'Exu';
    ELSE
        INSERT INTO batuara."Orixas" ("Name", "Description", "Origin", "BatuaraTeaching", "ImageUrl", "DisplayOrder", "Characteristics", "Colors", "Elements", "IsActive", "CreatedAt", "UpdatedAt") VALUES ('Exu', 'Exu é o Orixá mensageiro, guardião dos caminhos e das encruzilhadas.', 'Exu é o Orixá mensageiro, guardião dos caminhos e das encruzilhadas. É o comunicador entre os mundos espiritual e material.', 'Na Casa Batuara, Exu é reverenciado como o mensageiro essencial, aquele que abre os caminhos e permite a comunicação entre o céu e a terra.', 'https://batuara.net/assets/orixas/exu.jpg', 10, '["Comunicação", "Caminhos", "Encruzilhadas", "Movimento", "Equilíbrio"]'::jsonb, '["Vermelho", "Preto"]'::jsonb, '["Terra", "Tridente"]'::jsonb, true, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
    RAISE NOTICE 'Sincronizando Orixá: Pomba Gira';
    IF EXISTS (SELECT 1 FROM batuara."Orixas" WHERE "Name" = 'Pomba Gira') THEN
        UPDATE batuara."Orixas" SET "Description" = 'Pomba Gira é uma entidade feminina associada a Exu, senhora das encruzilhadas e dos mistérios femininos.', "Origin" = 'Pomba Gira é uma entidade feminina associada a Exu, senhora das encruzilhadas e dos mistérios femininos.', "BatuaraTeaching" = 'Na Casa Batuara, Pomba Gira é reverenciada como a guardiã dos mistérios femininos, ensinando-nos sobre a dualidade e o poder da energia feminina.', "Characteristics" = '["Mistério", "Feminilidade", "Amor", "Encantamento", "Dualidade"]'::jsonb, "Colors" = '["Preto", "Vermelho", "Rosa"]'::jsonb, "Elements" = '["Terra", "Tridente"]'::jsonb, "DisplayOrder" = 11, "ImageUrl" = 'https://batuara.net/assets/orixas/pomba-gira.jpg', "IsActive" = true, "UpdatedAt" = timezone('UTC', now()) WHERE "Name" = 'Pomba Gira';
    ELSE
        INSERT INTO batuara."Orixas" ("Name", "Description", "Origin", "BatuaraTeaching", "ImageUrl", "DisplayOrder", "Characteristics", "Colors", "Elements", "IsActive", "CreatedAt", "UpdatedAt") VALUES ('Pomba Gira', 'Pomba Gira é uma entidade feminina associada a Exu, senhora das encruzilhadas e dos mistérios femininos.', 'Pomba Gira é uma entidade feminina associada a Exu, senhora das encruzilhadas e dos mistérios femininos.', 'Na Casa Batuara, Pomba Gira é reverenciada como a guardiã dos mistérios femininos, ensinando-nos sobre a dualidade e o poder da energia feminina.', 'https://batuara.net/assets/orixas/pomba-gira.jpg', 11, '["Mistério", "Feminilidade", "Amor", "Encantamento", "Dualidade"]'::jsonb, '["Preto", "Vermelho", "Rosa"]'::jsonb, '["Terra", "Tridente"]'::jsonb, true, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
    RAISE NOTICE 'Sincronizando Orixá: Ossain';
    IF EXISTS (SELECT 1 FROM batuara."Orixas" WHERE "Name" = 'Ossain') THEN
        UPDATE batuara."Orixas" SET "Description" = 'Ossain é o Orixá das folhas e ervas medicinais, senhor do conhecimento das plantas curativas.', "Origin" = 'Ossain é o Orixá das folhas e ervas medicinais, senhor do conhecimento das plantas curativas.', "BatuaraTeaching" = 'Na Casa Batuara, Ossain é reverenciado como o mestre das ervas, ensinando-nos sobre as propriedades medicinais das plantas e a cura natural.', "Characteristics" = '["Cura", "Ervas", "Medicina", "Conhecimento ancestral", "Natureza"]'::jsonb, "Colors" = '["Verde", "Marrom"]'::jsonb, "Elements" = '["Ervas", "Terra", "Folhas"]'::jsonb, "DisplayOrder" = 12, "ImageUrl" = 'https://batuara.net/assets/orixas/ossain.jpg', "IsActive" = true, "UpdatedAt" = timezone('UTC', now()) WHERE "Name" = 'Ossain';
    ELSE
        INSERT INTO batuara."Orixas" ("Name", "Description", "Origin", "BatuaraTeaching", "ImageUrl", "DisplayOrder", "Characteristics", "Colors", "Elements", "IsActive", "CreatedAt", "UpdatedAt") VALUES ('Ossain', 'Ossain é o Orixá das folhas e ervas medicinais, senhor do conhecimento das plantas curativas.', 'Ossain é o Orixá das folhas e ervas medicinais, senhor do conhecimento das plantas curativas.', 'Na Casa Batuara, Ossain é reverenciado como o mestre das ervas, ensinando-nos sobre as propriedades medicinais das plantas e a cura natural.', 'https://batuara.net/assets/orixas/ossain.jpg', 12, '["Cura", "Ervas", "Medicina", "Conhecimento ancestral", "Natureza"]'::jsonb, '["Verde", "Marrom"]'::jsonb, '["Ervas", "Terra", "Folhas"]'::jsonb, true, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
    RAISE NOTICE 'Sincronizando Orixá: Oxumarê';
    IF EXISTS (SELECT 1 FROM batuara."Orixas" WHERE "Name" = 'Oxumarê') THEN
        UPDATE batuara."Orixas" SET "Description" = 'Oxumarê é o Orixá da transformação, do movimento e da renovação.', "Origin" = 'Oxumarê é o Orixá da transformação, do movimento e da renovação. Representa o arco-íris e a serpente.', "BatuaraTeaching" = 'Na Casa Batuara, Oxumarê é reverenciado como o renovador, aquele que nos ensina que toda situação pode ser transformada e que a esperança sempre retorna.', "Characteristics" = '["Renovação", "Transformação", "Movimento", "Esperança", "Equilíbrio"]'::jsonb, "Colors" = '["Amarelo", "Verde", "Arco-íris"]'::jsonb, "Elements" = '["Água", "Serpente", "Arco-íris"]'::jsonb, "DisplayOrder" = 13, "ImageUrl" = 'https://batuara.net/assets/orixas/oxumare.jpg', "IsActive" = true, "UpdatedAt" = timezone('UTC', now()) WHERE "Name" = 'Oxumarê';
    ELSE
        INSERT INTO batuara."Orixas" ("Name", "Description", "Origin", "BatuaraTeaching", "ImageUrl", "DisplayOrder", "Characteristics", "Colors", "Elements", "IsActive", "CreatedAt", "UpdatedAt") VALUES ('Oxumarê', 'Oxumarê é o Orixá da transformação, do movimento e da renovação.', 'Oxumarê é o Orixá da transformação, do movimento e da renovação. Representa o arco-íris e a serpente.', 'Na Casa Batuara, Oxumarê é reverenciado como o renovador, aquele que nos ensina que toda situação pode ser transformada e que a esperança sempre retorna.', 'https://batuara.net/assets/orixas/oxumare.jpg', 13, '["Renovação", "Transformação", "Movimento", "Esperança", "Equilíbrio"]'::jsonb, '["Amarelo", "Verde", "Arco-íris"]'::jsonb, '["Água", "Serpente", "Arco-íris"]'::jsonb, true, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
    RAISE NOTICE 'Sincronizando Orixá: Logun Edé';
    IF EXISTS (SELECT 1 FROM batuara."Orixas" WHERE "Name" = 'Logun Edé') THEN
        UPDATE batuara."Orixas" SET "Description" = 'Logun Edé é a fusão de Oxóssi e Oxum, representando a harmonia entre os opostos.', "Origin" = 'Logun Edé é a fusão de Oxóssi e Oxum, representando a harmonia entre os opostos. É Orixá da juventude, da sorte e das boas vendas.', "BatuaraTeaching" = 'Na Casa Batuara, Logun Edé é reverenciado como a união perfeita entre força e amor, ensina-nos que a prosperidade vem da harmonia entre os opostos.', "Characteristics" = '["União", "Prosperidade", "Juventude", "Sorte", "Harmonia"]'::jsonb, "Colors" = '["Verde", "Dourado", "Azul"]'::jsonb, "Elements" = '["Mata", "Rio", "Juventude"]'::jsonb, "DisplayOrder" = 14, "ImageUrl" = 'https://batuara.net/assets/orixas/logun-ede.jpg', "IsActive" = true, "UpdatedAt" = timezone('UTC', now()) WHERE "Name" = 'Logun Edé';
    ELSE
        INSERT INTO batuara."Orixas" ("Name", "Description", "Origin", "BatuaraTeaching", "ImageUrl", "DisplayOrder", "Characteristics", "Colors", "Elements", "IsActive", "CreatedAt", "UpdatedAt") VALUES ('Logun Edé', 'Logun Edé é a fusão de Oxóssi e Oxum, representando a harmonia entre os opostos.', 'Logun Edé é a fusão de Oxóssi e Oxum, representando a harmonia entre os opostos. É Orixá da juventude, da sorte e das boas vendas.', 'Na Casa Batuara, Logun Edé é reverenciado como a união perfeita entre força e amor, ensina-nos que a prosperidade vem da harmonia entre os opostos.', 'https://batuara.net/assets/orixas/logun-ede.jpg', 14, '["União", "Prosperidade", "Juventude", "Sorte", "Harmonia"]'::jsonb, '["Verde", "Dourado", "Azul"]'::jsonb, '["Mata", "Rio", "Juventude"]'::jsonb, true, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
    RAISE NOTICE 'Sincronizando Orixá: Arnaldo';
    IF EXISTS (SELECT 1 FROM batuara."Orixas" WHERE "Name" = 'Arnaldo') THEN
        UPDATE batuara."Orixas" SET "Description" = 'Arnaldo é um Orixá de menor popularidade, associado à proteção e à resistência.', "Origin" = 'Arnaldo é um Orixá de menor popularidade, associado à proteção e à resistência. Conhecido em algumas tradições como parte da corte de Ogum.', "BatuaraTeaching" = 'Na Casa Batuara, Arnaldo é reverenciado como o protetor silencioso, aquele que trabalha nos bastidores para nos manter seguros.', "Characteristics" = '["Proteção", "Resistência", "Silêncio", "Força", "Lealdade"]'::jsonb, "Colors" = '["Verde", "Branco"]'::jsonb, "Elements" = '["Terra", "Ferro"]'::jsonb, "DisplayOrder" = 15, "ImageUrl" = 'https://batuara.net/assets/orixas/arnaldo.jpg', "IsActive" = true, "UpdatedAt" = timezone('UTC', now()) WHERE "Name" = 'Arnaldo';
    ELSE
        INSERT INTO batuara."Orixas" ("Name", "Description", "Origin", "BatuaraTeaching", "ImageUrl", "DisplayOrder", "Characteristics", "Colors", "Elements", "IsActive", "CreatedAt", "UpdatedAt") VALUES ('Arnaldo', 'Arnaldo é um Orixá de menor popularidade, associado à proteção e à resistência.', 'Arnaldo é um Orixá de menor popularidade, associado à proteção e à resistência. Conhecido em algumas tradições como parte da corte de Ogum.', 'Na Casa Batuara, Arnaldo é reverenciado como o protetor silencioso, aquele que trabalha nos bastidores para nos manter seguros.', 'https://batuara.net/assets/orixas/arnaldo.jpg', 15, '["Proteção", "Resistência", "Silêncio", "Força", "Lealdade"]'::jsonb, '["Verde", "Branco"]'::jsonb, '["Terra", "Ferro"]'::jsonb, true, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
    RAISE NOTICE 'Sincronizando Linha da Umbanda: Linha de Oxalá (Linha da Fé)';
    IF EXISTS (SELECT 1 FROM batuara."UmbandaLines" WHERE "Name" = 'Linha de Oxalá (Linha da Fé)') THEN
        UPDATE batuara."UmbandaLines" SET "Description" = 'Regida por Oxalá, o Pai maior e luz divina. Esta linha trabalha com a iluminação espiritual, fortalecimento da fé e promoção da paz interior através da caridade.', "Characteristics" = 'Iluminação, fé, equilíbrio, paz, caridade', "BatuaraInterpretation" = 'Regida por Oxalá. Entidades em destaque: Cristos, Anjos, Espíritos elevados, Guias da luz.', "DisplayOrder" = 1, "Entities" = '["Cristos", "Anjos", "Espíritos elevados", "Guias da luz"]'::jsonb, "WorkingDays" = '["Domingo", "Sexta-feira"]'::jsonb, "IsActive" = true, "UpdatedAt" = timezone('UTC', now()) WHERE "Name" = 'Linha de Oxalá (Linha da Fé)';
    ELSE
        INSERT INTO batuara."UmbandaLines" ("Name", "Description", "Characteristics", "BatuaraInterpretation", "DisplayOrder", "Entities", "WorkingDays", "IsActive", "CreatedAt", "UpdatedAt") VALUES ('Linha de Oxalá (Linha da Fé)', 'Regida por Oxalá, o Pai maior e luz divina. Esta linha trabalha com a iluminação espiritual, fortalecimento da fé e promoção da paz interior através da caridade.', 'Iluminação, fé, equilíbrio, paz, caridade', 'Regida por Oxalá. Entidades em destaque: Cristos, Anjos, Espíritos elevados, Guias da luz.', 1, '["Cristos", "Anjos", "Espíritos elevados", "Guias da luz"]'::jsonb, '["Domingo", "Sexta-feira"]'::jsonb, true, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
    RAISE NOTICE 'Sincronizando Linha da Umbanda: Linha de Ogum (Linha da Lei e da Ordem)';
    IF EXISTS (SELECT 1 FROM batuara."UmbandaLines" WHERE "Name" = 'Linha de Ogum (Linha da Lei e da Ordem)') THEN
        UPDATE batuara."UmbandaLines" SET "Description" = 'Linha regida por Ogum, focada na manutenção da lei e ordem espiritual. Atua na quebra de demandas negativas e proteção através da força e justiça.', "Characteristics" = 'Quebra de demandas, justiça, força, desobsessão', "BatuaraInterpretation" = 'Regida por Ogum. Entidades em destaque: Caboclos guerreiros, Soldados espirituais.', "DisplayOrder" = 2, "Entities" = '["Caboclos guerreiros", "Soldados espirituais"]'::jsonb, "WorkingDays" = '["Segunda-feira", "Quinta-feira"]'::jsonb, "IsActive" = true, "UpdatedAt" = timezone('UTC', now()) WHERE "Name" = 'Linha de Ogum (Linha da Lei e da Ordem)';
    ELSE
        INSERT INTO batuara."UmbandaLines" ("Name", "Description", "Characteristics", "BatuaraInterpretation", "DisplayOrder", "Entities", "WorkingDays", "IsActive", "CreatedAt", "UpdatedAt") VALUES ('Linha de Ogum (Linha da Lei e da Ordem)', 'Linha regida por Ogum, focada na manutenção da lei e ordem espiritual. Atua na quebra de demandas negativas e proteção através da força e justiça.', 'Quebra de demandas, justiça, força, desobsessão', 'Regida por Ogum. Entidades em destaque: Caboclos guerreiros, Soldados espirituais.', 2, '["Caboclos guerreiros", "Soldados espirituais"]'::jsonb, '["Segunda-feira", "Quinta-feira"]'::jsonb, true, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
    RAISE NOTICE 'Sincronizando Linha da Umbanda: Linha de Oxóssi (Linha do Conhecimento)';
    IF EXISTS (SELECT 1 FROM batuara."UmbandaLines" WHERE "Name" = 'Linha de Oxóssi (Linha do Conhecimento)') THEN
        UPDATE batuara."UmbandaLines" SET "Description" = 'Regida por Oxóssi, esta linha trabalha com a sabedoria ancestral, cura através da natureza e abertura de caminhos para o conhecimento espiritual.', "Characteristics" = 'Sabedoria, cura, abertura de caminhos, natureza', "BatuaraInterpretation" = 'Regida por Oxóssi. Entidades em destaque: Caboclos caçadores, Mestres do conhecimento.', "DisplayOrder" = 3, "Entities" = '["Caboclos caçadores", "Mestres do conhecimento"]'::jsonb, "WorkingDays" = '["Terça-feira", "Quinta-feira"]'::jsonb, "IsActive" = true, "UpdatedAt" = timezone('UTC', now()) WHERE "Name" = 'Linha de Oxóssi (Linha do Conhecimento)';
    ELSE
        INSERT INTO batuara."UmbandaLines" ("Name", "Description", "Characteristics", "BatuaraInterpretation", "DisplayOrder", "Entities", "WorkingDays", "IsActive", "CreatedAt", "UpdatedAt") VALUES ('Linha de Oxóssi (Linha do Conhecimento)', 'Regida por Oxóssi, esta linha trabalha com a sabedoria ancestral, cura através da natureza e abertura de caminhos para o conhecimento espiritual.', 'Sabedoria, cura, abertura de caminhos, natureza', 'Regida por Oxóssi. Entidades em destaque: Caboclos caçadores, Mestres do conhecimento.', 3, '["Caboclos caçadores", "Mestres do conhecimento"]'::jsonb, '["Terça-feira", "Quinta-feira"]'::jsonb, true, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
    RAISE NOTICE 'Sincronizando Linha da Umbanda: Linha de Xangô (Linha da Justiça)';
    IF EXISTS (SELECT 1 FROM batuara."UmbandaLines" WHERE "Name" = 'Linha de Xangô (Linha da Justiça)') THEN
        UPDATE batuara."UmbandaLines" SET "Description" = 'Linha regida por Xangô, focada na aplicação da justiça divina e equilíbrio espiritual através da sabedoria ancestral dos Pretos-Velhos juristas.', "Characteristics" = 'Justiça, equilíbrio, sabedoria ancestral', "BatuaraInterpretation" = 'Regida por Xangô. Entidades em destaque: Pretos-Velhos juristas, Juízes espirituais.', "DisplayOrder" = 4, "Entities" = '["Pretos-Velhos juristas", "Juízes espirituais"]'::jsonb, "WorkingDays" = '["Segunda-feira", "Quarta-feira"]'::jsonb, "IsActive" = true, "UpdatedAt" = timezone('UTC', now()) WHERE "Name" = 'Linha de Xangô (Linha da Justiça)';
    ELSE
        INSERT INTO batuara."UmbandaLines" ("Name", "Description", "Characteristics", "BatuaraInterpretation", "DisplayOrder", "Entities", "WorkingDays", "IsActive", "CreatedAt", "UpdatedAt") VALUES ('Linha de Xangô (Linha da Justiça)', 'Linha regida por Xangô, focada na aplicação da justiça divina e equilíbrio espiritual através da sabedoria ancestral dos Pretos-Velhos juristas.', 'Justiça, equilíbrio, sabedoria ancestral', 'Regida por Xangô. Entidades em destaque: Pretos-Velhos juristas, Juízes espirituais.', 4, '["Pretos-Velhos juristas", "Juízes espirituais"]'::jsonb, '["Segunda-feira", "Quarta-feira"]'::jsonb, true, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
    RAISE NOTICE 'Sincronizando Linha da Umbanda: Linha de Iemanjá (Linha do Amor e da Geração)';
    IF EXISTS (SELECT 1 FROM batuara."UmbandaLines" WHERE "Name" = 'Linha de Iemanjá (Linha do Amor e da Geração)') THEN
        UPDATE batuara."UmbandaLines" SET "Description" = 'Regida por Iemanjá, mãe de todos os Orixás. Esta linha trabalha com as emoções, proteção familiar, gestação e acolhimento maternal.', "Characteristics" = 'Emoções, família, gestação, acolhimento', "BatuaraInterpretation" = 'Regida por Iemanjá. Entidades em destaque: Marinheiros, Iabás, Mães espirituais.', "DisplayOrder" = 5, "Entities" = '["Marinheiros", "Iabás", "Mães espirituais"]'::jsonb, "WorkingDays" = '["Sábado", "Segunda-feira"]'::jsonb, "IsActive" = true, "UpdatedAt" = timezone('UTC', now()) WHERE "Name" = 'Linha de Iemanjá (Linha do Amor e da Geração)';
    ELSE
        INSERT INTO batuara."UmbandaLines" ("Name", "Description", "Characteristics", "BatuaraInterpretation", "DisplayOrder", "Entities", "WorkingDays", "IsActive", "CreatedAt", "UpdatedAt") VALUES ('Linha de Iemanjá (Linha do Amor e da Geração)', 'Regida por Iemanjá, mãe de todos os Orixás. Esta linha trabalha com as emoções, proteção familiar, gestação e acolhimento maternal.', 'Emoções, família, gestação, acolhimento', 'Regida por Iemanjá. Entidades em destaque: Marinheiros, Iabás, Mães espirituais.', 5, '["Marinheiros", "Iabás", "Mães espirituais"]'::jsonb, '["Sábado", "Segunda-feira"]'::jsonb, true, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
    RAISE NOTICE 'Sincronizando Linha da Umbanda: Linha de Iansã (Linha das Almas e Espíritos)';
    IF EXISTS (SELECT 1 FROM batuara."UmbandaLines" WHERE "Name" = 'Linha de Iansã (Linha das Almas e Espíritos)') THEN
        UPDATE batuara."UmbandaLines" SET "Description" = 'Linha regida por Iansã, senhora dos ventos e das almas. Trabalha com espíritos em trânsito, auxiliando no desencarne e purificação energética.', "Characteristics" = 'Desencarne, passagem, purificação energética', "BatuaraInterpretation" = 'Regida por Iansã. Entidades em destaque: Eguns, Espíritos em trânsito, Mensageiros.', "DisplayOrder" = 6, "Entities" = '["Eguns", "Espíritos em trânsito", "Mensageiros"]'::jsonb, "WorkingDays" = '["Quarta-feira", "Domingo"]'::jsonb, "IsActive" = true, "UpdatedAt" = timezone('UTC', now()) WHERE "Name" = 'Linha de Iansã (Linha das Almas e Espíritos)';
    ELSE
        INSERT INTO batuara."UmbandaLines" ("Name", "Description", "Characteristics", "BatuaraInterpretation", "DisplayOrder", "Entities", "WorkingDays", "IsActive", "CreatedAt", "UpdatedAt") VALUES ('Linha de Iansã (Linha das Almas e Espíritos)', 'Linha regida por Iansã, senhora dos ventos e das almas. Trabalha com espíritos em trânsito, auxiliando no desencarne e purificação energética.', 'Desencarne, passagem, purificação energética', 'Regida por Iansã. Entidades em destaque: Eguns, Espíritos em trânsito, Mensageiros.', 6, '["Eguns", "Espíritos em trânsito", "Mensageiros"]'::jsonb, '["Quarta-feira", "Domingo"]'::jsonb, true, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
    RAISE NOTICE 'Sincronizando Linha da Umbanda: Linha de Exu (Linha da Comunicação e Movimento)';
    IF EXISTS (SELECT 1 FROM batuara."UmbandaLines" WHERE "Name" = 'Linha de Exu (Linha da Comunicação e Movimento)') THEN
        UPDATE batuara."UmbandaLines" SET "Description" = 'Regida por Exu e Pomba Gira, esta linha trabalha como comunicadora entre os mundos espiritual e material, abrindo caminhos e oferecendo proteção.', "Characteristics" = 'Comunicação entre mundos, abertura de caminhos, proteção', "BatuaraInterpretation" = 'Regida por Exu e Pomba Gira. Entidades em destaque: Exus, Pombas Giras, Guardiões.', "DisplayOrder" = 7, "Entities" = '["Exus", "Pombas Giras", "Guardiões"]'::jsonb, "WorkingDays" = '["Segunda-feira", "Quarta-feira"]'::jsonb, "IsActive" = true, "UpdatedAt" = timezone('UTC', now()) WHERE "Name" = 'Linha de Exu (Linha da Comunicação e Movimento)';
    ELSE
        INSERT INTO batuara."UmbandaLines" ("Name", "Description", "Characteristics", "BatuaraInterpretation", "DisplayOrder", "Entities", "WorkingDays", "IsActive", "CreatedAt", "UpdatedAt") VALUES ('Linha de Exu (Linha da Comunicação e Movimento)', 'Regida por Exu e Pomba Gira, esta linha trabalha como comunicadora entre os mundos espiritual e material, abrindo caminhos e oferecendo proteção.', 'Comunicação entre mundos, abertura de caminhos, proteção', 'Regida por Exu e Pomba Gira. Entidades em destaque: Exus, Pombas Giras, Guardiões.', 7, '["Exus", "Pombas Giras", "Guardiões"]'::jsonb, '["Segunda-feira", "Quarta-feira"]'::jsonb, true, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
    RAISE NOTICE 'Sincronizando Conteúdo Espiritual: Pai Nosso da Umbanda';
    IF EXISTS (SELECT 1 FROM batuara."SpiritualContents" WHERE "Title" = 'Pai Nosso da Umbanda' AND "Type" = 1 AND "Category" = 1) THEN
        UPDATE batuara."SpiritualContents" SET "Content" = 'Pai nosso que estais no infinito,
Santificado seja o vosso reino de luz.
Venha a nós a vossa paz,
Seja feita a vossa vontade,
Assim na Terra como no infinito.

O pão nosso de cada dia nos dai hoje,
Perdoai as nossas dívidas,
Assim como nós perdoamos aos nossos devedores.
Não nos deixeis cair em tentação,
Mas livrai-nos de todo mal.

Porque vosso é o reino,
O poder e a glória,
Para todo o sempre.
Saravá!', "Source" = 'Apostila Batuara 2024', "DisplayOrder" = 1, "IsFeatured" = true, "IsActive" = true, "UpdatedAt" = timezone('UTC', now()) WHERE "Title" = 'Pai Nosso da Umbanda' AND "Type" = 1 AND "Category" = 1;
    ELSE
        INSERT INTO batuara."SpiritualContents" ("Title", "Content", "Type", "Category", "Source", "DisplayOrder", "IsFeatured", "IsActive", "CreatedAt", "UpdatedAt") VALUES ('Pai Nosso da Umbanda', 'Pai nosso que estais no infinito,
Santificado seja o vosso reino de luz.
Venha a nós a vossa paz,
Seja feita a vossa vontade,
Assim na Terra como no infinito.

O pão nosso de cada dia nos dai hoje,
Perdoai as nossas dívidas,
Assim como nós perdoamos aos nossos devedores.
Não nos deixeis cair em tentação,
Mas livrai-nos de todo mal.

Porque vosso é o reino,
O poder e a glória,
Para todo o sempre.
Saravá!', 1, 1, 'Apostila Batuara 2024', 1, true, true, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
    RAISE NOTICE 'Sincronizando Conteúdo Espiritual: A Caridade Segundo os Ensinamentos da Casa Batuara';
    IF EXISTS (SELECT 1 FROM batuara."SpiritualContents" WHERE "Title" = 'A Caridade Segundo os Ensinamentos da Casa Batuara' AND "Type" = 2 AND "Category" = 3) THEN
        UPDATE batuara."SpiritualContents" SET "Content" = 'A caridade é o fundamento de toda a nossa doutrina. Não se trata apenas de dar esmolas ou ajudar materialmente, mas sim de amar verdadeiramente ao próximo como a nós mesmos.

A verdadeira caridade começa no coração. É preciso ter compaixão, compreensão e amor por todos os seres, independentemente de sua condição social, raça ou religião.

Na Casa Batuara, praticamos a caridade de várias formas:
- Através da assistência espiritual gratuita
- Do atendimento aos necessitados
- Da orientação e consolação aos aflitos
- Do ensino da doutrina espírita e umbandista
- Da promoção da fraternidade entre todos

Lembrem-se sempre: "Fora da caridade não há salvação".', "Source" = 'Apostila Batuara 2024', "DisplayOrder" = 2, "IsFeatured" = true, "IsActive" = true, "UpdatedAt" = timezone('UTC', now()) WHERE "Title" = 'A Caridade Segundo os Ensinamentos da Casa Batuara' AND "Type" = 2 AND "Category" = 3;
    ELSE
        INSERT INTO batuara."SpiritualContents" ("Title", "Content", "Type", "Category", "Source", "DisplayOrder", "IsFeatured", "IsActive", "CreatedAt", "UpdatedAt") VALUES ('A Caridade Segundo os Ensinamentos da Casa Batuara', 'A caridade é o fundamento de toda a nossa doutrina. Não se trata apenas de dar esmolas ou ajudar materialmente, mas sim de amar verdadeiramente ao próximo como a nós mesmos.

A verdadeira caridade começa no coração. É preciso ter compaixão, compreensão e amor por todos os seres, independentemente de sua condição social, raça ou religião.

Na Casa Batuara, praticamos a caridade de várias formas:
- Através da assistência espiritual gratuita
- Do atendimento aos necessitados
- Da orientação e consolação aos aflitos
- Do ensino da doutrina espírita e umbandista
- Da promoção da fraternidade entre todos

Lembrem-se sempre: "Fora da caridade não há salvação".', 2, 3, 'Apostila Batuara 2024', 2, true, true, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
    RAISE NOTICE 'Sincronizando Conteúdo Espiritual: Pai Nosso de Oxalá';
    IF EXISTS (SELECT 1 FROM batuara."SpiritualContents" WHERE "Title" = 'Pai Nosso de Oxalá' AND "Type" = 1 AND "Category" = 4) THEN
        UPDATE batuara."SpiritualContents" SET "Content" = 'Pai nosso que estais no infinito,
Todo poder é vosso,
Santificado seja o vosso nome,
Venha a nós a vossa paz,
Pois só na paz podemos encontrar a luz.

Eu sou vosso filho (a) e busco vossa orientação,
Concedei-me a sabedoria para seguir pelo caminho do bem,
A paciência para aceitar o que não posso mudar,
E a coragem para mudar o que posso.

Guiai-me pela estrada da caridade,
Para que eu possa servir aos meus irmãos,
E assim encontrar a verdadeira paz,
Que só vossa luz pode proporcionar.

Epa babá! Oxalá!', "Source" = 'Apostila Batuara 2024', "DisplayOrder" = 3, "IsFeatured" = false, "IsActive" = true, "UpdatedAt" = timezone('UTC', now()) WHERE "Title" = 'Pai Nosso de Oxalá' AND "Type" = 1 AND "Category" = 4;
    ELSE
        INSERT INTO batuara."SpiritualContents" ("Title", "Content", "Type", "Category", "Source", "DisplayOrder", "IsFeatured", "IsActive", "CreatedAt", "UpdatedAt") VALUES ('Pai Nosso de Oxalá', 'Pai nosso que estais no infinito,
Todo poder é vosso,
Santificado seja o vosso nome,
Venha a nós a vossa paz,
Pois só na paz podemos encontrar a luz.

Eu sou vosso filho (a) e busco vossa orientação,
Concedei-me a sabedoria para seguir pelo caminho do bem,
A paciência para aceitar o que não posso mudar,
E a coragem para mudar o que posso.

Guiai-me pela estrada da caridade,
Para que eu possa servir aos meus irmãos,
E assim encontrar a verdadeira paz,
Que só vossa luz pode proporcionar.

Epa babá! Oxalá!', 1, 4, 'Apostila Batuara 2024', 3, false, true, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
    RAISE NOTICE 'Sincronizando Conteúdo Espiritual: Canto a Iemanjá';
    IF EXISTS (SELECT 1 FROM batuara."SpiritualContents" WHERE "Title" = 'Canto a Iemanjá' AND "Type" = 4 AND "Category" = 1) THEN
        UPDATE batuara."SpiritualContents" SET "Content" = 'Iemanjá, mãe querida,
Rainha do mar e das águas,
Acolhei-me em vossos braços,
Como uma criança que volta para casa.

Ó doce mãe, dai-me vossa bênção,
Para viver com amor e esperança,
Que vossa luz me guie,
Nas horas de escuridão.

Odocya, Odocya, Odocya!
Mãe Iemanjá, abraça-me!
Eu sou seu filho (a),
E volto para os seus braços!

Salve Iemanjá!', "Source" = 'Apostila Batuara 2024', "DisplayOrder" = 4, "IsFeatured" = true, "IsActive" = true, "UpdatedAt" = timezone('UTC', now()) WHERE "Title" = 'Canto a Iemanjá' AND "Type" = 4 AND "Category" = 1;
    ELSE
        INSERT INTO batuara."SpiritualContents" ("Title", "Content", "Type", "Category", "Source", "DisplayOrder", "IsFeatured", "IsActive", "CreatedAt", "UpdatedAt") VALUES ('Canto a Iemanjá', 'Iemanjá, mãe querida,
Rainha do mar e das águas,
Acolhei-me em vossos braços,
Como uma criança que volta para casa.

Ó doce mãe, dai-me vossa bênção,
Para viver com amor e esperança,
Que vossa luz me guie,
Nas horas de escuridão.

Odocya, Odocya, Odocya!
Mãe Iemanjá, abraça-me!
Eu sou seu filho (a),
E volto para os seus braços!

Salve Iemanjá!', 4, 1, 'Apostila Batuara 2024', 4, true, true, timezone('UTC', now()), timezone('UTC', now()));
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Falha no seed do PublicWebsite: %', SQLERRM;
    RAISE;
END $$;
COMMIT;
