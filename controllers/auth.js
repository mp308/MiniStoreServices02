const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const crypto = require('crypto');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

const secretKey = "NoIdeaNow";


//client เก็บข้อมูลไว้ใน cookie
// ***
// * Verify token through Cookies of HttpOnly 
// ***
const verifyToken = (req, res, next) => {
    const token = req.cookies.authToken; // เปลี่ยนมาเช็คผ่าน cookie ที่ใส่ไปแทน
    if (token == null) return res.sendStatus(401); // if there isn't any token

    try {
        const user = jwt.verify(token, secretKey);
        req.user = user;
        next();
    } catch (error) {
        return res.sendStatus(401);
    }
}
// ***
// * Verify token through Bearer of Http authorization header
// ***

//client เก็บข้อมูลไว้ใน localstoreless


// const verifyToken = (req, res, next) => {
//     //auth :asdsadasdasdaskhhhjk.sdsdadsadasdasd.545กหฟกฟหก
//     const token = req.headers.authorization?.split(' ')[1]; //มีช่องว่างในการคั่นกลาง //ดึงtoken ที่1มาใช้ //ได้ข้อมุลจาก headder 
//     //จุดต่างด้านบน
//     if (!token) {
//         return res.sendStatus(401)
//     }
//     jwt.verify(token, secretKey, (err, decoded) => {
//         if (err) {
//             return res.status(401).json({ error: 'Failed to authenticate token' })
//         }
//         req.user = decoded;
//         next();
//     });
// }

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await prisma.users.findUnique({
            where: { UserName: username },
        });
        if (!user) {
            res.status(404).json({ 'message': 'User not found!' });
        }
        const validPassword = await bcrypt.compare(password, user.Password);
        if (!validPassword) {
            return res.status(401).send({ message: "Invalid username or password!" });
        }
        const token = jwt.sign({ username: user.UserName, role: user.Role }, secretKey, { expiresIn: "4h" });
        // use with HTTPS only with SameSite only
        res.cookie("authToken", token, {
            maxAge: 1000 * 60 * 60 * 4,   // expired after 4 hours
            secure: false,  // not use with HTTPS only //ไม่โดน java อืนรบกวน
            httpOnly: true,
            sameSite: "Strict",
        });
        // use with HTTPS only with SameSite is not strict
        // res.cookie("authToken", token, {
        //     maxAge: 1000 * 60 * 60 * 4,   // expired after 4 hours
        //     secure: true,  
        //     httpOnly: true,
        //     sameSite: "none",
        // });
        res.status(200).send({ message: "Login successful", id: user.UserID, role: user.Role, token: token });

    } catch (err) {
        res.status(500).json(err);
    }
}

// user logout
const logout = async (req, res) => {
    res.clearCookie('authToken', { path: '/' });
    res.send({ message: "Logout successful" });
}


// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Gmail address
        pass: process.env.EMAIL_PASSWORD, // App password (if using 2FA)
    },
});

// Verify the transporter to ensure proper setup
transporter.verify((error, success) => {
    if (error) {
        console.log("Error with email configuration: ", error);
    } else {
        console.log("Ready to send emails");
    }
});


// Request password reset function
const requestPasswordReset = async (req, res) => {
    const { usernameOrEmail } = req.body;

    try {
        // Find user by username or email and get the related health_info
        const user = await prisma.users.findFirst({
            where: {
                OR: [
                    { UserName: usernameOrEmail }, // Check by username
                    { healthInfo: { email: usernameOrEmail } }, // Check by email
                ],
            },
            include: {
                healthInfo: true, // Ensure healthInfo contains the email
            },
        });

        if (!user || !user.healthInfo.email) {
            return res.status(404).json({ message: 'User or email not found' });
        }

        // Generate reset token and set expiry time
        const resetToken = crypto.randomBytes(6).toString('hex'); // 6-character token
        const resetTokenExpiry = new Date(Date.now() + 3600000); // Token valid for 1 hour

        // Save the token and expiry in the database
        await prisma.users.update({
            where: { UserID: user.UserID },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });

        // Send the reset token to user's email
        await transporter.sendMail({
            from: process.env.EMAIL_USER, // Sender email
            to: user.healthInfo.email, // Recipient email
            subject: 'Password Reset Request',
            text: `Hello ${user.UserName},

We received a request to reset the password for your account. 

If this was you, please use the following token to reset your password:

Token: ${resetToken}

If you didn’t request a password reset, no action is required from you.

Thank you, 
Your Support Team`,
        });

        res.status(200).json({ message: 'Password reset link sent to email.' });
    } catch (error) {
        console.error('Error during password reset request:', error);
        res.status(500).json({ message: 'An error occurred', error });
    }
};



// Password Reset Function
const resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;
  
    try {
      // Find the user with the valid reset token and check if it's not expired
      const user = await prisma.users.findFirst({
        where: {
          resetToken,
          resetTokenExpiry: {
            gte: new Date(), // Check if token is still valid (not expired)
          },
        },
      });
  
      // If no user is found or token expired
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the password and clear reset token and expiry
      await prisma.users.update({
        where: { UserID: user.UserID },
        data: {
          Password: hashedPassword,
          resetToken: null,         // Clear resetToken
          resetTokenExpiry: null,   // Clear resetTokenExpiry
        },
      });
  
      res.status(200).json({ message: 'Password updated successfully!' });
    } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({ message: 'An error occurred', error });
    }
  };



module.exports = {
    login, logout, verifyToken, requestPasswordReset, resetPassword, secretKey
}