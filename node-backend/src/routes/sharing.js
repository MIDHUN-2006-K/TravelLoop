import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /shared/:token — public, no auth required
router.get('/:token', async (req, res, next) => {
  try {
    const { token } = req.params;

    const shared = await prisma.sharedTrip.findUnique({
      where: { share_token: token },
      include: {
        trip: {
          include: {
            stops: {
              include: {
                city: true,
                activities: { include: { activity: true } },
              },
              orderBy: { order_index: 'asc' },
            },
            expenses: true,
          },
        },
      },
    });

    if (!shared) {
      return res.status(404).json({ message: 'Shared trip not found' });
    }

    const trip = shared.trip;
    res.json({
      trip_id: trip.trip_id,
      trip_name: trip.trip_name,
      start_date: trip.start_date.toISOString().split('T')[0],
      end_date: trip.end_date.toISOString().split('T')[0],
      description: trip.description,
      status: trip.status,
      tags: trip.tags,
      stops: trip.stops.map((stop) => ({
        stop_id: stop.stop_id,
        city: stop.city,
        stopping_place: stop.stopping_place,
        start_date: stop.start_date.toISOString().split('T')[0],
        end_date: stop.end_date.toISOString().split('T')[0],
        order_index: stop.order_index,
        activities: stop.activities.map((ta) => ({
          trip_activity_id: ta.trip_activity_id,
          activity_id: ta.activity_id,
          name: ta.activity.name,
          category: ta.activity.category,
          scheduled_date: ta.scheduled_date.toISOString().split('T')[0],
          custom_cost: ta.custom_cost,
        })),
      })),
      share_token: token,
    });
  } catch (error) {
    next(error);
  }
});

// POST /shared/trips/:tripId/share — generate share token (requires auth)
router.post('/trips/:tripId/share', authenticate, async (req, res, next) => {
  try {
    const { tripId } = req.params;

    const trip = await prisma.trip.findFirst({
      where: { trip_id: tripId, user_id: req.user.userId },
    });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    // Check if already shared
    let shared = await prisma.sharedTrip.findFirst({
      where: { trip_id: tripId },
    });

    if (!shared) {
      shared = await prisma.sharedTrip.create({
        data: { trip_id: tripId },
      });
    }

    res.json({
      shared_trip_id: shared.shared_trip_id,
      trip_id: shared.trip_id,
      share_token: shared.share_token,
      share_url: `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/shared/${shared.share_token}`,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /shared/trips/:tripId/share/:shareId — revoke share
router.delete('/trips/:tripId/share/:shareId', authenticate, async (req, res, next) => {
  try {
    const { tripId, shareId } = req.params;

    const trip = await prisma.trip.findFirst({
      where: { trip_id: tripId, user_id: req.user.userId },
    });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    await prisma.sharedTrip.delete({ where: { shared_trip_id: shareId } });
    res.json({ message: 'Share revoked' });
  } catch (error) {
    next(error);
  }
});

export default router;
