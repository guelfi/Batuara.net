# Resumo Executivo — Plano de Testes AdminDashboard Batuara.net

**Data de execução:** 25/06/2026
**Responsável:** Marco Guelfi
**Escopo:** AdminDashboard — 12 módulos, 105 casos de teste
**Ambiente:** http://192.168.15.157/batuara-admin

---

## 1. Resultado Geral

| Métrica | Valor |
|---|---|
| Total de casos executados | 105 |
| ✅ Aprovados | 83 (79,0%) |
| ❌ Reprovados | 18 (17,1%) |
| ⚠️ Bloqueados | 4 (3,8%) |

**O sistema funciona corretamente em aproximadamente 8 de cada 10 cenários testados.** As falhas encontradas estão concentradas em funcionalidades de filtros avançados, controles de status (ativo/inativo) e ausência de telas de detalhe em alguns módulos.

---

## 2. Resultado por Módulo

| Módulo | Total | ✅ Aprovado | ❌ Reprovado | ⚠️ Bloqueado |
|---|:---:|:---:|:---:|:---:|
| Autenticação | 6 | 5 | 0 | 1 |
| Dashboard | 3 | 2 | 1 | 0 |
| Eventos | 15 | 11 | 4 | 0 |
| Calendário (Atendimentos) | 9 | 8 | 1 | 0 |
| Guias e Entidades | 8 | 6 | 2 | 0 |
| Membros da Casa | 12 | 11 | 1 | 0 |
| Orixás | 8 | 6 | 1 | 1 |
| Conteúdo Espiritual | 10 | 8 | 2 | 0 |
| Linhas de Umbanda | 10 | 5 | 4 | 1 |
| Mensagens de Contato | 10 | 8 | 2 | 0 |
| Configurações do Site | 7 | 7 | 0 | 0 |
| Gerais (UX/fluxo) | 7 | 6 | 0 | 1 |
| **TOTAL** | **105** | **83** | **18** | **4** |

---

## 3. Casos Reprovados

| Código | Módulo | O que falhou | Impacto |
|---|---|---|---|
| CT-DASH-003 | Dashboard | Paginação do log de atividades não encontrada na interface | Baixo |
| CT-EVT-004 | Eventos | Filtro por período (data início/fim) não filtra a lista | Médio |
| CT-EVT-007 | Eventos | Formulário fecha sem exibir erro ao omitir Descrição | Médio |
| CT-EVT-009 | Eventos | Exceder limite de título fecha o formulário silenciosamente, sem mensagem de erro | Alto |
| CT-EVT-010 | Eventos | Exceder limite de descrição fecha o formulário silenciosamente, sem mensagem de erro | Alto |
| CT-CAL-008 | Calendário | Controle Ativo/Inativo de atendimentos não exposto na interface | Médio |
| CT-GUI-006 | Guias | Controle Ativo/Inativo de guias não exposto na interface | Médio |
| CT-GUI-008 | Guias | Painel de detalhes do guia não implementado; apenas formulário de edição disponível | Baixo |
| CT-MBR-001 | Membros | Grade de membros não exibe coluna de Status (Ativo/Inativo) | Baixo |
| CT-ORI-002 | Orixás | Criação de orixá falha silenciosamente com cores em formato inválido, sem feedback | Alto |
| CT-ESP-001 | Conteúdo Espiritual | Lista sem controle de paginação; todos os itens exibidos em scroll contínuo | Médio |
| CT-ESP-009 | Conteúdo Espiritual | Controle Ativo/Inativo de conteúdo espiritual não exposto na interface | Médio |
| CT-UMB-001 | Linhas de Umbanda | Grade não exibe coluna de Status (Ativo/Inativo) | Baixo |
| CT-UMB-004 | Linhas de Umbanda | Criação de linha falha silenciosamente; formulário não fecha e não exibe mensagem de erro | Alto |
| CT-UMB-007 | Linhas de Umbanda | Painel de detalhes das entidades não implementado | Baixo |
| CT-UMB-009 | Linhas de Umbanda | Controle Ativo/Inativo de linhas de Umbanda não exposto na interface | Médio |
| CT-MSG-005 | Mensagens | Botão individual de "marcar como lida" não existe; apenas abas de filtro | Baixo |
| CT-MSG-006 | Mensagens | Botão individual de "marcar como não lida" não existe; apenas abas de filtro | Baixo |

