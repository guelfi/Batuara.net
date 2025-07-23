-- Script SQL para diagnosticar e corrigir dados inconsistentes no banco
-- Execute este script no PostgreSQL para corrigir problemas de autenticação

-- Conectar ao banco de dados CasaBatuara
\c CasaBatuara;

-- 1. DIAGNÓSTICO: Verificar estado atual dos usuários
SELECT 
    id,
    email,
    name,
    role,
    is_active,
    created_at,
    CASE 
        WHEN role = 0 THEN 'Admin (valor inconsistente)'
        WHEN role = 1 THEN 'Admin'
        WHEN role = 2 THEN 'Editor'
        WHEN role = 3 THEN 'Viewer'
        ELSE 'Role desconhecida'
    END as role_description
FROM users 
ORDER BY role, email;

-- 2. CORREÇÃO: Padronizar roles (1=Admin, 2=Editor, 3=Viewer)
-- Corrigir usuários admin que têm role = 0
UPDATE users 
SET role = 1, updated_at = NOW()
WHERE role = 0 AND (email LIKE '%admin%' OR name LIKE '%Admin%');

-- 3. VERIFICAÇÃO: Confirmar correções aplicadas
SELECT 
    id,
    email,
    name,
    role,
    is_active,
    CASE 
        WHEN role = 1 THEN 'Admin'
        WHEN role = 2 THEN 'Editor'
        WHEN role = 3 THEN 'Viewer'
        ELSE 'Role desconhecida'
    END as role_description
FROM users 
ORDER BY role, email;

-- 4. TESTE: Verificar hash de senha do usuário admin principal
SELECT 
    email,
    name,
    role,
    LENGTH(password_hash) as hash_length,
    SUBSTRING(password_hash, 1, 10) || '...' as hash_preview
FROM users 
WHERE email IN ('admin@batuara.org', 'admin@casabatuara.org.br')
ORDER BY email;

-- 5. INFORMAÇÕES: Mostrar estrutura de roles padronizada
SELECT 
    'Roles padronizadas:' as info,
    '1 = Admin, 2 = Editor, 3 = Viewer' as values;

COMMIT;