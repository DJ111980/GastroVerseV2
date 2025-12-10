/**
 * @fileoverview Configuración e inicialización del cliente de Supabase.
 * @author Tu Nombre
 * @version 1.0.0
 */
const { createClient } = require('@supabase/supabase-js');
// require('dotenv').config(); // <-- ELIMINA ESTA LÍNEA

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Se crea y exporta el cliente de Supabase para interactuar con el storage
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;