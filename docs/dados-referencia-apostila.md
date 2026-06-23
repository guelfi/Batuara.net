# Dados de Referência — Apostila Batuara 2024
> Documento consolidado para revisão e carga no AdminDashboard / exibição no PublicWebsite.
> Fonte: `dados-publicwebsite.json` (validado contra Apostila Batuara 2024).
> Última revisão: Junho/2026

---

## ÍNDICE
1. [Orixás](#orixás) — 11 registros
2. [Guias e Entidades](#guias-e-entidades) — 9 registros (Índio removido — não consta na apostila)
3. [Linhas de Umbanda](#linhas-de-umbanda) — 7 registros
4. [Orações e Pontos](#orações-e-pontos) — 2 registros confirmados na apostila
5. [Campos disponíveis no sistema](#campos-disponíveis-no-sistema)
6. [Observações e pendências](#observações-e-pendências)

---

## ORIXÁS

> **Campos no banco:** `name`, `description`, `origin`, `batuaraTeaching`, `characteristics[]`, `colors[]`, `elements[]`, `displayOrder`, `imageUrl`, `comida`, `diaDaSemana`, `fruta`, `saudacao`, `isActive`

| # | Nome | Saudação | Dia da Semana | Cor | Fruta | Comida | Elemento |
|---|------|----------|---------------|-----|-------|--------|----------|
| 1 | **Oxalá** | Epa babá | Sexta | Branco | Uva Branca | Canjica | Ar |
| 2 | **Iemanjá** | Odocya | Sábado | Azul | Mamão Papaya | Peixe | Água |
| 3 | **Nanã** | Salupa Nanã | Sábado | Lilás | Romã | Casquinha Siri | Água |
| 4 | **Oxum** | Aiê iê ô | Sábado | Dourado | Melão | Peixe água doce | Água |
| 5 | **Ogum** | Ogunhê | Quinta | Vermelho | Lima da Pérsia | Feijoada | Fogo |
| 6 | **Oxóssi** | Oxossi ê | Terça | Verde | Goiaba | Caça | Terra |
| 7 | **Xangô** | Kao Kabecile | Quarta | Marrom | Banana da terra | Rabada c/ guiabo | Terra |
| 8 | **Iansã** | Eparrey | Quarta | Alaranjado | Manga | Acarajé | Ar |
| 9 | **Obaluaê** | Atoto Obaluaê | Segunda | Roxo | Pinha | Carne de porco | Terra |
| 10 | **Ossain** | *(não consta)* | *(não consta)* | *(não consta)* | *(não consta)* | *(não consta)* | Terra |
| 11 | **Oxumarê** | *(não consta)* | *(não consta)* | *(não consta)* | *(não consta)* | *(não consta)* | Água |

### Detalhamento por Orixá

#### 1. Oxalá
- **Descrição:** Tem origem na tradição Yorubá, onde é conhecido como Obatalá. Criador da humanidade e pai de todos os Orixás.
- **Ensinamento Batuara:** Reverenciado como o grande pai. Ensina humildade, paciência e amor incondicional. A paz interior e pureza de coração levam à elevação espiritual.
- **Características:** Paciência, Sabedoria, Pureza, Paz, Criação, Paternidade, Humildade, Amor incondicional
- **Cor:** Branco
- **Elementos:** Ar, Éter, Luz
- **Habitat:** Campo aberto / planície | **Símbolo:** Pomba Branca | **Bebida:** Champagne Branca | **Data:** 25 de Dezembro

#### 2. Iemanjá
- **Descrição:** Divindade dos rios e mares, mãe de muitos Orixás e protetora das mulheres e crianças.
- **Ensinamento Batuara:** Amor incondicional de mãe, proteção aos necessitados e importância da família espiritual.
- **Características:** Maternidade, Proteção, Fertilidade, Amor maternal, Cura, Acolhimento, Generosidade, Compaixão
- **Cor:** Azul
- **Elementos:** Água, Mar, Rios, Conchas
- **Habitat:** Mar - Praia | **Símbolo:** Pérola ou Estrela do Mar | **Data:** 02 de Fevereiro

#### 3. Nanã
- **Descrição:** Uma das mais antigas Orixás femininas. Senhora da sabedoria ancestral e dos mistérios da vida e morte.
- **Ensinamento Batuara:** A anciã sábia. Guarda os segredos da vida e da morte, ensinando a respeitar todos os ciclos da existência.
- **Características:** Sabedoria, Tradição, Paciência, Mistério, Respeito aos antepassados
- **Cor:** Lilás
- **Elementos:** Água, Lama, Terra
- **Habitat:** Areia molhada da praia (cavar) | **Símbolo:** Vassoura de palha da Costa | **Data:** 27 de Julho

#### 4. Oxum
- **Descrição:** Orixá das águas doces, rios e cachoeiras. Senhora do ouro e do amor.
- **Ensinamento Batuara:** Amor, beleza e fertilidade. Ensina a valorizar a doçura da vida e a beleza interior.
- **Características:** Amor, Beleza, Fertilidade, Doçura, Prosperidade
- **Cor:** Dourado
- **Elementos:** Água doce, Ouro, Rios
- **Habitat:** Rio | **Símbolo:** Ouro | **Data:** 15 de Agosto

#### 5. Ogum
- **Descrição:** Senhor do ferro e da guerra. Uma das divindades mais antigas da tradição Yorubá.
- **Ensinamento Batuara:** O grande trabalhador. Importância do esforço e da dedicação para alcançar objetivos.
- **Características:** Trabalho, Perseverança, Coragem, Determinação, Proteção, Liderança, Honestidade, Força de vontade
- **Cor:** Vermelho
- **Elementos:** Ferro, Metal, Terra, Fogo
- **Habitat:** Estrada | **Símbolo:** Espada de aço | **Data:** 23 de Abril

#### 6. Oxóssi
- **Descrição:** O Orixá caçador, senhor das matas e da fartura. Sabedoria e conexão com a natureza.
- **Ensinamento Batuara:** O provedor. Ensina a buscar o conhecimento e viver em harmonia com a natureza.
- **Características:** Sabedoria, Conhecimento, Prosperidade, Caça, Natureza, Fartura
- **Cor:** Verde
- **Elementos:** Mata, Terra, Arco
- **Habitat:** Mata | **Símbolo:** Arco e flecha | **Data:** 20 de Janeiro

#### 7. Xangô
- **Descrição:** Orixá da justiça, do fogo e do trovão. Rei poderoso que pune os injustos e protege os oprimidos.
- **Ensinamento Batuara:** Personificação da justiça divina. Toda ação tem consequências e a verdade sempre prevalece.
- **Características:** Justiça, Equilíbrio, Autoridade, Fogo, Trovão, Determinação
- **Cor:** Marrom
- **Elementos:** Fogo, Pedra, Trovão
- **Habitat:** Pedra | **Símbolo:** Machado de pedra | **Data:** 30 de Setembro

#### 8. Iansã
- **Descrição:** Oyá na tradição Yorubá. Divindade dos ventos e tempestades. Esposa de Xangô.
- **Ensinamento Batuara:** A guerreira da luz. Coragem para enfrentar as adversidades da vida.
- **Características:** Coragem, Justiça, Determinação, Liderança, Proteção, Transformação, Força, Independência
- **Cor:** Alaranjado
- **Elementos:** Vento, Tempestade, Raio, Fogo
- **Habitat:** Queda da cachoeira | **Símbolo:** Espada | **Data:** 04 de Dezembro

#### 9. Obaluaê / Omolu
- **Descrição:** Orixá da cura e das doenças. Na Casa Batuara, Obaluaê (aspecto mais velho) e Omolu (aspecto mais jovial) são tratados como complementares — o mesmo Orixá em dois momentos. Médico dos Orixás e senhor da vida e da morte.
- **Ensinamento Batuara:** O grande curador. Saúde é o maior bem; cuidar do corpo e da alma.
- **Características:** Cura, Saúde, Doenças, Renovação, Ciclo da vida
- **Cor:** Roxo
- **Elementos:** Terra, Lama, Palha
- **Habitat:** Cemitério | **Símbolo:** Palha da costa | **Data:** 16 de Agosto

#### 10. Ossain
- **Descrição:** Orixá das folhas e ervas medicinais. Senhor do conhecimento das plantas curativas.
- **Ensinamento Batuara:** O mestre das ervas. Propriedades medicinais das plantas e a cura natural.
- **Características:** Cura, Ervas, Medicina, Conhecimento ancestral, Natureza
- **Cor:** *(não consta na apostila — preencher com a Casa)*
- **Elementos:** Ervas, Terra, Folhas
- **Habitat:** Ervas rasteiras | **Símbolo:** *(não consta)* | **Bebida:** Cerveja
- **⚠️ Atenção:** Saudação, símbolo, cor, dia, fruta e comida não constam na Apostila Batuara 2024.

#### 11. Oxumarê
- **Descrição:** Orixá da transformação, do movimento e da renovação. Representa o arco-íris e a serpente.
- **Ensinamento Batuara:** O renovador. Toda situação pode ser transformada e a esperança sempre retorna.
- **Características:** Renovação, Transformação, Movimento, Esperança, Equilíbrio
- **Cor:** *(não consta na apostila — preencher com a Casa)*
- **Elementos:** Água, Serpente, Arco-íris
- **Habitat:** Encontro do rio com mar | **Símbolo:** *(não consta)* | **Bebida:** Champagne Branca
- **⚠️ Atenção:** Saudação, símbolo, cor, dia, fruta e comida não constam na Apostila Batuara 2024.

---

## GUIAS E ENTIDADES

> **Campos no banco:** `name`, `description`, `specialties[]`, `displayOrder`, `comida`, `fruta`, `diaDaSemana`, `cor`, `saudacao`, `isActive`
> **Nota:** O campo `specialties` mapeia para as `caracteristicas` de cada guia.

> **⚠️ CORREÇÃO DE PARSE:** A base anterior tinha deslocamento nas frutas dos guias. Dados abaixo são os corretos conforme a apostila.
> **⚠️ Índio REMOVIDO:** Não consta na apostila — era artefato do deslocamento de dados.

| # | Nome | Saudação | Dia da Semana | Cor | Fruta *(corrigida)* | Comida | Comemoração |
|---|------|----------|---------------|-----|-------|--------|-------------|
| 1 | **Exu** | Laroye Exu | Segunda | Vermelho | Figo da India | Fígado ou Miúdos de Frango | 31/10 |
| 2 | **Pomba Gira** | Laroye Pomba Gira | Segunda | Preto | Figo ou Pera | Fígado ou Miúdos de Frango | — |
| 3 | **Baiano** | Salve Nosso Senhor do Bonfin | Quinta-feira | Amarelo e Vermelho | Coco / Caju | Farofa | 04/08 |
| 4 | **Preto Velho** | Adorei as Almas | Segunda-feira | Branco e Preto | Caqui | Feijão Preto s/ pertences | 13/05 |
| 5 | **Erês** | Aminbeijada | Domingo | Rosa e Azul | Doces | Caruru | 27/09 |
| 6 | **Boiadeiro** | Getruá seu Boiadeiro | Terça-feira | Marrom e Bege | Laranja Pera | Arroz Carreteiro | 24/06 |
| 7 | **Marinheiro** | Salve Nossa Sernhora dos Navegantes | Sábado | Azul e Branco | Carambola | Peixe frito | 07/07 |
| 8 | **Cigano** | É de Ouro e Oriente | Sexta-feira | Dourado e Roxo | Maçã | Pernil | 24/05 |
| 9 | **Malandro** | Salve a Malandragem | Quarta-feira | Preto e Branco | Abacaxi | Buteco | 18/03 |

### Detalhamento por Guia/Entidade

#### 1. Exu
- **Descrição:** Entidade mensageira, guardiã dos caminhos e das encruzilhadas. Comunicadora entre os mundos espiritual e material. Na Casa Batuara é tratado como Entidade, não como Orixá.
- **Especialidades/Características:** Comunicação, Abertura de caminhos, Guarda de encruzilhadas, Movimento, Equilíbrio
- **Habitat:** Encruzilhada 4 pontas | **Símbolo:** Tridente | **Bebida:** Pinga | **Data:** 31 de Outubro

#### 2. Pomba Gira
- **Descrição:** Entidade feminina, guardiã das encruzilhadas e dos mistérios femininos. Na Casa Batuara é tratada como Entidade, não como Orixá.
- **Especialidades/Características:** Mistério, Feminilidade, Amor, Encantamento, Dualidade
- **Habitat:** Encruzilhada 3 pontas ou T | **Símbolo:** Tridente c/ 2 pontas | **Bebida:** Champagne Vermelha

#### 3. Baiano
- **Descrição:** Entidades alegres e festeiras, vindas da Bahia. Conhecidos por sua sabedoria popular e humor.
- **Especialidades/Características:** Alegria contagiante, Sabedoria popular, Gosto por festas, Linguagem típica baiana, Proteção através da alegria
- **Habitat:** Praias e cidades da Bahia | **Bebida:** Pinga
- **⚠️ Saudação:** "Salve Nosso Senhor do Bonfin" (grafia original da apostila, sem o M final)

#### 4. Preto Velho
- **Descrição:** Espíritos de anciãos africanos, símbolos de sabedoria, paciência e humildade.
- **Especialidades/Características:** Sabedoria ancestral, Paciência infinita, Humildade profunda, Conselhos valiosos, Cura através da fé
- **Habitat:** Senzalas e terreiros antigos | **Bebida:** Café / Vinho

#### 5. Erês
- **Descrição:** Espíritos de crianças, trazem alegria, pureza e inocência. Mensageiros da esperança.
- **Especialidades/Características:** Pureza de coração, Alegria contagiante, Inocência genuína, Brincadeiras e risos, Proteção das crianças
- **Habitat:** Jardins e parques infantis | **Bebida:** Refrigerante

#### 6. Boiadeiro
- **Descrição:** Espíritos de vaqueiros e trabalhadores rurais. Força e determinação.
- **Especialidades/Características:** Força e coragem, Determinação, Simplicidade, Proteção do gado, Trabalho árduo
- **Habitat:** Campos e fazendas | **Bebida:** Pinga / Cerveja
- **⚠️ Fruta corrigida:** "Laranja Pera" conforme apostila (era "Laranja" na base antiga — "Pera" havia migrado incorretamente para o Marinheiro).

#### 7. Marinheiro
- **Descrição:** Espíritos dos mares, navegadores experientes que trazem proteção nas viagens.
- **Especialidades/Características:** Conhecimento dos mares, Proteção em viagens, Aventura e coragem, Histórias fascinantes, Ligação com Iemanjá
- **Habitat:** Portos e navios | **Bebida:** Rum
- **⚠️ Fruta corrigida:** "Carambola" conforme apostila (era "Pera" na base antiga — deslocamento do Boiadeiro).
- **⚠️ Saudação:** "Salve Nossa Sernhora dos Navegantes" (grafia original da apostila)

#### 8. Cigano
- **Descrição:** Espíritos nômades, conhecedores dos mistérios, da magia e da leitura do destino.
- **Especialidades/Características:** Conhecimento místico, Leitura do destino, Liberdade de espírito, Magia e encantamentos, Proteção em viagens
- **Habitat:** Estradas e acampamentos | **Bebida:** Vinho
- **⚠️ Fruta corrigida:** "Maçã" conforme apostila (era "Carambola" na base antiga — deslocamento).

#### 9. Malandro
- **Descrição:** Espíritos urbanos, conhecedores da vida nas ruas. Trazem proteção e esperteza.
- **Especialidades/Características:** Esperteza urbana, Proteção nas ruas, Jogo de cintura, Conhecimento da vida, Humor e malandragem
- **Habitat:** Ruas e esquinas da cidade | **Bebida:** Cerveja
- **⚠️ Fruta corrigida:** "Abacaxi" conforme apostila (era "Maçã / Abacaxi" na base antiga — deslocamento).

---

## LINHAS DE UMBANDA

> **Campos no banco:** `name`, `description`, `characteristics` (texto), `batuaraInterpretation`, `displayOrder`, `workingDays[]`, `isActive`
> **Nota:** O campo `entities[]` existe no banco mas **não será exibido** nos cards do PublicWebsite.

| # | Nome | Rege | Cor | Atuação | Dias |
|---|------|------|-----|---------|------|
| 1 | **Linha de Oxalá** (Linha da Fé) | Oxalá | Branco | Iluminação, fé, equilíbrio, paz, caridade | Domingo, Sexta-feira |
| 2 | **Linha de Ogum** (Linha da Lei e da Ordem) | Ogum | Vermelho | Quebra de demandas, justiça, força, desobsessão | Segunda, Quinta |
| 3 | **Linha de Oxóssi** (Linha do Conhecimento) | Oxóssi | Verde | Sabedoria, cura, abertura de caminhos, natureza | Terça, Quinta |
| 4 | **Linha de Xangô** (Linha da Justiça) | Xangô | Marrom | Justiça, equilíbrio, sabedoria ancestral | Segunda, Quarta |
| 5 | **Linha de Iemanjá** (Linha do Amor e da Geração) | Iemanjá | Azul-claro | Emoções, família, gestação, acolhimento | Sábado, Segunda |
| 6 | **Linha de Iansã** (Linha das Almas e Espíritos) | Iansã | Amarelo | Desencarne, passagem, purificação energética | Quarta, Domingo |
| 7 | **Linha de Exu** (Linha da Comunicação e Movimento) | Exu e Pomba Gira | Preto e Vermelho | Comunicação entre mundos, abertura de caminhos, proteção | Segunda, Quarta |

### Detalhamento por Linha

#### 1. Linha de Oxalá (Linha da Fé)
- **Descrição:** Regida por Oxalá, o Pai maior e luz divina. Trabalha com iluminação espiritual, fortalecimento da fé e promoção da paz interior através da caridade.

#### 2. Linha de Ogum (Linha da Lei e da Ordem)
- **Descrição:** Linha regida por Ogum, focada na manutenção da lei e ordem espiritual. Atua na quebra de demandas negativas e proteção através da força e justiça.

#### 3. Linha de Oxóssi (Linha do Conhecimento)
- **Descrição:** Regida por Oxóssi. Trabalha com a sabedoria ancestral, cura através da natureza e abertura de caminhos para o conhecimento espiritual.

#### 4. Linha de Xangô (Linha da Justiça)
- **Descrição:** Linha regida por Xangô, focada na aplicação da justiça divina e equilíbrio espiritual através da sabedoria ancestral dos Pretos-Velhos juristas.

#### 5. Linha de Iemanjá (Linha do Amor e da Geração)
- **Descrição:** Regida por Iemanjá, mãe de todos os Orixás. Trabalha com as emoções, proteção familiar, gestação e acolhimento maternal.

#### 6. Linha de Iansã (Linha das Almas e Espíritos)
- **Descrição:** Regida por Iansã, senhora dos ventos e das almas. Trabalha com espíritos em trânsito, auxiliando no desencarne e purificação energética.

#### 7. Linha de Exu (Linha da Comunicação e Movimento)
- **Descrição:** Regida por Exu e Pomba Gira. Comunicadora entre os mundos espiritual e material, abrindo caminhos e oferecendo proteção.

---

## ORAÇÕES E PONTOS

> **Campos no banco:** `title`, `content`, `type` (1=Prayer,2=Teaching,3=Doctrine,4=Hymn,5=Ritual), `category` (1=Umbanda,2=Kardecismo,3=General,4=Orixas), `source`, `displayOrder`, `isFeatured`, `isActive`

| # | Título | Tipo | Categoria | Destaque |
|---|--------|------|-----------|---------|
| 1 | **Pai Nosso da Umbanda** | Oração (1) | Umbanda (1) | ✅ Sim |
| 2 | **A Caridade Segundo os Ensinamentos da Casa Batuara** | Ensinamento (2) | Geral (3) | ✅ Sim |
| 3 | **Pai Nosso de Oxalá** | Oração (1) | Orixás (4) | Não |
| 4 | **Canto a Iemanjá** | Hino (4) | Umbanda (1) | ✅ Sim |

> **⚠️ FONTE DE VERDADE:** Apenas as 2 orações abaixo constam na Apostila Batuara 2024. As demais (Pai Nosso de Oxalá, Canto a Iemanjá, texto A Caridade) **não constam no PDF** e devem ser avaliadas pela Casa antes de carregar no banco.

### Conteúdo das Orações

#### 1. Prece de Cáritas *(Págs. 8 e 9 da apostila)*
```
Deus nosso Pai, que sois Todo poder e bondade, daí a força àquele que passa pela provação,
daí a luz àquele que procura a verdade, ponde no coração do homem a compaixão e a
caridade. Deus, daí ao viajor a estrela guia, ao aflito a consolação, ao doente o repouso.
Pai, daí ao culpado o arrependimento, ao espírito a verdade, à criança o guia, ao órfão o pai.
Senhor, que a Vossa bondade se estenda sobre tudo que criaste. Piedade Senhor para aqueles
que não Vos conhece, e esperança para aqueles que sofrem. Que a Vossa bondade permita aos
espíritos consoladores derramarem por toda parte a paz, a esperança e a fé. Deus, um raio,
uma faísca do Vosso amor pode abrasar a Terra. Deixai-nos beber nas fontes dessa bondade
fecunda e infinita e todas as lágrimas secarão, todas as dores e acalmarão e um só coração,
um só pensamento subirá até Vós, como um grito de reconhecimento e amor. Como Moisés
sobre as montanhas, nós Vos esperamos com os braços abertos. Ó bondade, ó beleza, ó
perfeicão. E queremos de alguma sorte forçar a Vossa misericórdia. Deus, dai-nos a força
de ajudar o progresso a fim de subirmos até Vós, dai-nos a caridade pura, dai-nos a fé e a
razão, daí-nos a simplicidade, que fará de nossas almas um espelho onde se refletirá a sua
Santa e Bendita Imagem. Que assim seja.
```

#### 2. Pai Nosso da Umbanda *(Págs. 8 e 9 da apostila)*
```
Pai Nosso que estás no céu, na Terra, no ar e em toda parte.
Santificado seja o Vosso nome, em todo o momento de nossas vidas.
Venha a nós o Vosso reino que é de paz, amor e perdão.
Seja feita a Vossa vontade assim na Terra como no Céu.
O pão nosso de cada dia, que nos daí hoje, nos destes ontem, e nos darás amanhã.
Perdoai Senhor as nossas ofensas que por ventura te fizemos da mesma forma que
perdoamos os nossos ofensores.
E não nos deixei cair na tentação dos maus espíritos,
Livrando-nos assim de todo mal, para que possamos fazer jus ao seu amor e perdão.
Que assim seja.
```

#### ⚠️ Orações ausentes na apostila (decisão pendente da Casa)
- **Pai Nosso de Oxalá** — não consta no PDF
- **Canto a Iemanjá** — não consta no PDF
- **A Caridade Segundo os Ensinamentos da Casa Batuara** — não consta no PDF

---

## CAMPOS DISPONÍVEIS NO SISTEMA

### Orixás — mapeamento JSON → banco de dados

| Campo JSON (apostila) | Campo no banco | Obs |
|-----------------------|---------------|-----|
| `name` | `Name` | ✅ Implementado |
| `description` | `Description` | ✅ Implementado |
| `origin` | `Origin` | ✅ Implementado |
| `batuaraTeaching` | `BatuaraTeaching` | ✅ Implementado |
| `characteristics[]` | `Characteristics` (jsonb) | ✅ Implementado |
| `colors[]` | `Colors` (jsonb) | ✅ Implementado |
| `elements[]` | `Elements` (jsonb) | ✅ Implementado |
| `displayOrder` | `DisplayOrder` | ✅ Implementado |
| `imageUrl` | `ImageUrl` | ✅ Implementado |
| `comida` | `Comida` | ✅ Adicionado (Fase 2) |
| `diaSemana` | `DiaDaSemana` | ✅ Adicionado (Fase 2) |
| `fruta` | `Fruta` | ✅ Adicionado (Fase 2) |
| `saudacao` | `Saudacao` | ✅ Adicionado (Fase 2) |
| `cor` | — | ⚠️ Já presente em `colors[]` |
| `habitat` | — | ❌ Não armazenado (considerar adicionar) |
| `simbolo` | — | ❌ Não armazenado (considerar adicionar) |
| `bebida` | — | ❌ Não armazenado (considerar adicionar) |
| `dataComemoracao` | — | ❌ Não armazenado (considerar adicionar) |
| `atuacao` | — | ❌ Não armazenado (já coberto por `description`) |

### Guias e Entidades — mapeamento JSON → banco de dados

| Campo JSON (apostila) | Campo no banco | Obs |
|-----------------------|---------------|-----|
| `name` | `Name` | ✅ Implementado |
| `description` | `Description` | ✅ Implementado |
| `caracteristicas[]` | `Specialties` (jsonb) | ✅ Implementado |
| `displayOrder` | `DisplayOrder` | ✅ Implementado |
| `comida` | `Comida` | ✅ Adicionado (Fase 4) |
| `fruta` | `Fruta` | ✅ Adicionado (Fase 4) |
| `diaSemana` | `DiaDaSemana` | ✅ Adicionado (Fase 4) |
| `cor` | `Cor` | ✅ Adicionado (Fase 4) |
| `saudacao` | `Saudacao` | ✅ Adicionado (Fase 4) |
| `habitat` | — | ❌ Não armazenado |
| `bebida` | — | ❌ Não armazenado |
| `comemoracao` | — | ❌ Não armazenado |

---

## OBSERVAÇÕES E PENDÊNCIAS

### ✅ Dados prontos para carga imediata
Os dados abaixo estão prontos para carga, com exceções indicadas:
- **11 Orixás** — Ossain e Oxumarê com campos incompletos (ver ⚠️)
- **9 Guias/Entidades** — Frutas corrigidas conforme apostila original
- **7 Linhas de Umbanda** — Prontas
- **2 Orações confirmadas** na apostila (Prece de Cáritas + Pai Nosso da Umbanda)

### ⚠️ Campos não implementados (para avaliação futura)
Os seguintes campos existem na apostila mas **não foram incluídos no banco** nesta fase:
- **Orixás:** `habitat`, `simbolo`, `bebida`, `dataComemoracao`
- **Guias:** `habitat`, `bebida`, `comemoracao`

> **Recomendação:** Avaliar se esses campos serão exibidos no PublicWebsite antes de criar migration. Se sim, incluir na Fase 2 de extensão.

### ⚠️ Pendências críticas (requerem decisão da Casa)
- **Ossain:** Saudação, cor, dia da semana, fruta e comida não constam na Apostila 2024. Preencher com o conhecimento dos dirigentes antes de carregar no banco.
- **Oxumarê:** Mesma situação de Ossain — campos principais ausentes na apostila.
- **Exu e Pomba Gira:** Confirmados como Entidades na Casa Batuara. Registros na tabela `Guides` do banco.
- **Omolu / Obaluaê:** Tratados como complementares (mesmo Orixá, dois aspectos). Um único registro no banco com nome "Obaluaê / Omolu".
- **Índio:** Removido — não consta na apostila. Era artefato de parse incorreto da tabela de frutas.
- **Orações adicionais** (Pai Nosso de Oxalá, Canto a Iemanjá, texto A Caridade): Não constam no PDF. Manter no banco ou remover? Confirmar com a Casa.

### 📌 Ordem de `displayOrder` dos Guias
O JSON não define `displayOrder` para os Guias. Sugestão de ordem baseada na tradição:
1. Preto Velho, 2. Caboclo/Índio, 3. Baiano, 4. Boiadeiro, 5. Marinheiro, 6. Erês, 7. Cigano, 8. Malandro

### 🔄 Campos da apostila não alinhados com o PublicWebsite atual
O PublicWebsite (`GuiasEntidadesSection.tsx`) exibia anteriormente `email`, `phone`, `whatsapp` dos Guias — campos que **não existem na Apostila** e foram removidos na Fase 4. O novo modelo está alinhado com a apostila.
