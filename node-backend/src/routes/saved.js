import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

// GET /saved-destinations
router.get('/', async (req, res, next) => {
  try {
    const saved = await prisma.savedDestination.findMany({
      where: { user_id: req.user.userId },
      include: { city: true },
      orderBy: { created_at: 'desc' },
    });

    res.json(saved.map((s) => ({
      saved_id: s.saved_id,
      city_id: s.city_id,
      city: s.city,
      notes: s.notes,
      created_at: s.created_at.toISOString(),
    })));
  } catch (error) {
    next(error);
  }
});

// POST /saved-destinations
router.post('/', validate(schemas.createSavedDestination), async (req, res, next) => {
  try {
    const { city_id, notes } = req.body;

    const city = await prisma.city.findUnique({ where: { city_id } });
    if (!city) return res.status(404).json({ message: 'City not found' });

    // Check if already saved
    const existing = await prisma.savedDestination.findFirst({
      where: { user_id: req.user.userId, city_id },
    });
    if (existing) return res.status(400).json({ message: 'Destination already saved' });

    const saved = await prisma.savedDestination.create({
      data: { user_id: req.user.userId, city_id, notes: notes || null },
      include: { city: true },
    });

    res.status(201).json({
      saved_id: saved.saved_id,
      city_id: saved.city_id,
      city: saved.city,
      notes: saved.notes,
      created_at: saved.created_at.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /saved-destinations/:savedId
router.delete('/:savedId', async (req, res, next) => {
  try {
    const { savedId } = req.params;

    const existing = await prisma.savedDestination.findFirst({
      where: { saved_id: savedId, user_id: req.user.userId },
    });
    if (!existing) return res.status(404).json({ message: 'Saved destination not found' });

    await prisma.savedDestination.delete({ where: { saved_id: savedId } });
    res.json({ message: 'Destination removed' });
  } catch (error) {
    next(error);
  }
});

export default router;
