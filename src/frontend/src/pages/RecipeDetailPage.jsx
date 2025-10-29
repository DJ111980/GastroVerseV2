/**
 * @fileoverview Página de detalles de una receta específica.
 * @author Diego Bugallo
 * @version 1.0.0
 * @description Este componente es el centro de visualización de una receta. Carga y muestra
 * los detalles de la receta, sus ingredientes (si el usuario está autenticado), y proporciona
 * acciones como añadir a favoritos, editar o borrar la receta (si el usuario es el propietario).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/modal/ConfirmModal';
import './RecipeDetailPage.css';

/**
 * Componente funcional que renderiza la página de detalles de una receta.
 * @returns {JSX.Element} La página de detalles de la receta.
 */
const RecipeDetailPage = () => {
  // --- HOOKS ---
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // --- ESTADOS DEL COMPONENTE ---
  const [recipe, setRecipe] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoriteStatus, setFavoriteStatus] = useState('');
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

  /**
   * Efecto para mostrar notificaciones (toasts) que llegan desde otras páginas
   * (ej. después de editar una receta).
   */
  useEffect(() => {
    if (location.state?.message) {
      const toastId = 'page-message-toast';
      if (!toast.isActive(toastId)) {
        toast.success(location.state.message, { toastId: toastId });
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  /**
   * Procesa un string de instrucciones y lo convierte en un array de pasos individuales.
   * @param {string} instructionsText - El string de instrucciones completo.
   * @returns {string[]} Un array de strings, donde cada string es un paso.
   */
  const processInstructions = (instructionsText) => {
    if (!instructionsText) return [];
    const steps = instructionsText.split(/\s*(?=\d+\.\s)/).filter(Boolean);
    return steps.map(step => step.replace(/^\d+\.\s*/, '').trim());
  };

  /**
   * Maneja la acción de añadir la receta actual a la lista de favoritos del usuario.
   * @async
   */
  const handleAddToFavorites = async () => {
    setFavoriteStatus('Añadiendo...');
    try {
      await apiClient.post('/favoritos', { receta_id: recipe.id });
      toast.success('¡Añadido a favoritos!');
      setFavoriteStatus('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'No se pudo añadir a favoritos.';
      toast.error(errorMessage);
      setFavoriteStatus('');
    }
  };

  /**
   * Confirma y ejecuta la eliminación de la receta. Se llama desde el modal.
   * @async
   */
  const confirmDelete = async () => {
    setConfirmModalOpen(false);
    try {
      await apiClient.delete(`/recetas/${id}`);
      toast.success("Receta borrada exitosamente.");
      navigate('/'); // Redirige a la página de inicio después de borrar.
    } catch (err) {
      const errorMessage = err.response?.data?.error || "No se pudo borrar la receta.";
      toast.error(errorMessage);
    }
  };

  /**
   * Abre el modal de confirmación para borrar la receta.
   */
  const openDeleteConfirmation = () => {
    setConfirmModalOpen(true);
  };

  /**
   * Obtiene todos los detalles de la receta (y sus ingredientes si aplica) desde la API.
   * @async
   */
  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const recipeResponse = await apiClient.get(`/recetas/${id}`);
      if (recipeResponse.data && typeof recipeResponse.data === 'object') {
        setRecipe(recipeResponse.data);
      } else {
        throw new Error("Respuesta inválida para la receta.");
      }
      if (isAuthenticated) {
        try {
          const ingredientsResponse = await apiClient.get(`/ingredientes/${id}`);
          if (Array.isArray(ingredientsResponse.data)) {
            setIngredients(ingredientsResponse.data);
          } else {
            setIngredients([]);
          }
        } catch (ingredientsError) {
          console.warn("No se pudieron cargar los ingredientes:", ingredientsError);
          setIngredients([]);
        }
      }
    } catch (err) {
      setError('No se pudo encontrar la receta.');
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated]);

  /**
   * Efecto que llama a `fetchDetails` al montar el componente o si sus dependencias cambian.
   */
  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  if (loading) return <div className="status-message">Cargando detalles...</div>;
  if (error) return <div className="status-message error">{error}</div>;
  if (!recipe) return <div className="status-message">Receta no encontrada.</div>;

  /**
   * Determina si el usuario autenticado es el propietario de la receta.
   * @type {boolean}
   */
  const isOwner = user && recipe.usuario_id && user.id === recipe.usuario_id;
  const instructionSteps = processInstructions(recipe.instrucciones);

  return (
    <>
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onRequestClose={() => setConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que quieres borrar esta receta? Esta acción no se puede deshacer."
      />

      <div className="recipe-detail-container">
        <header className="recipe-header">
          <h1>{recipe.titulo}</h1>
          
          <div className="recipe-actions">
            {isAuthenticated && (
              <div className="favorites-action">
                <button 
                  onClick={handleAddToFavorites} 
                  className="action-button favorite-button"
                  disabled={!!favoriteStatus}
                >
                  ⭐ Añadir a Favoritos
                </button>
              </div>
            )}

            {isOwner && (
              <div className="owner-actions">
                <Link 
                  to={`/recetas/${id}/editar`} 
                  className="action-button edit-button"
                >
                  ✏️ Editar Detalles
                </Link>
                <Link 
                  to={`/recetas/${id}/editar-ingredientes`} 
                  className="action-button edit-button"
                >
                  🥑 Editar Ingredientes
                </Link>
                <button 
                  onClick={openDeleteConfirmation}
                  className="action-button delete-button"
                >
                  🗑️ Borrar Receta
                </button>
              </div>
            )}
          </div>

          <div className="recipe-meta">
            <span><strong>Dificultad:</strong> {recipe.dificultad}</span>
            <span><strong>Tiempo:</strong> {recipe.tiempo_preparacion} minutos</span>
          </div>
        </header>

        <div className="recipe-content">
          {isAuthenticated && ingredients.length > 0 && (
            <div className="ingredients-section">
              <h2>Ingredientes</h2>
              <ul className="ingredients-list">
                {ingredients.map(ing => (
                  <li key={ing.id} className="ingredient-item">
                    <span className="ingredient-name">{ing.nombre}</span>
                    <span className="ingredient-quantity">
                      {ing.cantidad} {ing.unidad}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="instructions-section">
            <h2>Instrucciones</h2>
            <ol className="instructions-list">
              {instructionSteps.map((step, index) => (
                <li key={index} className="instruction-step">{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </>
  );
};

export default RecipeDetailPage;