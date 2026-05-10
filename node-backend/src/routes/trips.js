import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();
const prisma = new PrismaClient();

// Public endpoint (no auth required) - must be before authenticate middleware
// GET /trips/:id/public
router.get('/:id/public', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { expand } = req.query;

    const trip = await prisma.trip.findFirst({
      where: {
        trip_id: id,
        is_public: true,
      },
      include: {
        stops: expand?.includes('stops')
          ? {
              include: {
                city: true,
                activities: expand?.includes('activities')
                  ? {
                      include: {
                        activity: true,
                      },
                    }
                  : false,
              },
              orderBy: { order_index: 'asc' },
            }
          : false,
      },
    });

    if (!trip) {
      return res.status(404).json({ message: 'Public trip not found' });
    }

    // Transform to match frontend contract
    const transformedTrip = {
      trip_id: trip.trip_id,
      trip_name: trip.trip_name,
      start_date: trip.start_date.toISOString().split('T')[0],
      end_date: trip.end_date.toISOString().split('T')[0],
      description: trip.description,
      is_public: trip.is_public,
      ...(expand?.includes('stops') && {
        stops: trip.stops.map((stop) => ({
          stop_id: stop.stop_id,
          city: stop.city,
          stopping_place: stop.stopping_place,
          start_date: stop.start_date.toISOString().split('T')[0],
          end_date: stop.end_date.toISOString().split('T')[0],
          order_index: stop.order_index,
          ...(expand?.includes('activities') && {
            activities: stop.activities.map((ta) => ({
              trip_activity_id: ta.trip_activity_id,
              activity_id: ta.activity_id,
              name: ta.activity.name,
              scheduled_date: ta.scheduled_date.toISOString().split('T')[0],
              custom_cost: ta.custom_cost,
            })),
          }),
        })),
      }),
    };

    res.json(transformedTrip);
  } catch (error) {
    next(error);
  }
});

// All other trip routes require authentication
router.use(authenticate);

// GET /trips
router.get('/', async (req, res, next) => {
  try {
    const { expand } = req.query;

    const trips = await prisma.trip.findMany({
      where: { user_id: req.user.userId },
      include: {
        stops: expand?.includes('stops')
          ? {
              include: {
                city: true,
                activities: expand?.includes('activities')
                  ? {
                      include: {
                        activity: true,
                      },
                    }
                  : false,
              },
              orderBy: { order_index: 'asc' },
            }
          : false,
        expenses: expand?.includes('expenses') || false,
      },
      orderBy: { created_at: 'desc' },
    });

    // Transform to match frontend contract
    const transformedTrips = trips.map((trip) => ({
      trip_id: trip.trip_id,
      trip_name: trip.trip_name,
      start_date: trip.start_date.toISOString().split('T')[0],
      end_date: trip.end_date.toISOString().split('T')[0],
      description: trip.description,
      is_public: trip.is_public,
      ...(expand?.includes('stops') && {
        stops: trip.stops.map((stop) => ({
          stop_id: stop.stop_id,
          city: stop.city,
          stopping_place: stop.stopping_place,
          start_date: stop.start_date.toISOString().split('T')[0],
          end_date: stop.end_date.toISOString().split('T')[0],
          order_index: stop.order_index,
          ...(expand?.includes('activities') && {
            activities: stop.activities.map((ta) => ({
              trip_activity_id: ta.trip_activity_id,
              activity_id: ta.activity_id,
              name: ta.activity.name,
              scheduled_date: ta.scheduled_date.toISOString().split('T')[0],
              custom_cost: ta.custom_cost,
            })),
          }),
        })),
      }),
      ...(expand?.includes('expenses') && {
        expenses: trip.expenses.map((exp) => ({
          expense_id: exp.expense_id,
          category: exp.category,
          estimated_cost: exp.estimated_cost,
        })),
      }),
    }));

    res.json(transformedTrips);
  } catch (error) {
    next(error);
  }
});

