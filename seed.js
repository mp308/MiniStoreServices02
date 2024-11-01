const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // สร้างข้อมูลส่วนลดใหม่
  await prisma.discounts.create({
    data: {
      discount_code: 'DISCOUNT2024', // ตัวอย่าง discount code
      discount_percent: 10, // ตัวอย่างเปอร์เซ็นต์ส่วนลด
    },
  });
  console.log('Discount created successfully.');

  // สร้าง category เริ่มต้น
  const categories = [
    { CategoriesName: 'whey_protein' },
    { CategoriesName: 'supplement' },
    { CategoriesName: 'Snack' },
    { CategoriesName: 'Accessory' },
    { CategoriesName: 'special' }
  ];

  for (const category of categories) {
    await prisma.categories.create({
      data: category
    });
  }
  console.log('Categories created successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
