-- Casa de Caridade Batuara - Database Logging Setup
-- Configuração de logging e monitoramento do banco de dados

-- Habilitar logging de queries lentas (queries > 1 segundo)
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Habilitar logging de conexões
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;

-- Configurar logging de statements
ALTER SYSTEM SET log_statement = 'mod'; -- Log INSERT, UPDATE, DELETE

-- Configurar logging de locks
ALTER SYSTEM SET log_lock_waits = on;

-- Configurar logging de checkpoints
ALTER SYSTEM SET log_checkpoints = on;

-- Configurar formato de log
ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';

-- Configurar rotação de logs
ALTER SYSTEM SET logging_collector = on;
ALTER SYSTEM SET log_directory = 'pg_log';
ALTER SYSTEM SET log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log';
ALTER SYSTEM SET log_rotation_age = '1d';
ALTER SYSTEM SET log_rotation_size = '100MB';

-- Recarregar configuração
SELECT pg_reload_conf();

-- Criar função para monitoramento de performance
CREATE OR REPLACE FUNCTION batuara.get_slow_queries()
RETURNS TABLE (
    query TEXT,
    calls BIGINT,
    total_time DOUBLE PRECISION,
    mean_time DOUBLE PRECISION,
    rows BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pg_stat_statements.query,
        pg_stat_statements.calls,
        pg_stat_statements.total_exec_time,
        pg_stat_statements.mean_exec_time,
        pg_stat_statements.rows
    FROM pg_stat_statements
    WHERE pg_stat_statements.mean_exec_time > 100 -- queries com mais de 100ms
    ORDER BY pg_stat_statements.mean_exec_time DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Criar função para monitoramento de conexões
CREATE OR REPLACE FUNCTION batuara.get_connection_stats()
RETURNS TABLE (
    database_name NAME,
    active_connections BIGINT,
    idle_connections BIGINT,
    total_connections BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        datname,
        COUNT(*) FILTER (WHERE state = 'active') as active_connections,
        COUNT(*) FILTER (WHERE state = 'idle') as idle_connections,
        COUNT(*) as total_connections
    FROM pg_stat_activity
    WHERE datname IS NOT NULL
    GROUP BY datname
    ORDER BY total_connections DESC;
END;
$$ LANGUAGE plpgsql;

-- Criar função para monitoramento de tamanho das tabelas
CREATE OR REPLACE FUNCTION batuara.get_table_sizes()
RETURNS TABLE (
    schema_name NAME,
    table_name NAME,
    size_pretty TEXT,
    size_bytes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname::NAME,
        tablename::NAME,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size_pretty,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
    FROM pg_tables
    WHERE schemaname = 'batuara'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- Criar função para verificar saúde do banco
CREATE OR REPLACE FUNCTION batuara.health_check()
RETURNS TABLE (
    metric TEXT,
    value TEXT,
    status TEXT
) AS $$
BEGIN
    -- Verificar conexões ativas
    RETURN QUERY
    SELECT 
        'Active Connections'::TEXT as metric,
        COUNT(*)::TEXT as value,
        CASE 
            WHEN COUNT(*) < 50 THEN 'OK'
            WHEN COUNT(*) < 100 THEN 'WARNING'
            ELSE 'CRITICAL'
        END as status
    FROM pg_stat_activity
    WHERE state = 'active';
    
    -- Verificar tamanho do banco
    RETURN QUERY
    SELECT 
        'Database Size'::TEXT as metric,
        pg_size_pretty(pg_database_size(current_database())) as value,
        'INFO'::TEXT as status;
    
    -- Verificar uptime
    RETURN QUERY
    SELECT 
        'Uptime'::TEXT as metric,
        (now() - pg_postmaster_start_time())::TEXT as value,
        'INFO'::TEXT as status;
    
    -- Verificar cache hit ratio
    RETURN QUERY
    SELECT 
        'Cache Hit Ratio'::TEXT as metric,
        ROUND(
            (sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read))) * 100, 2
        )::TEXT || '%' as value,
        CASE 
            WHEN ROUND((sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read))) * 100, 2) > 95 THEN 'OK'
            WHEN ROUND((sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read))) * 100, 2) > 90 THEN 'WARNING'
            ELSE 'CRITICAL'
        END as status
    FROM pg_statio_user_tables;
END;
$$ LANGUAGE plpgsql;

-- Criar view para monitoramento de eventos
CREATE OR REPLACE VIEW batuara.events_monitoring AS
SELECT 
    'Total Events'::TEXT as metric,
    COUNT(*)::TEXT as value,
    'Active: ' || COUNT(*) FILTER (WHERE "IsActive" = true)::TEXT as details
FROM batuara."Events"
UNION ALL
SELECT 
    'Events This Month'::TEXT as metric,
    COUNT(*)::TEXT as value,
    'Types: ' || string_agg(DISTINCT "Type"::TEXT, ', ') as details
FROM batuara."Events"
WHERE "Date" >= date_trunc('month', CURRENT_DATE)
  AND "Date" < date_trunc('month', CURRENT_DATE) + interval '1 month'
  AND "IsActive" = true
UNION ALL
SELECT 
    'Upcoming Events'::TEXT as metric,
    COUNT(*)::TEXT as value,
    'Next 30 days' as details
FROM batuara."Events"
WHERE "Date" >= CURRENT_DATE
  AND "Date" <= CURRENT_DATE + interval '30 days'
  AND "IsActive" = true;

-- Criar view para monitoramento de atendimentos
CREATE OR REPLACE VIEW batuara.attendance_monitoring AS
SELECT 
    'Total Attendances'::TEXT as metric,
    COUNT(*)::TEXT as value,
    'Active: ' || COUNT(*) FILTER (WHERE "IsActive" = true)::TEXT as details
FROM batuara."CalendarAttendances"
UNION ALL
SELECT 
    'This Week Attendances'::TEXT as metric,
    COUNT(*)::TEXT as value,
    'Kardecismo: ' || COUNT(*) FILTER (WHERE "Type" = 1)::TEXT || 
    ', Umbanda: ' || COUNT(*) FILTER (WHERE "Type" = 2)::TEXT as details
FROM batuara."CalendarAttendances"
WHERE "Date" >= date_trunc('week', CURRENT_DATE)
  AND "Date" < date_trunc('week', CURRENT_DATE) + interval '1 week'
  AND "IsActive" = true;

-- Comentários para documentação
COMMENT ON FUNCTION batuara.get_slow_queries() IS 'Retorna as 20 queries mais lentas do sistema';
COMMENT ON FUNCTION batuara.get_connection_stats() IS 'Retorna estatísticas de conexões por banco de dados';
COMMENT ON FUNCTION batuara.get_table_sizes() IS 'Retorna o tamanho das tabelas do schema batuara';
COMMENT ON FUNCTION batuara.health_check() IS 'Verifica a saúde geral do banco de dados';
COMMENT ON VIEW batuara.events_monitoring IS 'View para monitoramento de eventos';
COMMENT ON VIEW batuara.attendance_monitoring IS 'View para monitoramento de atendimentos';

-- Criar usuário para monitoramento (opcional)
-- CREATE USER batuara_monitor WITH PASSWORD 'monitor_password';
-- GRANT CONNECT ON DATABASE batuara_dev TO batuara_monitor;
-- GRANT USAGE ON SCHEMA batuara TO batuara_monitor;
-- GRANT SELECT ON ALL TABLES IN SCHEMA batuara TO batuara_monitor;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA batuara TO batuara_monitor;