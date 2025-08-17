const express = require('express');
const router = express.Router();

// Importamos el controlador de reservas y el middleware de autenticación
const { crearReserva, getReservasUsuario, cancelarReserva } = require('../controllers/reservasController');
const { verifyToken } = require('../controllers/authController');

// --- DEFINICIÓN DE RUTAS PARA /api/reservas ---
// Todas las rutas están protegidas y requieren un token de autenticación.

/**
 * @route   POST /api/reservas
 * @desc    Crear una nueva reserva
 * @access  Privado
 */
router.post('/', verifyToken, crearReserva);

/**
 * @route   GET /api/reservas/usuario/:id
 * @desc    Obtener el historial de reservas de un usuario
 * @access  Privado
 */
router.get('/usuario/:id', verifyToken, getReservasUsuario);

/**
 * @route   DELETE /api/reservas/:id
 * @desc    Cancelar una reserva existente
 * @access  Privado
 */
router.delete('/:id', verifyToken, cancelarReserva);


module.exports = router;