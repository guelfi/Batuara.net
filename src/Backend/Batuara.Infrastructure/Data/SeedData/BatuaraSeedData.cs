using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Batuara.Domain.Entities;
using Batuara.Domain.ValueObjects;
using Batuara.Domain.Enums;

namespace Batuara.Infrastructure.Data.SeedData
{
    public static class BatuaraSeedData
    {
        public static async Task SeedAsync(BatuaraDbContext context, ILogger logger)
        {
            try
            {
                logger.LogInformation("Iniciando seed data da Casa de Caridade Batuara...");

                await SeedOrixasAsync(context, logger);
                await SeedGuidesAsync(context, logger);
                await SeedUmbandaLinesAsync(context, logger);
                await SeedSpiritualContentAsync(context, logger);
                await SeedEventsAsync(context, logger);
                await SeedCalendarAttendancesAsync(context, logger);
                await SeedSiteSettingsAsync(context, logger);

                logger.LogInformation("Seed data da Casa de Caridade Batuara concluído com sucesso!");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erro durante o seed data da Casa de Caridade Batuara");
                throw;
            }
        }

        private static async Task SeedOrixasAsync(BatuaraDbContext context, ILogger logger)
        {
            if (await context.Orixas.AnyAsync())
            {
                logger.LogInformation("Orixás já existem no banco. Seed desta entidade ignorado.");
                return;
            }

            logger.LogInformation("Inserindo dados dos Orixás (Apostila Batuara 2024)...");

            var orixas = new List<Orixa>
            {
                new Orixa(
                    "Oxalá",
                    "Tem origem na tradição Yorubá, onde é conhecido como Obatalá. Criador da humanidade e pai de todos os Orixás.",
                    "Tradição Yorubá — África Ocidental. Conhecido como Obatalá, o criador da humanidade e pai de todos os Orixás.",
                    "Reverenciado como o grande pai. Ensina humildade, paciência e amor incondicional. A paz interior e pureza de coração levam à elevação espiritual.",
                    new[] { "Paciência", "Sabedoria", "Pureza", "Paz", "Criação", "Paternidade", "Humildade", "Amor incondicional" },
                    new[] { "Branco" },
                    new[] { "Ar", "Éter", "Luz" },
                    1
                ),
                new Orixa(
                    "Iemanjá",
                    "Divindade dos rios e mares, mãe de muitos Orixás e protetora das mulheres e crianças.",
                    "Tradição Yorubá — África Ocidental. Conhecida como Yemoja, divindade dos rios e mares.",
                    "Amor incondicional de mãe, proteção aos necessitados e importância da família espiritual. Mãe que nunca abandona seus filhos.",
                    new[] { "Maternidade", "Proteção", "Fertilidade", "Amor maternal", "Cura", "Acolhimento", "Generosidade", "Compaixão" },
                    new[] { "Azul" },
                    new[] { "Água", "Mar", "Rios", "Conchas" },
                    2
                ),
                new Orixa(
                    "Nanã",
                    "Uma das mais antigas Orixás femininas. Senhora da sabedoria ancestral e dos mistérios da vida e morte.",
                    "Uma das Orixás mais antigas da tradição Yorubá. Senhora da sabedoria ancestral, dos mistérios da vida e da morte.",
                    "A anciã sábia. Guarda os segredos da vida e da morte, ensinando a respeitar todos os ciclos da existência.",
                    new[] { "Sabedoria", "Tradição", "Paciência", "Mistério", "Respeito aos antepassados" },
                    new[] { "Lilás" },
                    new[] { "Água", "Lama", "Terra" },
                    3
                ),
                new Orixa(
                    "Oxum",
                    "Orixá das águas doces, rios e cachoeiras. Senhora do ouro e do amor.",
                    "Tradição Yorubá — África Ocidental. Divindade das águas doces, senhora do ouro e do amor.",
                    "Amor, beleza e fertilidade. Ensina a valorizar a doçura da vida e a beleza interior.",
                    new[] { "Amor", "Beleza", "Fertilidade", "Doçura", "Prosperidade" },
                    new[] { "Dourado" },
                    new[] { "Água doce", "Ouro", "Rios" },
                    4
                ),
                new Orixa(
                    "Ogum",
                    "Senhor do ferro e da guerra. Uma das divindades mais antigas da tradição Yorubá.",
                    "Uma das divindades mais antigas da tradição Yorubá. Senhor do ferro e da guerra.",
                    "O grande trabalhador. Importância do esforço e da dedicação para alcançar objetivos. Guerreiro da luz.",
                    new[] { "Trabalho", "Perseverança", "Coragem", "Determinação", "Proteção", "Liderança", "Honestidade", "Força de vontade" },
                    new[] { "Vermelho" },
                    new[] { "Ferro", "Metal", "Terra", "Fogo" },
                    5
                ),
                new Orixa(
                    "Oxóssi",
                    "O Orixá caçador, senhor das matas e da fartura. Sabedoria e conexão com a natureza.",
                    "Tradição Yorubá — senhor das matas, da caça e da fartura.",
                    "O provedor. Ensina a buscar o conhecimento e viver em harmonia com a natureza.",
                    new[] { "Sabedoria", "Conhecimento", "Prosperidade", "Caça", "Natureza", "Fartura" },
                    new[] { "Verde" },
                    new[] { "Mata", "Terra", "Arco" },
                    6
                ),
                new Orixa(
                    "Xangô",
                    "Orixá da justiça, do fogo e do trovão. Rei poderoso que pune os injustos e protege os oprimidos.",
                    "Tradição Yorubá — rei de Oyó. Orixá da justiça, do fogo e do trovão.",
                    "Personificação da justiça divina. Toda ação tem consequências e a verdade sempre prevalece.",
                    new[] { "Justiça", "Equilíbrio", "Autoridade", "Fogo", "Trovão", "Determinação" },
                    new[] { "Marrom" },
                    new[] { "Fogo", "Pedra", "Trovão" },
                    7
                ),
                new Orixa(
                    "Iansã",
                    "Oyá na tradição Yorubá. Divindade dos ventos e tempestades. Esposa de Xangô.",
                    "Conhecida como Oyá na tradição Yorubá. Divindade dos ventos, tempestades e esposa de Xangô.",
                    "A guerreira da luz. Coragem para enfrentar as adversidades da vida.",
                    new[] { "Coragem", "Justiça", "Determinação", "Liderança", "Proteção", "Transformação", "Força", "Independência" },
                    new[] { "Alaranjado" },
                    new[] { "Vento", "Tempestade", "Raio", "Fogo" },
                    8
                ),
                new Orixa(
                    "Obaluaê / Omolu",
                    "Orixá da cura e das doenças. Na Casa Batuara, Obaluaê (aspecto mais velho) e Omolu (aspecto mais jovial) são tratados como complementares — o mesmo Orixá em dois momentos. Médico dos Orixás e senhor da vida e da morte.",
                    "Tradição Yorubá — senhor das doenças e da cura. Também conhecido como Omolu.",
                    "O grande curador. Saúde é o maior bem; cuidar do corpo e da alma.",
                    new[] { "Cura", "Saúde", "Doenças", "Renovação", "Ciclo da vida" },
                    new[] { "Roxo" },
                    new[] { "Terra", "Lama", "Palha" },
                    9
                ),
                new Orixa(
                    "Ossain",
                    "Orixá das folhas e ervas medicinais. Senhor do conhecimento das plantas curativas.",
                    "Tradição Yorubá — senhor das folhas e ervas medicinais.",
                    "O mestre das ervas. Propriedades medicinais das plantas e a cura natural.",
                    new[] { "Cura", "Ervas", "Medicina", "Conhecimento ancestral", "Natureza" },
                    new[] { "Verde" },
                    new[] { "Ervas", "Terra", "Folhas" },
                    10
                ),
                new Orixa(
                    "Oxumarê",
                    "Orixá da transformação, do movimento e da renovação. Representa o arco-íris e a serpente.",
                    "Tradição Yorubá — representa o arco-íris e a serpente, símbolo da renovação e do movimento.",
                    "O renovador. Toda situação pode ser transformada e a esperança sempre retorna.",
                    new[] { "Renovação", "Transformação", "Movimento", "Esperança", "Equilíbrio" },
                    new[] { "Arco-íris" },
                    new[] { "Água", "Serpente", "Arco-íris" },
                    11
                )
            };

            foreach (var orixa in orixas)
            {
                orixa.UpdateExtendedInfo(
                    orixa.Name switch
                    {
                        "Oxalá"         => "Canjica",
                        "Iemanjá"       => "Peixe (Água Salgada)",
                        "Nanã"          => "Casquinha Siri",
                        "Oxum"          => "Peixe água doce",
                        "Ogum"          => "Feijoada",
                        "Oxóssi"        => "Caça",
                        "Xangô"         => "Rabada c/ guiabo",
                        "Iansã"         => "Acarajé",
                        "Obaluaê / Omolu" => "Carne de porco",
                        _               => null
                    },
                    orixa.Name switch
                    {
                        "Oxalá"         => "Sexta",
                        "Iemanjá"       => "Sábado",
                        "Nanã"          => "Sábado",
                        "Oxum"          => "Sábado",
                        "Ogum"          => "Quinta",
                        "Oxóssi"        => "Terça",
                        "Xangô"         => "Quarta",
                        "Iansã"         => "Quarta",
                        "Obaluaê / Omolu" => "Segunda",
                        _               => null
                    },
                    orixa.Name switch
                    {
                        "Oxalá"         => "Uva Branca",
                        "Iemanjá"       => "Mamão Papaya",
                        "Nanã"          => "Romã",
                        "Oxum"          => "Melão",
                        "Ogum"          => "Lima da Pérsia",
                        "Oxóssi"        => "Goiaba",
                        "Xangô"         => "Banana da terra",
                        "Iansã"         => "Manga",
                        "Obaluaê / Omolu" => "Pinha",
                        _               => null
                    },
                    orixa.Name switch
                    {
                        "Oxalá"         => "Epa babá",
                        "Iemanjá"       => "Odocya",
                        "Nanã"          => "Salupa Nanã",
                        "Oxum"          => "Aiê iê ô",
                        "Ogum"          => "Ogunhê",
                        "Oxóssi"        => "Oxossi ê",
                        "Xangô"         => "Kao Kabecile",
                        "Iansã"         => "Eparrey",
                        "Obaluaê / Omolu" => "Atoto Obaluaê",
                        _               => null
                    }
                );
            }

            await context.Orixas.AddRangeAsync(orixas);
            await context.SaveChangesAsync();
            logger.LogInformation($"Inseridos {orixas.Count} Orixás");
        }

