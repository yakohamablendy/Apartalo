const express = require('express');
const router = express.Router();

// Importamos los controladores que necesitamos de su ubicación correcta.
const { getAllMesas, getMesasDisponibles } = require('../controllers/mesasController');

// Importamos el middleware de autenticación desde su ubicación correcta.
const { verifyToken } = require('../controllers/authController');

// --- DEFINICIÓN DE RUTAS PARA /api/mesas ---
// Todas las rutas aquí están protegidas y requieren un token de autenticación.

/**
 * @route   GET /api/mesas
 * @desc    Obtener una lista de todas las mesas del restaurante.
 * @access  Privado (requiere token)
 */
router.get('/', verifyToken, getAllMesas);

/**
 * @route   GET /api/mesas/disponibles
 * @desc    Obtener las mesas disponibles según fecha, hora y capacidad.
 * @access  Privado (requiere token)
 * @params  Query: fecha, hora, capacidad
 */
router.get('/disponibles', verifyToken, getMesasDisponibles);


module.exports = router;