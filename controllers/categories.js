const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ดึงข้อมูลหมวดหมู่ทั้งหมด
const getAllCategory = async (req, res) => {
    try {
        const categories = await prisma.categories.findMany(); // ใช้ 'categories' ตาม schema
        res.status(200).json(categories);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่:', error);
        res.status(500).json({
            status: 'error',
            message: 'ไม่สามารถดึงข้อมูลหมวดหมู่ได้',
            error
        });
    }
};

// ดึงข้อมูลหมวดหมู่โดยใช้ ID
const getCategoryById = async (req, res) => {
    const { categoryId } = req.params;

    try {
        const category = await prisma.categories.findUnique({
            where: {
                CategoriesID: parseInt(categoryId, 10) // ใช้ 'CategoriesID' ตาม schema
            }
        });

        if (!category) {
            return res.status(404).json({ 
                status: 'error',
                message: 'ไม่พบข้อมูลหมวดหมู่' 
            });
        }

        res.status(200).json(category);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่:', error);
        res.status(500).json({
            status: 'error',
            message: 'ไม่สามารถดึงข้อมูลหมวดหมู่ได้',
            error
        });
    }
};

// สร้างหมวดหมู่ใหม่
const createCategory = async (req, res) => {
    const { CategoriesName } = req.body; // ใช้ 'CategoriesName' ตาม schema

    if (!CategoriesName) {
        return res.status(400).json({
            status: 'error',
            message: 'กรุณาระบุ CategoriesName'
        });
    }

    try {
        const newCategory = await prisma.categories.create({
            data: {
                CategoriesName
            }
        });

        res.status(201).json({
            status: 'ok',
            message: 'สร้างหมวดหมู่ใหม่สำเร็จ',
            newCategory
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการสร้างหมวดหมู่:', error);
        res.status(500).json({
            status: 'error',
            message: 'ไม่สามารถสร้างหมวดหมู่ได้',
            error
        });
    }
};

// อัปเดตข้อมูลหมวดหมู่
const updateCategory = async (req, res) => {
    const { categoryId } = req.params;
    const { CategoriesName } = req.body; // ใช้ 'CategoriesName' ตาม schema

    const data = {};
    if (CategoriesName) data.CategoriesName = CategoriesName;

    if (Object.keys(data).length === 0) {
        return res.status(400).json({ 
            status: 'error',
            message: 'ไม่ได้ระบุข้อมูลสำหรับการอัปเดต' 
        });
    }

    try {
        const updatedCategory = await prisma.categories.update({
            where: { CategoriesID: parseInt(categoryId, 10) },
            data
        });

        res.status(200).json({
            status: 'ok',
            message: `อัปเดตข้อมูลหมวดหมู่สำเร็จสำหรับ ID = ${categoryId}`,
            updatedCategory
        });
    } catch (err) {
        if (err.code === 'P2025') {
            res.status(404).json({ 
                status: 'error',
                message: `ไม่พบหมวดหมู่ที่มี ID = ${categoryId}` 
            });
        } else {
            console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูลหมวดหมู่:', err);
            res.status(500).json({
                status: 'error',
                message: 'เกิดข้อผิดพลาดที่ไม่คาดคิด'
            });
        }
    }
};

// ลบข้อมูลหมวดหมู่
const deleteCategory = async (req, res) => {
    const { categoryId } = req.params;

    try {
        const deletedCategory = await prisma.categories.delete({
            where: { CategoriesID: parseInt(categoryId, 10) }
        });

        res.status(200).json({
            status: 'ok',
            message: `ลบข้อมูลหมวดหมู่สำเร็จสำหรับ ID = ${categoryId}`,
            deletedCategory
        });
    } catch (err) {
        if (err.code === 'P2025') {
            res.status(404).json({ 
                status: 'error',
                message: `ไม่พบหมวดหมู่ที่มี ID = ${categoryId}` 
            });
        } else {
            console.error('เกิดข้อผิดพลาดในการลบข้อมูลหมวดหมู่:', err);
            res.status(500).json({
                status: 'error',
                message: 'เกิดข้อผิดพลาดที่ไม่คาดคิด'
            });
        }
    }
};

module.exports = { getAllCategory, getCategoryById, createCategory, updateCategory, deleteCategory };
