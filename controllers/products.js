const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createProduct = async (req, res) => {
    const { product_id, name, description, price, category, image_url } = req.body;
    try {
        const prod = await prisma.products.create({
            data: {
                product_id,
                name,
                description,
                price,
                category,
                image_url
            }
        });
        res.status(200).json(prod);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Update one product
const updateProduct = async (req, res) => {
    const { product_id, name, description, price, category, image_url } = req.body;
    try {
        const prod = await prisma.products.update({
            data: {
                product_id,
                name,
                description,
                price,
                category,
                image_url
            },
            where: { product_id: Number(product_id) }
        });
        res.status(200).json(prod);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Delete product by product_id
const deleteProduct = async (req, res) => {
    const id = req.params.id;
    try {
        const prod = await prisma.products.delete({
            where: {
                product_id: Number(id),
            },
        });
        res.status(200).json(prod);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get all products
const getProducts = async (req, res) => {
    try {
        const prod = await prisma.products.findMany();
        res.json(prod);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get only one product by product_id
const getProduct = async (req, res) => {
    const id = req.params.id;
    try {
        const prod = await prisma.products.findUnique({
            where: { product_id: Number(id) },
        });
        if (!prod) {
            res.status(404).json({ message: 'Product not found' });
        } else {
            res.status(200).json(prod);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get products by search term
const getProductsByTerm = async (req, res) => {
    const searchString = req.params.term;
    try {
        const prods = await prisma.products.findMany({
            where: {
                OR: [
                    {
                        description: {
                            contains: searchString
                        }
                    },
                    {
                        name: {
                            contains: searchString
                        }
                    }
                ]
            },
        });
        if (!prods || prods.length == 0) {
            res.status(404).json({ message: 'Product not found' });
        } else {
            res.status(200).json(prods);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = {
    createProduct, getProduct, getProducts,
    updateProduct, deleteProduct, getProductsByTerm
};
