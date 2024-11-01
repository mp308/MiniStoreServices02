const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createOrder = async (req, res) => {
    const { 
      userId, orderDate, items, paymentMethod, totalAmount, fullName, 
      shippingAddress, phoneNumber, discount_id, discount_amount, 
      original_amount, final_amount, shipping_method, shipping_price 
    } = req.body;
  
    if (!userId || !items || !paymentMethod || !totalAmount || !fullName || !shippingAddress || !phoneNumber || !shipping_method || !shipping_price) {
      return res.status(400).json({ message: 'Invalid order data' });
    }
  
    try {
      const order = await prisma.orders.create({
        data: {
          UserID: userId,
          order_date: new Date(orderDate),
          order_status: 'processing',
          total_amount: totalAmount,
          full_name: fullName,
          shipping_address: shippingAddress,
          phone_number: phoneNumber,
          shipping_method: shipping_method, // บันทึกวิธีการส่งสินค้า
          shipping_price: shipping_price,   // บันทึกค่าส่งสินค้า
          discount_id: discount_id || null,  // ตรวจสอบว่ามีการส่ง discount_id หรือไม่ ถ้าไม่มีกำหนดให้เป็น null
          discount_amount: discount_amount || 0,  // บันทึกจำนวนส่วนลด
          original_amount: original_amount,  // บันทึกจำนวนเงินก่อนส่วนลด
          final_amount: final_amount,  // บันทึกจำนวนเงินหลังหักส่วนลด
          orderdetails: {
            create: items.map((item) => ({
              product_id: item.productId,
              quantity: item.quantity,
              unit_price: item.unitPrice,
            })),
          },
        },
      });
  
      const payment = await prisma.payments.create({
        data: {
          order_id: order.order_id,
          amount: totalAmount,
          payment_method: paymentMethod,
          payment_status: 'pending',
        },
      });
  
      console.log('Transaction committed:', { order, payment });
      res.status(200).json({ message: 'Order created successfully.', order, payment });
    } catch (err) {
      console.error('Failed to create orders:', err.message);
      res.status(500).json({ error: 'Failed to create order', message: err.message });
    }
  };
  
const getOrders = async (req, res) => {
  try {
      const orders = await prisma.orders.findMany({
          include: {
              orderdetails: true,  // Correct plural form for order details
              payments: true,      // Correct relation for payments 
                 
          },
      });
      res.status(200).json(orders);
  } catch (err) {
      console.error('Failed to retrieve orders:', err.message);
      res.status(500).json({ error: 'Failed to retrieve orders', message: err.message });
  }
};

const getOrderById = async (req, res) => {
  const id = req.params.id;

  try {
      const order = await prisma.orders.findUnique({
          where: {
              order_id: Number(id) // แปลง order_id ให้เป็น Int
          },
          include: {
              orderdetails: true,  // รวมรายละเอียดสินค้าในคำสั่งซื้อ (ใช้ชื่อที่ถูกต้องคือ orderdetails)
              payments: true,     // รวมข้อมูลการชำระเงิน
          },
      });

      if (!order) {
          return res.status(404).json({ message: 'Order not found' });
      }

      res.status(200).json(order);
  } catch (err) {
      console.error('Error retrieving order:', err.message);
      res.status(500).json({ error: 'Failed to retrieve order', message: err.message });
  }
};

const getOrdersByUserId = async (req, res) => {
  const userId = req.params.userId;  // Get userId from the request parameters

  try {
      const orders = await prisma.orders.findMany({
          where: {
            UserID: Number(userId)  // Filter by user_id instead of order_id
          },
          include: {
              orderdetails: true,  // Include order details
              payments: true,     // Include payment information
          },
      });

      if (orders.length === 0) {
          return res.status(404).json({ message: 'No orders found for this user' });
      }

      res.status(200).json(orders);
  } catch (err) {
      console.error('Error retrieving orders:', err.message);
      res.status(500).json({ error: 'Failed to retrieve orders', message: err.message });
  }
};


const updateOrder = async (req, res) => {
  const id = req.params.id;
  const { userId, orderDate, items, payment_status, totalAmount, fullName, shippingAddress, phoneNumber, orderStatus } = req.body;

  try {
      const existingOrder = await prisma.orders.findUnique({
          where: { order_id: Number(id) },
      });

      if (!existingOrder) {
          return res.status(404).json({ error: 'Order not found' });
      }

      const [updatedOrder, updatedPayment] = await prisma.$transaction([
          prisma.orders.update({
              where: { order_id: Number(id) },
              data: {
                  UserID: parseInt(userId),
                  order_date: new Date(orderDate),
                  total_amount: parseFloat(totalAmount),
                  full_name: fullName,
                  shipping_address: shippingAddress,
                  phone_number: phoneNumber,
                  order_status: orderStatus, // Update order status here
              },
          }),
          prisma.payments.updateMany({
              where: { order_id: Number(id) },
              data: {
                  payment_status: payment_status,
                  amount: parseFloat(totalAmount),
              },
          }),
      ]);

      await prisma.orderdetail.deleteMany({
          where: { order_id: Number(id) },
      });

      for (const item of items) {
          await prisma.orderdetail.create({
              data: {
                  order_id: Number(id),
                  product_id: parseInt(item.productId),
                  quantity: parseInt(item.quantity),
                  unit_price: parseFloat(item.unitPrice),
              },
          });
      }

      res.status(200).json({ message: 'Order updated successfully.', updatedOrder, updatedPayment });
  } catch (err) {
      console.error('Error updating order:', err.message);
      res.status(500).json({ error: 'Failed to update order', message: err.message });
  }
};



const deleteOrder = async (req, res) => {
  const id = req.params.id;

  try {
      await prisma.$transaction([
          prisma.orderdetail.deleteMany({ where: { order_id: Number(id) } }),
          prisma.payments.deleteMany({ where: { order_id: Number(id) } }),
          prisma.orders.delete({ where: { order_id: Number(id) } }),
      ]);
      res.status(200).json({ message: 'Order deleted successfully' });
  } catch (err) {
      res.status(500).json({ error: 'Failed to delete order', message: err.message });
  }
};


module.exports = { createOrder, getOrders, getOrderById,getOrdersByUserId,updateOrder ,deleteOrder };
