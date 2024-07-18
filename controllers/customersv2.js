const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();

// search any customer by name
const getCustomersByTerm = async (req, res) => {
    const  searchString  = req.params.term;
    try {
        const custs = await prisma.customers.findMany({
            where: { 
                OR: [
                    {
                        first_name: {
                            contains: searchString
                        }
                    },
                    {
                        last_name: {
                            contains: searchString
                        }
                    },
                    {
                        email: {
                            contains: searchString
                        }
                    },
                    {
                        phone_number: {
                            contains: searchString
                        }
                    }
                ]
            },
        });
        if (!custs || custs.length == 0) {
            res.status(404).json({ 'message': 'Customer not found!' });
        } else {
            res.status(200).json(custs);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = { getCustomersByTerm };