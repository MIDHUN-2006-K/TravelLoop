import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router({ mergeParams: true });
const prisma = new PrismaClient();

router.use(authenticate);

// Helper to get tripId from parent route params
const getTripId = (req) => req.params.tripId;

// GET /trips/:tripId/expenses
router.get('/', async (req, res, next) => {
  try {
    const tripId = getTripId(req);

    const trip = await prisma.trip.findFirst({
      where: { trip_id: tripId, user_id: req.user.userId },
    });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const expenses = await prisma.expense.findMany({
      where: { trip_id: tripId },
      orderBy: { created_at: 'desc' },
    });

    res.json(expenses.map((exp) => ({
      expense_id: exp.expense_id,
      trip_id: exp.trip_id,
      category: exp.category,
      estimated_cost: exp.estimated_cost,
      actual_cost: exp.actual_cost,
      description: exp.description,
      expense_date: exp.expense_date ? exp.expense_date.toISOString().split('T')[0] : null,
      created_at: exp.created_at.toISOString(),
    })));
  } catch (error) {
    next(error);
  }
});

// POST /trips/:tripId/expenses
router.post('/', validate(schemas.createExpense), async (req, res, next) => {
  try {
    const tripId = getTripId(req);

    const trip = await prisma.trip.findFirst({
      where: { trip_id: tripId, user_id: req.user.userId },
    });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const { category, estimated_cost, actual_cost, description, expense_date } = req.body;

    const expense = await prisma.expense.create({
      data: {
        trip_id: tripId,
        category,
        estimated_cost,
        actual_cost: actual_cost || null,
        description: description || null,
        expense_date: expense_date ? new Date(expense_date) : null,
      },
    });

    res.status(201).json({
      expense_id: expense.expense_id,
      trip_id: expense.trip_id,
      category: expense.category,
      estimated_cost: expense.estimated_cost,
      actual_cost: expense.actual_cost,
      description: expense.description,
      expense_date: expense.expense_date ? expense.expense_date.toISOString().split('T')[0] : null,
      created_at: expense.created_at.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /trips/:tripId/expenses/:expenseId
router.patch('/:expenseId', validate(schemas.updateExpense), async (req, res, next) => {
  try {
    const tripId = getTripId(req);
    const { expenseId } = req.params;

    const trip = await prisma.trip.findFirst({
      where: { trip_id: tripId, user_id: req.user.userId },
    });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const existing = await prisma.expense.findFirst({
      where: { expense_id: expenseId, trip_id: tripId },
    });
    if (!existing) return res.status(404).json({ message: 'Expense not found' });

    const updateData = {};
    if (req.body.category !== undefined) updateData.category = req.body.category;
    if (req.body.estimated_cost !== undefined) updateData.estimated_cost = req.body.estimated_cost;
    if (req.body.actual_cost !== undefined) updateData.actual_cost = req.body.actual_cost;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.expense_date !== undefined) updateData.expense_date = req.body.expense_date ? new Date(req.body.expense_date) : null;

    const expense = await prisma.expense.update({
      where: { expense_id: expenseId },
      data: updateData,
    });

    res.json({
      expense_id: expense.expense_id,
      trip_id: expense.trip_id,
      category: expense.category,
      estimated_cost: expense.estimated_cost,
      actual_cost: expense.actual_cost,
      description: expense.description,
      expense_date: expense.expense_date ? expense.expense_date.toISOString().split('T')[0] : null,
      created_at: expense.created_at.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /trips/:tripId/expenses/:expenseId
router.delete('/:expenseId', async (req, res, next) => {
  try {
    const tripId = getTripId(req);
    const { expenseId } = req.params;

    const trip = await prisma.trip.findFirst({
      where: { trip_id: tripId, user_id: req.user.userId },
    });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const existing = await prisma.expense.findFirst({
      where: { expense_id: expenseId, trip_id: tripId },
    });
    if (!existing) return res.status(404).json({ message: 'Expense not found' });

    await prisma.expense.delete({ where: { expense_id: expenseId } });
    res.status(200).json({ message: 'Expense deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
