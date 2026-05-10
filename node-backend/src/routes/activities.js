import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /activities?cityId=:cityId&category=:category&maxCost=:maxCost
router.get('/', async (req, res, next) => {
  try {
    const { cityId, category, maxCost } = req.query;

    const where = {};

    if (cityId) {
      where.city_id = cityId;
    }

    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    if (maxCost) {
      where.avg_cost = {
        lte: parseFloat(maxCost)
      };
    }

    const activities = await prisma.activity.findMany({
      where,
      include: {
        city: {
          select: {
            city_id: true,
            name: true,
            country: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(activities.map(activity => ({
      activity_id: activity.activity_id,
      name: activity.name,
      city_id: activity.city_id,
      category: activity.category,
      default_cost: activity.avg_cost,
      duration: activity.duration,
      description: activity.description
    })));
  } catch (error) {
    next(error);
  }
});

export default router;