        private static async Task SeedGuidesAsync(BatuaraDbContext context, ILogger logger)
        {
            if (await context.Guides.AnyAsync())
            {
                logger.LogInformation("Guias e Entidades já existem no banco. Seed desta entidade ignorado.");
                return;
            }

            logger.LogInformation("Inserindo dados dos Guias e Entidades (Apostila Batuara 2024)...");

            var guides = new[]
            {
                new GuideEntity(
                    "Exu",
                    "Entidade mensageira, guardiã dos caminhos e das encruzilhadas. Na Casa Batuara é tratado como Entidade, não como Orixá.",
                    new[] { "Comunicação", "Abertura de caminhos", "Guarda de encruzilhadas", "Movimento", "Equilíbrio" },
                    1, "Fígado ou Miúdos de Frango", "Figo da Índia", "Segunda", "Vermelho", "Laroye Exu"),
                new GuideEntity(
                    "Pomba Gira",
                    "Entidade feminina, guardiã das encruzilhadas e dos mistérios femininos. Na Casa Batuara é tratada como Entidade, não como Orixá.",
                    new[] { "Mistério", "Feminilidade", "Amor", "Encantamento", "Dualidade" },
                    2, "Fígado ou Miúdos de Frango", "Figo ou Pera", "Segunda", "Preto", "Laroye Pomba Gira"),
                new GuideEntity(
                    "Preto Velho",
                    "Espíritos de anciãos africanos, símbolos de sabedoria, paciência e humildade.",
                    new[] { "Sabedoria ancestral", "Paciência infinita", "Humildade profunda", "Conselhos valiosos", "Cura através da fé" },
                    3, "Feijão Preto s/ pertences", "Caqui", "Segunda-feira", "Branco e Preto", "Adorei as Almas"),
                new GuideEntity(
                    "Baiano",
                    "Entidades alegres e festeiras, vindas da Bahia. Conhecidos por sua sabedoria popular e humor.",
                    new[] { "Alegria contagiante", "Sabedoria popular", "Gosto por festas", "Linguagem típica baiana", "Proteção através da alegria" },
                    4, "Farofa", "Coco / Caju", "Quinta-feira", "Amarelo e Vermelho", "Salve Nosso Senhor do Bonfin"),
                new GuideEntity(
                    "Erês",
                    "Espíritos de crianças, trazem alegria, pureza e inocência. Mensageiros da esperança.",
                    new[] { "Pureza de coração", "Alegria contagiante", "Inocência genuína", "Brincadeiras e risos", "Proteção das crianças" },
                    5, "Caruru", "Doces", "Domingo", "Rosa e Azul", "Aminbeijada"),
                new GuideEntity(
                    "Boiadeiro",
                    "Espíritos de vaqueiros e trabalhadores rurais. Força e determinação.",
                    new[] { "Força e coragem", "Determinação", "Simplicidade", "Proteção do gado", "Trabalho árduo" },
                    6, "Arroz Carreteiro", "Laranja Pera", "Terça-feira", "Marrom e Bege", "Getruá seu Boiadeiro"),
                new GuideEntity(
                    "Marinheiro",
                    "Espíritos dos mares, navegadores experientes que trazem proteção nas viagens.",
                    new[] { "Conhecimento dos mares", "Proteção em viagens", "Aventura e coragem", "Histórias fascinantes", "Ligação com Iemanjá" },
                    7, "Peixe frito", "Carambola", "Sábado", "Azul e Branco", "Salve Nossa Sernhora dos Navegantes"),
                new GuideEntity(
                    "Cigano",
                    "Espíritos nômades, conhecedores dos mistérios, da magia e da leitura do destino.",
                    new[] { "Conhecimento místico", "Leitura do destino", "Liberdade de espírito", "Magia e encantamentos", "Proteção em viagens" },
                    8, "Pernil", "Maçã", "Sexta-feira", "Dourado e Roxo", "É de Ouro e Oriente"),
                new GuideEntity(
                    "Malandro",
                    "Espíritos urbanos, conhecedores da vida nas ruas. Trazem proteção e esperteza.",
                    new[] { "Esperteza urbana", "Proteção nas ruas", "Jogo de cintura", "Conhecimento da vida", "Humor e malandragem" },
                    9, "Buteco", "Abacaxi", "Quarta-feira", "Preto e Branco", "Salve a Malandragem")
            };

            await context.Guides.AddRangeAsync(guides);
            await context.SaveChangesAsync();
            logger.LogInformation($"Inseridos {guides.Length} Guias e Entidades");
        }

