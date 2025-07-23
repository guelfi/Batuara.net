-- Casa de Caridade Batuara - Seed Data para Orixás
-- Baseado na Apostila Batuara 2024 e ensinamentos da casa

-- Inserir dados dos Orixás conforme ensinamentos da Casa Batuara
INSERT INTO batuara."Orixas" (
    "Name", 
    "Description", 
    "Origin", 
    "BatuaraTeaching", 
    "DisplayOrder", 
    "Characteristics", 
    "Colors", 
    "Elements", 
    "IsActive", 
    "CreatedAt", 
    "UpdatedAt"
) VALUES 

-- Oxalá
(
    'Oxalá',
    'Oxalá é o maior dos Orixás, pai de todos os outros Orixás e de toda a humanidade. Representa a paz, a pureza, a sabedoria e a criação. É o Orixá da criação do mundo e dos seres humanos.',
    'Oxalá tem origem na tradição Yorubá da África, onde é conhecido como Obatalá. É considerado o criador da humanidade e o pai de todos os Orixás.',
    'Na Casa Batuara, Oxalá é reverenciado como o grande pai, aquele que nos ensina a humildade, a paciência e o amor incondicional. Seus ensinamentos nos mostram que através da paz interior e da pureza de coração podemos alcançar a elevação espiritual. Oxalá nos ensina que todos somos filhos de Deus e devemos nos tratar como irmãos.',
    1,
    '["Paciência", "Sabedoria", "Pureza", "Paz", "Criação", "Paternidade", "Humildade", "Amor incondicional"]',
    '["Branco", "Azul claro"]',
    '["Ar", "Éter", "Luz"]',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Yemanjá
(
    'Yemanjá',
    'Yemanjá é a mãe de todos os Orixás e rainha dos mares. Representa a maternidade, a fertilidade, a proteção e o amor maternal. É a grande mãe que acolhe e protege todos os seus filhos.',
    'Yemanjá tem origem na tradição Yorubá, onde é conhecida como Yemoja. É a divindade dos rios e mares, mãe de muitos Orixás e protetora das mulheres e crianças.',
    'A Casa Batuara tem especial devoção à Yemanjá, nossa mãe querida. Ela nos ensina o amor incondicional de mãe, a proteção aos necessitados e a importância da família espiritual. Yemanjá nos mostra que o amor maternal é a força mais poderosa do universo, capaz de curar, proteger e transformar. Em nossa casa, ela é celebrada como a mãe que nunca abandona seus filhos.',
    2,
    '["Maternidade", "Proteção", "Fertilidade", "Amor maternal", "Cura", "Acolhimento", "Generosidade", "Compaixão"]',
    '["Azul", "Branco", "Azul marinho", "Prata"]',
    '["Água", "Mar", "Rios", "Conchas"]',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Iansã
(
    'Iansã',
    'Iansã é a senhora dos ventos, tempestades e raios. Orixá guerreira, corajosa e determinada, que luta pela justiça e protege os oprimidos. É também a senhora dos eguns (espíritos dos mortos).',
    'Iansã, conhecida como Oyá na tradição Yorubá, é a divindade dos ventos e tempestades. É esposa de Xangô e uma das mais respeitadas guerreiras entre os Orixás.',
    'Na Casa Batuara, Iansã é reverenciada como a guerreira da luz, aquela que nos ensina a coragem para enfrentar as adversidades da vida. Ela nos mostra que devemos lutar pelos nossos ideais com determinação e justiça. Iansã nos ensina que a verdadeira força vem do coração puro e da fé inabalável. Ela também nos orienta no trabalho com os espíritos, ensinando-nos o respeito e a caridade para com aqueles que já partiram.',
    3,
    '["Coragem", "Justiça", "Determinação", "Liderança", "Proteção", "Transformação", "Força", "Independência"]',
    '["Amarelo", "Vermelho", "Coral", "Dourado"]',
    '["Vento", "Tempestade", "Raio", "Fogo"]',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Ogum
(
    'Ogum',
    'Ogum é o Orixá guerreiro, senhor do ferro, da tecnologia e dos caminhos. Representa o trabalho, a perseverança, a luta pelos objetivos e a abertura de novos caminhos na vida.',
    'Ogum é uma das divindades mais antigas da tradição Yorubá, conhecido como o senhor do ferro e da guerra. É o Orixá que ensina aos homens o uso dos metais e das ferramentas.',
    'A Casa Batuara ensina que Ogum é o grande trabalhador, aquele que nos mostra a importância do esforço e da dedicação para alcançar nossos objetivos. Ele nos ensina que através do trabalho honesto e da perseverança podemos vencer qualquer obstáculo. Ogum nos orienta a ser guerreiros da luz, lutando sempre pelo bem e pela justiça, mas sempre com amor no coração.',
    4,
    '["Trabalho", "Perseverança", "Coragem", "Determinação", "Proteção", "Liderança", "Honestidade", "Força de vontade"]',
    '["Azul escuro", "Vermelho", "Verde escuro"]',
    '["Ferro", "Metal", "Terra", "Fogo"]',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Oxóssi
(
    'Oxóssi',
    'Oxóssi é o Orixá caçador, senhor das matas e da fartura. Representa a abundância, a provisão, a conexão com a natureza e a sabedoria das florestas.',
    'Oxóssi é o grande caçador da tradição Yorubá, protetor das florestas e provedor de alimentos. É conhecido por sua precisão com o arco e flecha e sua conexão profunda com a natureza.',
    'Na Casa Batuara, Oxóssi é venerado como o provedor, aquele que nos ensina que Deus sempre provê para seus filhos. Ele nos mostra a importância de respeitarmos a natureza e vivermos em harmonia com ela. Oxóssi nos ensina a paciência do caçador, a precisão nos nossos objetivos e a gratidão pela abundância que recebemos. Ele nos orienta a ser provedores para nossa família e comunidade.',
    5,
    '["Abundância", "Provisão", "Paciência", "Precisão", "Conexão com a natureza", "Sabedoria", "Generosidade", "Proteção"]',
    '["Verde", "Azul", "Marrom", "Dourado"]',
    '["Floresta", "Terra", "Plantas", "Animais"]',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Xangô
(
    'Xangô',
    'Xangô é o Orixá da justiça, do fogo e dos raios. Rei poderoso e justo, representa a autoridade, a liderança, a justiça divina e o equilíbrio entre o poder e a sabedoria.',
    'Xangô foi um rei histórico de Oyó que se tornou Orixá após sua morte. É conhecido por sua justiça, poder e conexão com o fogo e os raios.',
    'A Casa Batuara reverencia Xangô como o rei justo, aquele que nos ensina a importância da justiça e da retidão em nossas ações. Ele nos mostra que o verdadeiro poder vem da sabedoria e da justiça, não da força bruta. Xangô nos ensina a ser líderes justos e compassivos, sempre buscando o equilíbrio e a harmonia. Ele nos orienta a usar nossa autoridade para proteger os mais fracos e promover a justiça.',
    6,
    '["Justiça", "Liderança", "Poder", "Sabedoria", "Equilíbrio", "Autoridade", "Proteção", "Nobreza"]',
    '["Vermelho", "Branco", "Marrom"]',
    '["Fogo", "Raio", "Pedra", "Madeira"]',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Oxum
(
    'Oxum',
    'Oxum é a Orixá das águas doces, do amor, da beleza e da prosperidade. Representa a feminilidade, a sensualidade, a riqueza e a capacidade de gerar e nutrir a vida.',
    'Oxum é a divindade dos rios e cachoeiras na tradição Yorubá, conhecida por sua beleza, vaidade e poder de cura. É uma das esposas de Xangô e mãe de muitos Orixás.',
    'Na Casa Batuara, Oxum é celebrada como a mãe da prosperidade e do amor. Ela nos ensina que a verdadeira riqueza está no amor que damos e recebemos. Oxum nos mostra a importância da autoestima, do cuidado com nossa aparência e nossa saúde. Ela nos ensina que podemos ser prósperos e abundantes quando vivemos com amor e gratidão. Oxum nos orienta no amor próprio e no amor ao próximo.',
    7,
    '["Amor", "Beleza", "Prosperidade", "Fertilidade", "Cura", "Sensualidade", "Vaidade", "Generosidade"]',
    '["Amarelo dourado", "Azul claro", "Rosa", "Dourado"]',
    '["Água doce", "Rios", "Cachoeiras", "Ouro"]',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Nanã
(
    'Nanã',
    'Nanã é a Orixá mais antiga, senhora da lama primordial, da sabedoria ancestral e da transformação. Representa a ancestralidade, a morte e o renascimento, a sabedoria dos mais velhos.',
    'Nanã Buruku é considerada a mais antiga das divindades Yorubás, anterior mesmo à descoberta do ferro. É a senhora da lama primordial de onde tudo surge e para onde tudo retorna.',
    'A Casa Batuara venera Nanã como a grande avó, a ancestral que nos conecta com a sabedoria dos antepassados. Ela nos ensina o respeito aos mais velhos e a importância da tradição. Nanã nos mostra que a morte é apenas uma transformação e que devemos honrar aqueles que vieram antes de nós. Ela nos orienta na aceitação dos ciclos da vida e na compreensão de que tudo tem seu tempo.',
    8,
    '["Ancestralidade", "Sabedoria", "Transformação", "Paciência", "Tradição", "Respeito", "Ciclos da vida", "Memória"]',
    '["Roxo", "Azul escuro", "Branco", "Lilás"]',
    '["Lama", "Barro", "Terra úmida", "Pântano"]',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Comentários sobre os dados inseridos
COMMENT ON TABLE batuara."Orixas" IS 'Dados dos Orixás baseados nos ensinamentos da Casa de Caridade Batuara e Apostila Batuara 2024';