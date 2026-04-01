@echo off
chcp 65001 >nul
cls

echo 🏠 Casa de Caridade Batuara - Frontend Development Setup
echo =======================================================
echo.

:: Verificar se Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado. Por favor, instale o Node.js 16+ antes de continuar.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado: 
node --version

:: Verificar se as dependências estão instaladas
if not exist "public-website\node_modules" (
    echo 📦 Instalando dependências do site público...
    cd public-website
    call npm install
    if errorlevel 1 (
        echo ❌ Erro ao instalar dependências do site público
        pause
        exit /b 1
    )
    cd ..
    echo ✅ Dependências do site público instaladas
)

if not exist "AdminDashboard\node_modules" (
    echo 📦 Instalando dependências do dashboard...
    cd AdminDashboard
    call npm install
    if errorlevel 1 (
        echo ❌ Erro ao instalar dependências do dashboard
        pause
        exit /b 1
    )
    cd ..
    echo ✅ Dependências do dashboard instaladas
)

if not exist "node_modules" (
    echo 📦 Instalando ferramentas de desenvolvimento...
    call npm install
    if errorlevel 1 (
        echo ❌ Erro ao instalar ferramentas
        pause
        exit /b 1
    )
    echo ✅ Ferramentas instaladas
)

:menu
echo.
echo Escolha uma opção:
echo 1) 🌐 Executar apenas o Site Público (porta 3000)
echo 2) 🔧 Executar apenas o Dashboard Admin (porta 3001)
echo 3) 🚀 Executar ambos simultaneamente
echo 4) 📦 Reinstalar dependências
echo 5) ❌ Sair
echo.
set /p choice="Digite sua escolha (1-5): "

if "%choice%"=="1" (
    echo 🌐 Iniciando Site Público...
    echo 📱 Acesse: http://localhost:3000
    cd public-website
    call npm start
    goto end
)

if "%choice%"=="2" (
    echo 🔧 Iniciando Dashboard Admin...
    echo 🔧 Acesse: http://localhost:3001
    echo 💡 Credenciais: ^<email-admin^> / ^<senha-admin^>
    cd AdminDashboard
    set PORT=3001
    call npm start
    goto end
)

if "%choice%"=="3" (
    echo 🚀 Iniciando ambos os projetos...
    echo.
    echo 📱 Site Público: http://localhost:3000
    echo 🔧 Dashboard Admin: http://localhost:3001
    echo.
    echo 💡 Credenciais do Dashboard:
    echo    Email: ^<email-admin^>
    echo    Senha: ^<senha-admin^>
    echo.
    echo 🔄 Use Ctrl+C para parar ambos os servidores
    echo.
    call npm run start:all
    goto end
)

if "%choice%"=="4" (
    echo 📦 Reinstalando dependências...
    rmdir /s /q public-website\node_modules 2>nul
    rmdir /s /q AdminDashboard\node_modules 2>nul
    rmdir /s /q node_modules 2>nul
    
    cd public-website
    call npm install
    cd ..\AdminDashboard
    call npm install
    cd ..
    call npm install
    
    echo ✅ Dependências reinstaladas com sucesso!
    pause
    goto menu
)

if "%choice%"=="5" (
    echo 👋 Até logo!
    goto end
)

echo ❌ Opção inválida. Tente novamente.
pause
goto menu

:end
pause