        private static async Task SeedUmbandaLinesAsync(BatuaraDbContext context, ILogger logger)
        {
            if (await context.UmbandaLines.AnyAsync())
            {
                logger.LogInformation("Linhas da Umbanda já existem no banco. Seed desta entidade ignorado.");
                return;
            }

            logger.LogInformation("Inserindo dados das Linhas da Umbanda...");

            var umbandaLines = new[]
            {
                new UmbandaLine(
                    "Linha de Oxalá",
                    "A Linha de Oxalá é a linha da paz, da fé e da elevação espiritual. Trabalha com a energia da criação, da purificação e da conexão com o divino.",
                    "Entidades desta linha trabalham com energias de paz, harmonia, fé, purificação espiritual e elevação da consciência. São espíritos de grande luz que auxiliam na cura espiritual e no desenvolvimento mediúnico.",
                    "Na Casa Batuara, a Linha de Oxalá é considerada a linha mestra, aquela que rege todas as outras. Nossos guias desta linha nos ensinam que a verdadeira força está na humildade e no amor. Eles trabalham principalmente na cura espiritual, no desenvolvimento da mediunidade e na orientação para a evolução espiritual. São espíritos de grande elevação que nos ajudam a compreender os ensinamentos de Jesus.",
                    new[] { "Pai João de Oxalá", "Vovô Benedito", "Pai Francisco", "Vovó Maria Conga", "Caboclo Pena Branca" },
                    new[] { "Domingo", "Quinta-feira" },
                    1
                ),

                new UmbandaLine(
                    "Linha de Yemanjá",
                    "A Linha de Yemanjá trabalha com as energias do amor maternal, da proteção, da cura emocional e da purificação através das águas.",
                    "Entidades desta linha são conhecidas por seu amor maternal, proteção às famílias, cura de traumas emocionais e limpeza espiritual. Trabalham especialmente com mulheres, crianças e questões familiares.",
                    "Na Casa Batuara, a Linha de Yemanjá é muito querida e respeitada. Nossos guias desta linha são verdadeiras mães espirituais que acolhem a todos com amor incondicional. Eles trabalham principalmente na cura emocional, na proteção das famílias e na orientação para as mães. Ensinam-nos que o amor de mãe é a força mais poderosa para a cura e transformação.",
                    new[] { "Mãe Yara", "Sereia do Mar", "Cabocla Jurema", "Vovó Cambinda", "Mãe Oxum" },
                    new[] { "Sábado", "Segunda-feira" },
                    2
                ),

                new UmbandaLine(
                    "Linha dos Caboclos",
                    "A Linha dos Caboclos trabalha com as energias da natureza, da cura através das ervas, da força e da conexão com os elementos naturais.",
                    "Os Caboclos são espíritos de índios que trabalham com a força da natureza, conhecimento das ervas medicinais, proteção e cura. São guerreiros da luz que defendem a justiça e protegem os necessitados.",
                    "Na Casa Batuara, os Caboclos são nossos grandes protetores e curadores. Eles nos ensinam o respeito pela natureza e o uso das plantas para a cura. Nossos Caboclos trabalham com muita força e determinação, sempre prontos a defender seus filhos e a promover a justiça. Eles nos orientam sobre a importância de viver em harmonia com a natureza e de usar seus recursos com sabedoria e gratidão.",
                    new[] { "Caboclo Pena Verde", "Cabocla Jurema", "Caboclo Sete Flechas", "Cabocla Jandira", "Caboclo Tupinambá" },
                    new[] { "Terça-feira", "Quinta-feira" },
                    3
                )
            };

            await context.UmbandaLines.AddRangeAsync(umbandaLines);
            await context.SaveChangesAsync();
            logger.LogInformation($"Inseridas {umbandaLines.Length} Linhas da Umbanda");
        }

