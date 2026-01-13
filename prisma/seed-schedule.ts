import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const scheduleData = [
  // FRIDAY
  { day: 'Friday', date: 'June 12', time: '16:00 - 17:00', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 1', color: '#FF6B6B' },
  { day: 'Friday', date: 'June 12', time: '16:00 - 17:00', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 2', color: '#4ECDC4' },
  { day: 'Friday', date: 'June 12', time: '16:00 - 17:00', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 3', color: '#95E1D3' },
  
  { day: 'Friday', date: 'June 12', time: '17:00 - 18:00', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 1', color: '#FF6B6B' },
  { day: 'Friday', date: 'June 12', time: '17:00 - 18:00', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 2', color: '#4ECDC4' },
  { day: 'Friday', date: 'June 12', time: '17:00 - 18:00', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 3', color: '#95E1D3' },
  
  { day: 'Friday', date: 'June 12', time: '18:00 - 19:00', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 1', color: '#FF6B6B' },
  { day: 'Friday', date: 'June 12', time: '18:00 - 19:00', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 2', color: '#4ECDC4' },
  { day: 'Friday', date: 'June 12', time: '18:00 - 19:00', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 3', color: '#95E1D3' },
  
  { day: 'Friday', date: 'June 12', time: '19:00 - 19:15', lecturer: '', danceStyle: 'Break', level: '', hall: null, color: '#FFF3B0' },
  
  { day: 'Friday', date: 'June 12', time: '19:15 - 20:15', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 1', color: '#FF6B6B' },
  { day: 'Friday', date: 'June 12', time: '19:15 - 20:15', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 2', color: '#4ECDC4' },
  { day: 'Friday', date: 'June 12', time: '19:15 - 20:15', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 3', color: '#95E1D3' },
  
  { day: 'Friday', date: 'June 12', time: '20:15 - 21:15', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 1', color: '#FF6B6B' },
  { day: 'Friday', date: 'June 12', time: '20:15 - 21:15', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 2', color: '#4ECDC4' },
  { day: 'Friday', date: 'June 12', time: '20:15 - 21:15', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 3', color: '#95E1D3' },

  // SATURDAY
  { day: 'Saturday', date: 'June 13', time: '10:00 - 11:00', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 1', color: '#A8E6CF' },
  { day: 'Saturday', date: 'June 13', time: '10:00 - 11:00', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 2', color: '#FFD3B6' },
  { day: 'Saturday', date: 'June 13', time: '10:00 - 11:00', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 3', color: '#FFAAA5' },
  
  { day: 'Saturday', date: 'June 13', time: '11:00 - 12:00', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 1', color: '#A8E6CF' },
  { day: 'Saturday', date: 'June 13', time: '11:00 - 12:00', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 2', color: '#FFD3B6' },
  { day: 'Saturday', date: 'June 13', time: '11:00 - 12:00', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 3', color: '#FFAAA5' },
  
  { day: 'Saturday', date: 'June 13', time: '12:00 - 12:15', lecturer: '', danceStyle: 'Break', level: '', hall: null, color: '#FFF3B0' },
  
  { day: 'Saturday', date: 'June 13', time: '12:15 - 13:15', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 1', color: '#A8E6CF' },
  { day: 'Saturday', date: 'June 13', time: '12:15 - 13:15', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 2', color: '#FFD3B6' },
  { day: 'Saturday', date: 'June 13', time: '12:15 - 13:15', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 3', color: '#FFAAA5' },
  
  { day: 'Saturday', date: 'June 13', time: '13:15 - 14:15', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 1', color: '#A8E6CF' },
  { day: 'Saturday', date: 'June 13', time: '13:15 - 14:15', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 2', color: '#FFD3B6' },
  { day: 'Saturday', date: 'June 13', time: '13:15 - 14:15', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 3', color: '#FFAAA5' },
  
  { day: 'Saturday', date: 'June 13', time: '14:15 - 16:15', lecturer: '', danceStyle: 'Lunch Break (not included)', level: '', hall: null, color: '#FFE5CC' },
  
  { day: 'Saturday', date: 'June 13', time: '16:15 - 17:15', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 1', color: '#A8E6CF' },
  { day: 'Saturday', date: 'June 13', time: '16:15 - 17:15', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 2', color: '#FFD3B6' },
  { day: 'Saturday', date: 'June 13', time: '16:15 - 17:15', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 3', color: '#FFAAA5' },
  
  { day: 'Saturday', date: 'June 13', time: '17:15 - 18:15', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 1', color: '#A8E6CF' },
  { day: 'Saturday', date: 'June 13', time: '17:15 - 18:15', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 2', color: '#FFD3B6' },
  { day: 'Saturday', date: 'June 13', time: '17:15 - 18:15', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 3', color: '#FFAAA5' },
  
  { day: 'Saturday', date: 'June 13', time: '18:15 - 18:30', lecturer: '', danceStyle: 'Break', level: '', hall: null, color: '#FFF3B0' },
  
  { day: 'Saturday', date: 'June 13', time: '18:30 - 19:30', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 1', color: '#A8E6CF' },
  { day: 'Saturday', date: 'June 13', time: '18:30 - 19:30', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 2', color: '#FFD3B6' },
  { day: 'Saturday', date: 'June 13', time: '18:30 - 19:30', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 3', color: '#FFAAA5' },
  
  { day: 'Saturday', date: 'June 13', time: '19:30 - 20:30', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 1', color: '#A8E6CF' },
  { day: 'Saturday', date: 'June 13', time: '19:30 - 20:30', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 2', color: '#FFD3B6' },
  { day: 'Saturday', date: 'June 13', time: '19:30 - 20:30', lecturer: 'TBA', danceStyle: 'TBA', level: 'All Levels', hall: 'Hall 3', color: '#FFAAA5' },
  
  { day: 'Saturday', date: 'June 13', time: '22:30', lecturer: '', danceStyle: '🎉 GREEK NIGHT 🎉', level: '', hall: null, color: '#9B59B6' },

  // SUNDAY
  { day: 'Sunday', date: 'June 14', time: '12:00', lecturer: '', danceStyle: '🏆 Zeimbekiko Guinness Record Attempt 🏆', level: '', hall: null, color: '#E74C3C' },
];

async function main() {
  console.log('Starting schedule seed...');
  
  // Clear existing schedule
  await prisma.schedule.deleteMany({});
  console.log('Cleared existing schedule');
  
  // Create new schedule
  for (const item of scheduleData) {
    await prisma.schedule.create({
      data: item,
    });
  }
  
  console.log(`Created ${scheduleData.length} schedule items`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
