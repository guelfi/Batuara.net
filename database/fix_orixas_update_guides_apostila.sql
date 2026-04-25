-- =============================================================
-- Fix: Orixás + Atualização dos Guias com dados da Apostila 2024
-- =============================================================

-- 1. Desativar "Yemanjá" (ID 2) — duplicata com grafia errada de "Iemanjá"
UPDATE batuara."Orixas"
   SET "IsActive" = false, "UpdatedAt" = NOW()
 WHERE "Id" = 2 AND "Name" = 'Yemanjá';

-- 2. Atualizar descrições dos 7 Guias/Entidades com dados oficiais da Apostila Batuara 2024
-- Formato: descrição contextual + atributos litúrgicos oficiais

UPDATE batuara."Guides" SET
  "Description" = 'Entidades alegres e festeiras, vindas da Bahia. Conhecidos pela sabedoria popular, humor e pela força da fé nordestina. Trabalham com proteção, alegria e descontração espiritual.'
  || chr(10) || 'Saudação: Salve Nosso Senhor do Bonfim'
  || chr(10) || 'Comemoração: 04 de Agosto'
  || chr(10) || 'Bebida: Pinga | Fruta: Cocô / Cajú | Comida: Farofa',
  "UpdatedAt" = NOW()
WHERE "Name" = 'Baiano';

UPDATE batuara."Guides" SET
  "Description" = 'Espíritos de anciãos africanos escravizados, símbolos da sabedoria, paciência e humildade. Trabalham com cura espiritual, conselhos e acolhimento com amor e fé.'
  || chr(10) || 'Saudação: Adorei as Almas'
  || chr(10) || 'Comemoração: 13 de Maio'
  || chr(10) || 'Bebida: Café / Vinho | Fruta: Caqui | Comida: Feijão Preto s/ pertences',
  "UpdatedAt" = NOW()
WHERE "Name" = 'Preto Velho';

UPDATE batuara."Guides" SET
  "Description" = 'Espíritos de crianças que trazem alegria, pureza e inocência. São os mensageiros da esperança e da espontaneidade, trabalhando com leveza e proteção dos mais jovens.'
  || chr(10) || 'Saudação: Aminbeijada'
  || chr(10) || 'Comemoração: 27 de Setembro'
  || chr(10) || 'Bebida: Refrigerante | Fruta: Doces | Comida: Caruru',
  "UpdatedAt" = NOW()
WHERE "Name" = 'Erês';

UPDATE batuara."Guides" SET
  "Description" = 'Espíritos de vaqueiros e trabalhadores rurais do sertão brasileiro. Conhecidos pela força, determinação e simplicidade. Trabalham com proteção, abertura de caminhos e coragem.'
  || chr(10) || 'Saudação: Getruá seu Boiadeiro'
  || chr(10) || 'Comemoração: 24 de Junho'
  || chr(10) || 'Bebida: Pinga / Cerveja | Fruta: Laranja / Pera | Comida: Arroz Carreteiro',
  "UpdatedAt" = NOW()
WHERE "Name" = 'Boiadeiro';

UPDATE batuara."Guides" SET
  "Description" = 'Espíritos dos mares e navegadores experientes. Ligados à Iemanjá, trazem proteção nas viagens, aventura e coragem. Trabalham com fluidez, liberdade e proteção nos caminhos.'
  || chr(10) || 'Saudação: Salve Nossa Senhora dos Navegantes'
  || chr(10) || 'Comemoração: 07 de Julho'
  || chr(10) || 'Bebida: Rum | Fruta: Carambola | Comida: Peixe frito',
  "UpdatedAt" = NOW()
WHERE "Name" = 'Marinheiro';

UPDATE batuara."Guides" SET
  "Description" = 'Espíritos nômades e conhecedores dos mistérios e da magia. Trabalham com leitura do destino, proteção em viagens e abertura de caminhos, trazendo liberdade e sabedoria mística.'
  || chr(10) || 'Saudação: É de Ouro e Oriente'
  || chr(10) || 'Comemoração: 24 de Maio'
  || chr(10) || 'Bebida: Vinho | Fruta: Maçã | Comida: Pernil',
  "UpdatedAt" = NOW()
WHERE "Name" = 'Cigano';

UPDATE batuara."Guides" SET
  "Description" = 'Espíritos urbanos das ruas e esquinas das cidades. Conhecedores da vida, trabalham com proteção urbana, esperteza, jogo de cintura e caminhos nos ambientes citadinos.'
  || chr(10) || 'Saudação: Salve a Malandragem'
  || chr(10) || 'Comemoração: 18 de Março'
  || chr(10) || 'Bebida: Cerveja | Fruta: Abacaxi | Comida: Buteco',
  "UpdatedAt" = NOW()
WHERE "Name" = 'Malandro';

-- 3. Confirmações
SELECT 'Orixas ativos' as info, COUNT(*) as total FROM batuara."Orixas" WHERE "IsActive" = true;
SELECT 'Guides ativos' as info, COUNT(*) as total FROM batuara."Guides" WHERE "IsActive" = true;
SELECT "Id", "Name", LEFT("Description", 60) || '...' as desc_preview FROM batuara."Guides" ORDER BY "DisplayOrder";
