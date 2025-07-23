-- Casa de Caridade Batuara - Seed Data para Conteúdos Espirituais
-- Baseado na Apostila Batuara 2024 e materiais específicos da casa

-- Inserir conteúdos espirituais da Casa Batuara
INSERT INTO batuara."SpiritualContents" (
    "Title", 
    "Content", 
    "Type", 
    "Category", 
    "Source", 
    "DisplayOrder", 
    "IsFeatured", 
    "IsActive", 
    "CreatedAt", 
    "UpdatedAt"
) VALUES 

-- Pai Nosso da Umbanda (Oração principal da casa)
(
    'Pai Nosso da Umbanda',
    'Pai nosso que estais no infinito,
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
Saravá!',
    1, -- Prayer
    1, -- Umbanda
    'Apostila Batuara 2024',
    1,
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Ave Maria da Umbanda
(
    'Ave Maria da Umbanda',
    'Ave Maria cheia de graça,
O Senhor é convosco,
Bendita sois vós entre as mulheres,
E bendito é o fruto do vosso ventre, Jesus.

Santa Maria, Mãe de Deus,
Rogai por nós pecadores,
Agora e na hora de nossa morte.
Amém.

Salve a Virgem da Conceição,
Mãe Yemanjá do mar,
Salve a Mãe Oxum dourada,
Que veio nos abençoar.
Saravá!',
    1, -- Prayer
    1, -- Umbanda
    'Apostila Batuara 2024',
    2,
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Oração de Oxalá
(
    'Oração de Oxalá',
    'Pai Oxalá, criador de todas as coisas,
Senhor da paz e da sabedoria,
Iluminai nossos caminhos com vossa luz divina,
Dai-nos força para vencer as dificuldades.

Ensinai-nos a humildade e a paciência,
Para que possamos crescer espiritualmente,
Protegei nossa família espiritual,
E abençoai todos os filhos de fé.

Que vossa paz reine em nossos corações,
E que vossa sabedoria nos guie sempre,
Para que possamos ser instrumentos de amor,
Na obra de caridade e fraternidade.

Salve Pai Oxalá!
Saravá!',
    1, -- Prayer
    4, -- Orixás
    'Casa de Caridade Batuara',
    3,
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Oração de Yemanjá
(
    'Oração de Yemanjá',
    'Mãe Yemanjá, rainha dos mares,
Mãe de todos os Orixás,
Acolhei-nos em vosso manto de amor,
Protegei-nos com vossa benção maternal.

Purificai nossos corações com vossas águas sagradas,
Lavai nossas mágoas e tristezas,
Dai-nos força para superar as dificuldades,
E amor para perdoar as ofensas.

Protegei nossas famílias,
Abençoai nossos filhos,
Guiai-nos pelos caminhos da vida,
Com vossa sabedoria e amor.

Salve Mãe Yemanjá!
Odoyá!',
    1, -- Prayer
    4, -- Orixás
    'Casa de Caridade Batuara',
    4,
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Ensinamento sobre Caridade
(
    'A Caridade Segundo os Ensinamentos da Casa Batuara',
    'A caridade é o fundamento de toda a nossa doutrina. Não se trata apenas de dar esmolas ou ajudar materialmente, mas sim de amar verdadeiramente ao próximo como a nós mesmos.

A verdadeira caridade começa no coração. É preciso ter compaixão, compreensão e amor por todos os seres, independentemente de sua condição social, raça ou religião. Jesus nos ensinou que devemos amar até mesmo nossos inimigos.

Na Casa Batuara, praticamos a caridade de várias formas:
- Através da assistência espiritual gratuita
- Do atendimento aos necessitados
- Da orientação e consolação aos aflitos
- Do ensino da doutrina espírita e umbandista
- Da promoção da fraternidade entre todos

Lembrem-se sempre: "Fora da caridade não há salvação". Este é o lema que deve guiar todas as nossas ações.',
    2, -- Teaching
    3, -- General
    'Apostila Batuara 2024',
    5,
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Ensinamento sobre Mediunidade
(
    'A Mediunidade na Casa Batuara',
    'A mediunidade é um dom divino que deve ser desenvolvido com responsabilidade, estudo e muita oração. Todo médium é um instrumento de Deus para levar consolação e orientação aos necessitados.

Princípios fundamentais para o desenvolvimento mediúnico:

1. ESTUDO: É fundamental conhecer a doutrina espírita e os ensinamentos da Umbanda para compreender os fenômenos mediúnicos.

2. ORAÇÃO: A oração é o alimento da alma e a proteção do médium. Ore sempre antes e depois dos trabalhos.

3. DISCIPLINA: A mediunidade exige disciplina mental, emocional e física. Mantenha hábitos saudáveis.

4. HUMILDADE: O médium deve ser humilde, reconhecendo que é apenas um instrumento dos espíritos superiores.

5. CARIDADE: Use sua mediunidade sempre para o bem, nunca para benefício próprio ou para prejudicar alguém.

6. REFORMA ÍNTIMA: Trabalhe constantemente seu próprio aperfeiçoamento moral e espiritual.

Lembrem-se: "Dai de graça o que de graça recebestes".',
    2, -- Teaching
    3, -- General
    'Apostila Batuara 2024',
    6,
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Doutrina sobre os Orixás
(
    'Os Orixás na Visão da Casa Batuara',
    'Os Orixás são manifestações divinas, aspectos de Deus que se apresentam para nos ensinar e orientar. Cada Orixá representa virtudes e qualidades que devemos desenvolver em nós mesmos.

Na Casa Batuara, compreendemos os Orixás como:

OXALÁ - O Pai Criador, que nos ensina a paz, a paciência e a sabedoria.
YEMANJÁ - A Mãe Universal, que nos ensina o amor incondicional e a proteção.
IANSÃ - A Guerreira da Justiça, que nos ensina a coragem e a determinação.
OGUM - O Trabalhador Incansável, que nos ensina a perseverança e a honestidade.
OXÓSSI - O Provedor, que nos ensina a abundância e a gratidão.
XANGÔ - O Rei Justo, que nos ensina a liderança e a justiça.
OXUM - A Mãe da Prosperidade, que nos ensina o amor próprio e a generosidade.
NANÃ - A Ancestral Sábia, que nos ensina o respeito e a tradição.

Cada Orixá tem seus ensinamentos específicos, mas todos nos conduzem ao mesmo objetivo: a evolução espiritual através do amor e da caridade.',
    3, -- Doctrine
    4, -- Orixás
    'Apostila Batuara 2024',
    7,
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Ponto Cantado de Oxalá
(
    'Ponto de Oxalá - Pai da Criação',
    'Oxalá, meu Pai,
Senhor da criação,
Iluminai os caminhos,
Do vosso filho irmão.

Com vossa luz divina,
Clareai a escuridão,
Dai força e esperança,
A todo coração.

Salve o Pai Oxalá,
Senhor da paz e amor,
Protegei vossos filhos,
Com vossa benção, Senhor.

Saravá Oxalá!
Saravá meu Pai!
Na luz da caridade,
Nosso amor não sai.',
    4, -- Hymn
    4, -- Orixás
    'Casa de Caridade Batuara',
    8,
    false,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Ponto Cantado de Yemanjá
(
    'Ponto de Yemanjá - Mãe do Mar',
    'Yemanjá, Yemanjá,
Rainha do mar,
Vossas ondas sagradas,
Vêm nos abençoar.

Mãe querida e amada,
Estrela do mar,
Protegei vossos filhos,
Onde quer que estejam a caminhar.

Odoyá, Yemanjá,
Mãe do coração,
Dai-nos vossa benção,
E vossa proteção.

Salve a Mãe Yemanjá!
Rainha do mar azul!
Vossa luz nos guia,
Do norte ao sul.',
    4, -- Hymn
    4, -- Orixás
    'Casa de Caridade Batuara',
    9,
    false,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),

-- Ritual de Abertura dos Trabalhos
(
    'Ritual de Abertura dos Trabalhos',
    'RITUAL DE ABERTURA DOS TRABALHOS ESPIRITUAIS

1. CONCENTRAÇÃO (5 minutos em silêncio)
   - Todos em pé, em concentração
   - Mentalizar luz branca envolvendo o ambiente
   - Pedir proteção aos mentores espirituais

2. ORAÇÃO INICIAL
   - Pai Nosso da Umbanda
   - Ave Maria da Umbanda
   - Oração de Oxalá

3. DEFUMAÇÃO
   - Defumar todo o ambiente com ervas sagradas
   - Começar pelo altar, depois os médiuns e assistência
   - Mentalizar limpeza e proteção

4. PONTOS CANTADOS DE ABERTURA
   - Ponto de Oxalá
   - Ponto de Yemanjá
   - Ponto dos Caboclos
   - Ponto dos Pretos Velhos

5. CHAMADA DOS MENTORES
   - Invocar os guias chefes da casa
   - Pedir proteção e orientação
   - Abrir os trabalhos em nome de Jesus

OBSERVAÇÕES:
- Manter sempre o respeito e a seriedade
- Todos devem participar com fé e devoção
- O dirigente conduz todo o ritual',
    5, -- Ritual
    1, -- Umbanda
    'Apostila Batuara 2024',
    10,
    false,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Comentários sobre os dados inseridos
COMMENT ON TABLE batuara."SpiritualContents" IS 'Conteúdos espirituais da Casa de Caridade Batuara baseados na Apostila Batuara 2024';