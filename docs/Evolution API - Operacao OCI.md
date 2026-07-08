# Evolution API - Operacao OCI

## Estado atual

- Compose versionado: `scripts/docker/docker-compose.whatsapp.yml`.
- Compose ativo na OCI: `/var/www/batuara_net/Batuara.net/scripts/docker/docker-compose.whatsapp.yml`.
- Segredos na OCI: `/var/www/batuara_net/Batuara.net/scripts/docker/.env.whatsapp`.
- API publicada apenas em loopback: `http://127.0.0.1:8085`.
- Nenhuma porta publica nova deve ser aberta para a Evolution API.
- Servicos: `batuara-evolution-api`, `batuara-evolution-postgres`, `batuara-evolution-redis`.
- Manager/API nao possuem acesso remoto publico. Acesso administrativo remoto somente via SSH/tunel local.

## Instancia definitiva

Usar `batuara-casa` como nome definitivo da instancia WhatsApp.

`batuara-casa` esta pareada na OCI usando temporariamente o numero pessoal `5511975747470`. Quando houver chip dedicado da Casa, trocar o pareamento para o numero definitivo.

`batuara-dev` foi usada apenas para validacao inicial com numero pessoal e nao deve ser usada nas configuracoes do backend.

## Variaveis do backend

Configurar no ambiente da API, nunca commitar segredos:

```env
WhatsApp__Provider=EvolutionApi
WhatsApp__Enabled=true
WhatsApp__BaseUrl=http://127.0.0.1:8085
WhatsApp__ApiKey=<api-key-da-evolution>
WhatsApp__InstanceName=batuara-casa
WhatsApp__AllowedRecipients=5511975747470,5511995384032
```

Durante desenvolvimento, manter `AllowedRecipients` preenchido. Em producao, remover a allowlist apenas quando o fluxo de login estiver validado com rate limit.

## Pareamento

Para gerar codigo de pareamento por telefone, criar a instancia ja informando `number`. Se a instancia ja estiver em `connecting`, recrie a instancia antes de gerar novo codigo.

Fluxo:

1. `DELETE /instance/delete/{instanceName}` se houver instancia antiga nao conectada.
2. `POST /instance/create` com `instanceName`, `integration=WHATSAPP-BAILEYS`, `qrcode=true` e `number` em E.164 sem `+`.
3. Usar `qrcode.pairingCode` no WhatsApp: `Dispositivos conectados > Conectar dispositivo > Conectar com numero de telefone`.
4. Validar com `GET /instance/connectionState/{instanceName}` ate retornar `open`.

Se o pareamento por codigo ficar instavel, usar tunel SSH local para acessar o Manager sem expor porta publica:

```powershell
ssh -i "C:\Users\MarcoGuelfi\Projetos\Batuara.net\ssh-key-2025-08-28.pem" -N -L 18085:127.0.0.1:8085 ubuntu@129.153.86.168
```

Depois acessar `http://127.0.0.1:18085/manager/` e parear por QR Code.

## Regras operacionais

- O uso atual do numero pessoal `5511975747470` e temporario para validacao operacional.
- Para producao definitiva, usar chip dedicado com WhatsApp Business e perfil da Casa.
- Enviar apenas codigos solicitados pelo proprio membro.
- Nao fazer disparos em massa.
- Nao registrar codigo de autenticacao em logs.
- Manter rate limit no endpoint de solicitacao de codigo.
- Se a sessao cair, repetir o pareamento com responsavel autorizado pela Casa.
- Nunca publicar a porta `8085` em `0.0.0.0` nem abrir regra publica no firewall/OCI para a Evolution API.

## Teste validado

Em 2026-07-07, a OCI enviou mensagens com sucesso via Evolution API para dois numeros autorizados usando a instancia temporaria `batuara-dev`.

Em 2026-07-08, a instancia definitiva `batuara-casa` foi pareada com sucesso, retornou `state=open` e enviou mensagens via OCI recebidas com sucesso em:

- `5511975747470`
- `5511995384032`
