-- =============================================================================
-- SCRIPT DE CARGA DE DADOS SANADOS — Casa de Caridade Batuara
-- Fonte de verdade: ApostilaBatuara.md (extraído do PDF Apostila Batuara 2024)
-- Gerado em: Junho/2026
-- Aplicar em: ambiente local (Docker) e OCI (produção)
-- ATENÇÃO: Este script faz DELETE + INSERT nas tabelas Orixas e Guides.
--          Executar SOMENTE após backup ou em banco sem dados críticos.
-- Schema: batuara
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. ORIXÁS (11 registros confirmados na apostila)
-- =============================================================================

DELETE FROM batuara."Orixas";

INSERT INTO batuara."Orixas"
    ("Name", "Description", "Origin", "BatuaraTeaching", "Characteristics", "Colors", "Elements",
     "DisplayOrder", "ImageUrl", "Comida", "DiaDaSemana", "Fruta", "Saudacao",
     "IsActive", "CreatedAt", "UpdatedAt")
VALUES

-- 1. Oxalá
('Oxalá',
 'Tem origem na tradição Yorubá, onde é conhecido como Obatalá. Criador da humanidade e pai de todos os Orixás.',
 'Tradição Yorubá — África Ocidental. Conhecido como Obatalá, o criador da humanidade e pai de todos os Orixás.',
 'Reverenciado como o grande pai. Ensina humildade, paciência e amor incondicional. A paz interior e pureza de coração levam à elevação espiritual.',
 '["Paciência","Sabedoria","Pureza","Paz","Criação","Paternidade","Humildade","Amor incondicional"]',
 '["Branco"]',
 '["Ar","Éter","Luz"]',
 1, NULL, 'Canjica', 'Sexta', 'Uva Branca', 'Epa babá',
 true, NOW(), NOW()),

-- 2. Iemanjá
('Iemanjá',
 'Divindade dos rios e mares, mãe de muitos Orixás e protetora das mulheres e crianças.',
 'Tradição Yorubá — África Ocidental. Conhecida como Yemoja, divindade dos rios e mares.',
 'Amor incondicional de mãe, proteção aos necessitados e importância da família espiritual. Mãe que nunca abandona seus filhos.',
 '["Maternidade","Proteção","Fertilidade","Amor maternal","Cura","Acolhimento","Generosidade","Compaixão"]',
 '["Azul"]',
 '["Água","Mar","Rios","Conchas"]',
 2, NULL, 'Peixe (Água Salgada)', 'Sábado', 'Mamão Papaya', 'Odocya',
 true, NOW(), NOW()),

-- 3. Nanã
('Nanã',
 'Uma das mais antigas Orixás femininas. Senhora da sabedoria ancestral e dos mistérios da vida e morte.',
 'Uma das Orixás mais antigas da tradição Yorubá. Senhora da sabedoria ancestral, dos mistérios da vida e da morte.',
 'A anciã sábia. Guarda os segredos da vida e da morte, ensinando a respeitar todos os ciclos da existência.',
 '["Sabedoria","Tradição","Paciência","Mistério","Respeito aos antepassados"]',
 '["Lilás"]',
 '["Água","Lama","Terra"]',
 3, NULL, 'Casquinha Siri', 'Sábado', 'Romã', 'Salupa Nanã',
 true, NOW(), NOW()),

-- 4. Oxum
('Oxum',
 'Orixá das águas doces, rios e cachoeiras. Senhora do ouro e do amor.',
 'Tradição Yorubá — África Ocidental. Divindade das águas doces, senhora do ouro e do amor.',
 'Amor, beleza e fertilidade. Ensina a valorizar a doçura da vida e a beleza interior.',
 '["Amor","Beleza","Fertilidade","Doçura","Prosperidade"]',
 '["Dourado"]',
 '["Água doce","Ouro","Rios"]',
 4, NULL, 'Peixe água doce', 'Sábado', 'Melão', 'Aiê iê ô',
 true, NOW(), NOW()),

-- 5. Ogum
('Ogum',
 'Senhor do ferro e da guerra. Uma das divindades mais antigas da tradição Yorubá.',
 'Uma das divindades mais antigas da tradição Yorubá. Senhor do ferro e da guerra.',
 'O grande trabalhador. Importância do esforço e da dedicação para alcançar objetivos. Guerreiro da luz.',
 '["Trabalho","Perseverança","Coragem","Determinação","Proteção","Liderança","Honestidade","Força de vontade"]',
 '["Vermelho"]',
 '["Ferro","Metal","Terra","Fogo"]',
 5, NULL, 'Feijoada', 'Quinta', 'Lima da Pérsia', 'Ogunhê',
 true, NOW(), NOW()),

