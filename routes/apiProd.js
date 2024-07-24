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

/**
 * @swagger
 * components:
 *    schemas:
 *      Product:
 *        type: object
 *        properties:
 *          product_id:
 *            type: integer
 *            description: The unique identifier of the product.
 *          name:
 *            type: string
 *            description: The name of the product.
 *          description:
 *            type: string
 *            description: The description of the product.
 *          price:
 *            type: number
 *            format: float
 *            description: The price of the product.
 *          category:
 *            type: string
 *            description: The category of the product.
 *          image_url:
 *            type: string
 *            description: The URL of the product's image.
 *        required:
 *          - name
 *          - price
 */

/**
 * @swagger
 * /api/prod/products:
 *   get:
 *     summary: Get All Products
 *     tags: [Products]
 *     description: Returns a list of all products in the database.
 *     responses:
 *       200:
 *         description: A list of products.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  $ref: '#/components/schemas/Product'
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/prod/products/{id}:
 *   get:
 *     summary: Get Product by ID
 *     tags: [Products]
 *     description: Returns a single product object based on the provided ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The unique identifier of the product.
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Product object found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating product not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/prod/products:
 *   post:
 *     summary: Create a new Product
 *     tags: [Products]
 *     description: Create a new product in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product object created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/prod/products:
 *   put:
 *     summary: Update an existing Product
 *     tags: [Products]
 *     description: Update a product's details in the database based on the provided product_id.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product object updated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating product not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/prod/products/{id}:
 *   delete:
 *     summary: Delete a Product by ID
 *     tags: [Products]
 *     description: Delete a product from the database based on the provided ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The unique identifier of the product.
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Product object deleted.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating product not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/prod/products/q/{term}:
 *   get:
 *     summary: Search Products by term
 *     tags: [Products]
 *     description: Returns a list of products matching the search term.
 *     parameters:
 *       - in: path
 *         name: term
 *         description: The term to search for in product names and descriptions.
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: List of products matching the search term.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating product not found.
 *       500:
 *         description: Internal server error.
 */
