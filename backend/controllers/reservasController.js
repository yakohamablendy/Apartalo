// backend/controllers/reservasController.js

const db = require('../config/database');

/**
 * @desc    Crear una nueva reserva
 */
const crearReserva = (req, res) => {
    const { mesa_id, fecha, hora, personas } = req.body;
    const usuario_id = req.user.id;

    if (!mesa_id || !fecha || !hora || !personas) {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    // Usando los nombres de columna EXACTOS de tu tabla 'reservas'
    const query = 'INSERT INTO reservas (usuario_id, mesa_id, fecha, hora, personas, estado) VALUES (?, ?, ?, ?, ?, ?)';
    
    const values = [usuario_id, mesa_id, fecha, hora, personas, 'confirmada']; // 'confirmada' en minúscula como en tu enum

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Error al crear la reserva en la BD:", err);
            return res.status(500).json({ message: 'Error en el servidor al guardar la reserva.' });
        }
        res.status(201).json({ message: '¡Reserva creada exitosamente!', reservaId: result.insertId });
    });
};

/**
 * @desc    Obtener el historial de reservas de un usuario
 */
const getReservasUsuario = (req, res) => {
    const usuario_id = req.user.id; 

    // Usando los nombres de columna EXACTOS de tus tablas 'reservas' y 'mesas'
    const query = `
        SELECT 
            r.id, 
            r.fecha, 
            r.hora, 
            r.personas, 
            r.estado, 
            m.numero AS numero_mesa 
        FROM reservas r
        JOIN mesas m ON r.mesa_id = m.id
        WHERE r.usuario_id = ?
        ORDER BY r.fecha DESC, r.hora DESC;
    `;

    db.query(query, [usuario_id], (err, results) => {
        if (err) {
            console.error("Error al obtener historial de usuario:", err);
            return res.status(500).json({ message: "Error al obtener el historial de reservas." });
        }
        res.status(200).json(results);
    });
};

/**
 * @desc    Cancelar una reserva
 */
const cancelarReserva = (req, res) => {
    const reserva_id = req.params.id;
    const usuario_id = req.user.id;

    // Usando 'cancelada' en minúscula para que coincida con tu enum
    const query = "UPDATE reservas SET estado = 'cancelada' WHERE id = ? AND usuario_id = ?";

    db.query(query, [reserva_id, usuario_id], (err, result) => {
        if (err) {
            console.error("Error al cancelar reserva:", err);
            return res.status(500).json({ message: "Error al cancelar la reserva." });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "No se encontró la reserva o no tienes permiso para cancelarla." });
        }
        res.status(200).json({ message: "Reserva cancelada exitosamente." });
    });
};

module.exports = {
    crearReserva,
    getReservasUsuario,
    cancelarReserva
};