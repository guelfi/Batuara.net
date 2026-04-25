-- Seed: Guias e Entidades validados (Apostila Batuara 2024)
-- Remove registros de QA/teste e insere os 7 guias validados

-- 1. Remove os registros de teste/QA
DELETE FROM batuara."Guides" WHERE "Name" IN ('Guia QA Automação', 'Guia QA Data', 'Guia Smoke Test');

-- 2. Reseta a sequência do Id para evitar conflitos
SELECT setval(pg_get_serial_sequence('batuara."Guides"', 'Id'), COALESCE(MAX("Id"), 0) + 1, false)
FROM batuara."Guides";

-- 3. Insere os 7 Guias e Entidades validados
INSERT INTO batuara."Guides"
  ("Name", "Description", "Specialties", "EntryDate", "DisplayOrder", "IsActive", "CreatedAt", "UpdatedAt")
VALUES
  (
    'Baiano',
    'Entidades alegres e festeiras, vindas da Bahia. Conhecidos por sua sabedoria popular e humor. Comemoração: 04/08 — Saudação: Salve Nosso Senhor do Bonfim. Habitat: Praias e cidades da Bahia. Cor: Amarelo e Vermelho. Dia: Quinta-feira.',
    '["Alegria contagiante","Sabedoria popular","Gosto por festas","Linguagem típica baiana","Proteção através da alegria"]',
    '2024-01-01 00:00:00+00',
    1, true, NOW(), NOW()
  ),
  (
    'Preto Velho',
    'Espíritos de anciãos africanos, símbolos de sabedoria, paciência e humildade. Comemoração: 13/05 — Saudação: Adorei as Almas. Habitat: Senzalas e terreiros antigos. Cor: Branco e Preto. Dia: Segunda-feira.',
    '["Sabedoria ancestral","Paciência infinita","Humildade profunda","Conselhos valiosos","Cura através da fé"]',
    '2024-01-01 00:00:00+00',
    2, true, NOW(), NOW()
  ),
  (
    'Erês',
    'Espíritos de crianças, trazem alegria, pureza e inocência. São os mensageiros da esperança. Comemoração: 27/09 — Saudação: Aminbeijada. Habitat: Jardins e parques infantis. Cor: Rosa e Azul. Dia: Domingo.',
    '["Pureza de coração","Alegria contagiante","Inocência genuína","Brincadeiras e risos","Proteção das crianças"]',
    '2024-01-01 00:00:00+00',
    3, true, NOW(), NOW()
  ),
  (
    'Boiadeiro',
    'Espíritos de vaqueiros e trabalhadores rurais, conhecidos por sua força e determinação. Comemoração: 24/06 — Saudação: Getruá seu Boiadeiro. Habitat: Campos e fazendas. Cor: Marrom e Bege. Dia: Terça-feira.',
    '["Força e coragem","Determinação","Simplicidade","Proteção do gado","Trabalho árduo"]',
    '2024-01-01 00:00:00+00',
    4, true, NOW(), NOW()
  ),
  (
    'Marinheiro',
    'Espíritos dos mares, navegadores experientes que trazem proteção nas viagens. Comemoração: 07/07 — Saudação: Salve Nossa Senhora dos Navegantes. Habitat: Portos e navios. Cor: Azul e Branco. Dia: Sábado.',
    '["Conhecimento dos mares","Proteção em viagens","Aventura e coragem","Histórias fascinantes","Ligação com Iemanjá"]',
    '2024-01-01 00:00:00+00',
    5, true, NOW(), NOW()
  ),
  (
    'Cigano',
    'Espíritos nômades, conhecedores dos mistérios, da magia e da leitura do destino. Comemoração: 24/05 — Saudação: É de Ouro e Oriente. Habitat: Estradas e acampamentos. Cor: Dourado e Roxo. Dia: Sexta-feira.',
    '["Conhecimento místico","Leitura do destino","Liberdade de espírito","Magia e encantamentos","Proteção em viagens"]',
    '2024-01-01 00:00:00+00',
    6, true, NOW(), NOW()
  ),
  (
    'Malandro',
    'Espíritos urbanos, conhecedores da vida nas ruas, trazem proteção e esperteza. Comemoração: 18/03 — Saudação: Salve a Malandragem. Habitat: Ruas e esquinas da cidade. Cor: Preto e Branco. Dia: Quarta-feira.',
    '["Esperteza urbana","Proteção nas ruas","Jogo de cintura","Conhecimento da vida","Humor e malandragem"]',
    '2024-01-01 00:00:00+00',
    7, true, NOW(), NOW()
  );

-- 4. Confirma
SELECT "Id", "Name", "IsActive", "DisplayOrder" FROM batuara."Guides" ORDER BY "DisplayOrder";
