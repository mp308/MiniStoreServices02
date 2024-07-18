const express = require('express');
const router = express.Router();
const customerControllerv2 = require('../controllers/productsv2');

router.get('/products/q/:term', customerControllerv2.getProductsByTerm);

module.exports = router;