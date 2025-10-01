-- Índices para búsquedas frecuentes
CREATE INDEX idx_recetas_titulo ON recetas USING gin(to_tsvector('spanish', titulo));
CREATE INDEX idx_ingredientes_nombre ON ingredientes USING gin(to_tsvector('spanish', nombre));
CREATE INDEX idx_recetas_dificultad ON recetas(dificultad);

-- Índices para relaciones
CREATE INDEX idx_favoritos_usuario ON favoritos(usuario_id);
CREATE INDEX idx_favoritos_receta ON favoritos(receta_id);
CREATE INDEX idx_ingredientes_receta ON ingredientes(receta_id);

-- Índices para optimizar consultas
CREATE INDEX idx_tokens_blacklist_token ON tokens_blacklist(token);
CREATE INDEX idx_tokens_blacklist_usuario_id ON tokens_blacklist(usuario_id);
CREATE INDEX idx_tokens_blacklist_expira_en ON tokens_blacklist(expira_en);

-- --- NUEVO: ÍNDICE PARA RENDIMIENTO ---
CREATE INDEX idx_recetas_usuario_id ON public.recetas(usuario_id);
