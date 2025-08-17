const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const db = require('./config/database'); // Importamos la conexión

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rutas de la API
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const mesasRoutes = require('./routes/mesas');
app.use('/api/mesas', mesasRoutes);

const reservasRoutes = require('./routes/reservas');
app.use('/api/reservas', reservasRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Ruta principal para servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'index.html'));
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    
    // --- MÉTODO DE VERIFICACIÓN DE CONEXIÓN CORREGIDO ---
    // Hacemos una consulta simple para probar la conexión.
    db.query('SELECT 1', (err, results) => {
        if (err) {
            console.error('Error al conectar con MySQL:', err.stack);
            return;
        }
        console.log('Conexión a MySQL verificada exitosamente.');
    });
});