        private static async Task SeedSpiritualContentAsync(BatuaraDbContext context, ILogger logger)
        {
            if (await context.SpiritualContents.AnyAsync())
            {
                logger.LogInformation("Conteúdos espirituais já existem no banco. Seed desta entidade ignorado.");
                return;
            }

            logger.LogInformation("Inserindo conteúdos espirituais...");

            var spiritualContents = new[]
            {
                new SpiritualContent(
                    "Pai Nosso da Umbanda",
                    @"Pai nosso que estais no infinito,
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
Saravá!",
                    SpiritualContentType.Prayer,
                    SpiritualCategory.Umbanda,
                    "Apostila Batuara 2024",
                    1,
                    true
                ),

                new SpiritualContent(
                    "A Caridade Segundo os Ensinamentos da Casa Batuara",
                    @"A caridade é o fundamento de toda a nossa doutrina. Não se trata apenas de dar esmolas ou ajudar materialmente, mas sim de amar verdadeiramente ao próximo como a nós mesmos.

A verdadeira caridade começa no coração. É preciso ter compaixão, compreensão e amor por todos os seres, independentemente de sua condição social, raça ou religião. Jesus nos ensinou que devemos amar até mesmo nossos inimigos.

Na Casa Batuara, praticamos a caridade de várias formas:
- Através da assistência espiritual gratuita
- Do atendimento aos necessitados
- Da orientação e consolação aos aflitos
- Do ensino da doutrina espírita e umbandista
- Da promoção da fraternidade entre todos

Lembrem-se sempre: ""Fora da caridade não há salvação"". Este é o lema que deve guiar todas as nossas ações.",
                    SpiritualContentType.Teaching,
                    SpiritualCategory.General,
                    "Apostila Batuara 2024",
                    2,
                    true
                ),

                new SpiritualContent(
                    "Os Orixás na Visão da Casa Batuara",
                    @"Os Orixás são manifestações divinas, aspectos de Deus que se apresentam para nos ensinar e orientar. Cada Orixá representa virtudes e qualidades que devemos desenvolver em nós mesmos.

Na Casa Batuara, compreendemos os Orixás como:

OXALÁ - O Pai Criador, que nos ensina a paz, a paciência e a sabedoria.
YEMANJÁ - A Mãe Universal, que nos ensina o amor incondicional e a proteção.
IANSÃ - A Guerreira da Justiça, que nos ensina a coragem e a determinação.
OGUM - O Trabalhador Incansável, que nos ensina a perseverança e a honestidade.

Cada Orixá tem seus ensinamentos específicos, mas todos nos conduzem ao mesmo objetivo: a evolução espiritual através do amor e da caridade.",
                    SpiritualContentType.Doctrine,
                    SpiritualCategory.Orixas,
                    "Apostila Batuara 2024",
                    3,
                    true
                ),

                new SpiritualContent(
                    "Oração de Caritas",
                    @"Deus, nosso Pai, que sois todo poder e bondade,
Dai força àquele que passa pela provação,
Dai luz àquele que procura a verdade,
Ponde no coração do homem a compaixão e a caridade.

Deus! Dai ao viajor a estrela guia,
Ao aflito a consolação,
Ao doente o repouso.

Pai! Dai ao culpado o arrependimento,
Ao espírito a verdade,
À criança o guia,
Ao órfão o pai.

Senhor! Que a vossa bondade se estenda sobre tudo o que criastes.
Piedade, Senhor, para aqueles que vos não conhecem,
Esperança para aqueles que sofrem.

Que a vossa bondade permita aos espíritos consoladores
Derramarem por toda parte a paz, a esperança e a fé.",
                    SpiritualContentType.Prayer,
                    SpiritualCategory.Kardecismo,
                    "Apostila Batuara 2024",
                    3,
                    true
                ),

                new SpiritualContent(
                    "Oração a Oxalá",
                    @"Salve Oxalá, Pai de todos os Orixás,
Senhor da paz e da harmonia,
Que vossa luz ilumine nossos caminhos,
E vossa sabedoria guie nossos passos.

Oxalá, Pai da criação,
Dai-nos força para vencer as dificuldades,
Paciência para suportar as provações,
E amor para perdoar as ofensas.

Que vossa benção esteja sempre conosco,
Protegendo nossa família e nossos irmãos.",
                    SpiritualContentType.Prayer,
                    SpiritualCategory.Orixas,
                    "Apostila Batuara 2024",
                    4,
                    true
                ),

                new SpiritualContent(
                    "Oração do Médium",
                    @"Senhor Jesus, que sois o caminho, a verdade e a vida,
Iluminai-me para que eu possa ser um instrumento de vossa paz.

Que os espíritos de luz me assistam nesta tarefa sagrada,
E que eu possa transmitir apenas palavras de consolação,
Esperança e amor aos corações aflitos.

Afastai de mim toda vaidade e orgulho,
Para que eu seja apenas um canal humilde
De vossa infinita misericórdia.",
                    SpiritualContentType.Prayer,
                    SpiritualCategory.Kardecismo,
                    "Apostila Batuara 2024",
                    5,
                    false
                )
            };

            await context.SpiritualContents.AddRangeAsync(spiritualContents);
            await context.SaveChangesAsync();
            logger.LogInformation($"Inseridos {spiritualContents.Length} conteúdos espirituais");
        }

