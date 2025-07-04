const pool = require('../db/connection');

exports.registrarPago = async (req, res) => {
    const { cedulaEstudiante, monto, fecha, concepto } = req.body;

    if (!cedulaEstudiante || !monto || !fecha || !concepto) {
        return res.status(400).json({ message: 'Todos los campos del pago son obligatorios.' });
    }

    try {
        const [estRows] = await pool.execute('SELECT id FROM estudiantes WHERE cedula = ?', [cedulaEstudiante]);
        if (estRows.length === 0) {
            return res.status(404).json({ message: 'Estudiante no encontrado para registrar el pago.' });
        }

        const estudianteId = estRows[0].id;

        const [result] = await pool.execute(
            'INSERT INTO pagos (estudiante_id, monto, fecha_pago, concepto) VALUES (?, ?, ?, ?)',
            [estudianteId, monto, fecha, concepto]
        );

        res.status(201).json({ message: 'Pago registrado con éxito', id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: 'Error al registrar pago.', error: err.message });
    }
};

exports.obtenerPagos = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT p.*, e.nombre AS estudiante_nombre, e.cedula AS estudiante_cedula
            FROM pagos p
            JOIN estudiantes e ON p.estudiante_id = e.id
            ORDER BY p.fecha_pago DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener pagos.', error: err.message });
    }
};