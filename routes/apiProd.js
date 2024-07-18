const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const apiLimiter = rateLimit({
    windowMs: 1000*60*3,   // 1 minutes
    max: 30, // 5 times
    message: 'Too many requests, please try again after 3 minutes!' // if have sent more that have show message 
});

const productController = require('../controllers/products');

router.post('/products', apiLimiter, productController.createProduct);
router.put('/products', apiLimiter, productController.updateProduct);
router.delete('/products/:id',apiLimiter, productController.deleteProduct);
router.get('/products/:id', apiLimiter, productController.getProduct);
router.get('/products/q/:term', apiLimiter, productController.getProductsByTerm);
router.get('/products', apiLimiter, productController.getProducts);


module.exports = router;