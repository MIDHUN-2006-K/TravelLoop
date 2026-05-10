import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Traveloop seed...');

  // Create sample cities with coordinates
  const cities = [
    { city_id: 'c_paris', name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, cost_index: 1.4, popularity_score: 95, description: 'The City of Light' },
    { city_id: 'c_tokyo', name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, cost_index: 1.35, popularity_score: 93, description: 'A blend of tradition and technology' },
    { city_id: 'c_newyork', name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, cost_index: 1.6, popularity_score: 98, description: 'The city that never sleeps' },
    { city_id: 'c_london', name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, cost_index: 1.5, popularity_score: 94, description: 'Historic and modern' },
    { city_id: 'c_rome', name: 'Rome', country: 'Italy', latitude: 41.9028, longitude: 12.4964, cost_index: 1.2, popularity_score: 92, description: 'The Eternal City' },
    { city_id: 'c_barcelona', name: 'Barcelona', country: 'Spain', latitude: 41.3874, longitude: 2.1686, cost_index: 1.1, popularity_score: 90, description: 'Gaudi and beaches' },
    { city_id: 'c_dubai', name: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, cost_index: 1.3, popularity_score: 88, description: 'Luxury in the desert' },
    { city_id: 'c_sydney', name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, cost_index: 1.4, popularity_score: 91, description: 'Harbour city beauty' },
  ];

  for (const city of cities) {
    await prisma.city.upsert({
      where: { city_id: city.city_id },
      update: { latitude: city.latitude, longitude: city.longitude, description: city.description },
      create: city
    });
  }
  console.log(`✅ Created ${cities.length} cities`);

  // Create sample activities
  const activities = [
    { activity_id: 'a1', city_id: 'c_paris', name: 'Louvre Tour', category: 'sightseeing', avg_cost: 25, duration: 180, description: 'Guided tour of the world-famous Louvre Museum' },
    { activity_id: 'a2', city_id: 'c_paris', name: 'Eiffel Tower Visit', category: 'sightseeing', avg_cost: 30, duration: 120, description: 'Visit the iconic Eiffel Tower' },
    { activity_id: 'a3', city_id: 'c_paris', name: 'Seine River Cruise', category: 'entertainment', avg_cost: 20, duration: 60, description: 'Scenic cruise along the Seine River' },
    { activity_id: 'a4', city_id: 'c_tokyo', name: 'Tsukiji Food Walk', category: 'food', avg_cost: 40, duration: 120, description: 'Food tour through Tsukiji market' },
    { activity_id: 'a5', city_id: 'c_tokyo', name: 'Shibuya Crossing Experience', category: 'sightseeing', avg_cost: 0, duration: 30, description: 'Experience the famous Shibuya crossing' },
    { activity_id: 'a6', city_id: 'c_tokyo', name: 'Tokyo Skytree', category: 'sightseeing', avg_cost: 35, duration: 90, description: 'Visit Tokyo Skytree observation deck' },
    { activity_id: 'a7', city_id: 'c_newyork', name: 'Statue of Liberty Tour', category: 'sightseeing', avg_cost: 25, duration: 120, description: 'Tour of the Statue of Liberty' },
    { activity_id: 'a8', city_id: 'c_newyork', name: 'Broadway Show', category: 'entertainment', avg_cost: 150, duration: 150, description: 'Watch a Broadway musical' },
    { activity_id: 'a9', city_id: 'c_london', name: 'Big Ben & Westminster', category: 'sightseeing', avg_cost: 0, duration: 60, description: 'Walking tour of Big Ben and Westminster' },
    { activity_id: 'a10', city_id: 'c_london', name: 'British Museum', category: 'sightseeing', avg_cost: 0, duration: 180, description: 'Visit the British Museum' },
    { activity_id: 'a11', city_id: 'c_rome', name: 'Colosseum Tour', category: 'sightseeing', avg_cost: 20, duration: 120, description: 'Guided tour of the Colosseum' },
    { activity_id: 'a12', city_id: 'c_barcelona', name: 'Sagrada Familia', category: 'sightseeing', avg_cost: 30, duration: 90, description: "Visit Gaudi's masterpiece" },
    { activity_id: 'a13', city_id: 'c_london', name: 'London Eye Ride', category: 'sightseeing', avg_cost: 35, duration: 45, description: 'Panoramic views from the London Eye' },
    { activity_id: 'a14', city_id: 'c_rome', name: 'Vatican Museums', category: 'sightseeing', avg_cost: 25, duration: 150, description: 'Explore the Vatican art collections' },
    { activity_id: 'a15', city_id: 'c_rome', name: 'Roman Food Tour', category: 'food', avg_cost: 45, duration: 180, description: 'Taste authentic Roman cuisine' },
    { activity_id: 'a16', city_id: 'c_barcelona', name: 'Park Güell Visit', category: 'sightseeing', avg_cost: 10, duration: 90, description: "Gaudi's colorful park" },
  ];

  for (const activity of activities) {
    await prisma.activity.upsert({
      where: { activity_id: activity.activity_id },
      update: activity,
      create: activity
    });
  }
  console.log(`✅ Created ${activities.length} activities`);

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@traveloop.com' },
    update: {},
    create: {
      email: 'test@traveloop.com',
      password_hash: hashedPassword,
      name: 'Marco Traveler'
    }
  });
  console.log('✅ Created test user (test@traveloop.com / password123)');

  // Also upsert old test user for backward compat
  await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password_hash: hashedPassword,
      name: 'Test User'
    }
  });

  // Create sample European Dream Tour trip
  const sampleTrip = await prisma.trip.upsert({
    where: { trip_id: 'trip_sample_euro' },
    update: {},
    create: {
      trip_id: 'trip_sample_euro',
      trip_name: 'European Dream Tour',
      start_date: new Date('2026-06-01'),
      end_date: new Date('2026-06-15'),
      description: "A stunning two-week journey through Europe's most iconic cities — from the romance of Paris to the ancient streets of Rome.",
      is_public: true,
      status: 'PLANNED',
      tags: ['europe', 'culture', 'food'],
      user_id: testUser.user_id,
      stops: {
        create: [
          {
            city_id: 'c_paris',
            start_date: new Date('2026-06-01'),
            end_date: new Date('2026-06-05'),
            order_index: 0,
            activities: {
              create: [
                { activity_id: 'a1', scheduled_date: new Date('2026-06-02'), custom_cost: 25 },
                { activity_id: 'a2', scheduled_date: new Date('2026-06-03'), custom_cost: 30 },
                { activity_id: 'a3', scheduled_date: new Date('2026-06-04'), custom_cost: 20 },
              ]
            }
          },
          {
            city_id: 'c_barcelona',
            start_date: new Date('2026-06-05'),
            end_date: new Date('2026-06-08'),
            order_index: 1,
            activities: {
              create: [
                { activity_id: 'a12', scheduled_date: new Date('2026-06-06'), custom_cost: 30 },
                { activity_id: 'a16', scheduled_date: new Date('2026-06-07'), custom_cost: 10 },
              ]
            }
          },
          {
            city_id: 'c_rome',
            start_date: new Date('2026-06-08'),
            end_date: new Date('2026-06-12'),
            order_index: 2,
            activities: {
              create: [
                { activity_id: 'a11', scheduled_date: new Date('2026-06-09'), custom_cost: 20 },
                { activity_id: 'a14', scheduled_date: new Date('2026-06-10'), custom_cost: 25 },
                { activity_id: 'a15', scheduled_date: new Date('2026-06-11'), custom_cost: 45 },
              ]
            }
          },
          {
            city_id: 'c_london',
            start_date: new Date('2026-06-12'),
            end_date: new Date('2026-06-15'),
            order_index: 3,
            activities: {
              create: [
                { activity_id: 'a9', scheduled_date: new Date('2026-06-13'), custom_cost: 0 },
                { activity_id: 'a10', scheduled_date: new Date('2026-06-13'), custom_cost: 0 },
                { activity_id: 'a13', scheduled_date: new Date('2026-06-14'), custom_cost: 35 },
              ]
            }
          },
        ]
      },
      expenses: {
        create: [
          { category: 'transport', estimated_cost: 850, description: 'Flights + Trains' },
          { category: 'hotels', estimated_cost: 1200, description: '14 nights' },
          { category: 'meals', estimated_cost: 600, description: 'Daily dining budget' },
          { category: 'activities', estimated_cost: 350, description: 'Tickets and tours' },
          { category: 'miscellaneous', estimated_cost: 200, description: 'Shopping, tips' },
        ]
      },
      packing_items: {
        create: [
          { name: 'Passport', category: 'documents', is_packed: true },
          { name: 'Travel Insurance', category: 'documents' },
          { name: 'Phone Charger', category: 'electronics', is_packed: true },
          { name: 'Camera', category: 'electronics' },
          { name: 'Power Adapter (EU)', category: 'electronics' },
          { name: 'T-Shirts (5)', category: 'clothing', quantity: 5 },
          { name: 'Jeans (2)', category: 'clothing', quantity: 2 },
          { name: 'Walking Shoes', category: 'clothing', is_packed: true },
          { name: 'Rain Jacket', category: 'clothing' },
          { name: 'Sunscreen', category: 'toiletries' },
          { name: 'Toothbrush', category: 'toiletries' },
          { name: 'Pain Relief', category: 'medicine' },
          { name: 'Hand Sanitizer', category: 'essentials' },
          { name: 'Reusable Water Bottle', category: 'essentials', is_packed: true },
        ]
      },
      notes: {
        create: [
          { title: 'Restaurant Tip', content: 'Try Le Bouillon Chartier in Paris — classic French food at great prices!', day_date: new Date('2026-06-02') },
          { title: 'Museum Hours', content: 'Colosseum opens at 8:30 AM. Get there early to avoid lines.', day_date: new Date('2026-06-09') },
          { title: 'Packing Reminder', content: 'EU power adapter is Type C/F. UK uses Type G — bring both!' },
        ]
      }
    }
  });

  console.log('✅ Created European Dream Tour trip with stops, activities, expenses, packing items, and notes');

  // Also keep old sample trip for backward compat
  const oldTripExists = await prisma.trip.findUnique({ where: { trip_id: 'trip_sample' } });
  if (!oldTripExists) {
    await prisma.trip.create({
      data: {
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
                  { activity_id: 'a1', scheduled_date: new Date('2026-03-02'), custom_cost: 25 },
                  { activity_id: 'a2', scheduled_date: new Date('2026-03-03'), custom_cost: 30 },
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
                  { activity_id: 'a9', scheduled_date: new Date('2026-03-06'), custom_cost: 0 },
                ]
              }
            }
          ]
        },
        expenses: {
          create: [
            { category: 'hotels', estimated_cost: 500 },
            { category: 'meals', estimated_cost: 200 },
          ]
        }
      }
    });
    console.log('✅ Created legacy Europe Adventure trip');
  }

  console.log('🎉 Traveloop seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
