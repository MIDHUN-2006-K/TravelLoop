import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /cities?search=:query&country=:country
router.get('/', async (req, res, next) => {
  try {
    const { search, country, popular } = req.query;

    const where = {};

    if (popular === 'true') {
      where.popularity_score = {
        gte: 80 // Consider cities with popularity >= 80 as popular
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (country) {
      where.country = { contains: country, mode: 'insensitive' };
    }

    const cities = await prisma.city.findMany({
      where,
      orderBy: popular === 'true' 
        ? { popularity_score: 'desc' }
        : { name: 'asc' },
      take: 100 // Limit results
    });

    res.json(cities.map(city => ({
      city_id: city.city_id,
      name: city.name,
      country: city.country,
      cost_index: city.cost_index,
      popularity_score: city.popularity_score
    })));
  } catch (error) {
    next(error);
  }
});

export default router;