        private static async Task SeedEventsAsync(BatuaraDbContext context, ILogger logger)
        {
            if (await context.Events.AnyAsync())
            {
                logger.LogInformation("Eventos já existem no banco. Seed desta entidade ignorado.");
                return;
            }

            logger.LogInformation("Inserindo eventos iniciais...");

            var referenceDate = DateTime.UtcNow.Date;
            var events = new[]
            {
                new Event(
                    "Festa de Yemanjá",
                    "Celebração em honra à nossa querida Mãe Yemanjá, com gira especial e oferendas ao mar.",
                    new EventDate(GetUpcomingDate(referenceDate, 15), TimeSpan.FromHours(19), TimeSpan.FromHours(22)),
                    EventType.Festa,
                    "Casa de Caridade Batuara"),
                new Event(
                    "Palestra: Os Orixás na Umbanda",
                    "Palestra educativa sobre os Orixás e seus ensinamentos na tradição umbandista.",
                    new EventDate(GetUpcomingDate(referenceDate, 8), TimeSpan.FromHours(19.5), TimeSpan.FromHours(21)),
                    EventType.Palestra,
                    "Casa de Caridade Batuara"),
                new Event(
                    "Bazar Beneficente",
                    "Bazar com roupas, livros e artesanatos para arrecadar fundos para as obras da casa.",
                    new EventDate(GetUpcomingDate(referenceDate, 12), TimeSpan.FromHours(14), TimeSpan.FromHours(18)),
                    EventType.Bazar,
                    "Casa de Caridade Batuara")
            };

            await context.Events.AddRangeAsync(events);
            await context.SaveChangesAsync();
            logger.LogInformation($"Inseridos {events.Length} eventos");
        }

