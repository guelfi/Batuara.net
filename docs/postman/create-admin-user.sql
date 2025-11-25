-- Script SQL para criar o primeiro usuário administrador
-- Execute este script no PostgreSQL antes de usar a collection do Postman

-- Conectar ao banco de dados CasaBatuara
\c CasaBatuara;

-- Inserir usuário administrador
-- Senha: Admin@123 (hash BCrypt)
INSERT INTO users (
    email,
    password_hash, 
    name,
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    'admin@batuara.org',
    '$2a$11$8K1p/a0dclsgJddgsJUjdOCyGjRH4CyDdHrWrNVH.fOUO1yQquwuW', -- Admin@123
    'Administrador Batuara',
    1, -- Admin role
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Verificar se o usuário foi criado
SELECT id, email, name, role, is_active, created_at 
FROM users 
WHERE email = 'admin@batuara.org';

-- Informações sobre roles:
-- 1 = Admin
-- 2 = Editor  
-- 3 = Viewer

COMMIT;