-- 6. Oxóssi
('Oxóssi',
 'O Orixá caçador, senhor das matas e da fartura. Sabedoria e conexão com a natureza.',
 'Tradição Yorubá — senhor das matas, da caça e da fartura.',
 'O provedor. Ensina a buscar o conhecimento e viver em harmonia com a natureza.',
 '["Sabedoria","Conhecimento","Prosperidade","Caça","Natureza","Fartura"]',
 '["Verde"]',
 '["Mata","Terra","Arco"]',
 6, NULL, 'Caça', 'Terça', 'Goiaba', 'Oxossi ê',
 true, NOW(), NOW()),

-- 7. Xangô
('Xangô',
 'Orixá da justiça, do fogo e do trovão. Rei poderoso que pune os injustos e protege os oprimidos.',
 'Tradição Yorubá — rei de Oyó. Orixá da justiça, do fogo e do trovão.',
 'Personificação da justiça divina. Toda ação tem consequências e a verdade sempre prevalece.',
 '["Justiça","Equilíbrio","Autoridade","Fogo","Trovão","Determinação"]',
 '["Marrom"]',
 '["Fogo","Pedra","Trovão"]',
 7, NULL, 'Rabada c/ guiabo', 'Quarta', 'Banana da terra', 'Kao Kabecile',
 true, NOW(), NOW()),

-- 8. Iansã
('Iansã',
 'Oyá na tradição Yorubá. Divindade dos ventos e tempestades. Esposa de Xangô.',
 'Conhecida como Oyá na tradição Yorubá. Divindade dos ventos, tempestades e esposa de Xangô.',
 'A guerreira da luz. Coragem para enfrentar as adversidades da vida.',
 '["Coragem","Justiça","Determinação","Liderança","Proteção","Transformação","Força","Independência"]',
 '["Alaranjado"]',
 '["Vento","Tempestade","Raio","Fogo"]',
 8, NULL, 'Acarajé', 'Quarta', 'Manga', 'Eparrey',
 true, NOW(), NOW()),

-- 9. Obaluaê / Omolu
('Obaluaê / Omolu',
 'Orixá da cura e das doenças. Na Casa Batuara, Obaluaê (aspecto mais velho) e Omolu (aspecto mais jovial) são tratados como complementares — o mesmo Orixá em dois momentos. Médico dos Orixás e senhor da vida e da morte.',
 'Tradição Yorubá — senhor das doenças e da cura. Também conhecido como Omolu.',
 'O grande curador. Saúde é o maior bem; cuidar do corpo e da alma.',
 '["Cura","Saúde","Doenças","Renovação","Ciclo da vida"]',
 '["Roxo"]',
 '["Terra","Lama","Palha"]',
 9, NULL, 'Carne de porco', 'Segunda', 'Pinha', 'Atoto Obaluaê',
 true, NOW(), NOW()),

-- 10. Ossain (campos de oferenda ausentes na apostila — preencher com a Casa)
('Ossain',
 'Orixá das folhas e ervas medicinais. Senhor do conhecimento das plantas curativas.',
 'Tradição Yorubá — senhor das folhas e ervas medicinais.',
 'O mestre das ervas. Propriedades medicinais das plantas e a cura natural.',
 '["Cura","Ervas","Medicina","Conhecimento ancestral","Natureza"]',
 '[]',
 '["Ervas","Terra","Folhas"]',
 10, NULL, NULL, NULL, NULL, NULL,
 true, NOW(), NOW()),

-- 11. Oxumarê (campos de oferenda ausentes na apostila — preencher com a Casa)
('Oxumarê',
 'Orixá da transformação, do movimento e da renovação. Representa o arco-íris e a serpente.',
 'Tradição Yorubá — representa o arco-íris e a serpente, símbolo da renovação e do movimento.',
 'O renovador. Toda situação pode ser transformada e a esperança sempre retorna.',
 '["Renovação","Transformação","Movimento","Esperança","Equilíbrio"]',
 '[]',
 '["Água","Serpente","Arco-íris"]',
 11, NULL, NULL, NULL, NULL, NULL,
 true, NOW(), NOW());


