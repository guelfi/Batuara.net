Preciso implementar de verdade a funcionalidade por trás dos dois toggles que você adicionou em `MemberProfilePage.tsx` ("Contribuição recorrente" e "Autorizar lembrete por WhatsApp"). Hoje eles só geram texto dentro do campo `notes` da contribuição (`MemberProfilePage.tsx:109-113`) — não persistem como dado estruturado e não disparam nenhuma automação. Preciso que isso vire funcionalidade real.

## Estado atual confirmado no código

- `HouseMemberContribution` (`src/Backend/Batuara.Domain/Entities/HouseMemberContribution.cs`) não tem colunas `IsRecurring` nem `AllowWhatsAppReminder` — só `HouseMemberId, ReferenceMonth, DueDate, Amount, Status, PaidAt, Notes`.
- `HouseMember.AddContribution` (`src/Backend/Batuara.Domain/Entities/HouseMember.cs:128`) e `HouseMemberContributionService`/`HouseMemberService.AddSelfContributionAsync` (`src/Backend/Batuara.Infrastructure/HouseMembers/Services/HouseMemberService.cs:265`) não recebem nem persistem essas flags.
- `MemberContributionRequest` (`src/Backend/Batuara.Application/MemberAuth/Models/MemberAuthModels.cs:48`) e `HouseMemberContributionDto`/`HouseMemberContributionInput` (`src/Backend/Batuara.Application/HouseMembers/Models/HouseMemberModels.cs`) não têm esses campos.
- Não existe nenhum job/serviço em background no projeto (nenhum `IHostedService`/`BackgroundService`, Hangfire ou Quartz) — ou seja, tanto a geração automática de contribuição recorrente quanto o envio agendado de lembrete por WhatsApp precisam de uma peça de infraestrutura nova, não existe hoje nada parecido para reaproveitar.

## O que precisa ser feito

1. **Backend — dados estruturados:**
   - Adicionar `IsRecurring` (bool) e `AllowWhatsAppReminder` (bool) em `HouseMemberContribution`, com migration EF Core nova.
   - Propagar esses campos por `MemberContributionRequest`, `HouseMemberContributionInput`, `HouseMemberContributionDto`, `HouseMember.AddContribution`, `HouseMemberService.AddSelfContributionAsync` e o endpoint `MemberSelfServiceController.AddContribution` (`src/Backend/Batuara.API/Controllers/MemberSelfServiceController.cs:45`).

2. **Frontend — parar de usar `notes` como gambiarra:**
   - Em `MemberProfilePage.tsx`, enviar `isRecurring` e `allowWhatsAppReminder` como campos reais no payload de `addMyMemberContribution`, removendo a concatenação de texto em `notes` (linhas 109-113).
   - Opcional, mas recomendado: mostrar esses dois status na grade de contribuições do Admin (`MembersPage.tsx`), já que hoje o Dirigente da Casa não teria como ver isso sem estrutura.

3. **Automação de recorrência:**
   - Quando uma contribuição com `IsRecurring=true` for marcada como paga (`MarkAsPaid`), gerar automaticamente a contribuição do mês seguinte (mesmo valor, `DueDate` reaproveitando o dia do mês, `IsRecurring=true` propagado).
   - Decidir e documentar o gatilho: pode ser síncrono (dentro do próprio fluxo de marcar como pago) ou via job diário — dado que não há infraestrutura de job hoje, prefira o gatilho síncrono para o primeiro corte, e deixe registrado como melhoria futura migrar para job se o volume justificar.

4. **Automação de lembrete por WhatsApp:**
   - Criar um `BackgroundService` (ou endpoint de cron manual, se preferir simplicidade no primeiro corte) que, X dias antes do `DueDate`, busca contribuições `Status=Pending` e `AllowWhatsAppReminder=true`, e dispara mensagem via `IWhatsAppService` (`src/Backend/Batuara.Application/Notifications/Services/IWhatsAppService.cs`) — vai precisar de um novo método tipo `SendContributionReminderAsync`, já que `SendAuthCodeAsync` é específico do login.
   - Reaproveitar a allowlist/regras operacionais já documentadas em `docs/Evolution API - Operacao OCI.md` (não gerar disparo em massa, respeitar rate limit).

5. **Testes:**
   - Cobrir com testes automatizados (padrão do projeto: xUnit + EF InMemory, ver `src/Backend/Batuara.Infrastructure.Tests/MemberAuth/MemberAuthServiceTests.cs` como referência de estilo) a geração automática de recorrência e o disparo condicional do lembrete (com um fake de `IWhatsAppService`, sem precisar de WhatsApp real).

## Critério de aceite

- Marcar uma contribuição como recorrente e paga gera automaticamente a próxima, sem ação manual do membro.
- Uma contribuição com lembrete autorizado dispara mensagem de WhatsApp perto do vencimento, respeitando allowlist/rate limit — validável com teste automatizado usando um fake de `IWhatsAppService` (não precisa de envio real para o teste passar).
- `tsc --noEmit` e `dotnet test` (via container `mcr.microsoft.com/dotnet/sdk:8.0`, como já vem sendo feito neste projeto) passam sem erros.

## Melhoria de UI/UX adicional (incluir junto)

No login "Filho da Casa" (`LoginPage.tsx`, campo "Celular com DDD", linhas 308-321), o `placeholder="(11) 99999-9999"` mostra a máscara antes de digitar, mas o valor digitado não é formatado — ao digitar, aparece só `11975747470` em vez de `(11) 97574-7470`. O campo usa `value={memberPhone}` / `onChange={(event) => setMemberPhone(event.target.value)}` sem nenhuma formatação.

O projeto já tem o padrão certo pra isso em outro lugar: `formatPhoneBr`/`onlyDigits` (`src/Frontend/AdminDashboard/src/pages/MembersPage.tsx:133-140`), aplicado no `onChange` de um campo de celular (`MembersPage.tsx:804`: `onChange={(e) => setForm((prev) => ({ ...prev, mobilePhone: formatPhoneBr(e.target.value) }))}`).

Aplicar o mesmo padrão em `LoginPage.tsx`: formatar `memberPhone` a cada `onChange` usando essas mesmas funções (extrair para um util compartilhado se fizer sentido, já que hoje `formatPhoneBr`/`onlyDigits` estão declaradas localmente dentro de `MembersPage.tsx` e não são exportadas). Manter o envio pro backend em `apiService.requestMemberCode`/`loginMemberWithCode` normalizado (só dígitos), já que o backend já faz sua própria normalização (`PhoneNumberNormalizer.NormalizeBrazilMobile`).
