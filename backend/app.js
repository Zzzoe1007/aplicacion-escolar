const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Rutas
app.use('/api/estudiantes', require('./routes/estudiantesRoutes'));
app.use('/api/representantes', require('./routes/representantesRoutes'));
app.use('/api/pagos', require('./routes/pagosRoutes'));
app.use('/api/notas', require('./routes/notasRoutes'));

module.exports = app;