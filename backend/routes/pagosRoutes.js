const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pagosController');

router.post('/', ctrl.registrarPago);
router.get('/', ctrl.obtenerPagos);

module.exports = router;