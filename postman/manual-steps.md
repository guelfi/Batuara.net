# Guia Completo - Projeto Batuara

## Status Atual - Projeto Batuara

### ✅ CONCLUÍDO:
- Código corrigido e compilando sem erros
- Configurações JWT corrigidas
- Modelos de dados atualizados
- Todos os serviços funcionando (computador + mobile)
- API acessível externamente (0.0.0.0:3003)
- Frontends funcionando perfeitamente

### 🎯 PRÓXIMA FASE:
- Correção dos dados no banco de dados
- Melhorias e funcionalidades da API
- Integração completa Frontend + API

## Comandos para Executar

### 1. Primeiro, aplicar correções no banco de dados
```bash
# Conectar ao PostgreSQL e executar script de correção
psql -U postgres -f fix-user-data.sql
```

### 2. Verificar se as correções foram aplicadas
```bash
# Conectar ao banco para verificar
psql -U postgres -d CasaBatuara -c "SELECT id, email, name, role, is_active FROM users ORDER BY role, email;"
```

### 3. Testar hash de senha (opcional - para debug)
```bash
# Se quiser testar o hash de senha separadamente
cd Batuara.net/postman
# Criar projeto temporário para testar hash
dotnet new console -n TestHash
cd TestHash
dotnet add package BCrypt.Net-Next
# Copiar conteúdo do test-password-hash.cs para Program.cs
# dotnet run
```

### 4. Iniciar a API
```bash
cd Batuara.net/src/Backend/Batuara.API
dotnet run
```

### 5. Testar as correções
```bash
# Em outro terminal
cd Batuara.net/postman
./test-auth-fix.sh
```

### 6. Se ainda houver problemas, testar login manualmente
```bash
# Teste direto com curl
curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@batuara.org",
    "password": "Admin@123",
    "rememberMe": true
  }' \
  -v
```

### 7. Verificar logs da aplicação
```bash
# Verificar logs em tempo real
tail -f Batuara.net/src/Backend/Batuara.API/logs/application-*.log
```

## Problemas Esperados e Soluções

### Se o login ainda falhar:
1. **Verificar se o hash de senha está correto no banco**
2. **Verificar se as roles foram padronizadas (1=Admin)**
3. **Verificar logs da aplicação para detalhes do erro**

### Se o JWT não funcionar:
1. **Verificar se as configurações JWT estão corretas no appsettings.Development.json**
2. **Verificar se o middleware de autenticação está configurado**

## Arquivos Importantes Criados/Modificados

### Scripts SQL:
- `fix-user-data.sql` - Corrige dados inconsistentes no banco
- `create-admin-user.sql` - Cria usuário admin inicial

### Scripts de Teste:
- `test-auth-fix.sh` - Testa correções do sistema
- `test-password-hash.cs` - Testa hash de senhas

### Código Corrigido:
- `appsettings.Development.json` - Configurações JWT completas
- `LoginResponse.cs` - Propriedade AccessToken corrigida
- `UserRole.cs` - Enum padronizado (1=Admin, 2=Editor, 3=Viewer)
- `AuthService.cs` - Logs detalhados e método RegisterFirstAdmin
- `JwtService.cs` - Logs detalhados para debugging

## Próximos Passos Quando Retomar

### FASE 1: Correção da API (Passos 1-7 acima)
1. Execute os comandos na ordem listada
2. Se tudo funcionar, a correção da API estará completa
3. Documente os resultados dos testes

### FASE 2: Testes dos Frontends

#### 8. Testar AdminDashboard
```bash
# Terminal 1 - Iniciar AdminDashboard
cd Batuara.net/src/Frontend/AdminDashboard
npm install  # se necessário
npm start
# Verificar se carrega em http://localhost:3000 (ou porta configurada)
```

**Checklist de Testes AdminDashboard:**
- [ ] Aplicação carrega sem erros
- [ ] Navegação entre páginas funciona
- [ ] Layout responsivo funciona
- [ ] Componentes interativos respondem
- [ ] Console do browser sem erros críticos

#### 9. Testar PublicWebsite
```bash
# Terminal 2 - Iniciar PublicWebsite
cd Batuara.net/src/Frontend/PublicWebsite
npm install  # se necessário
npm start
# Verificar se carrega em http://localhost:3001 (ou porta configurada)
```

**Checklist de Testes PublicWebsite:**
- [ ] Site carrega sem erros
- [ ] Navegação entre páginas funciona
- [ ] Formulários funcionam (mesmo sem backend)
- [ ] Layout responsivo funciona
- [ ] Console do browser sem erros críticos

### FASE 3: Integração Frontend + API

#### 10. Integrar AdminDashboard com API
```bash
# Manter API rodando (Terminal da API)
# Manter AdminDashboard rodando (Terminal 1)
# Testar integração:
```

**Checklist de Integração AdminDashboard:**
- [ ] Login funciona com credenciais da API
- [ ] Páginas carregam dados da API
- [ ] Operações CRUD funcionam
- [ ] Tratamento de erros funciona
- [ ] Logout funciona corretamente

#### 11. Integrar PublicWebsite com API
```bash
# Manter API rodando (Terminal da API)
# Manter PublicWebsite rodando (Terminal 2)
# Testar integração:
```

**Checklist de Integração PublicWebsite:**
- [ ] Dados públicos carregam da API
- [ ] Formulários enviam dados para API
- [ ] Tratamento de erros funciona
- [ ] Performance adequada

### FASE 4: Testes Completos do Sistema

#### 12. Bateria de Testes Final
```bash
# Todos os serviços rodando simultaneamente:
# Terminal API: dotnet run (porta 3003)
# Terminal 1: AdminDashboard (porta 3000)
# Terminal 2: PublicWebsite (porta 3001)
```

**Checklist Sistema Completo:**
- [ ] API responde corretamente
- [ ] AdminDashboard integrado funciona
- [ ] PublicWebsite integrado funciona
- [ ] Comunicação entre componentes funciona
- [ ] Performance geral adequada
- [ ] Logs sem erros críticos

## Scripts de Teste Automatizado

### Criar script para testar frontends
```bash
# Criar script de teste dos frontends
cat > test-frontends.sh << 'EOF'
#!/bin/bash
echo "🧪 Testando Frontends Batuara..."

# Testar AdminDashboard
echo "1. Testando AdminDashboard..."
curl -s http://localhost:3000 > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ AdminDashboard respondendo"
else
    echo "❌ AdminDashboard não está respondendo"
fi

# Testar PublicWebsite
echo "2. Testando PublicWebsite..."
curl -s http://localhost:3001 > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ PublicWebsite respondendo"
else
    echo "❌ PublicWebsite não está respondendo"
fi

# Testar API
echo "3. Testando API..."
curl -s http://localhost:3003/swagger > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ API respondendo"
else
    echo "❌ API não está respondendo"
fi

echo "📋 Teste completo!"
EOF

chmod +x test-frontends.sh
```

## Comandos de Verificação Final

```bash
# Testar todos os componentes
./test-frontends.sh

# Testar API especificamente
./test-auth-fix.sh

# Verificar logs de todos os serviços
# API: tail -f Batuara.net/src/Backend/Batuara.API/logs/application-*.log
# Frontend logs: verificar console do browser
```

## Documentação dos Resultados

Após cada fase, documente:
1. **Problemas encontrados** e suas soluções
2. **Funcionalidades testadas** e status
3. **Performance observada**
4. **Próximas melhorias** necessárias

Se todos os testes passarem, o sistema completo estará funcionando corretamente!