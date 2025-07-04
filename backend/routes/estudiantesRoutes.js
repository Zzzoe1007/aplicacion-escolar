const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/estudiantesController');

router.post('/', ctrl.crearEstudiante);
router.get('/', ctrl.obtenerEstudiantes);
router.get('/buscarConNotas', ctrl.buscarConNotas);

module.exports = router;