const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const createUser = async (req, res) => {
    const { username, password, role } = req.body;
  
    // Hash the password
    const hashResult = await bcrypt.hash(password, 256);
    // 256 = salt (การสุ่มค่าเพื่อเพิ่มความซับซ้อนในการเข้ารหัส)
  
    // Store the user data
    const userData = {
      UserName: username,
      Role: role,
      Status: 'Active',
      Password: hashResult
    };
  
    try {
        const user = await prisma.users.create({
            data: userData
        });
        res.status(200).json({message: 'ok'});
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "insert user data fail!",
        error,
      });
    } 
  }
  
  module.exports = { createUser }