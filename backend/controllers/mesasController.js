const db = require('../config/database');

/**
 * @desc    Obtener todas las mesas (para administración, por ejemplo)
 */
const getAllMesas = (req, res) => {
    const query = 'SELECT * FROM mesas ORDER BY numero';
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener todas las mesas:", err);
            return res.status(500).json({ message: "Error interno del servidor al obtener mesas." });
        }
        res.json(results);
    });
};

/**
 * @desc    Obtener mesas disponibles filtrando por fecha, hora y capacidad
 */
const getMesasDisponibles = (req, res) => {
    const { fecha, hora, capacidad } = req.query;

    if (!fecha || !hora || !capacidad) {
        return res.status(400).json({ message: "Faltan parámetros: se requiere fecha, hora y capacidad." });
    }

    // --- CORRECCIÓN CLAVE ---
    // Cambiamos 'fecha_reserva' por 'fecha' y 'hora_reserva' por 'hora'
    // para que coincidan con los nombres de las columnas en tu tabla `reservas`.
    const query = `
        SELECT * FROM mesas
        WHERE capacidad >= ? AND id NOT IN (
            SELECT mesa_id FROM reservas
            WHERE fecha = ? AND hora = ? AND estado = 'confirmada'
        )
        ORDER BY numero;
    `;

    db.query(query, [capacidad, fecha, hora], (err, results) => {
        if (err) {
            console.error("Error al buscar mesas disponibles:", err);
            return res.status(500).json({ message: err.sqlMessage || "Error al consultar la base de datos." });
        }
        
        res.json(results);
    });
};

module.exports = {
    getAllMesas,
    getMesasDisponibles
};