---

## 4. Casos Bloqueados

| Código | Módulo | Motivo do bloqueio |
|---|---|---|
| CT-AUTH-006 | Autenticação | Refresh token não exposto na interface do AdminDashboard |
| CT-ORI-007 | Orixás | Exclusão não testada por risco de violação de integridade referencial com membros cadastrados |
| CT-UMB-010 | Linhas de Umbanda | Exclusão não testada por risco de impacto em membros vinculados |
| CT-GRL-007 | Geral | Usuário com role "Editor" não cadastrado no ambiente de teste |

---

## 5. Conclusão

O AdminDashboard do Batuara.net está **operacional para as funcionalidades principais**: login, cadastro, edição e exclusão de dados funcionam corretamente na grande maioria dos módulos. Os módulos de Configurações, Membros da Casa e Calendário são os mais robustos, com aprovação acima de 85%.

Os pontos que merecem atenção imediata são os **erros silenciosos** — situações em que o sistema falha sem avisar o usuário (limites de campo, falha ao criar linha de Umbanda e orixá). Esses casos são os mais problemáticos porque deixam o administrador sem saber se a ação foi bem-sucedida ou não.

O módulo de **Linhas de Umbanda** concentrou o maior número de reprovações (4 de 10 casos), principalmente pela ausência do controle de ativo/inativo e pela falha silenciosa na criação.

---

## 6. Próximos Passos

### 🔴 Alta prioridade — corrigir antes da próxima versão

| Ação | Responsável sugerido | Prazo sugerido |
|---|---|---|
| CT-EVT-009/010: Exibir mensagem de erro quando título ou descrição excedem o limite de caracteres | Dev Frontend | 1 semana |
| CT-ORI-002: Exibir feedback de erro ao tentar criar orixá com formato de cor inválido | Dev Frontend | 1 semana |
| CT-UMB-004: Corrigir falha silenciosa ao criar linha de Umbanda; exibir erro ao usuário | Dev Frontend | 1 semana |

### 🟡 Média prioridade — implementar no próximo sprint

| Ação | Responsável sugerido | Prazo sugerido |
|---|---|---|
| CT-CAL-008 / CT-GUI-006 / CT-ESP-009 / CT-UMB-009: Adicionar controle Ativo/Inativo nos módulos que ainda não possuem (Calendário, Guias, Conteúdo Espiritual, Linhas de Umbanda) | Dev Frontend + Backend | 2–3 semanas |
| CT-EVT-004: Implementar filtro por período (data início/fim) na lista de eventos | Dev Frontend | 1–2 semanas |
| CT-EVT-007: Definir se Descrição é obrigatória em eventos; se sim, adicionar validação; se não, documentar intencionalmente | Product Owner + Dev | 1 semana |
| CT-ESP-001: Adicionar paginação à lista de conteúdos espirituais | Dev Frontend | 1 semana |
| CT-GRL-007: Cadastrar usuário com role "Editor" no ambiente de teste e reexecutar testes de restrição de acesso | QA + DevOps | 1 semana |

### 🟢 Baixa prioridade — melhorias para versões futuras

| Ação | Responsável sugerido | Prazo sugerido |
|---|---|---|
| CT-GUI-008 / CT-UMB-007: Implementar painel de detalhes (drawer lateral) nos módulos Guias e Linhas de Umbanda | Dev Frontend | 3–4 semanas |
| CT-MBR-001 / CT-UMB-001: Adicionar coluna de Status (Ativo/Inativo) visível nas grades de Membros e Linhas de Umbanda | Dev Frontend | 1–2 semanas |
| CT-MSG-005/006: Adicionar botões individuais de marcar mensagem como lida/não lida | Dev Frontend | 1–2 semanas |
| CT-DASH-003: Adicionar paginação ao log de atividades do Dashboard | Dev Frontend | 1–2 semanas |
| CT-AUTH-006: Avaliar necessidade de expor controle de refresh token na interface | Product Owner | Backlog |
| CT-ORI-007 / CT-UMB-010: Definir política de exclusão com verificação de integridade referencial e implementar na UI | Dev Backend + Frontend | 3–4 semanas |