        private static async Task SeedCalendarAttendancesAsync(BatuaraDbContext context, ILogger logger)
        {
            if (await context.CalendarAttendances.AnyAsync())
            {
                logger.LogInformation("Atendimentos de calendário já existem no banco. Seed desta entidade ignorado.");
                return;
            }

            logger.LogInformation("Inserindo atendimentos iniciais do calendário...");

            var referenceDate = DateTime.UtcNow.Date;
            var attendances = new[]
            {
                new CalendarAttendance(
                    new EventDate(GetNextDayOfWeek(referenceDate, DayOfWeek.Tuesday), TimeSpan.FromHours(19), TimeSpan.FromHours(21)),
                    AttendanceType.Kardecismo,
                    "Atendimento Kardecista",
                    "Trazer água",
                    false),
                new CalendarAttendance(
                    new EventDate(GetNextDayOfWeek(referenceDate, DayOfWeek.Friday), TimeSpan.FromHours(20), TimeSpan.FromHours(22)),
                    AttendanceType.Umbanda,
                    "Gira de Umbanda",
                    "Usar roupas brancas",
                    false),
                new CalendarAttendance(
                    new EventDate(GetNextDayOfWeek(referenceDate, DayOfWeek.Sunday), TimeSpan.FromHours(14), TimeSpan.FromHours(17)),
                    AttendanceType.Curso,
                    "Curso de Desenvolvimento Mediúnico",
                    null,
                    true,
                    30)
            };

            await context.CalendarAttendances.AddRangeAsync(attendances);
            await context.SaveChangesAsync();
            logger.LogInformation($"Inseridos {attendances.Length} atendimentos de calendário");
        }

