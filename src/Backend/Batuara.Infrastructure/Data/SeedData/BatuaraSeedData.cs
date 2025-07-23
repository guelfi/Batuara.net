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

                // Verificar se já existem dados
                if (await context.Orixas.AnyAsync() || 
                    await context.UmbandaLines.AnyAsync() || 
                    await context.SpiritualContents.AnyAsync())
                {
                    logger.LogInformation("Dados já existem no banco. Seed data cancelado.");
                    return;
                }

                // Seed dos Orixás
                await SeedOrixasAsync(context, logger);

                // Seed das Linhas da Umbanda
                await SeedUmbandaLinesAsync(context, logger);

                // Seed dos Conteúdos Espirituais
                await SeedSpiritualContentAsync(context, logger);

                // Salvar todas as mudanças
                await context.SaveChangesAsync();

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
            logger.LogInformation("Inserindo dados dos Orixás...");

            var orixas = new[]
            {
                new Orixa(
                    "Oxalá",
                    "Oxalá é o maior dos Orixás, pai de todos os outros Orixás e de toda a humanidade. Representa a paz, a pureza, a sabedoria e a criação. É o Orixá da criação do mundo e dos seres humanos.",
                    "Oxalá tem origem na tradição Yorubá da África, onde é conhecido como Obatalá. É considerado o criador da humanidade e o pai de todos os Orixás.",
                    "Na Casa Batuara, Oxalá é reverenciado como o grande pai, aquele que nos ensina a humildade, a paciência e o amor incondicional. Seus ensinamentos nos mostram que através da paz interior e da pureza de coração podemos alcançar a elevação espiritual. Oxalá nos ensina que todos somos filhos de Deus e devemos nos tratar como irmãos.",
                    new[] { "Paciência", "Sabedoria", "Pureza", "Paz", "Criação", "Paternidade", "Humildade", "Amor incondicional" },
                    new[] { "Branco", "Azul claro" },
                    new[] { "Ar", "Éter", "Luz" },
                    1
                ),

                new Orixa(
                    "Yemanjá",
                    "Yemanjá é a mãe de todos os Orixás e rainha dos mares. Representa a maternidade, a fertilidade, a proteção e o amor maternal. É a grande mãe que acolhe e protege todos os seus filhos.",
                    "Yemanjá tem origem na tradição Yorubá, onde é conhecida como Yemoja. É a divindade dos rios e mares, mãe de muitos Orixás e protetora das mulheres e crianças.",
                    "A Casa Batuara tem especial devoção à Yemanjá, nossa mãe querida. Ela nos ensina o amor incondicional de mãe, a proteção aos necessitados e a importância da família espiritual. Yemanjá nos mostra que o amor maternal é a força mais poderosa do universo, capaz de curar, proteger e transformar. Em nossa casa, ela é celebrada como a mãe que nunca abandona seus filhos.",
                    new[] { "Maternidade", "Proteção", "Fertilidade", "Amor maternal", "Cura", "Acolhimento", "Generosidade", "Compaixão" },
                    new[] { "Azul", "Branco", "Azul marinho", "Prata" },
                    new[] { "Água", "Mar", "Rios", "Conchas" },
                    2
                ),

                new Orixa(
                    "Iansã",
                    "Iansã é a senhora dos ventos, tempestades e raios. Orixá guerreira, corajosa e determinada, que luta pela justiça e protege os oprimidos. É também a senhora dos eguns (espíritos dos mortos).",
                    "Iansã, conhecida como Oyá na tradição Yorubá, é a divindade dos ventos e tempestades. É esposa de Xangô e uma das mais respeitadas guerreiras entre os Orixás.",
                    "Na Casa Batuara, Iansã é reverenciada como a guerreira da luz, aquela que nos ensina a coragem para enfrentar as adversidades da vida. Ela nos mostra que devemos lutar pelos nossos ideais com determinação e justiça. Iansã nos ensina que a verdadeira força vem do coração puro e da fé inabalável. Ela também nos orienta no trabalho com os espíritos, ensinando-nos o respeito e a caridade para com aqueles que já partiram.",
                    new[] { "Coragem", "Justiça", "Determinação", "Liderança", "Proteção", "Transformação", "Força", "Independência" },
                    new[] { "Amarelo", "Vermelho", "Coral", "Dourado" },
                    new[] { "Vento", "Tempestade", "Raio", "Fogo" },
                    3
                ),

                new Orixa(
                    "Ogum",
                    "Ogum é o Orixá guerreiro, senhor do ferro, da tecnologia e dos caminhos. Representa o trabalho, a perseverança, a luta pelos objetivos e a abertura de novos caminhos na vida.",
                    "Ogum é uma das divindades mais antigas da tradição Yorubá, conhecido como o senhor do ferro e da guerra. É o Orixá que ensina aos homens o uso dos metais e das ferramentas.",
                    "A Casa Batuara ensina que Ogum é o grande trabalhador, aquele que nos mostra a importância do esforço e da dedicação para alcançar nossos objetivos. Ele nos ensina que através do trabalho honesto e da perseverança podemos vencer qualquer obstáculo. Ogum nos orienta a ser guerreiros da luz, lutando sempre pelo bem e pela justiça, mas sempre com amor no coração.",
                    new[] { "Trabalho", "Perseverança", "Coragem", "Determinação", "Proteção", "Liderança", "Honestidade", "Força de vontade" },
                    new[] { "Azul escuro", "Vermelho", "Verde escuro" },
                    new[] { "Ferro", "Metal", "Terra", "Fogo" },
                    4
                )
            };

            await context.Orixas.AddRangeAsync(orixas);
            logger.LogInformation($"Inseridos {orixas.Length} Orixás");
        }

        private static async Task SeedUmbandaLinesAsync(BatuaraDbContext context, ILogger logger)
        {
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
            logger.LogInformation($"Inseridas {umbandaLines.Length} Linhas da Umbanda");
        }

        private static async Task SeedSpiritualContentAsync(BatuaraDbContext context, ILogger logger)
        {
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
                )
            };

            await context.SpiritualContents.AddRangeAsync(spiritualContents);
            logger.LogInformation($"Inseridos {spiritualContents.Length} conteúdos espirituais");
        }
    }
}