-- =============================================================================
-- 2. GUIAS E ENTIDADES (9 registros confirmados na apostila)
--    Exu e Pomba Gira: tratados como Entidades na Casa Batuara (tabela Guides)
--    Índio: REMOVIDO — não consta na apostila
-- =============================================================================

DELETE FROM batuara."Guides";

INSERT INTO batuara."Guides"
    ("Name", "Description", "Specialties", "DisplayOrder",
     "Comida", "Fruta", "DiaDaSemana", "Cor", "Saudacao",
     "IsActive", "CreatedAt", "UpdatedAt")
VALUES

-- 1. Exu (Entidade — não Orixá na Casa Batuara)
('Exu',
 'Entidade mensageira, guardiã dos caminhos e das encruzilhadas. Comunicadora entre os mundos espiritual e material. Na Casa Batuara é tratado como Entidade, não como Orixá.',
 '["Comunicação","Abertura de caminhos","Guarda de encruzilhadas","Movimento","Equilíbrio"]',
 1,
 'Fígado ou Miúdos de Frango', 'Figo da Índia', 'Segunda', 'Vermelho', 'Laroye Exu',
 true, NOW(), NOW()),

-- 2. Pomba Gira (Entidade — não Orixá na Casa Batuara)
('Pomba Gira',
 'Entidade feminina, guardiã das encruzilhadas e dos mistérios femininos. Na Casa Batuara é tratada como Entidade, não como Orixá.',
 '["Mistério","Feminilidade","Amor","Encantamento","Dualidade"]',
 2,
 'Fígado ou Miúdos de Frango', 'Figo ou Pera', 'Segunda', 'Preto', 'Laroye Pomba Gira',
 true, NOW(), NOW()),

-- 3. Preto Velho
('Preto Velho',
 'Espíritos de anciãos africanos, símbolos de sabedoria, paciência e humildade.',
 '["Sabedoria ancestral","Paciência infinita","Humildade profunda","Conselhos valiosos","Cura através da fé"]',
 3,
 'Feijão Preto s/ pertences', 'Caqui', 'Segunda-feira', 'Branco e Preto', 'Adorei as Almas',
 true, NOW(), NOW()),

-- 4. Baiano
('Baiano',
 'Entidades alegres e festeiras, vindas da Bahia. Conhecidos por sua sabedoria popular e humor.',
 '["Alegria contagiante","Sabedoria popular","Gosto por festas","Linguagem típica baiana","Proteção através da alegria"]',
 4,
 'Farofa', 'Coco / Caju', 'Quinta-feira', 'Amarelo e Vermelho', 'Salve Nosso Senhor do Bonfin',
 true, NOW(), NOW()),

-- 5. Erês
('Erês',
 'Espíritos de crianças, trazem alegria, pureza e inocência. Mensageiros da esperança.',
 '["Pureza de coração","Alegria contagiante","Inocência genuína","Brincadeiras e risos","Proteção das crianças"]',
 5,
 'Caruru', 'Doces', 'Domingo', 'Rosa e Azul', 'Aminbeijada',
 true, NOW(), NOW()),

-- 6. Boiadeiro
('Boiadeiro',
 'Espíritos de vaqueiros e trabalhadores rurais. Força e determinação.',
 '["Força e coragem","Determinação","Simplicidade","Proteção do gado","Trabalho árduo"]',
 6,
 'Arroz Carreteiro', 'Laranja Pera', 'Terça-feira', 'Marrom e Bege', 'Getruá seu Boiadeiro',
 true, NOW(), NOW()),

-- 7. Marinheiro
('Marinheiro',
 'Espíritos dos mares, navegadores experientes que trazem proteção nas viagens.',
 '["Conhecimento dos mares","Proteção em viagens","Aventura e coragem","Histórias fascinantes","Ligação com Iemanjá"]',
 7,
 'Peixe frito', 'Carambola', 'Sábado', 'Azul e Branco', 'Salve Nossa Sernhora dos Navegantes',
 true, NOW(), NOW()),

-- 8. Cigano
('Cigano',
 'Espíritos nômades, conhecedores dos mistérios, da magia e da leitura do destino.',
 '["Conhecimento místico","Leitura do destino","Liberdade de espírito","Magia e encantamentos","Proteção em viagens"]',
 8,
 'Pernil', 'Maçã', 'Sexta-feira', 'Dourado e Roxo', 'É de Ouro e Oriente',
 true, NOW(), NOW()),

