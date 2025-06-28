// server.js

const express = require('express');
const mysql = require('mysql2/promise'); // Usar mysql2/promise para async/await
const path = require('path');
const cors = require('cors'); // Para permitir peticiones desde el frontend si están en dominios diferentes

const app = express();
const PORT = process.env.PORT || 3000; // Puedes dejar el puerto desde .env o ponerlo fijo

// Configuración de la base de datos (¡VERIFICA ESTO!)
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', // ¡Tu contraseña de MySQL! DÉJALO VACÍO SI NO TIENE.
    database: 'gestion_escolar_db' // El nombre de tu base de datos
};

let pool; // Definir pool fuera de la función para que sea accesible globalmente

// --- 3. Conexión a MySQL ---
async function connectToDatabase() {
    try {
        pool = mysql.createPool(dbConfig);
        await pool.getConnection(); // Intentar una conexión para verificar que todo está bien
        console.log('SERVIDOR: MySQL conectado exitosamente.');
    } catch (err) {
        console.error('SERVIDOR: Error de conexión a MySQL:', err.message);
        console.error('SERVIDOR: Verifique sus credenciales en dbConfig y que MySQL esté corriendo.');
        process.exit(1); // Salir del proceso si no puede conectar a la DB
    }
}

// Iniciar conexión y luego el servidor (esto envuelve todo el resto del código)
connectToDatabase().then(() => {
    // --- 4. Middlewares ---
    app.use(express.json()); // Permite que Express entienda el JSON
    app.use(express.static(path.join(__dirname, 'public'))); // Sirve archivos estáticos
    app.use(cors()); // Habilita CORS para todas las rutas (descomentar si tienes problemas de CORS)

    // --- 5. Rutas de la API (Endpoints) ---

    // ** Representantes **
    // POST: Crear un nuevo representante
    app.post('/api/representantes', async (req, res) => {
        console.log('SERVIDOR: Recibida petición POST /api/representantes con datos:', req.body);
        try {
            const { nombre, cedula, telefono, parentesco } = req.body;

            if (!nombre || !cedula || !telefono || !parentesco) {
                console.warn('SERVIDOR: Datos de representante incompletos:', req.body);
                return res.status(400).json({ message: 'Todos los campos del representante son obligatorios.' });
            }

            // Verificar si el representante ya existe por cédula
            const [existing] = await pool.execute('SELECT id FROM representantes WHERE cedula = ?', [cedula]);
            if (existing.length > 0) {
                return res.status(409).json({ message: 'Ya existe un representante con esa cédula.' });
            }

            const [result] = await pool.execute(
                'INSERT INTO representantes (nombre, cedula, telefono, parentesco) VALUES (?, ?, ?, ?)',
                [nombre, cedula, telefono, parentesco]
            );
            console.log('SERVIDOR: Representante registrado en DB con ID:', result.insertId);
            res.status(201).json({ id: result.insertId, message: 'Representante registrado con éxito.' });
        } catch (error) {
            console.error('SERVIDOR: Error general al registrar representante:', error);
            res.status(500).json({ message: 'Error interno del servidor al registrar representante.', error: error.message });
        }
    });

    // GET: Obtener todos los representantes
    app.get('/api/representantes', async (req, res) => {
        console.log('SERVIDOR: Recibida petición GET /api/representantes');
        try {
            const [rows] = await pool.execute('SELECT * FROM representantes ORDER BY nombre ASC');
            console.log('SERVIDOR: Representantes obtenidos de DB:', rows.length, 'registros');
            res.status(200).json(rows);
        } catch (error) {
            console.error('SERVIDOR: Error al obtener representantes:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener representantes.', error: error.message });
        }
    });

    // GET /api/representantes/buscarConHijos?query=... - Buscar representante y sus hijos
    app.get('/api/representantes/buscarConHijos', async (req, res) => {
        const searchQuery = req.query.query;
        console.log('BACKEND: Recibida petición GET para buscar representante Y sus hijos con query:', searchQuery);

        if (!searchQuery) {
            return res.status(400).json({ message: 'El parámetro de búsqueda (query) es obligatorio.' });
        }

        try {
            // 1. Buscar al representante
            const [representanteRows] = await pool.execute(
                'SELECT id, nombre, cedula, telefono, parentesco FROM representantes WHERE nombre LIKE ? OR cedula LIKE ?',
                [`%${searchQuery}%`, `%${searchQuery}%`]
            );

            if (representanteRows.length === 0) {
                return res.json({ representante: null, hijos: [] }); // No se encontró el representante
            }

            const representanteEncontrado = representanteRows[0];

            // 2. Buscar todos los estudiantes asociados a este representante por representante_id
            const [hijosRows] = await pool.execute(
                'SELECT id, nombre, cedula, grado, fecha_nacimiento FROM estudiantes WHERE representante_id = ?',
                [representanteEncontrado.id]
            );

            res.json({
                representante: representanteEncontrado,
                hijos: hijosRows
            });

        } catch (err) {
            console.error('BACKEND: Error al buscar representante y sus hijos:', err);
            res.status(500).json({ message: 'Error interno del servidor al buscar representante y sus hijos.', error: err.message });
        }
    });


    // ** Estudiantes **
    // POST: Crear un nuevo estudiante
    app.post('/api/estudiantes', async (req, res) => {
        console.log('SERVIDOR: Recibida petición POST /api/estudiantes con datos:', req.body);
        try {
            const { nombre, cedula, grado, fechaNacimiento, direccion, representanteCedula } = req.body;

            if (!nombre || !cedula || !grado || !fechaNacimiento || !representanteCedula) {
                console.warn('SERVIDOR: Datos de estudiante incompletos:', req.body);
                return res.status(400).json({ message: 'Campos obligatorios del estudiante incompletos.' });
            }

            // 1. Encontrar el ID del representante (usando la cédula del representante)
            const [representanteRows] = await pool.execute('SELECT id FROM representantes WHERE cedula = ?', [representanteCedula]);

            if (representanteRows.length === 0) {
                return res.status(404).json({ message: 'Representante no encontrado con la cédula proporcionada.' });
            }
            const representanteId = representanteRows[0].id; // Obtener el ID numérico del representante

            // 2. Verificar si el estudiante ya existe por cédula
            const [existing] = await pool.execute('SELECT id FROM estudiantes WHERE cedula = ?', [cedula]);
            if (existing.length > 0) {
                return res.status(409).json({ message: 'Ya existe un estudiante con esa cédula.' });
            }

            // 3. Insertar el estudiante usando el representante_id (clave foránea)
            const [result] = await pool.execute(
                'INSERT INTO estudiantes (nombre, cedula, grado, fecha_nacimiento, direccion, representante_id) VALUES (?, ?, ?, ?, ?, ?)',
                [nombre, cedula, grado, fechaNacimiento, direccion, representanteId]
            );
            console.log('SERVIDOR: Estudiante registrado en DB con ID:', result.insertId);
            res.status(201).json({ id: result.insertId, message: 'Estudiante registrado con éxito.' });
        } catch (error) {
            console.error('SERVIDOR: Error general al registrar estudiante:', error);
            res.status(500).json({ message: 'Error interno del servidor al registrar estudiante.', error: error.message });
        }
    });

    // GET: Obtener todos los estudiantes (con nombre y cédula de representante)
    app.get('/api/estudiantes', async (req, res) => {
        console.log('SERVIDOR: Recibida petición GET /api/estudiantes');
        try {
            const [rows] = await pool.execute(`
                SELECT e.*, r.nombre AS representante_nombre, r.cedula AS representante_cedula
                FROM estudiantes e
                LEFT JOIN representantes r ON e.representante_id = r.id
                ORDER BY e.nombre ASC
            `);
            console.log('SERVIDOR: Estudiantes obtenidos de DB:', rows.length, 'registros');
            res.status(200).json(rows);
        } catch (error) {
            console.error('SERVIDOR: Error al obtener estudiantes:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener estudiantes.', error: error.message });
        }
    });

    // GET /api/estudiantes/buscarConNotas?query=... - Buscar estudiante y sus notas
    app.get('/api/estudiantes/buscarConNotas', async (req, res) => {
        const searchQuery = req.query.query;
        console.log('BACKEND: Recibida petición GET para buscar estudiante Y sus notas con query:', searchQuery);

        if (!searchQuery) {
            return res.status(400).json({ message: 'El parámetro de búsqueda (query) es obligatorio.' });
        }

        try {
            // 1. Buscar al estudiante
            const [estudianteRows] = await pool.execute(
                `SELECT e.*, r.nombre AS representante_nombre, r.cedula AS representante_cedula
                FROM estudiantes e
                LEFT JOIN representantes r ON e.representante_id = r.id
                WHERE e.nombre LIKE ? OR e.cedula LIKE ?`,
                [`%${searchQuery}%`, `%${searchQuery}%`]
            );

            if (estudianteRows.length === 0) {
                return res.json({ estudiante: null, notas: [] }); // No se encontró el estudiante
            }

            const estudianteEncontrado = estudianteRows[0];

            // 2. Buscar todas las notas asociadas a este estudiante
            const [notasRows] = await pool.execute(
                'SELECT * FROM notas WHERE estudiante_id = ? ORDER BY fecha_nota DESC, materia ASC',
                [estudianteEncontrado.id]
            );

            res.json({
                estudiante: estudianteEncontrado,
                notas: notasRows
            });

        } catch (err) {
            console.error('BACKEND: Error al buscar estudiante y sus notas:', err);
            res.status(500).json({ message: 'Error interno del servidor al buscar estudiante y sus notas.', error: err.message });
        }
    });


    // --- Rutas para Pagos ---

    // POST /api/pagos - Registrar un nuevo pago
    app.post('/api/pagos', async (req, res) => {
        const { cedulaEstudiante, monto, fecha, concepto } = req.body;
        console.log('BACKEND: Recibida petición POST para registrar pago:', req.body);
        try {
            const [estudianteRows] = await pool.execute('SELECT id FROM estudiantes WHERE cedula = ?', [cedulaEstudiante]);
            if (estudianteRows.length === 0) {
                return res.status(404).json({ message: 'Estudiante no encontrado para registrar el pago.' });
            }
            const estudianteId = estudianteRows[0].id;

            const [result] = await pool.execute(
                'INSERT INTO pagos (estudiante_id, monto, fecha_pago, concepto) VALUES (?, ?, ?, ?)',
                [estudianteId, monto, fecha, concepto]
            );
            res.status(201).json({ message: 'Pago registrado con éxito', id: result.insertId });
        } catch (err) {
            console.error('BACKEND: Error al registrar pago:', err);
            res.status(500).json({ message: 'Error interno del servidor al registrar pago.', error: err.message });
        }
    });

    // GET /api/pagos - Obtener todos los pagos (con nombre y cédula de estudiante)
    app.get('/api/pagos', async (req, res) => {
        console.log('BACKEND: Recibida petición GET para obtener todos los pagos.');
        try {
            const [rows] = await pool.execute(`
                SELECT p.*, e.nombre AS estudiante_nombre, e.cedula AS estudiante_cedula
                FROM pagos p
                JOIN estudiantes e ON p.estudiante_id = e.id
                ORDER BY p.fecha_pago DESC
            `);
            res.json(rows);
        } catch (err) {
            console.error('BACKEND: Error al obtener pagos:', err);
            res.status(500).json({ message: 'Error interno del servidor al obtener pagos.', error: err.message });
        }
    });


    // --- Rutas para Notas ---

    // POST /api/notas - Registrar una nueva nota
    app.post('/api/notas', async (req, res) => {
        const { cedulaEstudiante, materia, valor, fecha } = req.body;
        console.log('BACKEND: Recibida petición POST para registrar nota:', req.body);
        try {
            const [estudianteRows] = await pool.execute('SELECT id FROM estudiantes WHERE cedula = ?', [cedulaEstudiante]);
            if (estudianteRows.length === 0) {
                return res.status(404).json({ message: 'Estudiante no encontrado para registrar la nota.' });
            }
            const estudianteId = estudianteRows[0].id;

            const [result] = await pool.execute(
                'INSERT INTO notas (estudiante_id, materia, valor, fecha_nota) VALUES (?, ?, ?, ?)',
                [estudianteId, materia, valor, fecha]
            );
            res.status(201).json({ message: 'Nota registrada con éxito', id: result.insertId });
        } catch (err) {
            console.error('BACKEND: Error al registrar nota:', err);
            res.status(500).json({ message: 'Error interno del servidor al registrar nota.', error: err.message });
        }
    });

    // GET /api/notas/estudiante/:cedula - Obtener notas de un estudiante específico
    app.get('/api/notas/estudiante/:cedula', async (req, res) => {
        const estudianteCedula = req.params.cedula;
        console.log('BACKEND: Recibida petición GET para obtener notas del estudiante con cédula:', estudianteCedula);
        try {
            const [estudianteRows] = await pool.execute(
                `SELECT e.id, e.nombre, e.cedula FROM estudiantes e WHERE e.cedula = ?`,
                [estudianteCedula]
            );

            if (estudianteRows.length === 0) {
                return res.json({ estudiante: null, notas: [] });
            }
            const estudiante = estudianteRows[0];

            const [notasRows] = await pool.execute(
                'SELECT * FROM notas WHERE estudiante_id = ? ORDER BY fecha_nota DESC, materia ASC',
                [estudiante.id]
            );

            res.json({
                estudiante: estudiante,
                notas: notasRows
            });

        } catch (err) {
            console.error('BACKEND: Error al obtener notas del estudiante:', err);
            res.status(500).json({ message: 'Error interno del servidor al obtener notas.', error: err.message });
        }
    });


    // --- 6. Iniciar el Servidor ---
    app.listen(PORT, () => {
        console.log(`\n*******************************************************`);
        console.log(`SERVIDOR: Backend corriendo en http://localhost:${PORT}`);
        console.log(`SERVIDOR: Accede a la aplicación en http://localhost:${PORT}/index.html`);
        console.log(`*******************************************************\n`);
    });

}).catch(err => {
    console.error('BACKEND: No se pudo iniciar el servidor debido a un error de conexión a la base de datos. Por favor, revise los logs.');
});