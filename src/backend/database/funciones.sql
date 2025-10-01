-- Función para limpiar tokens expirados
CREATE OR REPLACE FUNCTION limpiar_tokens_expirados()
RETURNS INTEGER AS $$
DECLARE
    eliminados INTEGER;
BEGIN
    DELETE FROM tokens_blacklist WHERE expira_en <= NOW();
    GET DIAGNOSTICS eliminados = ROW_COUNT;
    RETURN eliminados;
END;
$$ LANGUAGE plpgsql;

-- Función del trigger que limpia automáticamente
CREATE OR REPLACE FUNCTION trigger_limpiar_tokens()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM tokens_blacklist WHERE expira_en <= NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que se ejecuta antes de cada inserción
CREATE TRIGGER trigger_limpiar_tokens_automatico
    BEFORE INSERT ON tokens_blacklist
    FOR EACH ROW
    EXECUTE FUNCTION trigger_limpiar_tokens();

-- Función para verificar si un token está invalidado
CREATE OR REPLACE FUNCTION es_token_invalidado(token_verificar TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    token_encontrado BOOLEAN := FALSE;
BEGIN
    DELETE FROM tokens_blacklist WHERE expira_en <= NOW();
    
    SELECT EXISTS(
        SELECT 1 FROM tokens_blacklist 
        WHERE token = token_verificar
    ) INTO token_encontrado;
    
    RETURN token_encontrado;
END;
$$ LANGUAGE plpgsql;

-- Función para invalidar un token
CREATE OR REPLACE FUNCTION invalidar_token(
    token_a_invalidar TEXT,
    id_usuario INTEGER,
    tiempo_expiracion TIMESTAMP DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    expira_en_final TIMESTAMP;
BEGIN
    IF tiempo_expiracion IS NULL THEN
        expira_en_final := NOW() + INTERVAL '30 days';
    ELSE
        expira_en_final := tiempo_expiracion;
    END IF;
    
    INSERT INTO tokens_blacklist (token, usuario_id, expira_en)
    VALUES (token_a_invalidar, id_usuario, expira_en_final)
    ON CONFLICT (token) DO NOTHING;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Función para estadísticas de la blacklist
CREATE OR REPLACE FUNCTION estadisticas_blacklist()
RETURNS TABLE(
    total_tokens INTEGER,
    tokens_activos INTEGER,
    tokens_expirados INTEGER,
    usuarios_con_tokens INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_tokens,
        COUNT(CASE WHEN expira_en > NOW() THEN 1 END)::INTEGER as tokens_activos,
        COUNT(CASE WHEN expira_en <= NOW() THEN 1 END)::INTEGER as tokens_expirados,
        COUNT(DISTINCT usuario_id)::INTEGER as usuarios_con_tokens
    FROM tokens_blacklist;
END;
$$ LANGUAGE plpgsql;