-- 9. Malandro
('Malandro',
 'Espíritos urbanos, conhecedores da vida nas ruas. Trazem proteção e esperteza.',
 '["Esperteza urbana","Proteção nas ruas","Jogo de cintura","Conhecimento da vida","Humor e malandragem"]',
 9,
 'Buteco', 'Abacaxi', 'Quarta-feira', 'Preto e Branco', 'Salve a Malandragem',
 true, NOW(), NOW());


-- =============================================================================
-- 3. ORAÇÕES / CONTEÚDO ESPIRITUAL
--    Atualizar textos para os confirmados na apostila
--    NOTA: Não apaga registros existentes — apenas atualiza os 2 confirmados
--    pelo título. As demais orações ficam para decisão da Casa.
-- =============================================================================

-- Atualizar Prece de Cáritas (nome pode variar — atualiza por título)
UPDATE batuara."SpiritualContents"
SET "Title"   = 'Prece de Cáritas',
    "Content" = 'Deus nosso Pai, que sois Todo poder e bondade, daí a força àquele que passa pela provação, daí a luz àquele que procura a verdade, ponde no coração do homem a compaixão e a caridade. Deus, daí ao viajor a estrela guia, ao aflito a consolação, ao doente o repouso. Pai, daí ao culpado o arrependimento, ao espírito a verdade, à criança o guia, ao órfão o pai. Senhor, que a Vossa bondade se estenda sobre tudo que criaste. Piedade Senhor para aqueles que não Vos conhece, e esperança para aqueles que sofrem. Que a Vossa bondade permita aos espíritos consoladores derramarem por toda parte a paz, a esperança e a fé. Deus, um raio, uma faísca do Vosso amor pode abrasar a Terra. Deixai-nos beber nas fontes dessa bondade fecunda e infinita e todas as lágrimas secarão, todas as dores e acalmarão e um só coração, um só pensamento subirá até Vós, como um grito de reconhecimento e amor. Como Moisés sobre as montanhas, nós Vos esperamos com os braços abertos. Ó bondade, ó beleza, ó perfeição. E queremos de alguma sorte forçar a Vossa misericórdia. Deus, dai-nos a força de ajudar o progresso a fim de subirmos até Vós, dai-nos a caridade pura, dai-nos a fé e a razão, daí-nos a simplicidade, que fará de nossas almas um espelho onde se refletirá a sua Santa e Bendita Imagem. Que assim seja.',
    "Source"  = 'Apostila Batuara 2024 — Págs. 8 e 9',
    "UpdatedAt" = NOW()
WHERE "Title" IN ('Oração de Caritas', 'Prece de Cáritas', 'Prece de Caritas');

-- Atualizar Pai Nosso da Umbanda
UPDATE batuara."SpiritualContents"
SET "Content" = 'Pai Nosso que estás no céu, na Terra, no ar e em toda parte. Santificado seja o Vosso nome, em todo o momento de nossas vidas. Venha a nós o Vosso reino que é de paz, amor e perdão. Seja feita a Vossa vontade assim na Terra como no Céu. O pão nosso de cada dia, que nos daí hoje, nos destes ontem, e nos darás amanhã. Perdoai Senhor as nossas ofensas que por ventura te fizemos da mesma forma que perdoamos os nossos ofensores. E não nos deixei cair na tentação dos maus espíritos, Livrando-nos assim de todo mal, para que possamos fazer jus ao seu amor e perdão. Que assim seja.',
    "Source"  = 'Apostila Batuara 2024 — Págs. 8 e 9',
    "UpdatedAt" = NOW()
WHERE "Title" = 'Pai Nosso da Umbanda';


COMMIT;

-- =============================================================================
-- VERIFICAÇÃO PÓS-CARGA
-- =============================================================================
-- SELECT COUNT(*) FROM batuara."Orixas";           -- deve retornar 11
-- SELECT COUNT(*) FROM batuara."Guides";            -- deve retornar 9
-- SELECT "Name", "Saudacao", "Cor", "Fruta", "Comida", "DiaDaSemana"
--   FROM batuara."Orixas" ORDER BY "DisplayOrder";
-- SELECT "Name", "Saudacao", "Cor", "Fruta", "Comida", "DiaDaSemana"
--   FROM batuara."Guides" ORDER BY "DisplayOrder";
