import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

const packageMapping: { [key: string]: string } = {
  // English names
  "Guinness Record Only": "guinness-only",
  "Greek Night Only": "greek-night-only",
  "Starter Pass": "starter-pass",
  "Explorer Pass": "explorer-pass",
  "Enthusiast Pass": "enthusiast-pass",
  "Full Pass": "full-pass",
  
  // Greek names
  "Μόνο Ρεκόρ Guinness": "guinness-only",
  "Μόνο Ελληνική Βραδιά": "greek-night-only",
  "Κάρτα Εισαγωγής": "starter-pass",
  "Κάρτα Εξερεύνησης": "explorer-pass",
  "Κάρτα Ενθουσιώδη": "enthusiast-pass",
  "Πλήρης Κάρτα": "full-pass",
};

const packagePrices: { [key: string]: number } = {
  "guinness-only": 30,
  "greek-night-only": 40,
  "starter-pass": 70,
  "explorer-pass": 100,
  "enthusiast-pass": 160,
  "full-pass": 260,
};

async function migratePackageKeys() {
  console.log('Starting package key migration...');
  
  try {
    // Get all participants
    const participants = await prisma.participant.findMany({
      select: {
        id: true,
        packageType: true,
        totalPrice: true,
        guinnessRecordAttempt: true,
        greekNight: true,
      },
    });

    console.log(`Found ${participants.length} participants to check`);

    let updated = 0;
    let alreadyCorrect = 0;
    let priceFixed = 0;

    for (const participant of participants) {
      const newKey = packageMapping[participant.packageType];
      
      if (newKey) {
        // Calculate correct price
        let correctPrice = packagePrices[newKey];
        
        // Add addons for non-all-inclusive packages
        if (newKey !== "full-pass" && newKey !== "guinness-only" && newKey !== "greek-night-only") {
          if (participant.guinnessRecordAttempt) correctPrice += 30;
          if (participant.greekNight) correctPrice += 40;
        } else if (newKey === "guinness-only" && participant.greekNight) {
          correctPrice += 40;
        } else if (newKey === "greek-night-only" && participant.guinnessRecordAttempt) {
          correctPrice += 30;
        }
        
        // Update both package key and price if either is wrong
        const needsPriceUpdate = participant.totalPrice !== correctPrice;
        
        await prisma.participant.update({
          where: { id: participant.id },
          data: {
            packageType: newKey,
            ...(needsPriceUpdate ? { totalPrice: correctPrice } : {}),
          },
        });
        
        updated++;
        if (needsPriceUpdate) {
          priceFixed++;
          console.log(`Updated participant ${participant.id}: "${participant.packageType}" → "${newKey}", price: €${participant.totalPrice} → €${correctPrice}`);
        } else {
          console.log(`Updated participant ${participant.id}: "${participant.packageType}" → "${newKey}"`);
        }
      } else if (participant.packageType.startsWith('guinness-') || 
                 participant.packageType.startsWith('greek-') || 
                 participant.packageType.includes('-pass')) {
        alreadyCorrect++;
      } else {
        console.warn(`Unknown package type for participant ${participant.id}: "${participant.packageType}"`);
      }
    }

    console.log('\nMigration complete!');
    console.log(`- Updated: ${updated}`);
    console.log(`- Already correct: ${alreadyCorrect}`);
    console.log(`- Price fixed: ${priceFixed}`);
    console.log(`- Total checked: ${participants.length}`);
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migratePackageKeys()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
