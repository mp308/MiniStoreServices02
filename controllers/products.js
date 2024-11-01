const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');
const path = require('path');

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save the uploaded images in the 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Rename the file with a timestamp
    }
});

const upload = multer({ storage: storage }).single('image'); // For handling single image upload

const createProduct = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ error: 'File upload error', details: err });
        }

        const { name, description, price, CategoryID, size, Nutritional_value, taste } = req.body;
        const image_url = req.file ? `/uploads/${req.file.filename}` : null;

        // ตรวจสอบค่าที่จำเป็น
        if (!name || !description || !price || !CategoryID) {
            return res.status(400).json({ error: 'กรุณาระบุข้อมูลที่จำเป็นทั้งหมด' });
        }

        try {
            console.log("Data being saved:", { name, description, price, CategoryID, size, Nutritional_value, taste, image_url });

            const prod = await prisma.product.create({
                data: {
                    name,
                    description,
                    price: parseFloat(price),
                    size: size ? parseFloat(size) : null,  // ตรวจสอบว่า size เป็นค่าที่ระบุไว้หรือไม่
                    Nutritional_value,
                    taste,
                    image_url,
                    categories: {
                        connect: { CategoriesID: parseInt(CategoryID) }
                    }
                }
            });
            res.status(200).json(prod);
        } catch (err) {
            console.error('Error creating product:', err);
            res.status(500).json({ error: 'Error creating product', details: err });
        }
    });
};




const updateProduct = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error uploading file', error: err.message });
        }

        const { name, description, price, CategoryID, size, Nutritional_value, taste } = req.body;
        const { id } = req.params; // ดึง ID ของสินค้าจาก URL

        // สร้างออบเจ็กต์ `data` สำหรับการอัปเดต
        const data = {};
        if (name) data.name = name;
        if (description) data.description = description;
        if (price) data.price = parseFloat(price);
        if (size) data.size = parseFloat(size); // ตรวจสอบว่า size เป็นค่าที่ระบุไว้หรือไม่
        if (Nutritional_value) data.Nutritional_value = Nutritional_value;
        if (taste) data.taste = taste;
        if (req.file) data.image_url = `/uploads/${req.file.filename}`;
        
        // ตรวจสอบว่ามีการส่ง CategoryID เพื่อเชื่อมโยงกับหมวดหมู่ใหม่
        if (CategoryID) {
            data.categories = {
                connect: { CategoriesID: parseInt(CategoryID) }
            };
        }

        // ตรวจสอบว่ามีข้อมูลให้อัปเดตหรือไม่
        if (Object.keys(data).length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'No data provided for update.',
            });
        }

        try {
            const prod = await prisma.product.update({
                data,
                where: { product_id: Number(id) }
            });
            res.status(200).json({
                status: 'ok',
                message: `Product with ID = ${id} is updated`,
                product: prod
            });
        } catch (err) {
            if (err.code === 'P2002') {
                res.status(400).json({
                    status: 'error',
                    message: 'Product name already exists.',
                });
            } else if (err.code === 'P2025') {
                res.status(404).json({
                    status: 'error',
                    message: `Product with ID = ${id} not found.`,
                });
            } else {
                console.error('Update product error: ', err);
                res.status(500).json({
                    status: 'error',
                    message: 'An unexpected error occurred.',
                });
            }
        }
    });
};


// Delete product by product_id
const deleteProduct = async (req, res) => {
    const id = req.params.id;
    try {
        const prod = await prisma.product.delete({
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
        const prod = await prisma.product.findMany();
        res.json(prod);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get a single product by product_id
const getProduct = async (req, res) => {
    const id = req.params.id;
    try {
        const prod = await prisma.product.findUnique({
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
        const prods = await prisma.product.findMany({
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
        if (!prods || prods.length === 0) {
            res.status(404).json({ message: 'Product not found' });
        } else {
            res.status(200).json(prods);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    getProducts,
    getProduct,
    getProductsByTerm
};
