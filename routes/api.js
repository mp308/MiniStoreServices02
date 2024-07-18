const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const apiLimiter = rateLimit({
    windowMs: 1000*60*3,   // 1 minutes
    max: 30, // 5 times
    message: 'Too many requests, please try again after 3 minutes!' // if have sent more that have show message 
});

const customerController = require('../controllers/customers');

router.post('/customers', apiLimiter, customerController.createCustomer);
router.put('/customers', apiLimiter, customerController.updateCustomer);
router.delete('/customers/:id',apiLimiter, customerController.deleteCustomer);
router.get('/customers/:id', apiLimiter, customerController.getCustomer);
router.get('/customers/q/:term', apiLimiter, customerController.getCustomersByTerm);
router.get('/customers', apiLimiter, customerController.getCustomers);


module.exports = router;