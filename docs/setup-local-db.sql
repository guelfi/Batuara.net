-- Criar usuário e banco que a API espera (batuara_user / batuara_db)
-- Executar como postgres no banco postgres (não no CasaBatuara)
CREATE USER batuara_user WITH PASSWORD 'Batuara2024!@#';
CREATE DATABASE batuara_db OWNER batuara_user ENCODING 'UTF8';
GRANT ALL PRIVILEGES ON DATABASE batuara_db TO batuara_user;
