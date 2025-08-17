const express = require('express');
const router = express.Router();

// Importamos la lógica del controlador de admin
const { getAllReservas, updateReservaStatus } = require('../controllers/adminController');

// Importamos a nuestros 'guardianes' de seguridad
const { verifyToken, isAdmin } = require('../controllers/authController');

/**
 * @route   GET /api/admin/reservas
 * @desc    Admin: Obtener una lista de todas las reservas
 * @access  Protegido para Admins
 */
// Esta ruta primero verifica que el usuario haya iniciado sesión (verifyToken),
// y luego verifica que sea un administrador (isAdmin).
// Si ambas verificaciones pasan, ejecuta la función getAllReservas.
router.get('/reservas', verifyToken, isAdmin, getAllReservas);

/**
 * @route   PUT /api/admin/reservas/:id/estado
 * @desc    Admin: Actualizar el estado de una reserva específica
 * @access  Protegido para Admins
 */
router.put('/reservas/:id/estado', verifyToken, isAdmin, updateReservaStatus);

module.exports = router;