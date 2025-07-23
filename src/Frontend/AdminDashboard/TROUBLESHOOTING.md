# Guia de Solução de Problemas - AdminDashboard

Este guia contém soluções para problemas comuns encontrados ao iniciar o AdminDashboard.

## Problema: AdminDashboard não inicia

### Solução 1: Limpar cache e reinstalar dependências

Execute o script `reset-dependencies.sh`:

```bash
./reset-dependencies.sh
```

Este script irá:
1. Remover a pasta `node_modules`
2. Remover o arquivo `package-lock.json`
3. Limpar o cache do npm
4. Reinstalar todas as dependências

### Solução 2: Verificar conflitos de porta

Execute o script `start-with-port-check.sh`:

```bash
./start-with-port-check.sh
```

Este script irá:
1. Verificar se a porta 3001 está em uso
2. Se estiver em uso, tentará portas alternativas (3002, 3003, 3004, 3005)
3. Iniciará o servidor na primeira porta disponível

### Solução 3: Verificar versões de Node.js e npm

Certifique-se de que você está usando versões compatíveis:

```bash
node -v  # Deve ser v18.x ou superior
npm -v   # Deve ser v9.x ou superior
```

Se as versões forem incompatíveis, considere usar nvm para instalar versões compatíveis.

### Solução 4: Verificar erros no console

Execute o comando abaixo para ver erros detalhados:

```bash
npm start --verbose
```

### Solução 5: Verificar configurações de ambiente

Certifique-se de que os arquivos `.env` e `.env.local` estão configurados corretamente:

1. `.env` deve conter `PORT=3001`
2. `.env.local` deve conter `REACT_APP_API_URL=http://localhost:5000/api`

## Problema: Conflitos com o PublicWebsite

Se o AdminDashboard e o PublicWebsite estiverem em conflito:

1. Certifique-se de que o PublicWebsite está usando a porta 3000
2. Certifique-se de que o AdminDashboard está usando a porta 3001
3. Inicie os serviços separadamente em terminais diferentes

## Problema: Erros de TypeScript

Se você encontrar erros de TypeScript:

1. Verifique se a versão do TypeScript é compatível com o React
2. Execute `npm install typescript@4.9.5 --save-exact` para garantir a versão correta
3. Limpe o cache do TypeScript: `rm -rf node_modules/.cache/typescript`