// GET /trips/:id?expand=stops,activities
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { expand } = req.query;

    const trip = await prisma.trip.findFirst({
      where: {
        trip_id: id,
        user_id: req.user.userId,
      },
      include: {
        stops: expand?.includes('stops')
          ? {
              include: {
                city: true,
                activities: expand?.includes('activities')
                  ? {
                      include: {
                        activity: true,
                      },
                    }
                  : false,
              },
              orderBy: { order_index: 'asc' },
            }
          : false,
        expenses: expand?.includes('expenses') || false,
      },
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Transform to match frontend contract
    const transformedTrip = {
      trip_id: trip.trip_id,
      trip_name: trip.trip_name,
      start_date: trip.start_date.toISOString().split('T')[0],
      end_date: trip.end_date.toISOString().split('T')[0],
      description: trip.description,
      is_public: trip.is_public,
      ...(expand?.includes('stops') && {
        stops: trip.stops.map((stop) => ({
          stop_id: stop.stop_id,
          city: stop.city,
          stopping_place: stop.stopping_place,
          start_date: stop.start_date.toISOString().split('T')[0],
          end_date: stop.end_date.toISOString().split('T')[0],
          order_index: stop.order_index,
          ...(expand?.includes('activities') && {
            activities: stop.activities.map((ta) => ({
              trip_activity_id: ta.trip_activity_id,
              activity_id: ta.activity_id,
              name: ta.activity.name,
              scheduled_date: ta.scheduled_date.toISOString().split('T')[0],
              custom_cost: ta.custom_cost,
            })),
          }),
        })),
      }),
      ...(expand?.includes('expenses') && {
        expenses: trip.expenses.map((exp) => ({
          expense_id: exp.expense_id,
          category: exp.category,
          estimated_cost: exp.estimated_cost,
        })),
      }),
    };

    res.json(transformedTrip);
  } catch (error) {
    next(error);
  }
});

