@echo off
echo 🏠 Iniciando Batuara.net Frontend Applications
echo =============================================
echo.

echo 📱 PublicWebsite estará disponível em: http://localhost:8080
echo 🔧 AdminDashboard estará disponível em: http://localhost:8081
echo.
echo 💡 Credenciais do Dashboard:
echo    Email: admin@casabatuara.org.br
echo    Senha: admin123
echo.

echo Iniciando PublicWebsite na porta 8080...
start "PublicWebsite" cmd /k "cd src\Frontend\PublicWebsite && npm start"

timeout /t 3 /nobreak >nul

echo Iniciando AdminDashboard na porta 8081...
start "AdminDashboard" cmd /k "cd src\Frontend\AdminDashboard && npm start"

echo.
echo ✅ Aplicações iniciadas em janelas separadas!
echo 📱 PublicWebsite: http://localhost:8080
echo 🔧 AdminDashboard: http://localhost:8081
echo.
echo Para parar as aplicações, feche as janelas do terminal ou use Ctrl+C
pause