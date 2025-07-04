const pool = require('../db/connection');

exports.crearRepresentante = async (req, res) => {
    const { nombre, cedula, telefono, parentesco } = req.body;
    if (!nombre || !cedula || !telefono || !parentesco) {
        return res.status(400).json({ message: 'Todos los campos del representante son obligatorios.' });
    }

    try {
        const [existing] = await pool.execute('SELECT id FROM representantes WHERE cedula = ?', [cedula]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Ya existe un representante con esa cédula.' });
        }

        const [result] = await pool.execute(
            'INSERT INTO representantes (nombre, cedula, telefono, parentesco) VALUES (?, ?, ?, ?)',
            [nombre, cedula, telefono, parentesco]
        );
        res.status(201).json({ id: result.insertId, message: 'Representante registrado con éxito.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar representante.', error: error.message });
    }
};

exports.obtenerRepresentantes = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM representantes ORDER BY nombre ASC');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener representantes.', error: error.message });
    }
};

exports.buscarConHijos = async (req, res) => {
    const searchQuery = req.query.query;
    if (!searchQuery) {
        return res.status(400).json({ message: 'El parámetro de búsqueda (query) es obligatorio.' });
    }

    try {
        const [representanteRows] = await pool.execute(
            'SELECT id, nombre, cedula, telefono, parentesco FROM representantes WHERE nombre LIKE ? OR cedula LIKE ?',
            [`%${searchQuery}%`, `%${searchQuery}%`]
        );

        if (representanteRows.length === 0) {
            return res.json({ representante: null, hijos: [] });
        }

        const representante = representanteRows[0];
        const [hijos] = await pool.execute(
            'SELECT id, nombre, cedula, grado, fecha_nacimiento FROM estudiantes WHERE representante_id = ?',
            [representante.id]
        );

        res.json({ representante, hijos });
    } catch (err) {
        res.status(500).json({ message: 'Error al buscar representante y sus hijos.', error: err.message });
    }
};