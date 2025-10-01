-- Vista para recetas con conteo de favoritos
CREATE VIEW recetas_populares AS
SELECT r.id, r.titulo, COUNT(f.id) as favoritos
FROM recetas r
LEFT JOIN favoritos f ON r.id = f.receta_id
GROUP BY r.id
ORDER BY favoritos DESC;

-- Vista para búsqueda de recetas con ingredientes
CREATE VIEW recetas_con_ingredientes AS
SELECT r.id, r.titulo, 
       string_agg(i.nombre, ', ' ORDER BY i.nombre) AS ingredientes,
       r.tiempo_preparacion, r.dificultad
FROM recetas r
JOIN ingredientes i ON r.id = i.receta_id
GROUP BY r.id;