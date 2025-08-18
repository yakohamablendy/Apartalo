const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const db = require('./config/database'); 


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


app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    
    
    db.query('SELECT 1', (err, results) => {
        if (err) {
            console.error('Error al conectar con MySQL:', err.stack);
            return;
        }
        console.log('Conexión a MySQL verificada exitosamente.');
    });
});
