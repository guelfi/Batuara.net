@echo off
echo === Configurando Port Forwarding Windows para WSL ===
echo.
echo Removendo configuracoes existentes...
netsh interface portproxy delete v4tov4 listenport=3000 listenaddress=0.0.0.0 2>nul
netsh interface portproxy delete v4tov4 listenport=3001 listenaddress=0.0.0.0 2>nul
echo.
echo Adicionando redirecionamento para porta 3000 (PublicWebsite)...
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=172.17.158.1
echo.
echo Adicionando redirecionamento para porta 3001 (AdminDashboard)...
netsh interface portproxy add v4tov4 listenport=3001 listenaddress=0.0.0.0 connectport=3001 connectaddress=172.17.158.1
echo.
echo Configurando Windows Firewall...
netsh advfirewall firewall delete rule name="WSL PublicWebsite" 2>nul
netsh advfirewall firewall delete rule name="WSL AdminDashboard" 2>nul
netsh advfirewall firewall add rule name="WSL PublicWebsite" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="WSL AdminDashboard" dir=in action=allow protocol=TCP localport=3001
echo.
echo === Verificando Configuracoes ===
netsh interface portproxy show all
echo.
echo === Testando Conectividade ===
echo Testando PublicWebsite...
curl -s --connect-timeout 5 http://192.168.15.120:3000 | findstr "DOCTYPE" && echo [OK] PublicWebsite acessivel || echo [ERRO] PublicWebsite nao acessivel
echo.
echo Testando AdminDashboard...
curl -s --connect-timeout 5 http://192.168.15.120:3001 | findstr "DOCTYPE" && echo [OK] AdminDashboard acessivel || echo [ERRO] AdminDashboard nao acessivel
echo.
echo === Instrucoes ===
echo 1. Agora voce pode acessar os frontends pelo IP da rede local:
echo    - PublicWebsite: http://192.168.15.120:3000
echo    - AdminDashboard: http://192.168.15.120:3001
echo 2. Teste pelo celular conectado na mesma rede WiFi
echo 3. Se nao funcionar, verifique o Windows Defender
echo.
echo Configuracao concluida!
pause