const db = require('../config/database');

/**
 * @desc    
 * @route   
 * @access  
 */
const getAllReservas = (req, res) => {
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
 * @desc    
 * @route   
 * @access  
 */
const updateReservaStatus = (req, res) => {
    const reservaId = req.params.id;
    const { estado } = req.body;

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
            return res.status(404).json({ message: "Reserva no encontrada." });
        }
        res.json({ message: "Estado de la reserva actualizado exitosamente." });
    });
};

module.exports = {
    getAllReservas,
    updateReservaStatus
};