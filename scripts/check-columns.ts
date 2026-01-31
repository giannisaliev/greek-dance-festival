import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkColumns() {
  try {
    // Try to query with isTeacher and studioName
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name IN ('isTeacher', 'studioName')
      ORDER BY column_name;
    `;
    
    console.log('Columns found:', result);
    
    // Also try to select these fields from User table
    const user = await prisma.user.findFirst({
      select: { 
        id: true,
        email: true,
        isTeacher: true,
        studioName: true
      }
    });
    
    console.log('Sample user query successful:', user ? 'Yes' : 'No users found');
    console.log('\n✅ isTeacher and studioName columns exist!');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkColumns();
