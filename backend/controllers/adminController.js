const db = require('../config/database');

/**
 * @desc    Admin: Obtener todas las reservas de todos los usuarios
 * @route   GET /api/admin/reservas
 * @access  Admin
 */
const getAllReservas = (req, res) => {
    // Esta consulta es más compleja: une la tabla de reservas con la de usuarios y mesas
    // para poder mostrar el nombre del cliente y el número de la mesa, no solo los IDs.
    const query = `
        SELECT 
            r.id, 
            r.fecha, 
            r.hora, 
            r.personas, 
            r.estado,
            u.nombre AS nombre_cliente, 
            u.email AS email_cliente,
            m.numero AS numero_mesa
        FROM reservas AS r
        JOIN usuarios AS u ON r.usuario_id = u.id
        JOIN mesas AS m ON r.mesa_id = m.id
        ORDER BY r.fecha DESC, r.hora DESC;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener todas las reservas para admin:", err);
            return res.status(500).json({ message: "Error en el servidor al obtener las reservas." });
        }
        res.json(results);
    });
};

/**
 * @desc    Admin: Actualizar el estado de una reserva
 * @route   PUT /api/admin/reservas/:id/estado
 * @access  Admin
 */
const updateReservaStatus = (req, res) => {
    const reservaId = req.params.id;
    const { estado } = req.body;

    // Validación simple para asegurar que se envió un estado
    if (!estado) {
        return res.status(400).json({ message: "El nuevo estado es requerido." });
    }

    const query = 'UPDATE reservas SET estado = ? WHERE id = ?';

    db.query(query, [estado, reservaId], (err, result) => {
        if (err) {
            console.error("Error al actualizar estado de reserva por admin:", err);
            return res.status(500).json({ message: "Error en el servidor al actualizar la reserva." });
        }
        if (result.affectedRows === 0) {
            // Esto pasa si el ID de la reserva no existe
            return res.status(404).json({ message: "Reserva no encontrada." });
        }
        res.json({ message: "Estado de la reserva actualizado exitosamente." });
    });
};

module.exports = {
    getAllReservas,
    updateReservaStatus
};