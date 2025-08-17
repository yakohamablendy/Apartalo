const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const register = (req, res) => {
    const { nombre, email, password, telefono } = req.body;
    if (!nombre || !email || !password) {
        return res.status(400).json({ message: 'Nombre, email y password son requeridos' });
    }
    db.query('SELECT email FROM usuarios WHERE email = ?', [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        if (results.length > 0) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query(
            'INSERT INTO usuarios (nombre, email, password, telefono) VALUES (?, ?, ?, ?)',
            [nombre, email, hashedPassword, telefono],
            (err, results) => {
                if (err) {
                    return res.status(500).json({ message: 'Error al registrar usuario' });
                }
                res.status(201).json({ message: 'Usuario registrado exitosamente' });
            }
        );
    });
};

const login = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email y password son requeridos' });
    }
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error en el servidor' });
        }
        if (results.length === 0) {
            return res.status(400).json({ message: 'Email o password incorrecto' });
        }
        const user = results[0];
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Email o password incorrecto' });
        }
        const token = jwt.sign(
            { id: user.id, email: user.email, rol: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.json({
            message: 'Login exitoso',
            token: token,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                telefono: user.telefono,
                rol: user.rol
            }
        });
    });
};

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Token de acceso requerido' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido' });
    }
};

// --- NUEVA FUNCIÓN 'GUARDIÁN' ---
// Middleware para verificar si el usuario es Admin
const isAdmin = (req, res, next) => {
    // Revisa el 'pasaporte' (req.user) que 'verifyToken' ya preparó.
    // Si el rol es 'admin', permite continuar con la siguiente función.
    if (req.user && req.user.rol === 'admin') {
        next();
    } else {
        // Si no es 'admin', lo bloquea con un error de "Acceso Prohibido".
        res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }
};

// Exportamos todas las funciones, incluyendo la nueva
module.exports = { 
    register, 
    login, 
    verifyToken,
    isAdmin // <-- Se exporta el guardián
};