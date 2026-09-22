const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('Admin123', 10);
    
    const admin = await prisma.users.create({
      data: {
        email: 'admin@nexhire.com',
        password_hash: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        status: 'active',
      },
    });

    console.log('✅ Admin created successfully!');
    console.log('Email: admin@nexhire.com');
    console.log('Password: Admin123');
    console.log('Admin ID:', admin.user_id);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
