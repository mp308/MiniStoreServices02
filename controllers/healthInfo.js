const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'profiles/'); // กำหนดพาธสำหรับการบันทึกรูปภาพ
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // กำหนดชื่อไฟล์
    }
});

const upload = multer({ storage: storage }).single('profile_image'); // single สำหรับรูปภาพ 1 รูป



const getAllHealthInfo = async (req, res) => {
    try {
      const healthInfoList = await prisma.health_info.findMany();
      res.status(200).json(healthInfoList);
    } catch (error) {
      console.error("Error fetching all health info:", error);
      res.status(500).json({
        message: "Failed to fetch all health info",
        error,
      });
    }
  }

const getHealthInfo = async (req, res) => {
    const { userId } = req.params; // รับ userId จากพารามิเตอร์ของ URL
  
    try {
      const healthInfo = await prisma.health_info.findUnique({
        where: {
          UserID: parseInt(userId, 10),
        },
      });
  
      if (!healthInfo) {
        return res.status(404).json({ message: 'Health info not found for this user' });
      }
  
      res.status(200).json(healthInfo);
    } catch (error) {
      console.error("Error fetching health info:", error);
      res.status(500).json({
        message: "Failed to fetch health info",
        error,
      });
    }
  }

  const updateHealthInfo = (req, res) => {
    // ตรวจสอบการอัปโหลดไฟล์ผ่าน multer
    upload(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error uploading file', error: err.message });
      }
  
      const { first_name, last_name, gender, email, address, phone_number, age, weight, height } = req.body;
      const { userId } = req.params; // รับ userId จากพารามิเตอร์ของ URL
  
      // สร้าง data object สำหรับการอัปเดต
      const data = {};
      if (first_name) data.first_name = first_name;
      if (last_name) data.last_name = last_name;
      if (gender) data.gender = gender;
      if (email) data.email = email;
      if (address) data.address = address;
      if (phone_number) data.phone_number = phone_number;
      if (age !== undefined) data.age = parseInt(age, 10);
      if (weight !== undefined) data.weight = parseFloat(weight);
      if (height !== undefined) data.height = parseFloat(height);
  
      // ตรวจสอบว่ามีไฟล์ภาพอัปโหลดมาหรือไม่
      if (req.file) data.profile_image = `/profiles/${req.file.filename}`; // บันทึกชื่อไฟล์รูปภาพลงในฐานข้อมูล
      
  
      try {
        // อัปเดตข้อมูลในฐานข้อมูลด้วย Prisma
        const healthInfo = await prisma.health_info.update({
          data,
          where: { UserID: parseInt(userId, 10) } // ใช้ userId จากพารามิเตอร์ URL
        });
  
        // ตอบกลับพร้อมข้อมูลที่อัปเดต
        res.status(200).json({
          status: 'ok',
          message: `Health info for User with ID = ${userId} is updated`,
          healthInfo
        });
      } catch (err) {
        // Handle Prisma-specific errors
        if (err.code === 'P2025') {
          res.status(404).json({ status: 'error', message: `Health info for User with ID = ${userId} not found.` });
        } else {
          console.error('Update health info error:', err);
          res.status(500).json({ status: 'error', message: 'An unexpected error occurred.' });
        }
      }
    });
  };
  





  

module.exports = { getAllHealthInfo, getHealthInfo, updateHealthInfo };