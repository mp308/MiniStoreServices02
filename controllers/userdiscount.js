const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// สร้างส่วนลดให้ผู้ใช้ (Create)
async function createUserDiscount(req, res) {
  const { UserID, discount_id } = req.body;

  try {
    // ตรวจสอบว่ามี discount_id นี้อยู่ในระบบหรือไม่
    const discount = await prisma.discounts.findUnique({
      where: { discount_id: parseInt(discount_id) },
    });

    if (!discount) {
      return res.status(404).json({ error: 'Discount not found' });
    }

    // ตรวจสอบว่าผู้ใช้ได้รับส่วนลดนี้แล้วหรือไม่
    const existingUserDiscount = await prisma.userdiscount.findFirst({
      where: { UserID: parseInt(UserID), discount_id: parseInt(discount_id) },
    });

    if (existingUserDiscount) {
      return res.status(400).json({ error: 'User already has this discount' });
    }

    const userDiscount = await prisma.userdiscount.create({
      data: {
        UserID: parseInt(UserID),
        discount_id: parseInt(discount_id),
      },
    });
    res.json(userDiscount);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user discount', details: error.message });
  }
}

// ดึงส่วนลดทั้งหมดของผู้ใช้ (Read All)
async function getUserDiscounts(req, res) {
  const { userID } = req.params;

  try {
    const userDiscounts = await prisma.userdiscount.findMany({
      where: { UserID: parseInt(userID) },
      include: {
        discount: true, // รวมข้อมูลส่วนลด
      },
    });
    res.json(userDiscounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user discounts', details: error.message });
  }
}

// ดึงส่วนลดของผู้ใช้ตาม ID (Read One)
async function getUserDiscountById(req, res) {
  const { id } = req.params;

  try {
    const userDiscount = await prisma.userdiscount.findUnique({
      where: { user_discount_id: parseInt(id) },
      include: {
        discount: true, // รวมข้อมูลส่วนลด
      },
    });
    if (userDiscount) {
      res.json(userDiscount);
    } else {
      res.status(404).json({ error: 'User discount not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user discount', details: error.message });
  }
}

// อัปเดตส่วนลดของผู้ใช้ (Update)
async function updateUserDiscount(req, res) {
  const { id } = req.params;
  const { UserID, discount_id, status } = req.body;

  try {
    const updatedUserDiscount = await prisma.userdiscount.update({
      where: { user_discount_id: parseInt(id) },
      data: {
        UserID: parseInt(UserID),
        discount_id: parseInt(discount_id),
        status: status
      },
    });
    res.json(updatedUserDiscount);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user discount', details: error.message });
  }
}

// ลบส่วนลดของผู้ใช้ (Delete)
async function deleteUserDiscount(req, res) {
  const { id } = req.params;

  try {
    const deletedUserDiscount = await prisma.userdiscount.delete({
      where: { user_discount_id: parseInt(id) },
    });
    res.json(deletedUserDiscount);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user discount', details: error.message });
  }
}

// สร้างส่วนลดให้ผู้ใช้ทุกคน (Apply Discount to All Users)
async function applyDiscountToAllUsers(req, res) {
  const { discount_id } = req.body;

  try {
    // ตรวจสอบว่ามี discount_id นี้อยู่ในระบบหรือไม่
    const discount = await prisma.discounts.findUnique({
      where: { discount_id: parseInt(discount_id) },
    });

    if (!discount) {
      return res.status(404).json({ error: 'Discount not found' });
    }

    // ดึงข้อมูลผู้ใช้ทั้งหมด
    const allUsers = await prisma.users.findMany();

    if (!allUsers || allUsers.length === 0) {
      return res.status(404).json({ error: 'No users found' });
    }

    // สร้างส่วนลดให้กับผู้ใช้แต่ละคน
    const userDiscounts = await Promise.all(
      allUsers.map(async (user) => {
        // ตรวจสอบว่าผู้ใช้ได้รับส่วนลดนี้แล้วหรือไม่
        const existingUserDiscount = await prisma.userdiscount.findFirst({
          where: { UserID: user.UserID, discount_id: parseInt(discount_id) },
        });

        if (!existingUserDiscount) {
          return prisma.userdiscount.create({
            data: {
              UserID: user.UserID,
              discount_id: parseInt(discount_id),
            },
          });
        } else {
          return null; // ถ้าผู้ใช้ได้รับส่วนลดนี้แล้วจะไม่สร้างซ้ำ
        }
      })
    );

    res.json({
      message: `Discount applied to ${allUsers.length} users successfully.`,
      userDiscounts: userDiscounts.filter(Boolean) // กรองเอาเฉพาะส่วนลดที่สร้างใหม่จริง ๆ
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to apply discount to all users', details: error.message });
  }
}

async function getUserDiscountsActive(req, res) {
  const { userID } = req.params;

  try {
    const userDiscounts = await prisma.userdiscount.findMany({
      where: { 
        UserID: parseInt(userID),
        status: 'active' // ดึงข้อมูลเฉพาะส่วนลดที่มีสถานะ active
      },
      include: {
        discount: true, // รวมข้อมูลส่วนลด
      },
    });
    res.json(userDiscounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user discounts', details: error.message });
  }
}



// Export ฟังก์ชัน CRUD ทั้งหมด
module.exports = {
  createUserDiscount,
  getUserDiscounts,
  getUserDiscountById,
  updateUserDiscount,
  deleteUserDiscount,
  applyDiscountToAllUsers,
  getUserDiscountsActive
};
