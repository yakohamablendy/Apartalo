const express = require('express');
const router = express.Router();

// Importamos las funciones necesarias del controlador de admin
const { getAllReservas, updateReservaStatus } = require('../controllers/adminController');

// Importamos los middlewares de autenticación y autorización
const { verifyToken, isAdmin } = require('../controllers/authController');

/**
 * @route   GET /api/admin/reservas
 * @desc    Obtiene todas las reservas para el panel de administración.
 * @access  Private (Solo para Admin)
 */
// --- ESTA ES LA RUTA QUE FALTABA ---
router.get('/reservas', verifyToken, isAdmin, getAllReservas);


/**
 * @route   PUT /api/admin/reservas/:id/estado
 * @desc    Actualiza el estado de una reserva específica.
 * @access  Private (Solo para Admin)
 */
router.put('/reservas/:id/estado', verifyToken, isAdmin, updateReservaStatus);

module.exports = router;