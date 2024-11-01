const express = require('express');
const router = express.Router();

const ordersController = require('../controllers/orders');
const paymentController = require('../controllers/payment')

router.post('/orders',  ordersController.createOrder);
router.get('/orders',  ordersController.getOrders);
router.get('/orders/:id', ordersController.getOrderById);
router.get('/orders/byuser/:userId', ordersController.getOrdersByUserId);
router.put('/orders/:id',  ordersController.updateOrder);
router.delete('/orders/:id',  ordersController.deleteOrder);

// Route to create a new payment
router.get('/payments', paymentController.getAllPayments);
router.get('/payments/:paymentId', paymentController.getPaymentById);
router.put('/payments/:payment_id', paymentController.updatePayment);
router.get('/payments/user/:userID', paymentController.getPaymentsByUserId);




module.exports = router;