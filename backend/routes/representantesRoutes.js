const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/representantesController');

router.post('/', ctrl.crearRepresentante);
router.get('/', ctrl.obtenerRepresentantes);
router.get('/buscarConHijos', ctrl.buscarConHijos);

module.exports = router;