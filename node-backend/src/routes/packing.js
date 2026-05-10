import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router({ mergeParams: true });
const prisma = new PrismaClient();

router.use(authenticate);

const getTripId = (req) => req.params.tripId;

// GET /trips/:tripId/packing
router.get('/', async (req, res, next) => {
  try {
    const tripId = getTripId(req);

    const trip = await prisma.trip.findFirst({
      where: { trip_id: tripId, user_id: req.user.userId },
    });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const items = await prisma.packingItem.findMany({
      where: { trip_id: tripId },
      orderBy: [{ category: 'asc' }, { created_at: 'asc' }],
    });

    res.json(items.map((item) => ({
      packing_item_id: item.packing_item_id,
      trip_id: item.trip_id,
      name: item.name,
      category: item.category,
      is_packed: item.is_packed,
      quantity: item.quantity,
      created_at: item.created_at.toISOString(),
    })));
  } catch (error) {
    next(error);
  }
});

// POST /trips/:tripId/packing
router.post('/', validate(schemas.createPackingItem), async (req, res, next) => {
  try {
    const tripId = getTripId(req);

    const trip = await prisma.trip.findFirst({
      where: { trip_id: tripId, user_id: req.user.userId },
    });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const { name, category, quantity } = req.body;

    const item = await prisma.packingItem.create({
      data: {
        trip_id: tripId,
        name,
        category,
        quantity: quantity || 1,
      },
    });

    res.status(201).json({
      packing_item_id: item.packing_item_id,
      trip_id: item.trip_id,
      name: item.name,
      category: item.category,
      is_packed: item.is_packed,
      quantity: item.quantity,
      created_at: item.created_at.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// POST /trips/:tripId/packing/reset  — unpack all items (MUST be before /:itemId)
router.post('/reset', async (req, res, next) => {
  try {
    const tripId = getTripId(req);

    const trip = await prisma.trip.findFirst({
      where: { trip_id: tripId, user_id: req.user.userId },
    });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    await prisma.packingItem.updateMany({
      where: { trip_id: tripId },
      data: { is_packed: false },
    });

    res.json({ message: 'All items unpacked' });
  } catch (error) {
    next(error);
  }
});

// PATCH /trips/:tripId/packing/:itemId
router.patch('/:itemId', validate(schemas.updatePackingItem), async (req, res, next) => {
  try {
    const tripId = getTripId(req);
    const { itemId } = req.params;

    const trip = await prisma.trip.findFirst({
      where: { trip_id: tripId, user_id: req.user.userId },
    });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const existing = await prisma.packingItem.findFirst({
      where: { packing_item_id: itemId, trip_id: tripId },
    });
    if (!existing) return res.status(404).json({ message: 'Packing item not found' });

    const updateData = {};
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.category !== undefined) updateData.category = req.body.category;
    if (req.body.is_packed !== undefined) updateData.is_packed = req.body.is_packed;
    if (req.body.quantity !== undefined) updateData.quantity = req.body.quantity;

    const item = await prisma.packingItem.update({
      where: { packing_item_id: itemId },
      data: updateData,
    });

    res.json({
      packing_item_id: item.packing_item_id,
      trip_id: item.trip_id,
      name: item.name,
      category: item.category,
      is_packed: item.is_packed,
      quantity: item.quantity,
      created_at: item.created_at.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /trips/:tripId/packing/:itemId
router.delete('/:itemId', async (req, res, next) => {
  try {
    const tripId = getTripId(req);
    const { itemId } = req.params;

    const trip = await prisma.trip.findFirst({
      where: { trip_id: tripId, user_id: req.user.userId },
    });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const existing = await prisma.packingItem.findFirst({
      where: { packing_item_id: itemId, trip_id: tripId },
    });
    if (!existing) return res.status(404).json({ message: 'Packing item not found' });

    await prisma.packingItem.delete({ where: { packing_item_id: itemId } });
    res.status(200).json({ message: 'Item deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
