# Resumo da Apostila Batuara 2024

Este documento apresenta uma análise detalhada e consolidada dos dados encontrados no arquivo [Apostila Batuara 2024.pdf](file:///C:/Users/MarcoGuelfi/Projetos/Batuara.net/docs/Apostila%20Batuara%202024.pdf), da **Casa de Caridade Batuara** (CNPJ: `08.488.544/0001-56`).

---

## 1. Divergências e Ajustes Críticos (PDF vs. Banco de Dados)

Durante a análise detalhada página por página do PDF original, foram identificadas divergências significativas em relação ao arquivo de referência do banco de dados (`dados-referencia-apostila.md` / `dados-publicwebsite.json`). 

### Orixás
- **Orixás Presentes no PDF (13):** Oxalá, Iemanjá, Nanã, Oxum, Ogum, Oxóssi, Xangô, Iansã, Obaluaê, Exu, Pomba Gira, Ossain e Oxumarê.
- **Orixás Ausentes no PDF (2):** **Logun Edé** e **Arnaldo** não constam em nenhuma parte, tabela ou texto da Apostila de 2024.
- **Ossain e Oxumarê:** São listados nas tabelas de elementos/habitats, bebidas e datas, mas **não possuem** dados de saudações, símbolos, cores, dias da semana, frutas ou comidas na apostila.

### Guias e Entidades
- **Guias Presentes no PDF (7):** Baiano, Preto Velho, Erês, Boiadeiro, Marinheiro, Cigano e Malandro.
- **Guias Ausentes no PDF (1):** **Índio** não consta na tabela de Guias/Entidades do PDF.
- **Correção de Deslocamento na Tabela de Frutas:** Nas versões anteriores do banco de dados, ocorreu um erro de leitura/parse na tabela de frutas dos guias que causou o deslocamento dos dados. A tabela abaixo demonstra a correspondência original do PDF:

| Entidade | Fruta no PDF (Correto) | Fruta na Base Antiga (Incorreto) | Motivo do Desvio |
| :--- | :--- | :--- | :--- |
| **Baiano** | Coco / Caju | Coco / Caju | Correto |
| **Preto Velho** | Caqui | Caqui | Correto |
| **Erês** | Doces | Doces | Correto |
| **Boiadeiro** | Laranja Pera | Laranja | O termo "Laranja Pera" foi dividido. "Laranja" ficou para o Boiadeiro e "Pera" foi jogado para o Marinheiro. |
| **Marinheiro** | Carambola | Pera | Herdado do deslocamento do Boiadeiro. |
| **Cigano** | Maçã | Carambola | Herdado do deslocamento anterior. |
| **Malandro** | Abacaxi | Maçã / Abacaxi | Juntou a maçã deslocada com o abacaxi. |
| **Índio** | *(Não existe)* | Frutas do cerrado | Registro criado artificialmente para absorver a sobra dos campos deslocados. |

Com essa correção, as frutas e comidas alinham-se perfeitamente com os 7 guias descritos no PDF, sem a necessidade de criar a entidade "Índio" apenas para ajustar a tabela.

### Linhas de Umbanda
- **Ausência de Seção Específica:** A Apostila Batuara 2024 **não contém** nenhuma seção dedicada às "7 Linhas de Umbanda" (Fé, Lei, Conhecimento, Justiça, Amor/Geração, Almas, Comunicação). A única menção a "linha" ocorre na introdução da tabela de entidades na página 3: *"entidades -guias ou linha das almas"*.

### Orações e Preces
- **Orações Presentes no PDF (2):** "Prece de Cáritas" e "Pai Nosso da Umbanda".
- **Orações Ausentes no PDF (2):** "Pai Nosso de Oxalá", "Canto a Iemanjá" e o texto "A Caridade Segundo os Ensinamentos..." não constam no documento.

---

## 2. Origem da Umbanda no Brasil

Conforme a apostila (Pág. 1), a Umbanda teve sua origem no Brasil em **15 de novembro de 1908**, através de **Zélio Fernandino de Moraes**. Zélio, um católico praticante que manifestava influências espirituais, incorporou o espírito do **Caboclo das Sete Encruzilhadas** durante uma visita a uma sessão de Kardecismo.

- **Objetivo Inicial:** Oferecer atendimento, consulta, auxílio espiritual e acolhimento.
- **Filosofia de Trabalho:** Dado que a Umbanda não é fundamentada em escrituras sagradas (como a Bíblia), cabe a cada *Zelador de Santo* (dirigente) conceituar uma filosofia própria em seu terreiro.

---

## 3. Orixás (Forças Naturais)

A apostila define os Orixás como forças ou elementos da natureza. Inicialmente (Pág. 1), aponta **10 forças principais**:
- **Ar:** Oxalá e Iansã
- **Água:** Iemanjá, Oxum e Nanã
- **Fogo:** Ogum
- **Mata:** Oxóssi
- **Rocha:** Xangô
- **Terra:** Obaluaê, Exu e Pomba Gira

No detalhamento (Págs. 2 e 3), são listados **13 Orixás** com seus campos de força, atuações e oferendas:

### Tabela Geral de Atuação e Habitats

| Orixá | Elemento | Campo de Força (Habitat/Otah) | Atuação Principal |
| :--- | :--- | :--- | :--- |
| **Oxalá** | Ar | Campo aberto / planície | Espiritualidade |
| **Iemanjá** | Água | Mar - Praia | Família |
| **Nanã** | Água | Areia molhada da praia (cavar) | Emoções |
| **Oxum** | Água | Rio | Amor – Fertilidade |
| **Ogum** | Fogo | Estrada | Batalha |
| **Oxóssi** | Terra | Mata | Prosperidade / Fartura |
| **Xangô** | Terra | Pedra | Justiça |
| **Iansã** | Ar | Queda da cachoeira | Transformação |
| **Obaluaê** | Terra | Cemitério | Saúde |
| **Exu** | Terra | Encruzilhada 4 pontas | Caminho |
| **Pomba Gira** | Terra | Encruzilhada 3 pontas ou T | Caminho |
| **Ossain** | Terra | Ervas Rasteiras | Cura |
| **Oxumarê** | Água | Encontro do rio com mar | Conflitos emocionais |

### Tabela de Oferendas, Símbolos e Rituais

| Orixá | Saudação | Símbolo | Cor | Dia da Semana | Fruta | Comida | Bebida | Data Comemorativa |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Oxalá** | Epa babá | Pomba Branca | Branco | Sexta | Uva Branca | Canjica | Champagne Branca | 25 de Dezembro |
| **Iemanjá** | Odocya | Pérola ou Estrela do Mar | Azul | Sábado | Mamão Papaya | Peixe (Água Salgada) | Champagne Branca | 02 de Fevereiro |
| **Nanã** | Salupa Nanã | Vassoura de palha da Costa | Lilás | Sábado | Romã | Casquinha Siri | Champagne Branca | 27 de Julho |
| **Oxum** | Aiê iê ô | Ouro | Dourado | Sábado | Melão | Peixe água doce | Champagne Branca | 15 de Agosto |
| **Ogum** | Ogunhê | Espada de aço | Vermelho | Quinta | Lima da Pérsia | Feijoada | Cerveja | 23 de Abril |
| **Oxóssi** | Oxossi ê | Arco e flecha | Verde | Terça | Goiaba | Caça | Cerveja | 20 de Janeiro |
| **Xangô** | Kao Kabecile | Machado de pedra | Marrom | Quarta | Banana da terra | Rabada c/ guiabo (quiabo) | Cerveja Preta | 30 de Setembro |
| **Iansã** | Eparrey | Espada | Alaranjado | Quarta | Manga | Acarajé | Champagne Branca | 04 de Dezembro |
| **Obaluaê** | Atoto Obaluaê | Palha da costa | Roxo | Segunda | Pinha | Carne de porco | Vinho Branco | 16 de Agosto |
| **Exu** | Laroye Exu | Tridente | Vermelho / Preto | Segunda | Figo da Índia | Fígado ou Miúdos de Frango | Pinga | 31 de Outubro |
| **Pomba Gira** | Laroye Pomba gira | Tridente c/ 2 pontas | Preto / Vermelho | Segunda | Figo ou Pera | Fígado ou Miúdos de Frango | Champagne Vermelha | *(Sem data)* |
| **Ossain** | *(Não consta)* | *(Não consta)* | *(Não consta)* | *(Não consta)* | *(Não consta)* | *(Não consta)* | Cerveja | *(Sem data)* |
| **Oxumarê** | *(Não consta)* | *(Não consta)* | *(Não consta)* | *(Não consta)* | *(Não consta)* | *(Não consta)* | Champagne Branca | *(Sem data)* |

---

## 4. Guias e Entidades (Linha das Almas)

Conforme as páginas 3 e 4, a casa trabalha com 7 linhas de guias e entidades espirituais:

| Entidade | Saudação | Comemoração | Bebida | Fruta (PDF) | Comida |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Baiano** | Salve Nosso Senhor do Bonfin | 04/08 | Pinga | Coco / Caju | Farofa |
| **Preto Velho** | Adorei as Almas | 13/05 | Café / Vinho | Caqui | Feijão Preto s/ pertences |
| **Erês** | Aminbeijada | 27/09 | Refrigerante | Doces | Caruru |
| **Boiadeiro** | Getruá seu Boiadeiro | 24/06 | Pinga / Cerveja | Laranja Pera | Arroz Carreteiro |
| **Marinheiro** | Salve Nossa Sernhora dos Navegantes | 07/07 | Rum | Carambola | Peixe frito |
| **Cigano** | É de Ouro e Oriente | 24/05 | Vinho | Maçã | Pernil |
| **Malandro** | Salve a Malandragem | 18/03 | Cerveja | Abacaxi | Buteco |

---

## 5. Doutrina e Regras do Terreiro (Págs. 5 a 7)

O terreiro é definido como o local preparado e designado exclusivamente para a realização dos trabalhos espirituais (giras) através dos médiuns.

### Estrutura Magnética do Terreiro
- **Firmações Principais:** Devem ser feitas em três partes essenciais para sustentar as forças de trabalho: **Porta de entrada**, **Porteira** e **Congá**. O método específico de firmação fica a critério e aprendizado de cada Zelador de Santo.
- **Atabaques:** Instrumentos sagrados que servem como elo de comunicação entre os filhos de fé e as forças espirituais. Exigem máximo respeito; cada força possui uma batida e um ponto cantado específicos.

### Deveres e Obrigações dos Filhos de Fé
1. **Vestimenta:** Roupa totalmente branca, lavada separadamente das roupas cotidianas e de uso exclusivo para os trabalhos da gira.
2. **Abstinência:** Abster-se de carne, sexo e bebidas alcoólicas por pelo menos **12 horas antes** do início dos trabalhos.
3. **Higiene Corporal:** Comparecer com o corpo limpo e, preferencialmente, tomar um banho de ervas (geralmente preparado no próprio terreiro).
4. **Ritual de Entrada:** Ajoelhar-se na porteira que separa a assistência do terreiro, solicitando permissão ao dono da casa. No Batuara, pede-se licença à **Rainha do Terreiro, Iemanjá**, realizando o seguinte gesto:
   - Colocar a mão direita no chão com a palma para cima (significa *"Com sua licença"*).
   - Levar a mão direita à testa e a esquerda à nuca simultaneamente, invertendo a posição das mãos por três vezes (significa *"Que as forças de meus Orixás estejam presentes neste terreiro e me guardem"*).
5. **Defumação:** Permanecer ajoelhado até receber a defumação sagrada.
6. **Saudação ao Orixá (Bater Cabeça):** Após a defumação, deitar-se de bruços em frente ao Congá. Médiuns que ainda não sabem quem é o seu Orixá regente devem saudar Oxalá.
7. **Postura e Silêncio:** Manter silêncio absoluto na gira, evitando conversas sobre assuntos cotidianos e alheios ao trabalho espiritual.
8. **Participação Ativa:** Cantar os pontos e bater palmas em harmonia com a Curimba.
9. **Foco Mental:** Manter o pensamento firme e sério, sem se ausentar física ou mentalmente durante as atividades.
10. **Esclarecimento de Dúvidas:** Dirigir-se unicamente aos Zeladores, Pai Pequeno ou Mães Pequenas.
11. **Saída da Gira:** Se for necessário sair antes da conclusão, é obrigatório pedir permissão ao Congá (bater cabeça) caso os trabalhos ainda estejam em andamento.

### Obrigações Administrativas e Financeiras
- **Manutenção Física:** O terreiro possui custos operacionais reais (água, luz, telefone, manutenção e materiais religiosos). Os membros contribuem com um valor pré-estabelecido simbólico, que pode ser ajustado com os dirigentes conforme a situação financeira de cada um.
- **Eventos Beneficentes (Bazar/Cantina):** Todos os filhos devem trabalhar e apoiar a realização de bazares, festas temáticas e bingos. A cantina não vende fiado, pois a arrecadação é revertida para a manutenção da casa.
- **Festas de Orixás:** Para agradecer o auxílio espiritual, realizam-se festas aos Orixás. A compra de flores, frutas e feitura da "Comida de Santo" exige ajuda financeira ou de trabalho dos membros.
- **Comprometimento e Ausência:** O comparecimento às giras deve ser regular. Faltas devem ser notificadas previamente. Se o médium se ausentar por mais de **um mês sem justificativa**, será considerado desligado da casa; caso retorne, deverá permanecer na assistência e procurar os dirigentes.
- **Restrição na Cozinha:** É proibido entrar na cozinha durante o preparo das comidas de Orixá ou enquanto houver uma vela acesa no recinto.
- **Quartinho de Exu (Casinha):** O acesso a este espaço deve ser sempre autorizado e devidamente acompanhado.
- **Giras da Tarde:** É obrigatória a presença tanto de novos médiuns (para aprendizado) quanto dos mais experientes (para compartilhar ensinamentos).
- **Proibição de Cobrança:** A Casa Batuara **não cobra** por nenhum trabalho espiritual e adquire todo o material necessário para os trabalhos solicitados. É terminantemente proibido pedir qualquer valor financeiro à assistência.

---

## 6. Preces da Abertura dos Trabalhos (Págs. 8 e 9)

### Prece de Cáritas
> *"Deus nosso Pai, que sois Todo poder e bondade, daí a força àquele que passa pela provação, daí a luz àquele que procura a verdade, ponde no coração do homem a compaixão e a caridade. Deus, daí ao viajor a estrela guia, ao aflito a consolação, ao doente o repouso. Pai, daí ao culpado o arrependimento, ao espírito a verdade, à criança o guia, ao órfão o pai. Senhor, que a Vossa bondade se estenda sobre tudo que criaste. Piedade Senhor para aqueles que não Vos conhece, e esperança para aqueles que sofrem. Que a Vossa bondade permita aos espíritos consoladores derramarem por toda parte a paz, a esperança e a fé. Deus, um raio, uma faísca do Vosso amor pode abrasar a Terra. Deixai-nos beber nas fontes dessa bondade fecunda e infinita e todas as lágrimas secarão, todas as dores e acalmarão e um só coração, um só pensamento subirá até Vós, como um grito de reconhecimento e amor. Como Moisés sobre as montanhas, nós Vos esperamos com os braços abertos. Ó bondade, ó beleza, ó perfeição. E queremos de alguma sorte forçar a Vossa misericórdia. Deus, dai-nos a força de ajudar o progresso a fim de subirmos até Vós, dai-nos a caridade pura, dai-nos a fé e a razão, daí-nos a simplicidade, que fará de nossas almas um espelho onde se refletirá a sua Santa e Bendita Imagem. Que assim seja."*

### Pai Nosso da Umbanda
> *"Pai Nosso que estás no céu, na Terra, no ar e em toda parte. Santificado seja o Vosso nome, em todo o momento de nossas vidas. Venha a nós o Vosso reino que é de paz, amor e perdão. Seja feita a Vossa vontade assim na Terra como no Céu. O pão nosso de cada dia, que nos daí hoje, nos destes ontem, e nos darás amanhã. Perdoai Senhor as nossas ofensas que por ventura te fizemos da mesma forma que perdoamos os nossos ofensores. E não nos deixei cair na tentação dos maus espíritos, Livrando-nos assim de todo mal, para que possamos fazer jus ao seu amor e perdão. Que assim seja."*

---

## 7. História da Casa de Caridade Batuara (Págs. 10 e 11)

A história do terreiro inicia-se com a mediunidade de **Armando Augusto Nunes Filho** (conhecido afetuosamente como *Dinho*), que morava no bairro de Santana (SP). 

- **A Primeira Manifestação:** Ocorreu na casa da família de Armando, onde o espírito do **Caboclo Batuara** incorporou e deixou um recado ao pai de Armando. Por ser leigo, o pai relatou a Armando que um "Japonês" estava cobrando um "terreno" dele.
- **O Chamado Espiritual:** Em uma segunda manifestação, o espírito esclareceu tratar-se de um Caboclo de Umbanda. Posteriormente, com a ajuda de uma tia familiarizada com o espiritismo, confirmou-se a missão espiritual de Armando como Zelador de Santo (Babalaô) e a necessidade de fundar um terreiro.
- **O Apoio de Seu Zé Roberto (Baiano):** A entidade Baiana incorporou e prometeu auxílio na missão caso Armando abraçasse a Umbanda, instruindo-o a realizar um ritual de firmeza (lançar três moedas, caminhar 21 passos e arremessar uma garrafa de pinga para trás à meia-noite de uma sexta-feira).
- **A Chegada de Ciro:** Armando conheceu seu companheiro de vida, Ciro, que não sabia nada sobre religião. Durante uma incorporação inesperada de Seu Zé Roberto, Ciro assustou-se e escondeu-se embaixo de uma mesa gritando por socorro. A entidade acalmou-o e predisse que ele seria seu primeiro discípulo.
- **Fundação da Gira:** Em **23 de abril de 1973**, por iniciativa de Ciro, realizaram a primeira gira de Umbanda em uma lavanderia na cidade de Guarulhos (onde Armando passou a morar), marcando a fundação oficial da **Casa de Caridade Batuara**. Ciro atuou ativamente como dirigente espiritual e Zelador de Santo (Babalaô) até fazer sua passagem espiritual em **29 de novembro de 1999**.
- **Continuação da Liderança da Casa:**
  - **Maria Preciosa da Silva Moscardi (Ialorixá):** Ingressou na casa em meados dos anos 80 e atua hoje como dirigente.
  - **José Roberto Heleno Marquis (Babalaô):** Conheceu o terreiro em 03 de novembro de 1997 e hoje também é dirigente.
  - **Adriana Cassemiro (Ialorixá):** Iniciou sua caminhada no Batuara em 2006, em uma festa de Oxóssi, e atualmente atua como dirigente.
  - **Alessandro Bitelli (Pai Pequeno)**
  - **Sandra Sargent (Mãe Pequena)**
  - **Lucia Shimoda (Mãe Pequena)**

### Mensagem de Encerramento da Apostila
> *"... a Umbanda nasce do culto aos Orixás, nunca podemos perder essa essência, trabalhamos com as entidades e todas as forças, mas não podemos nos esquecer de cuidar/cultuar a nossa raiz – cuidar dos Orixás. Mas, cuidar do Orixá é muito mais do que fazer oferendas, do que qualquer ritual, cuidar do Orixá é ser digno dele, como pessoa, atitudes, postura, levar sua vida de acordo com o Orixá..."*
