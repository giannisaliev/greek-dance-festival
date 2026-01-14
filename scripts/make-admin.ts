import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeAdmin() {
  const adminEmail = 'giannisaliev@gmail.com';
  
  try {
    // First, check if user exists
    let user = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (user) {
      // Update existing user to be admin
      user = await prisma.user.update({
        where: { email: adminEmail },
        data: { isAdmin: true },
      });
      console.log(`✅ Updated ${adminEmail} to admin status`);
    } else {
      console.log(`⚠️  User ${adminEmail} not found. They need to sign in with Google first.`);
    }
  } catch (error) {
    console.error('Error making user admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
