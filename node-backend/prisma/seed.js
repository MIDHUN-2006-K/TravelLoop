import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create sample cities
  const cities = [
    {
      city_id: 'c_paris',
      name: 'Paris',
      country: 'France',
      cost_index: 1.4,
      popularity_score: 95
    },
    {
      city_id: 'c_tokyo',
      name: 'Tokyo',
      country: 'Japan',
      cost_index: 1.35,
      popularity_score: 93
    },
    {
      city_id: 'c_newyork',
      name: 'New York',
      country: 'United States',
      cost_index: 1.6,
      popularity_score: 98
    },
    {
      city_id: 'c_london',
      name: 'London',
      country: 'United Kingdom',
      cost_index: 1.5,
      popularity_score: 94
    },
    {
      city_id: 'c_rome',
      name: 'Rome',
      country: 'Italy',
      cost_index: 1.2,
      popularity_score: 92
    },
    {
      city_id: 'c_barcelona',
      name: 'Barcelona',
      country: 'Spain',
      cost_index: 1.1,
      popularity_score: 90
    },
    {
      city_id: 'c_dubai',
      name: 'Dubai',
      country: 'United Arab Emirates',
      cost_index: 1.3,
      popularity_score: 88
    },
    {
      city_id: 'c_sydney',
      name: 'Sydney',
      country: 'Australia',
      cost_index: 1.4,
      popularity_score: 91
    }
  ];

  for (const city of cities) {
    await prisma.city.upsert({
      where: { city_id: city.city_id },
      update: city,
      create: city
    });
  }

  console.log(`✅ Created ${cities.length} cities`);

  // Create sample activities
  const activities = [
    {
      activity_id: 'a1',
      city_id: 'c_paris',
      name: 'Louvre Tour',
      category: 'sightseeing',
      avg_cost: 25,
      duration: 180,
      description: 'Guided tour of the world-famous Louvre Museum'
    },
    {
      activity_id: 'a2',
      city_id: 'c_paris',
      name: 'Eiffel Tower Visit',
      category: 'sightseeing',
      avg_cost: 30,
      duration: 120,
      description: 'Visit the iconic Eiffel Tower'
    },
    {
      activity_id: 'a3',
      city_id: 'c_paris',
      name: 'Seine River Cruise',
      category: 'entertainment',
      avg_cost: 20,
      duration: 60,
      description: 'Scenic cruise along the Seine River'
    },
    {
      activity_id: 'a4',
      city_id: 'c_tokyo',
      name: 'Tsukiji Food Walk',
      category: 'food',
      avg_cost: 40,
      duration: 120,
      description: 'Food tour through Tsukiji market'
    },
    {
      activity_id: 'a5',
      city_id: 'c_tokyo',
      name: 'Shibuya Crossing Experience',
      category: 'sightseeing',
      avg_cost: 0,
      duration: 30,
      description: 'Experience the famous Shibuya crossing'
    },
    {
      activity_id: 'a6',
      city_id: 'c_tokyo',
      name: 'Tokyo Skytree',
      category: 'sightseeing',
      avg_cost: 35,
      duration: 90,
      description: 'Visit Tokyo Skytree observation deck'
    },
    {
      activity_id: 'a7',
      city_id: 'c_newyork',
      name: 'Statue of Liberty Tour',
      category: 'sightseeing',
      avg_cost: 25,
      duration: 120,
      description: 'Tour of the Statue of Liberty'
    },
    {
      activity_id: 'a8',
      city_id: 'c_newyork',
      name: 'Broadway Show',
      category: 'entertainment',
      avg_cost: 150,
      duration: 150,
      description: 'Watch a Broadway musical'
    },
    {
      activity_id: 'a9',
      city_id: 'c_london',
      name: 'Big Ben & Westminster',
      category: 'sightseeing',
      avg_cost: 0,
      duration: 60,
      description: 'Walking tour of Big Ben and Westminster'
    },
    {
      activity_id: 'a10',
      city_id: 'c_london',
      name: 'British Museum',
      category: 'sightseeing',
      avg_cost: 0,
      duration: 180,
      description: 'Visit the British Museum'
    },
    {
      activity_id: 'a11',
      city_id: 'c_rome',
      name: 'Colosseum Tour',
      category: 'sightseeing',
      avg_cost: 20,
      duration: 120,
      description: 'Guided tour of the Colosseum'
    },
    {
      activity_id: 'a12',
      city_id: 'c_barcelona',
      name: 'Sagrada Familia',
      category: 'sightseeing',
      avg_cost: 30,
      duration: 90,
      description: 'Visit Gaudi\'s masterpiece'
    }
  ];

  for (const activity of activities) {
    await prisma.activity.upsert({
      where: { activity_id: activity.activity_id },
      update: activity,
      create: activity
    });
  }

  console.log(`✅ Created ${activities.length} activities`);

  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password_hash: hashedPassword,
      name: 'Test User'
    }
  });

  console.log('✅ Created test user (test@example.com / password123)');

  // Create a sample public trip
  const sampleTrip = await prisma.trip.upsert({
    where: { trip_id: 'trip_sample' },
    update: {},
    create: {
      trip_id: 'trip_sample',
      trip_name: 'Europe Adventure',
      start_date: new Date('2026-03-01'),
      end_date: new Date('2026-03-10'),
      description: 'A sample public trip showcasing Paris and London',
      is_public: true,
      user_id: testUser.user_id,
      stops: {
        create: [
          {
            city_id: 'c_paris',
            start_date: new Date('2026-03-01'),
            end_date: new Date('2026-03-05'),
            order_index: 0,
            activities: {
              create: [
                {
                  activity_id: 'a1',
                  scheduled_date: new Date('2026-03-02'),
                  custom_cost: 25
                },
                {
                  activity_id: 'a2',
                  scheduled_date: new Date('2026-03-03'),
                  custom_cost: 30
                }
              ]
            }
          },
          {
            city_id: 'c_london',
            start_date: new Date('2026-03-05'),
            end_date: new Date('2026-03-10'),
            order_index: 1,
            activities: {
              create: [
                {
                  activity_id: 'a9',
                  scheduled_date: new Date('2026-03-06'),
                  custom_cost: 0
                }
              ]
            }
          }
        ]
      },
      expenses: {
        create: [
          {
            category: 'stay',
            estimated_cost: 500
          },
          {
            category: 'food',
            estimated_cost: 200
          }
        ]
      }
    }
  });

  console.log('✅ Created sample public trip');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

