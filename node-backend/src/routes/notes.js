import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router({ mergeParams: true });
const prisma = new PrismaClient();

router.use(authenticate);

const getTripId = (req) => req.params.tripId;

// GET /trips/:tripId/notes
router.get('/', async (req, res, next) => {
  try {
    const tripId = getTripId(req);

    const trip = await prisma.trip.findFirst({
      where: { trip_id: tripId, user_id: req.user.userId },
    });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const notes = await prisma.note.findMany({
      where: { trip_id: tripId },
      orderBy: { created_at: 'desc' },
    });

    res.json(notes.map((note) => ({
      note_id: note.note_id,
      trip_id: note.trip_id,
      title: note.title,
      content: note.content,
      stop_id: note.stop_id,
      day_date: note.day_date ? note.day_date.toISOString().split('T')[0] : null,
      created_at: note.created_at.toISOString(),
    })));
  } catch (error) {
    next(error);
  }
});

// POST /trips/:tripId/notes
router.post('/', validate(schemas.createNote), async (req, res, next) => {
  try {
    const tripId = getTripId(req);

    const trip = await prisma.trip.findFirst({
      where: { trip_id: tripId, user_id: req.user.userId },
    });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const { title, content, stop_id, day_date } = req.body;

    const note = await prisma.note.create({
      data: {
        trip_id: tripId,
        title,
        content,
        stop_id: stop_id || null,
        day_date: day_date ? new Date(day_date) : null,
      },
    });

    res.status(201).json({
      note_id: note.note_id,
      trip_id: note.trip_id,
      title: note.title,
      content: note.content,
      stop_id: note.stop_id,
      day_date: note.day_date ? note.day_date.toISOString().split('T')[0] : null,
      created_at: note.created_at.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /trips/:tripId/notes/:noteId
router.patch('/:noteId', validate(schemas.updateNote), async (req, res, next) => {
  try {
    const tripId = getTripId(req);
    const { noteId } = req.params;

    const trip = await prisma.trip.findFirst({
      where: { trip_id: tripId, user_id: req.user.userId },
    });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const existing = await prisma.note.findFirst({
      where: { note_id: noteId, trip_id: tripId },
    });
    if (!existing) return res.status(404).json({ message: 'Note not found' });

    const updateData = {};
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.content !== undefined) updateData.content = req.body.content;
    if (req.body.stop_id !== undefined) updateData.stop_id = req.body.stop_id;
    if (req.body.day_date !== undefined) updateData.day_date = req.body.day_date ? new Date(req.body.day_date) : null;

    const note = await prisma.note.update({
      where: { note_id: noteId },
      data: updateData,
    });

    res.json({
      note_id: note.note_id,
      trip_id: note.trip_id,
      title: note.title,
      content: note.content,
      stop_id: note.stop_id,
      day_date: note.day_date ? note.day_date.toISOString().split('T')[0] : null,
      created_at: note.created_at.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /trips/:tripId/notes/:noteId
router.delete('/:noteId', async (req, res, next) => {
  try {
    const tripId = getTripId(req);
    const { noteId } = req.params;

    const trip = await prisma.trip.findFirst({
      where: { trip_id: tripId, user_id: req.user.userId },
    });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const existing = await prisma.note.findFirst({
      where: { note_id: noteId, trip_id: tripId },
    });
    if (!existing) return res.status(404).json({ message: 'Note not found' });

    await prisma.note.delete({ where: { note_id: noteId } });
    res.status(200).json({ message: 'Note deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
