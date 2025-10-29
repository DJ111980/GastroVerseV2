/**
 * @fileoverview Página para editar los ingredientes de una receta específica.
 * @author Diego Bugallo
 * @version 1.0.0
 * @description Este componente permite a los usuarios ver, añadir y eliminar ingredientes
 * de una receta. Carga los ingredientes existentes, proporciona un formulario para
 * añadir nuevos, y utiliza un modal de confirmación para las eliminaciones.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../services/api';
import { FaTrash, FaPlus } from 'react-icons/fa';
import ConfirmModal from '../components/modal/ConfirmModal';
import './EditIngredientsPage.css';

/**
 * Componente funcional que renderiza la interfaz de edición de ingredientes.
 * @returns {JSX.Element} La página de edición de ingredientes.
 */
const EditIngredientsPage = () => {
  // --- HOOKS ---
  const { id: recetaId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // --- ESTADOS DEL COMPONENTE ---
  const [ingredientes, setIngredientes] = useState([]);
  const [newIngredient, setNewIngredient] = useState({ nombre: '', cantidad: '', unidad: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState(null);

  /**
   * Efecto para mostrar notificaciones (toasts) que llegan desde otras páginas
   * a través del estado de la navegación.
   */
  useEffect(() => {
    if (location.state?.message) {
      const toastId = 'recipe-created-toast';
      if (!toast.isActive(toastId)) {
        toast.success(location.state.message, { toastId: toastId });
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  /**
   * Función para obtener la lista de ingredientes de la receta desde la API.
   * Se utiliza `useCallback` para memorizar la función y evitar re-creaciones innecesarias.
   * @async
   */
  const fetchIngredients = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get(`/ingredientes/${recetaId}`);
      if (Array.isArray(response.data)) {
        setIngredientes(response.data);
      } else {
        console.error("Formato de respuesta inesperado para ingredientes:", response.data);
        setError("No se pudieron cargar los ingredientes en el formato correcto.");
      }
    } catch (err) {
      console.error("Error al cargar ingredientes:", err);
      setError("No se pudieron cargar los ingredientes.");
    } finally {
      setLoading(false);
    }
  }, [recetaId]);

  /**
   * Efecto que llama a `fetchIngredients` cuando el componente se monta o `recetaId` cambia.
   */
  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  /**
   * Maneja los cambios en los campos del formulario para añadir un nuevo ingrediente.
   * @param {React.ChangeEvent<HTMLInputElement>} e - El evento de cambio del input.
   */
  const handleNewIngredientChange = (e) => {
    setNewIngredient({ ...newIngredient, [e.target.name]: e.target.value });
  };

  /**
   * Maneja el envío del formulario para añadir un nuevo ingrediente.
   * Realiza una validación básica y envía la petición a la API.
   * @param {React.FormEvent<HTMLFormElement>} e - El evento de envío del formulario.
   * @async
   */
  const handleAddIngredient = async (e) => {
    e.preventDefault();
    if (!newIngredient.nombre.trim()) {
      toast.error('El nombre del ingrediente es obligatorio.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const response = await apiClient.post('/ingredientes', { ...newIngredient, receta_id: parseInt(recetaId) });
      const addedIngredient = response.data;
      
      if (addedIngredient && addedIngredient.id) {
        setIngredientes(prev => [...prev, addedIngredient]);
        setNewIngredient({ nombre: '', cantidad: '', unidad: '' }); // Resetea el formulario
        toast.success('Ingrediente añadido.');
      } else {
        throw new Error("Respuesta inesperada del servidor al añadir ingrediente.");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'No se pudo añadir el ingrediente.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Prepara la eliminación de un ingrediente. Guarda el ID del ingrediente
   * y abre el modal de confirmación.
   * @param {number} ingredientId - El ID del ingrediente a eliminar.
   */
  const handleRemoveClick = (ingredientId) => {
    setIngredientToDelete(ingredientId);
    setIsModalOpen(true);
  };

  /**
   * Confirma y ejecuta la eliminación del ingrediente.
   * Se llama desde el modal de confirmación. Realiza una actualización optimista de la UI.
   * @async
   */
  const confirmRemoveIngredient = async () => {
    if (!ingredientToDelete) return;
    const originalIngredients = [...ingredientes];
    setIngredientes(prev => prev.filter(ing => ing.id !== ingredientToDelete));
    setIsModalOpen(false);
    try {
      await apiClient.delete(`/ingredientes/${ingredientToDelete}`);
      toast.success('Ingrediente eliminado.');
    } catch (err) {
      setError('No se pudo eliminar el ingrediente del servidor.');
      toast.error('No se pudo eliminar el ingrediente.');
      setIngredientes(originalIngredients); // Revierte el cambio en la UI si la API falla
    } finally {
      setIngredientToDelete(null);
    }
  };

  if (loading) return <div className="status-message">Cargando...</div>;

  return (
    <>
      <ConfirmModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onConfirm={confirmRemoveIngredient}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que quieres borrar este ingrediente? Esta acción no se puede deshacer."
      />

      <div className="main-container">
        <div className="edit-ingredients-card">
          <h1>Paso 2: Añadir Ingredientes</h1>
          <p className="subtitle">Añade los ingredientes necesarios para tu receta.</p>

          <div className="ingredients-list-container">
            <h3>Ingredientes Actuales</h3>
            {ingredientes.length > 0 ? (
              <ul className="ingredients-list-editable">
                {ingredientes.map(ing => (
                  ing && (
                    <li key={ing.id}>
                      <span className="ing-name">{ing.nombre}</span>
                      <span className="ing-qty">{ing.cantidad} {ing.unidad}</span>
                      <button onClick={() => handleRemoveClick(ing.id)} className="delete-btn" aria-label="Borrar ingrediente">
                        <FaTrash />
                      </button>
                    </li>
                  )
                ))}
              </ul>
            ) : (
              <p className="empty-state">Aún no has añadido ningún ingrediente.</p>
            )}
          </div>

          <form onSubmit={handleAddIngredient} className="add-ingredient-form">
            <h3>Añadir Nuevo</h3>
            <div className="ingredient-input-row">
              <input
                type="text" name="nombre" placeholder="Nombre (ej: Harina)"
                value={newIngredient.nombre} onChange={handleNewIngredientChange} required
              />
              <input
                type="text" name="cantidad" placeholder="Cantidad (ej: 250)"
                value={newIngredient.cantidad} onChange={handleNewIngredientChange}
              />
              <input
                type="text" name="unidad" placeholder="Unidad (ej: gr)"
                value={newIngredient.unidad} onChange={handleNewIngredientChange}
              />
              <button type="submit" className="add-btn" disabled={isSubmitting}>
                <FaPlus /> {isSubmitting ? '...' : 'Añadir'}
              </button>
            </div>
            {error && <p className="error-message-inline">{error}</p>}
          </form>

          <div className="finish-section">
            <button onClick={() => navigate(`/recetas/${recetaId}`)} className="finish-btn">
              Finalizar y Ver Receta
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditIngredientsPage;