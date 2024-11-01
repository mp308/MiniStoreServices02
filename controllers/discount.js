const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/// สร้าง Discount ใหม่
async function createDiscount(req, res) {
    const { discount_code, discount_amount, discount_percent, expiration_date} = req.body;
  
    try {
      const newDiscount = await prisma.discounts.create({
        data: {
          discount_code,
          discount_amount: discount_amount ? parseFloat(discount_amount) : null,
          discount_percent: discount_percent ? parseFloat(discount_percent) : null,
          expiration_date: expiration_date ? new Date(expiration_date) : null,
          
        },
      });
      res.json(newDiscount);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create discount', details: error.message });
    }
  }
  

// ดึง Discount ทั้งหมด
async function getAllDiscounts(req, res) {
  try {
    const discounts = await prisma.discounts.findMany();
    res.json(discounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch discounts' });
  }
}

// ดึง Discount ตาม ID
async function getDiscountById(req, res) {
  const { id } = req.params;

  try {
    const discount = await prisma.discounts.findUnique({
      where: { discount_id: parseInt(id) },
    });
    if (discount) {
      res.json(discount);
    } else {
      res.status(404).json({ error: 'Discount not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch discount' });
  }
}

// อัปเดต Discount
async function updateDiscount(req, res) {
  const { id } = req.params;
  const { discount_code, discount_amount, discount_percent, expiration_date,status } = req.body;

  try {
    const updatedDiscount = await prisma.discounts.update({
      where: { discount_id: parseInt(id) },
      data: {
        discount_code,
        discount_amount: parseFloat(discount_amount),
        discount_percent: discount_percent ? parseFloat(discount_percent) : null,
        expiration_date: expiration_date ? new Date(expiration_date) : null,
        status
      },
    });
    res.json(updatedDiscount);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update discount' });
  }
}

// ลบ Discount
async function deleteDiscount(req, res) {
  const { id } = req.params;

  try {
    const deletedDiscount = await prisma.discounts.delete({
      where: { discount_id: parseInt(id) },
    });
    res.json(deletedDiscount);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete discount' });
  }
}

// Export CRUD functions
module.exports = {
  createDiscount,
  getAllDiscounts,
  getDiscountById,
  updateDiscount,
  deleteDiscount
};