// POST /trips
router.post('/', validate(schemas.createTrip), async (req, res, next) => {
  try {
    const { trip_name, start_date, end_date, description } = req.body;

    const trip = await prisma.trip.create({
      data: {
        trip_name,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        description: description || null,
        user_id: req.user.userId,
      },
    });

    res.status(201).json({
      trip_id: trip.trip_id,
      trip_name: trip.trip_name,
      start_date: trip.start_date.toISOString().split('T')[0],
      end_date: trip.end_date.toISOString().split('T')[0],
      description: trip.description,
      is_public: trip.is_public,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /trips/:id
router.patch('/:id', validate(schemas.updateTrip), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify trip belongs to user
    const existingTrip = await prisma.trip.findFirst({
      where: {
        trip_id: id,
        user_id: req.user.userId,
      },
    });

    if (!existingTrip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const updateData = {};
    if (req.body.trip_name) updateData.trip_name = req.body.trip_name;
    if (req.body.start_date) updateData.start_date = new Date(req.body.start_date);
    if (req.body.end_date) updateData.end_date = new Date(req.body.end_date);
    if (req.body.description !== undefined) updateData.description = req.body.description || null;
    if (req.body.is_public !== undefined) updateData.is_public = req.body.is_public;

    const trip = await prisma.trip.update({
      where: { trip_id: id },
      data: updateData,
    });

    res.json({
      trip_id: trip.trip_id,
      trip_name: trip.trip_name,
      start_date: trip.start_date.toISOString().split('T')[0],
      end_date: trip.end_date.toISOString().split('T')[0],
      description: trip.description,
      is_public: trip.is_public,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /trips/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify trip belongs to user
    const trip = await prisma.trip.findFirst({
      where: {
        trip_id: id,
        user_id: req.user.userId,
      },
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    await prisma.trip.delete({
      where: { trip_id: id },
    });

    res.status(200).send();
  } catch (error) {
    next(error);
  }
});

// POST /trips/:id/copy
router.post('/:id/copy', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get original trip with all relations
    const originalTrip = await prisma.trip.findFirst({
      where: {
        trip_id: id,
        is_public: true, // Can copy public trips
      },
      include: {
        stops: {
          include: {
            activities: {
              include: {
                activity: true,
              },
            },
          },
          orderBy: { order_index: 'asc' },
        },
        expenses: true,
      },
    });

    if (!originalTrip) {
      return res.status(404).json({ message: 'Trip not found or not public' });
    }

    // Create new trip
    const newTrip = await prisma.trip.create({
      data: {
        trip_name: `${originalTrip.trip_name} (Copy)`,
        start_date: originalTrip.start_date,
        end_date: originalTrip.end_date,
        description: originalTrip.description,
        user_id: req.user.userId,
        is_public: false,
        stops: {
          create: originalTrip.stops.map((stop) => ({
            city_id: stop.city_id,
            start_date: stop.start_date,
            end_date: stop.end_date,
            order_index: stop.order_index,
            activities: {
              create: stop.activities.map((ta) => ({
                activity_id: ta.activity_id,
                scheduled_date: ta.scheduled_date,
                custom_cost: ta.custom_cost,
                notes: ta.notes,
              })),
            },
          })),
        },
        expenses: {
          create: originalTrip.expenses.map((exp) => ({
            category: exp.category,
            estimated_cost: exp.estimated_cost,
            description: exp.description,
          })),
        },
      },
      include: {
        stops: {
          include: {
            city: true,
          },
        },
      },
    });

    res.status(201).json({
      trip_id: newTrip.trip_id,
      trip_name: newTrip.trip_name,
      start_date: newTrip.start_date.toISOString().split('T')[0],
      end_date: newTrip.end_date.toISOString().split('T')[0],
      description: newTrip.description,
      is_public: newTrip.is_public,
    });
  } catch (error) {
    next(error);
  }
});

// GET /trips/:id/summary
router.get('/:id/summary', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify trip belongs to user
    const trip = await prisma.trip.findFirst({
      where: {
        trip_id: id,
        user_id: req.user.userId,
      },
      include: {
        stops: {
          include: {
            activities: true,
          },
        },
        expenses: true,
      },
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Calculate total cost from expenses
    const expensesTotal = trip.expenses.reduce((sum, exp) => sum + exp.estimated_cost, 0);

    // Calculate activities cost
    const activitiesTotal = trip.stops.reduce((sum, stop) => {
      return (
        sum +
        stop.activities.reduce((activitySum, ta) => {
          return activitySum + (ta.custom_cost || 0);
        }, 0)
      );
    }, 0);

    const total_cost = expensesTotal + activitiesTotal;

    // Group expenses by category
    const categories = {};
    trip.expenses.forEach((exp) => {
      const category = exp.category.toLowerCase();
      categories[category] = (categories[category] || 0) + exp.estimated_cost;
    });

    // Add activities to appropriate category (default to "Activities")
    const activitiesCategory = 'Activities';
    categories[activitiesCategory] = (categories[activitiesCategory] || 0) + activitiesTotal;

    // Calculate days
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const avg_per_day = days > 0 ? total_cost / days : 0;

    res.json({
      total_cost,
      categories,
      avg_per_day: Math.round(avg_per_day * 100) / 100,
      days,
    });
  } catch (error) {
    next(error);
  }
});

// POST /trips/:tripId/stops
router.post('/:tripId/stops', validate(schemas.createStop), async (req, res, next) => {
  try {
    const { tripId } = req.params;

    // Verify trip belongs to user
    const trip = await prisma.trip.findFirst({
      where: {
        trip_id: tripId,
        user_id: req.user.userId,
      },
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // If city_id provided, verify city exists
    if (req.body.city_id) {
      const city = await prisma.city.findUnique({
        where: { city_id: req.body.city_id },
      });

      if (!city) {
        return res.status(404).json({ message: 'City not found' });
      }
    }

    const { city_id, stopping_place, start_date, end_date, order_index } = req.body;

    const stop = await prisma.tripStop.create({
      data: {
        trip_id: tripId,
        city_id: city_id || null,
        stopping_place: stopping_place || null,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        order_index: order_index ?? 0,
      },
      include: {
        city: true,
        activities: {
          include: {
            activity: true,
          },
        },
      },
    });

    res.status(201).json({
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
        scheduled_date: ta.scheduled_date.toISOString().split('T')[0],
        custom_cost: ta.custom_cost,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /trips/:tripId/stops/:stopId
router.patch('/:tripId/stops/:stopId', validate(schemas.updateStop), async (req, res, next) => {
  try {
    const { tripId, stopId } = req.params;

    // Verify trip belongs to user
    const trip = await prisma.trip.findFirst({
      where: {
        trip_id: tripId,
        user_id: req.user.userId,
      },
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Verify stop belongs to the trip
    const existingStop = await prisma.tripStop.findFirst({
      where: {
        stop_id: stopId,
        trip_id: tripId,
      },
    });

    if (!existingStop) {
      return res.status(404).json({ message: 'Stop not found in this trip' });
    }

    const updateData = {};
    if (req.body.start_date) updateData.start_date = new Date(req.body.start_date);
    if (req.body.end_date) updateData.end_date = new Date(req.body.end_date);
    if (req.body.order_index !== undefined) updateData.order_index = req.body.order_index;

    const stop = await prisma.tripStop.update({
      where: { stop_id: stopId },
      data: updateData,
      include: {
        city: true,
        activities: {
          include: {
            activity: true,
          },
        },
      },
    });

    res.json({
      stop_id: stop.stop_id,
      city: stop.city,
      start_date: stop.start_date.toISOString().split('T')[0],
      end_date: stop.end_date.toISOString().split('T')[0],
      order_index: stop.order_index,
      activities: stop.activities.map((ta) => ({
        trip_activity_id: ta.trip_activity_id,
        activity_id: ta.activity_id,
        name: ta.activity.name,
        scheduled_date: ta.scheduled_date.toISOString().split('T')[0],
        custom_cost: ta.custom_cost,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /trips/:tripId/stops/:stopId
router.delete('/:tripId/stops/:stopId', async (req, res, next) => {
  try {
    const { tripId, stopId } = req.params;

    // Verify trip belongs to user
    const trip = await prisma.trip.findFirst({
      where: {
        trip_id: tripId,
        user_id: req.user.userId,
      },
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Verify stop belongs to the trip
    const stop = await prisma.tripStop.findFirst({
      where: {
        stop_id: stopId,
        trip_id: tripId,
      },
    });

    if (!stop) {
      return res.status(404).json({ message: 'Stop not found in this trip' });
    }

    await prisma.tripStop.delete({
      where: { stop_id: stopId },
    });

    res.status(200).send();
  } catch (error) {
    next(error);
  }
});

// POST /trips/:tripId/stops/:stopId/activities
router.post(
  '/:tripId/stops/:stopId/activities',
  validate(schemas.addActivity),
  async (req, res, next) => {
    try {
      const { tripId, stopId } = req.params;

      // Verify trip belongs to user
      const trip = await prisma.trip.findFirst({
        where: {
          trip_id: tripId,
          user_id: req.user.userId,
        },
      });

      if (!trip) {
        return res.status(404).json({ message: 'Trip not found' });
      }

      // Verify stop belongs to trip
      const stop = await prisma.tripStop.findFirst({
        where: {
          stop_id: stopId,
          trip_id: tripId,
        },
      });

      if (!stop) {
        return res.status(404).json({ message: 'Stop not found' });
      }

      // Verify activity exists
      const activity = await prisma.activity.findUnique({
        where: { activity_id: req.body.activity_id },
      });

      if (!activity) {
        return res.status(404).json({ message: 'Activity not found' });
      }

      const { activity_id, scheduled_date } = req.body;

      const tripActivity = await prisma.tripActivity.create({
        data: {
          stop_id: stopId,
          activity_id,
          scheduled_date: scheduled_date ? new Date(scheduled_date) : stop.start_date,
        },
        include: {
          activity: true,
        },
      });

      res.status(201).json({
        trip_activity_id: tripActivity.trip_activity_id,
        activity_id: tripActivity.activity_id,
        name: tripActivity.activity.name,
        scheduled_date: tripActivity.scheduled_date.toISOString().split('T')[0],
        custom_cost: tripActivity.custom_cost,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /trips/:tripId/activities/:activityId
router.patch(
  '/:tripId/activities/:activityId',
  validate(schemas.updateActivity),
  async (req, res, next) => {
    try {
      const { tripId, activityId } = req.params;

      // Verify trip belongs to user
      const trip = await prisma.trip.findFirst({
        where: {
          trip_id: tripId,
          user_id: req.user.userId,
        },
      });

      if (!trip) {
        return res.status(404).json({ message: 'Trip not found' });
      }

      // Verify activity belongs to trip
      const tripActivity = await prisma.tripActivity.findFirst({
        where: {
          trip_activity_id: activityId,
          stop: {
            trip_id: tripId,
          },
        },
        include: {
          stop: true,
        },
      });

      if (!tripActivity) {
        return res.status(404).json({ message: 'Activity not found in this trip' });
      }

      const updateData = {};
      if (req.body.custom_cost !== undefined) updateData.custom_cost = req.body.custom_cost;
      if (req.body.scheduled_date) updateData.scheduled_date = new Date(req.body.scheduled_date);
      if (req.body.notes !== undefined) updateData.notes = req.body.notes;

      const updated = await prisma.tripActivity.update({
        where: { trip_activity_id: activityId },
        data: updateData,
        include: {
          activity: true,
        },
      });

      res.json({
        trip_activity_id: updated.trip_activity_id,
        activity_id: updated.activity_id,
        name: updated.activity.name,
        scheduled_date: updated.scheduled_date.toISOString().split('T')[0],
        custom_cost: updated.custom_cost,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /trips/:tripId/activities/:activityId
router.delete('/:tripId/activities/:activityId', async (req, res, next) => {
  try {
    const { tripId, activityId } = req.params;

    // Verify trip belongs to user
    const trip = await prisma.trip.findFirst({
      where: {
        trip_id: tripId,
        user_id: req.user.userId,
      },
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Verify activity belongs to trip
    const tripActivity = await prisma.tripActivity.findFirst({
      where: {
        trip_activity_id: activityId,
        stop: {
          trip_id: tripId,
        },
      },
      include: {
        stop: true,
      },
    });

    if (!tripActivity) {
      return res.status(404).json({ message: 'Activity not found in this trip' });
    }

    await prisma.tripActivity.delete({
      where: { trip_activity_id: activityId },
    });

    res.status(200).send();
  } catch (error) {
    next(error);
  }
});

export default router;
