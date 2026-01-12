const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding schedule data...');

  // Friday schedule
  await prisma.schedule.createMany({
    data: [
      {
        day: 'Friday',
        date: 'June 12',
        time: '10:00 - 11:30',
        lecturer: 'Maria Papadopoulos',
        danceStyle: 'Syrtos',
        level: 'Beginner',
      },
      {
        day: 'Friday',
        date: 'June 12',
        time: '12:00 - 13:30',
        lecturer: 'Dimitris Konstantinou',
        danceStyle: 'Kalamatianos',
        level: 'Intermediate',
      },
      {
        day: 'Friday',
        date: 'June 12',
        time: '14:00 - 15:30',
        lecturer: 'Elena Georgiou',
        danceStyle: 'Tsamikos',
        level: 'Advanced',
      },
      {
        day: 'Friday',
        date: 'June 12',
        time: '16:00 - 17:30',
        lecturer: 'Nikos Anastasiadis',
        danceStyle: 'Hasapiko',
        level: 'All Levels',
      },

      // Saturday schedule
      {
        day: 'Saturday',
        date: 'June 13',
        time: '09:00 - 10:30',
        lecturer: 'Sofia Michaelidou',
        danceStyle: 'Pentozalis',
        level: 'Beginner',
      },
      {
        day: 'Saturday',
        date: 'June 13',
        time: '11:00 - 12:30',
        lecturer: 'Yannis Petrakis',
        danceStyle: 'Sousta',
        level: 'Intermediate',
      },
      {
        day: 'Saturday',
        date: 'June 13',
        time: '13:00 - 14:30',
        lecturer: 'Maria Papadopoulos',
        danceStyle: 'Ballos',
        level: 'Advanced',
      },
      {
        day: 'Saturday',
        date: 'June 13',
        time: '15:00 - 16:30',
        lecturer: 'Dimitris Konstantinou',
        danceStyle: 'Zeibekiko',
        level: 'All Levels',
      },
      {
        day: 'Saturday',
        date: 'June 13',
        time: '17:00 - 18:30',
        lecturer: 'Elena Georgiou',
        danceStyle: 'Syrtos Haniotikos',
        level: 'Intermediate',
      },

      // Sunday schedule
      {
        day: 'Sunday',
        date: 'June 14',
        time: '10:00 - 11:30',
        lecturer: 'Nikos Anastasiadis',
        danceStyle: 'Kalamatiano',
        level: 'Beginner',
      },
      {
        day: 'Sunday',
        date: 'June 14',
        time: '12:00 - 13:30',
        lecturer: 'Sofia Michaelidou',
        danceStyle: 'Pidichtos',
        level: 'Intermediate',
      },
      {
        day: 'Sunday',
        date: 'June 14',
        time: '14:00 - 15:30',
        lecturer: 'Yannis Petrakis',
        danceStyle: 'Ikariotikos',
        level: 'Advanced',
      },
      {
        day: 'Sunday',
        date: 'June 14',
        time: '16:00 - 18:00',
        lecturer: 'All Instructors',
        danceStyle: 'Grand Finale Performance',
        level: 'All Levels',
      },
    ],
  });

  console.log('✅ Schedule data seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
