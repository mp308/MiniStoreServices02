const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Insert one customer
const createCustomer = async (req, res) => {
    const { customer_id, first_name, last_name, address, email, phone_number } = req.body;
    try {
        const cust = await prisma.customers.create({
            data: {
                customer_id,
                first_name,
                last_name,
                address,
                email,
                phone_number
            }
        });
        res.status(200).json(cust);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update one customer
const updateCustomer = async (req, res) => {
    const { customer_id, first_name, last_name, address, email, phone_number } = req.body;
    try {
        const cust = await prisma.customers.update({
            data: {
                first_name,
                last_name,
                address,
                email,
                phone_number
            },
            where: { customer_id: Number(customer_id) }
        });
        res.status(200).json(cust);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete customer by customer_id
const deleteCustomer = async (req, res) => {
    const id = req.params.id;
    try {
        const cust = await prisma.customers.delete({
            where: { customer_id: Number(id) }
        });
        res.status(200).json(cust);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all customers
const getCustomers = async (req, res) => {
    try {
        const custs = await prisma.customers.findMany();
        res.status(200).json(custs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a single customer by customer_id
const getCustomer = async (req, res) => {
    const id = req.params.id;
    try {
        const cust = await prisma.customers.findUnique({
            where: { customer_id: Number(id) }
        });
        if (!cust) {
            res.status(404).json({ message: 'Customer not found' });
        } else {
            res.status(200).json(cust);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Search customers by term
const getCustomersByTerm = async (req, res) => {
    const searchString = req.params.term;
    try {
        const custs = await prisma.customers.findMany({
            where: {
                OR: [
                    { first_name: { contains: searchString } },
                    { email: { contains: searchString } }
                ]
            }
        });
        if (custs.length === 0) {
            res.status(404).json({ message: 'No customers found' });
        } else {
            res.status(200).json(custs);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomer,
    getCustomers,
    getCustomersByTerm
};
