-- Casa de Caridade Batuara - Seed Data para Linhas da Umbanda
-- Baseado na Apostila Batuara 2024 e interpretações específicas da casa

-- Inserir dados das Linhas da Umbanda conforme interpretação da Casa Batuara
INSERT INTO batuara."UmbandaLines" (
    "Name", 
    "Description", 
    "Characteristics", 
    "BatuaraInterpretation", 
    "DisplayOrder", 
    "Entities", 
    "WorkingDays", 
    "IsActive", 
    "CreatedAt", 
    "UpdatedAt"
) VALUES 

-- Linha de Oxalá
(
    'Linha de Oxalá',
    'A Linha de Oxalá é a linha da paz, da fé e da elevação espiritual. Trabalha com a energia da criação, da purificação e da conexão com o divino.',
    'Entidades desta linha trabalham com energias de paz, harmonia, fé, purificação espiritual e elevação da consciência. São espíritos de grande luz que auxiliam na cura espiritual e no desenvolvimento mediúnico.',
    'Na Casa Batuara, a Linha de Oxalá é considerada a linha mestra, aquela que rege todas as outras. Nossos guias desta linha nos ensinam que a verdadeira força está na humildade e no amor. Eles trabalham principalmente na cura espiritual, no desenvolvimento da mediunidade e na orientação para a evolução espiritual. São espíritos de grande elevação que nos ajudam a compreender os ensinamentos de Jesus.',
    1,
    '["Pai João de Oxalá", "Vovô Benedito", "Pai Francisco", "Vovó Maria Conga", "Caboclo Pena Branca"]',
    '["Domingo", "Quinta-feira"]',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Linha de Yemanjá
(
    'Linha de Yemanjá',
    'A Linha de Yemanjá trabalha com as energias do amor maternal, da proteção, da cura emocional e da purificação através das águas.',
    'Entidades desta linha são conhecidas por seu amor maternal, proteção às famílias, cura de traumas emocionais e limpeza espiritual. Trabalham especialmente com mulheres, crianças e questões familiares.',
    'Na Casa Batuara, a Linha de Yemanjá é muito querida e respeitada. Nossos guias desta linha são verdadeiras mães espirituais que acolhem a todos com amor incondicional. Eles trabalham principalmente na cura emocional, na proteção das famílias e na orientação para as mães. Ensinam-nos que o amor de mãe é a força mais poderosa para a cura e transformação.',
    2,
    '["Mãe Yara", "Sereia do Mar", "Cabocla Jurema", "Vovó Cambinda", "Mãe Oxum"]',
    '["Sábado", "Segunda-feira"]',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Linha dos Caboclos
(
    'Linha dos Caboclos',
    'A Linha dos Caboclos trabalha com as energias da natureza, da cura através das ervas, da força e da conexão com os elementos naturais.',
    'Os Caboclos são espíritos de índios que trabalham com a força da natureza, conhecimento das ervas medicinais, proteção e cura. São guerreiros da luz que defendem a justiça e protegem os necessitados.',
    'Na Casa Batuara, os Caboclos são nossos grandes protetores e curadores. Eles nos ensinam o respeito pela natureza e o uso das plantas para a cura. Nossos Caboclos trabalham com muita força e determinação, sempre prontos a defender seus filhos e a promover a justiça. Eles nos orientam sobre a importância de viver em harmonia com a natureza e de usar seus recursos com sabedoria e gratidão.',
    3,
    '["Caboclo Pena Verde", "Cabocla Jurema", "Caboclo Sete Flechas", "Cabocla Jandira", "Caboclo Tupinambá"]',
    '["Terça-feira", "Quinta-feira"]',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Linha dos Pretos Velhos
(
    'Linha dos Pretos Velhos',
    'A Linha dos Pretos Velhos trabalha com as energias da sabedoria, da paciência, da humildade e da cura através do amor e da experiência de vida.',
    'Os Pretos Velhos são espíritos de grande sabedoria e humildade, que trazem conselhos, cura espiritual e emocional. Trabalham com paciência, amor incondicional e conhecimento adquirido através de muitas experiências de vida.',
    'Na Casa Batuara, os Pretos Velhos são nossos conselheiros mais queridos. Eles nos ensinam através de suas histórias e experiências, sempre com muito amor e paciência. Nossos Pretos Velhos trabalham principalmente no aconselhamento, na cura de traumas emocionais e na orientação espiritual. Eles nos mostram que a verdadeira sabedoria vem da humildade e do amor ao próximo.',
    4,
    '["Pai João", "Vovó Cambinda", "Pai Benedito", "Vovó Maria Conga", "Pai Francisco"]',
    '["Domingo", "Segunda-feira"]',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Linha das Crianças
(
    'Linha das Crianças',
    'A Linha das Crianças trabalha com as energias da alegria, da pureza, da simplicidade e da renovação espiritual.',
    'As entidades desta linha são espíritos de crianças que trazem alegria, descontração, pureza de coração e renovação das energias. Trabalham especialmente na cura interior e na reconexão com nossa criança interior.',
    'Na Casa Batuara, as Crianças são muito amadas e respeitadas. Elas nos ensinam a simplicidade, a alegria de viver e a importância de manter a pureza do coração. Nossos guias mirins trabalham principalmente na cura da criança interior, na renovação das energias e na proteção das crianças. Eles nos lembram que devemos manter sempre viva nossa capacidade de se alegrar com as coisas simples da vida.',
    5,
    '["Cosme", "Damião", "Doum", "Mariazinha", "Pedrinho"]',
    '["Domingo", "Quarta-feira"]',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Linha dos Exus
(
    'Linha dos Exus',
    'A Linha dos Exus trabalha com as energias de proteção, limpeza espiritual, abertura de caminhos e quebra de demandas negativas.',
    'Os Exus são guardiões e protetores que trabalham na limpeza espiritual, proteção contra energias negativas, abertura de caminhos e resolução de problemas materiais. São espíritos que conhecem bem as dificuldades da vida material.',
    'Na Casa Batuara, os Exus são respeitados como nossos guardiões e protetores. Eles trabalham incansavelmente para nos proteger das energias negativas e abrir nossos caminhos. Nossos Exus nos ensinam que devemos enfrentar as dificuldades com coragem e determinação. Eles trabalham principalmente na proteção, limpeza espiritual e resolução de problemas práticos da vida.',
    6,
    '["Exu Tranca Rua", "Exu Sete Encruzilhadas", "Exu Marabô", "Pomba Gira Maria Padilha", "Exu Caveira"]',
    '["Segunda-feira", "Sexta-feira"]',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Linha dos Boiadeiros
(
    'Linha dos Boiadeiros',
    'A Linha dos Boiadeiros trabalha com as energias do trabalho, da perseverança, da simplicidade e da conexão com a terra.',
    'Os Boiadeiros são espíritos de trabalhadores rurais que trazem a energia do trabalho honesto, da perseverança, da simplicidade e do amor pela terra. Trabalham especialmente em questões relacionadas ao trabalho e sustento.',
    'Na Casa Batuara, os Boiadeiros são admirados por sua simplicidade e dedicação ao trabalho. Eles nos ensinam o valor do trabalho honesto e da perseverança para alcançar nossos objetivos. Nossos Boiadeiros trabalham principalmente em questões relacionadas ao trabalho, sustento da família e conexão com a natureza. Eles nos mostram que através do trabalho digno podemos alcançar nossa evolução espiritual.',
    7,
    '["Boiadeiro João", "Boiadeiro José", "Boiadeira Maria", "Boiadeiro Pedro", "Boiadeiro Antônio"]',
    '["Terça-feira", "Sábado"]',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Linha dos Marinheiros
(
    'Linha dos Marinheiros',
    'A Linha dos Marinheiros trabalha com as energias das águas, da navegação pelos caminhos da vida, da aventura e da superação de obstáculos.',
    'Os Marinheiros são espíritos ligados ao mar e às águas que trabalham na orientação para navegar pelas dificuldades da vida, superação de obstáculos e renovação das energias através das águas.',
    'Na Casa Batuara, os Marinheiros são conhecidos por sua alegria e capacidade de nos ajudar a superar as tempestades da vida. Eles nos ensinam a navegar com sabedoria pelos desafios que enfrentamos. Nossos Marinheiros trabalham principalmente na superação de dificuldades, renovação de energias e orientação para encontrar novos rumos na vida.',
    8,
    '["Marinheiro João", "Marinheiro José", "Tarimba", "Marinheiro Pedro", "Capitão Bento"]',
    '["Quarta-feira", "Sábado"]',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Comentários sobre os dados inseridos
COMMENT ON TABLE batuara."UmbandaLines" IS 'Dados das Linhas da Umbanda baseados na interpretação específica da Casa de Caridade Batuara';