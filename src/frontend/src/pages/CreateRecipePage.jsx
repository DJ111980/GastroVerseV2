import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import './CreateRecipePage.css';

const CreateRecipePage = () => {
  const [titulo, setTitulo] = useState('');
  const [pasos, setPasos] = useState(['', '', '', '']);
  const [tiempo_preparacion, setTiempoPreparacion] = useState('');
  const [dificultad, setDificultad] = useState('Fácil');
  const [imagen_url, setImagenUrl] = useState('');

  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  const imagenDefault =
    "https://www.shutterstock.com/image-vector/girl-confuse-decide-eating-junk-260nw-2013231194.jpg";

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handlePasoChange = (index, value) => {
    const nuevosPasos = [...pasos];
    nuevosPasos[index] = value;
    setPasos(nuevosPasos);
  };

  const agregarPaso = () => setPasos([...pasos, '']);

  const eliminarPaso = (index) => {
    if (pasos.length <= 1) return;
    setPasos(pasos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError("Debes iniciar sesión para poder crear una receta.");
      return;
    }

    setLoading(true);

    const instrucciones = pasos
      .filter((paso) => paso.trim() !== '')
      .map((paso, index) => `${index + 1}. ${paso.trim()}`)
      .join(' ');

    if (!instrucciones) {
      setError("Debes añadir al menos una instrucción.");
      setLoading(false);
      return;
    }

    const finalImage = imagen_url.trim() === '' ? imagenDefault : imagen_url.trim();

    const recipeData = {
      titulo,
      instrucciones,
      tiempo_preparacion: tiempo_preparacion ? Number(tiempo_preparacion) : null,
      dificultad,
      imagen_url: finalImage,
      usuario_id: user.id
    };

    try {
      const response = await apiClient.post('/recetas', recipeData);
      const newRecipeId = response.data?.id || response.data?.receta?.id;

      navigate(`/recetas/${newRecipeId}/editar-ingredientes`, {
        state: { message: '¡Receta creada exitosamente! Ahora añade los ingredientes.' }
      });

    } catch (err) {
      setError(err.response?.data?.error || 'Ocurrió un error al crear la receta.');
    } finally {
      setLoading(false);
    }
  };

  const validarImagen = (value) => {
    setImagenUrl(value);

    if (value && !value.startsWith('http')) {
      showToast("URL inválida, debe empezar por http o https");
    }
  };

  return (
    <div className="create-recipe-container">
      <form onSubmit={handleSubmit} className="create-recipe-form">

        {toast && <div className="toast-image">{toast}</div>}

        <h1>Paso 1: Detalles de la Receta</h1>
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="titulo">Título de la Receta</label>
          <input id="titulo" type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
        </div>

        {/* ✅ Campo con botón + preview + validación */}
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
            <button
              type="button"
              onClick={() => setImagenUrl(imagenDefault)}
              className="default-image-btn"
            >
              Usar default
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
            {pasos.map((paso, index) => (
              <div key={index} className="paso-input-group">
                <span className="paso-numero">{index + 1}.</span>
                <input
                  type="text"
                  value={paso}
                  onChange={(e) => handlePasoChange(index, e.target.value)}
                  placeholder={`Describe el paso ${index + 1}`}
                />
                <button type="button" onClick={() => eliminarPaso(index)} className="eliminar-paso-btn">×</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={agregarPaso} className="agregar-paso-btn">+ Añadir otro paso</button>
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

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Guardando...' : 'Siguiente: Añadir Ingredientes'}
        </button>
      </form>
    </div>
  );
};

export default CreateRecipePage;
