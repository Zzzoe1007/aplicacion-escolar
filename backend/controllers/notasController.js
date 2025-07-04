const pool = require('../db/connection');

exports.registrarNota = async (req, res) => {
    const { cedulaEstudiante, materia, valor, fecha } = req.body;

    if (!cedulaEstudiante || !materia || valor == null || !fecha) {
        return res.status(400).json({ message: 'Todos los campos de la nota son obligatorios.' });
    }

    try {
        const [estRows] = await pool.execute('SELECT id FROM estudiantes WHERE cedula = ?', [cedulaEstudiante]);
        if (estRows.length === 0) {
            return res.status(404).json({ message: 'Estudiante no encontrado para registrar la nota.' });
        }

        const estudianteId = estRows[0].id;

        const [result] = await pool.execute(
            'INSERT INTO notas (estudiante_id, materia, valor, fecha_nota) VALUES (?, ?, ?, ?)',
            [estudianteId, materia, valor, fecha]
        );

        res.status(201).json({ message: 'Nota registrada con éxito', id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: 'Error al registrar nota.', error: err.message });
    }
};

exports.obtenerNotasPorEstudiante = async (req, res) => {
    const cedula = req.params.cedula;

    try {
        const [estRows] = await pool.execute(
            'SELECT id, nombre, cedula FROM estudiantes WHERE cedula = ?',
            [cedula]
        );

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
        res.status(500).json({ message: 'Error al obtener notas del estudiante.', error: err.message });
    }
};