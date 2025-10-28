/**
 * @fileoverview Servicio para la lógica de negocio de recetas.
 * @author Tu Nombre
 * @version 1.0.0
 * @description Centraliza la lógica de negocio, incluyendo la interacción con Supabase Storage.
 */

const RecetasModel = require('../models/recetasModel');
const supabase = require('../config/supabase');
const path = require('path');

const BUCKET_NAME = 'recetas';

/**
 * Sube un archivo a Supabase Storage.
 * @param {Object} file - El archivo recibido de multer.
 * @returns {Promise<string>} La URL pública del archivo subido.
 */
async function subirImagen(file) {
    const fileName = `img_${Date.now()}${path.extname(file.originalname)}`;
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        throw new Error(`Error al subir la imagen: ${error.message}`);
    }
    
    // Obtenemos la URL pública del archivo
    const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);
    return publicUrl;
}

/**
 * Elimina un archivo de Supabase Storage.
 * @param {string} imageUrl - La URL de la imagen a eliminar.
 */
async function eliminarImagen(imageUrl) {
    if (!imageUrl) return;
    try {
        const imageName = imageUrl.split('/').pop();
        await supabase.storage.from(BUCKET_NAME).remove([imageName]);
    } catch (error) {
        // Logueamos el error pero no detenemos el flujo si falla la eliminación
        console.error(`No se pudo eliminar la imagen ${imageUrl}:`, error.message);
    }
}


const RecetasService = {
    async crearReceta(recetaData, usuarioId, imagenFile) {
        let imagen_url = null;
        if (imagenFile) {
            imagen_url = await subirImagen(imagenFile);
        }
        
        const nuevaReceta = { ...recetaData, usuario_id: usuarioId, imagen_url };
        return RecetasModel.crearReceta(nuevaReceta);
    },

    async actualizarReceta(recetaId, datosActualizacion, usuarioId, imagenFile) {
        const recetaExistente = await RecetasModel.obtenerPorId(recetaId);
        if (!recetaExistente) {
            throw new Error('Receta no encontrada');
        }
        if (recetaExistente.usuario_id !== usuarioId) {
            throw new Error('Acción no autorizada: no eres el propietario de esta receta.');
        }

        let imagen_url = recetaExistente.imagen_url;
        if (imagenFile) {
            // Si hay una imagen nueva, eliminamos la anterior
            await eliminarImagen(recetaExistente.imagen_url);
            imagen_url = await subirImagen(imagenFile);
        }

        const datosParaActualizar = { ...datosActualizacion, imagen_url };
        return RecetasModel.actualizarReceta(recetaId, datosParaActualizar);
    },

    async eliminarReceta(recetaId, usuarioId) {
        const recetaExistente = await RecetasModel.obtenerPorId(recetaId);
        if (!recetaExistente) {
            throw new Error('Receta no encontrada');
        }
        if (recetaExistente.usuario_id !== usuarioId) {
            throw new Error('Acción no autorizada: no eres el propietario de esta receta.');
        }

        // Eliminar la imagen del storage ANTES de borrar el registro de la BD
        await eliminarImagen(recetaExistente.imagen_url);

        return RecetasModel.eliminarReceta(recetaId);
    },

    async listarRecetas() {
        return RecetasModel.obtenerTodas();
    },

    async obtenerUna(id) {
        return RecetasModel.obtenerPorId(id);
    },

    async listarRecetasPorUsuario(usuarioId) {
        return RecetasModel.obtenerPorUsuarioId(usuarioId);
    }
};

module.exports = RecetasService;