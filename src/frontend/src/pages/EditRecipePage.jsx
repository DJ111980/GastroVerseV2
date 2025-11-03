/**
 * @fileoverview Página para editar los detalles de una receta existente.
 * @author Ronald
 * @version 1.1.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../services/api';
import './AuthForm.css';
import './CreateRecipePage.css';

const parseInstructions = (instructionsText) => {
  if (!instructionsText) return ['', '', '', ''];
  const steps = instructionsText.split(/\s*(?=\d+\.\s)/).filter(Boolean);
  const parsedSteps = steps.map(step => step.replace(/^\d+\.\s*/, '').trim());
  while (parsedSteps.length < 4) parsedSteps.push('');
  return parsedSteps.slice(0, 4);
};

const EditRecipePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- ESTADOS DEL FORMULARIO ---
  const [titulo, setTitulo] = useState('');
  const [pasos, setPasos] = useState(['', '', '', '']);
  const [tiempo_preparacion, setTiempoPreparacion] = useState('');
  const [dificultad, setDificultad] = useState('Fácil');
  const [imagen_url, setImagenUrl] = useState('');

  // --- ESTADOS UI ---
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const imagenDefault =
    "https://www.shutterstock.com/image-vector/girl-confuse-decide-eating-junk-260nw-2013231194.jpg";

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get(`/recetas/${id}`);
        const data = response.data;

        setTitulo(data.titulo);
        setPasos(parseInstructions(data.instrucciones));
        setTiempoPreparacion(data.tiempo_preparacion || '');
        setDificultad(data.dificultad);
        setImagenUrl(data.imagen_url || '');
      } catch (err) {
        setError("No se pudieron cargar los datos de la receta para editar.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handlePasoChange = (i, value) => {
    const nuevos = [...pasos];
    nuevos[i] = value;
    setPasos(nuevos);
  };

  const validarImagen = (value) => {
    setImagenUrl(value);
    if (value && !value.startsWith("http")) {
      showToast("URL inválida, debe comenzar por http o https");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    const instruccionesFormateadas = pasos
      .map((paso, i) => `${i + 1}. ${paso.trim()}`)
      .filter(p => p.length > 3)
      .join(' ');

    const finalImage = imagen_url.trim() === '' ? imagenDefault : imagen_url.trim();

    const updatedRecipe = {
      titulo,
      instrucciones: instruccionesFormateadas,
      dificultad,
      imagen_url: finalImage,
      ...(tiempo_preparacion && { tiempo_preparacion: parseInt(tiempo_preparacion, 10) }),
    };

    try {
      await apiClient.put(`/recetas/${id}`, updatedRecipe);
      console.log("→ Enviando recipeData:", updatedRecipe);
      navigate(`/recetas/${id}`, {
        replace: true,
        state: { message: '¡Receta actualizada exitosamente!' }
      });
    } catch (err) {
      setError(err.response?.data?.error || "Ocurrió un error al guardar.");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <div className="status-message">Cargando datos...</div>;

  return (
    <div className="auth-form-container">

      {toast && <div className="toast-image">{toast}</div>}

      <form onSubmit={handleSubmit} className="auth-form" style={{ maxWidth: '600px' }}>
        <h2>Editar Receta</h2>

        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label htmlFor="titulo">Título de la Receta</label>
          <input id="titulo" type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
        </div>

        {/* ✅ Campo URL con botón + preview */}
        <div className="form-group">
          <label htmlFor="imagen_url">URL de la Imagen (opcional)</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              id="imagen_url"
              type="url"
              placeholder="Ej: https://misimagenes.com/foto.jpg"
              value={imagen_url}
              onChange={(e) => validarImagen(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="button" className="default-image-btn" onClick={() => setImagenUrl(imagenDefault)}>
              Default
            </button>
          </div>

          {imagen_url && (
            <img
              src={imagen_url}
              alt="preview"
              style={{
                width: "120px",
                marginTop: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc"
              }}
            />
          )}
        </div>

        <div className="form-group">
          <label>Instrucciones</label>
          <div className="pasos-container">
            {pasos.map((paso, i) => (
              <div key={i} className="paso-input-group">
                <span className="paso-numero">{i + 1}.</span>
                <input
                  type="text"
                  placeholder={`Describe el paso ${i + 1}`}
                  value={paso}
                  onChange={(e) => handlePasoChange(i, e.target.value)}
                  required={i === 0}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="tiempo_preparacion">Tiempo de Preparación (minutos)</label>
          <input id="tiempo_preparacion" type="number" min="1" value={tiempo_preparacion} onChange={(e) => setTiempoPreparacion(e.target.value)} />
        </div>

        <div className="form-group">
          <label htmlFor="dificultad">Dificultad</label>
          <select id="dificultad" value={dificultad} onChange={(e) => setDificultad(e.target.value)}>
            <option value="Fácil">Fácil</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Difícil">Difícil</option>
          </select>
        </div>

        <button type="submit" className="auth-button" disabled={formLoading}>
          {formLoading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
};

export default EditRecipePage;
