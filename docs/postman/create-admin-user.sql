-- Script SQL para criar o primeiro usuário administrador
-- Execute este script no PostgreSQL antes de usar a collection do Postman

-- Conectar ao banco de dados CasaBatuara
\c CasaBatuara;

INSERT INTO users (
    email,
    password_hash, 
    name,
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    'admin@example.com',
    '-- REPLACE_WITH_BCRYPT_HASH --', -- defina o hash da senha gerado localmente
    'Administrador Batuara',
    1, -- Admin role
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Verificar se o usuário foi criado
SELECT id, email, name, role, is_active, created_at 
FROM users 
WHERE email = 'admin@example.com';

-- Informações sobre roles:
-- 1 = Admin
-- 2 = Editor  
-- 3 = Viewer

COMMIT;
