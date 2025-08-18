// backend/controllers/mesasController.js

const db = require('../config/database');

const getAllMesas = (req, res) => {
    const query = 'SELECT id, numero, capacidad, disponible FROM mesas ORDER BY numero';
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener todas las mesas:", err);
            return res.status(500).json({ message: "Error interno del servidor." });
        }
        res.json(results);
    });
};

const getMesasDisponibles = (req, res) => {
    const { fecha, hora, capacidad } = req.query;

    if (!fecha || !hora || !capacidad) {
        return res.status(400).json({ message: "Faltan parámetros: se requiere fecha, hora y capacidad." });
    }

    const query = `
        SELECT id, numero, capacidad, disponible FROM mesas
        WHERE capacidad >= ? AND id NOT IN (
            SELECT mesa_id FROM reservas
            WHERE fecha = ? AND hora = ? AND estado = 'confirmada'
        )
        ORDER BY numero;
    `;

    db.query(query, [capacidad, fecha, hora], (err, results) => {
        if (err) {
            console.error("Error al buscar mesas disponibles:", err);
            return res.status(500).json({ message: "Error al consultar la base de datos." });
        }
        res.json(results);
    });
};

module.exports = {
    getAllMesas,
    getMesasDisponibles
};