        private static async Task SeedSiteSettingsAsync(BatuaraDbContext context, ILogger logger)
        {
            if (await context.SiteSettings.AnyAsync())
            {
                logger.LogInformation("Configurações do site já existem no banco. Seed desta entidade ignorado.");
                return;
            }

            logger.LogInformation("Inserindo configurações iniciais do site...");

            var siteSettings = new Batuara.Domain.Entities.SiteSettings(
                new ContactInfo(
                    "Av.Brigadeiro Faria Lima, 2750 - Jardim Cocaia, Guarulhos - SP, 07130-000",
                    "contato@casabatuara.org.br",
                    "(11) 1234-5678",
                    "casadecaridade.batuara"),
                "A Casa de Caridade Batuara nasceu do desejo de servir a Espiritualidade através da caridade e do amor ao próximo. Trabalhamos com a Umbanda e a Doutrina Espírita, unindo acolhimento, orientação e assistência espiritual gratuita para todos que buscam a luz, a paz e a elevação da alma.",
                "https://www.instagram.com/casadecaridade.batuara?igsh=ejU1dWozbTZlYXM4",
                "contato@casabatuara.org.br");

            await context.SiteSettings.AddAsync(siteSettings);
            await context.SaveChangesAsync();
            logger.LogInformation("Configurações iniciais do site inseridas");
        }

        private static DateTime GetUpcomingDate(DateTime referenceDate, int daysToAdd)
        {
            return DateTime.SpecifyKind(referenceDate.Date.AddDays(daysToAdd), DateTimeKind.Utc);
        }

        private static DateTime GetNextDayOfWeek(DateTime referenceDate, DayOfWeek targetDay)
        {
            var date = referenceDate.Date.AddDays(1);
            while (date.DayOfWeek != targetDay)
            {
                date = date.AddDays(1);
            }

            return DateTime.SpecifyKind(date, DateTimeKind.Utc);
        }
    }
}
