const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const apiLimiter = rateLimit({
    windowMs: 1000 * 60 * 3,   // 3 minutes
    max: 30, // 30 requests
    message: 'Too many requests, please try again after 3 minutes!' // if exceeded limit
});

const customerController = require('../controllers/customers');

const authController = require('../controllers/auth');
const userController = require('../controllers/users');
const healthInfoController = require('../controllers/healthInfo');
const reviewsController = require('../controllers/reviews');
const discountController = require('../controllers/discount')
const userDiscountController = require('../controllers/userdiscount');
const categoryController = require('../controllers/categories')


router.post('/customers', apiLimiter, customerController.createCustomer);
router.put('/customers', apiLimiter, customerController.updateCustomer);
router.delete('/customers/:id', apiLimiter, customerController.deleteCustomer);
router.get('/customers/:id', apiLimiter, customerController.getCustomer);
router.get('/customers/q/:term', apiLimiter, customerController.getCustomersByTerm);
router.get('/customers', apiLimiter, customerController.getCustomers);

router.get('/customers', authController.verifyToken, customerController.getCustomers);

router.get('/healthinfo', apiLimiter, healthInfoController.getAllHealthInfo);
router.get('/healthinfo/:userId', apiLimiter, healthInfoController.getHealthInfo);
router.put('/healthinfo/:userId', apiLimiter, healthInfoController.updateHealthInfo);

router.post('/reviews', reviewsController.createReview)
router.get('/reviews', reviewsController.getReviews)
router.put('/reviews/:id', reviewsController.updateReviews)
router.delete('/reviews/:id', reviewsController.deleteReviews)
router.get('/reviews/:id', reviewsController.getReviewsByReviewID)
router.get('/reviews/user/:userID', reviewsController.getReviewsByUserID)
router.get('/reviews/product/:productID', reviewsController.getReviewsByProductID)

router.post('/users', userController.createUser);
router.get('/users', userController.getAllUsers)
router.get('/users/:id', userController.getUserById)

router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.put('/request-password-reset', authController.requestPasswordReset)
router.put('/reset-password', authController.resetPassword);

router.post('/discounts', apiLimiter, discountController.createDiscount);     // สร้าง Discount
router.get('/discounts', apiLimiter, discountController.getAllDiscounts);     // ดึง Discount ทั้งหมด
router.get('/discounts/:id', apiLimiter, discountController.getDiscountById); // ดึง Discount ตาม ID
router.put('/discounts/:id', apiLimiter, discountController.updateDiscount);  // อัปเดต Discount
router.delete('/discounts/:id', apiLimiter, discountController.deleteDiscount); // ลบ Discount

router.post('/userdiscounts', userDiscountController.createUserDiscount);
router.get('/userdiscounts/user/:userID', userDiscountController.getUserDiscounts);
router.get('/userdiscounts/:id', userDiscountController.getUserDiscountById);
router.put('/userdiscounts/:id', userDiscountController.updateUserDiscount);
router.delete('/userdiscounts/:id', userDiscountController.deleteUserDiscount);
router.post('/apply-discount-to-all', userDiscountController.applyDiscountToAllUsers)
router.get('/userdiscounts/user/active/:userID', userDiscountController.getUserDiscountsActive);

// Zone categories
router.get('/category', categoryController.getAllCategory);
router.get('/category/:categoryId', categoryController.getCategoryById);
router.put('/category/:categoryId', categoryController.updateCategory);
router.delete('/category/:categoryId', categoryController.deleteCategory);
router.post('/category', categoryController.createCategory);// เพิ่มเส้นทางสำหรับการสร้างหมวดหมู่


module.exports = router;

/**
 * @swagger
 * components:
 *    schemas:
 *      Customer:
 *        type: object
 *        properties:
 *          customer_id:
 *            type: integer
 *            description: The unique identifier of the customer.
 *          first_name:
 *            type: string
 *            description: The customer's firstname.
 *          last_name:
 *            type: string
 *            description: The customer's lastname.
 *          address:
 *            type: string
 *            description: The customer's address.
 *          email:
 *            type: string
 *            description: The customer's email (unique).
 *          phone_number:
 *            type: string
 *            description: The customer's phone number.
 *        required:
 *          - none
 */

/**
 * @swagger
 * /api/v1/customers:
 *   get:
 *     summary: Get All Customers
 *     tags: [Customers]
 *     description: Returns a list of all customers in the database.
 *     responses:
 *       200:
 *         description: A list of customers.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  $ref: '#/components/schemas/Customer'
 *       500:
 *         description: Internal server error.
 * 
 */

/**
 * @swagger
 * /api/v1/customers/{id}:
 *   get:
 *     summary: Get Customer by ID
 *     tags: [Customers]
 *     description: Returns a single customer object based on the provided ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The unique identifier of the customer.
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Customer object found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating customer not found.
 *       500:
 *         description: Internal server error.
 *
 */

/**
 * @swagger
 * /api/v1/customers:
 *   post:
 *     summary: Create a new Customer 
 *     tags: [Customers]
 *     description: create a new customer on database 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       200:
 *         description: Customer object created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       500:
 *         description: Internal server error.
 *
 */

/**
 * @swagger
 * /api/v1/customers:
 *   put:
 *     summary: Update an existing Customer
 *     tags: [Customers]
 *     description: Update a customer's details in the database based on the provided customer_id.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       200:
 *         description: Customer object updated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating customer not found.
 *       500:
 *         description: Internal server error.
 */


/**
 * @swagger
 * /api/v1/customers/{id}:
 *   delete:
 *     summary: Delete a Customer by ID
 *     tags: [Customers]
 *     description: Delete a customer from the database based on the provided ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The unique identifier of the customer.
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Customer object deleted.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating customer not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/v1/customers/q/{term}:
 *   get:
 *     summary: Search Customers by term
 *     tags: [Customers]
 *     description: Returns a list of customers matching the search term.
 *     parameters:
 *       - in: path
 *         name: term
 *         description: The term to search for in customer names and emails.
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: List of customers matching the search term.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating customer not found.
 *       500:
 *         description: Internal server error.
 */
