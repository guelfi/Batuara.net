# Resumo Executivo — Batuara.net

## Objetivos

- Publicar e estabilizar uma API RESTful sob “/batuara-api” para alimentar PublicWebsite e AdminDashboard.
- Implementar segurança em profundidade: MFA, RBAC, rate limiting, WAF, SIEM e pentests no pipeline.
- Cumprir SLAs: p95 ≤ 200ms; p99 ≤ 400ms; throughput alvo ≥ 1000 req/s (edge) com escalabilidade.

## Escopo

- Incluídos
  - Endpoints públicos de leitura: eventos, calendário, orixás, linhas, conteúdos espirituais, site settings e localização.
  - Ações públicas controladas: contato e inscrição em atendimento (quando habilitado).
  - CRUD Admin: eventos, calendário, orixás, linhas, conteúdos espirituais, site settings.
  - Segurança e observabilidade: MFA/RBAC, rate limit, WAF, SIEM, logs estruturados.
  - Documentação OpenAPI 3.0 (Swagger protegido em produção).
- Excluídos
  - Pagamentos/donativos online; notificações push em tempo real.
  - App mobile nativo; moderação avançada de mídia.

## Benefícios e KPIs

- Redução de retrabalho de integração: -30% defeitos por contratos padronizados.
- Experiência do usuário: p95 ≤ 200ms, maior engajamento nas seções dinâmicas (+20% tempo de permanência).
- Segurança operacional: redução de superfície de ataque com MFA/RBAC/WAF/rate limit e pentests por commit.
- Observabilidade: MTTR -40% via logs correlacionados (traceId, userId, IP, userAgent) e SIEM.

## Riscos e Mitigações

- Expansão de escopo (novos domínios): backlog priorizado; gates de decisão.
- Performance em picos: HPA, cache Nginx/ETag, otimizações DB e DTOs de listagem.
- Segurança/WAF: hardening contínuo; ZAP baseline, SAST e dependency scanning por commit.
- Dados legados/migrações: seeds controlados; validações e smoke tests em staging.

## Cronograma Macro (10 dias úteis, revisões a cada 3 dias)

- D0–D2: Contratos, OpenAPI, DTOs, rate limiting básico, políticas de acesso e revisão do Swagger em produção.
- D3: Revisão 1 com stakeholders; ajustes.
- D4–D6: Núcleo — SiteSettings, Events, Contact.
- D6: Revisão 2; smoke tests de SLA/segurança em staging.
- D7–D9: Orixás, UmbandaLines, SpiritualContents; Calendar (P1); Dashboard/Auditoria.
- D9: Revisão 3; testes de desempenho e segurança.
- D10: MFA/RBAC granular, WAF/SIEM, hardening avançado; aprovação final e go/no-go.

> **Nota:** Segurança avançada (MFA, RBAC granular, WAF/SIEM) foi realocada para o final (Bloco 6.4) conforme ROADMAP.md. A fundação técnica (D0–D2) inclui rate limiting básico e políticas de acesso.

## Gates de Decisão

- Gate 1 (D3): Aprovação de contratos e segurança base.
- Gate 2 (D6): Aprovação do núcleo funcional (SiteSettings, Events, Contact).
- Gate Final (D10): Aprovação operacional (SLA, segurança, pentest).

## Alinhamentos Técnicos Obrigatórios

- Prefixo `/batuara-api` em todas as rotas.
- MFA TOTP (fallback SMS; suporte futuro a biometria/WebAuthn) para Admin.
- RBAC granular por endpoint; rate limiting por IP (100 req/h) e por token (1000 req/h).
- Validações robustas contra OWASP Top 10; sanitização/encoding; proteção IDOR; transações atômicas para capacidade.
- Criptografia: TLS 1.3; AES-256 em repouso quando aplicável; segredos no Vault (sem código).
- Headers de segurança (CSP/HSTS/XFO/XCTO) e Swagger protegido em produção.
- SIEM/Logs: Serilog JSON com correlação; alertas no SOC.
- WAF (OCI) em frente ao LB com regras de SQLi/XSS e bot management.

