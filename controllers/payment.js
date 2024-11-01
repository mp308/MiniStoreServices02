const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const multer = require('multer');
const path = require('path');

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'payments/'); // Save the uploaded images in the 'payments' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Rename the file with a timestamp
    }
});

const upload = multer({ storage: storage }).single('paymentImage'); // Single image upload with the 'paymentImage' field




// Get All Payments (ดึงข้อมูลการชำระเงินทั้งหมด)
const getAllPayments = async (req, res) => {
    try {
        const payments = await prisma.payments.findMany({
            include: {
                orders: true // รวมข้อมูลที่เกี่ยวข้องกับตาราง orders
            }
        });
        res.status(200).json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch payments',
            error
        });
    }
};

// Get Payment by ID (ดึงข้อมูลการชำระเงินตาม ID)
const getPaymentById = async (req, res) => {
    const { paymentId } = req.params;

    try {
        const payment = await prisma.payments.findUnique({
            where: {
                payment_id: parseInt(paymentId, 10)
            },
            include: {
                orders: true // รวมข้อมูลคำสั่งซื้อที่เกี่ยวข้อง
            }
        });

        if (!payment) {
            return res.status(404).json({
                status: 'error',
                message: 'Payment not found'
            });
        }

        res.status(200).json(payment);
    } catch (error) {
        console.error('Error fetching payment:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch payment',
            error
        });
    }
};

const updatePayment = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                message: 'Image upload failed',
                error: err.message
            });
        }

        const { payment_id } = req.params;
        const { PaymentDate, Amount, PaymentMethod, payment_status, remark } = req.body;

        const data = {
            payment_date: PaymentDate ? new Date(PaymentDate).toISOString() : undefined, // Use lowercase field names
            amount: Amount,
            payment_method: PaymentMethod,
            payment_status: payment_status,
            remark: remark || null
        };

        // If a file is uploaded, add the image path
        if (req.file) {
            data.payment_Image = `/payments/${req.file.filename}`;
        }

        try {
            console.log('Updating payment with data:', data); // Log data being sent to Prisma
            const updatedPayment = await prisma.payments.update({
                where: { payment_id: parseInt(payment_id, 10) },
                data
            });

            res.status(200).json({
                status: 'ok',
                message: `Payment with ID = ${payment_id} is updated`,
                updatedPayment
            });
        } catch (error) {
            console.error('Error updating payment:', error); // Log full error
            if (error.code === 'P2025') {
                res.status(404).json({
                    status: 'error',
                    message: `Payment with ID = ${payment_id} not found`
                });
            } else {
                res.status(500).json({
                    status: 'error',
                    message: 'An unexpected error occurred',
                    error: error.message
                });
            }
        }
    });
};




// Get Payments by User ID (ดึงข้อมูลการชำระเงินตาม UserID)
const getPaymentsByUserId = async (req, res) => {
    const { userID } = req.params;

    try {
        const payments = await prisma.payments.findMany({
            where: {
                orders: {
                    UserID: parseInt(userID, 10) // เงื่อนไขการค้นหาตาม UserID
                }
            },
            include: {
                orders: true // รวมข้อมูลคำสั่งซื้อที่เกี่ยวข้อง
            }
        });

        if (payments.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No payments found for this user'
            });
        }

        res.status(200).json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch payments',
            error
        });
    }
};

module.exports = { getAllPayments, getPaymentById, updatePayment, getPaymentsByUserId };

