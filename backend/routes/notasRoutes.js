const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notasController');

router.post('/', ctrl.registrarNota);
router.get('/estudiante/:cedula', ctrl.obtenerNotasPorEstudiante);

module.exports = router;