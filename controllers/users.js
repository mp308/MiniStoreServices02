const { PrismaClient, userdiscount_status } = require('@prisma/client')
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const createUser = async (req, res) => {
  const { username, password, role, healthInfo } = req.body;

  // Hash the password
  const hashResult = await bcrypt.hash(password, 10);

  // Prepare user data
  const userData = {
    UserName: username,
    Role: role,
    Status: 'Active',
    Password: hashResult,
    healthInfo: {
      create: {
        first_name: healthInfo.first_name,
        last_name: healthInfo.last_name,
        gender: healthInfo.gender,
        email: healthInfo.email,
        address: healthInfo.address,
        phone_number: healthInfo.phone_number,
        age: parseInt(healthInfo.age), // แปลง age เป็น Int
        weight: parseInt(healthInfo.weight), // แปลง weight เป็น Int
        height: parseInt(healthInfo.height) // แปลง height เป็น Int
      }
    },
    userdiscount: {
      create: {
        discount_id: 1,
      }
    }
  };

  try {
    // Create user with user discount data
    const user = await prisma.users.create({
      data: userData
    });

    res.status(200).json({ message: 'User created successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to create user!',
      error,
    });
  }
};


// ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้ทั้งหมด
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      include: {
        healthInfo: true, // รวมข้อมูล healthInfo
        userdiscount: {
          include: {
            discount: true // รวมข้อมูลส่วนลดที่เกี่ยวข้องกับ userdiscount
          }
        }
      }
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to fetch users!',
      error,
    });
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้ตาม ID
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.users.findUnique({
      where: { UserID: parseInt(id) },
      include: {
        healthInfo: true, // รวมข้อมูล healthInfo
        userdiscount: {
          include: {
            discount: true // รวมข้อมูลส่วนลดที่เกี่ยวข้องกับ userdiscount
          }
        }
      }
    });

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found!' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to fetch user!',
      error,
    });
  }
};


module.exports = { createUser, getAllUsers, getUserById  }


  
