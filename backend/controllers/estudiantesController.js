const pool = require('../db/connection');

exports.crearEstudiante = async (req, res) => {
    const { nombre, cedula, grado, fechaNacimiento, direccion, representanteCedula } = req.body;

    if (!nombre || !cedula || !grado || !fechaNacimiento || !representanteCedula) {
        return res.status(400).json({ message: 'Campos obligatorios del estudiante incompletos.' });
    }

    try {
        const [repRows] = await pool.execute('SELECT id FROM representantes WHERE cedula = ?', [representanteCedula]);
        if (repRows.length === 0) {
            return res.status(404).json({ message: 'Representante no encontrado con la cédula proporcionada.' });
        }

        const representanteId = repRows[0].id;

        const [existing] = await pool.execute('SELECT id FROM estudiantes WHERE cedula = ?', [cedula]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Ya existe un estudiante con esa cédula.' });
        }

        const [result] = await pool.execute(
            'INSERT INTO estudiantes (nombre, cedula, grado, fecha_nacimiento, direccion, representante_id) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, cedula, grado, fechaNacimiento, direccion, representanteId]
        );

        res.status(201).json({ id: result.insertId, message: 'Estudiante registrado con éxito.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar estudiante.', error: error.message });
    }
};

exports.obtenerEstudiantes = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT e.*, r.nombre AS representante_nombre, r.cedula AS representante_cedula
            FROM estudiantes e
            LEFT JOIN representantes r ON e.representante_id = r.id
            ORDER BY e.nombre ASC
        `);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener estudiantes.', error: error.message });
    }
};

exports.buscarConNotas = async (req, res) => {
    const searchQuery = req.query.query;
    if (!searchQuery) {
        return res.status(400).json({ message: 'El parámetro de búsqueda (query) es obligatorio.' });
    }

    try {
        const [estRows] = await pool.execute(`
            SELECT e.*, r.nombre AS representante_nombre, r.cedula AS representante_cedula
            FROM estudiantes e
            LEFT JOIN representantes r ON e.representante_id = r.id
            WHERE e.nombre LIKE ? OR e.cedula LIKE ?
        `, [`%${searchQuery}%`, `%${searchQuery}%`]);

        if (estRows.length === 0) {
            return res.json({ estudiante: null, notas: [] });
        }

        const estudiante = estRows[0];
        const [notas] = await pool.execute(
            'SELECT * FROM notas WHERE estudiante_id = ? ORDER BY fecha_nota DESC, materia ASC',
            [estudiante.id]
        );

        res.json({ estudiante, notas });
    } catch (err) {
        res.status(500).json({ message: 'Error al buscar estudiante y sus notas.', error: err.message });
    }
};