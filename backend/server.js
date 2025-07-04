const app = require('./app');
const pool = require('./db/connection');

const PORT = process.env.PORT || 3000;

(async () => {
    try {
        await pool.getConnection();
        console.log('SERVIDOR: Conectado a MySQL.');
        app.listen(PORT, () => {
            console.log(`SERVIDOR: Corriendo en http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('SERVIDOR: Error al conectar con la base de datos:', err.message);
        process.exit(1);
    }
})();