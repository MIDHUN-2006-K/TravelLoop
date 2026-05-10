import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { validate, schemas } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';
import { generateOTP, sendOTPEmail } from '../utils/email.js';

const router = express.Router();
const prisma = new PrismaClient();

// POST /auth/signup
router.post('/signup', validate(schemas.signup), async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password_hash, name: name || null },
      select: { user_id: true, email: true, name: true, profile_photo: true, avatar_url: true },
    });

    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.user_id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/login
router.post('/login', validate(schemas.login), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.user_id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /auth/me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: req.user.userId },
      select: {
        user_id: true, email: true, name: true,
        profile_photo: true, avatar_url: true,
        language: true, preferences: true, created_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.user_id,
      email: user.email,
      name: user.name,
      profile_photo: user.profile_photo,
      avatar_url: user.avatar_url,
      language: user.language,
      preferences: user.preferences,
      created_at: user.created_at,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /auth/profile
router.patch('/profile', authenticate, validate(schemas.updateProfile), async (req, res, next) => {
  try {
    const updateData = {};
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.avatar_url !== undefined) updateData.avatar_url = req.body.avatar_url;
    if (req.body.language !== undefined) updateData.language = req.body.language;
    if (req.body.preferences !== undefined) updateData.preferences = req.body.preferences;

    const user = await prisma.user.update({
      where: { user_id: req.user.userId },
      data: updateData,
      select: {
        user_id: true, email: true, name: true,
        avatar_url: true, language: true, preferences: true,
      },
    });

    res.json({
      id: user.user_id, email: user.email, name: user.name,
      avatar_url: user.avatar_url, language: user.language, preferences: user.preferences,
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/upload-avatar
router.post('/upload-avatar', authenticate, async (req, res, next) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ message: 'Image data is required' });
    }
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Invalid image format. Must be a base64 data URL.' });
    }
    if (image.length > 7 * 1024 * 1024) {
      return res.status(400).json({ message: 'Image too large. Max 5MB.' });
    }

    const user = await prisma.user.update({
      where: { user_id: req.user.userId },
      data: { profile_photo: image },
      select: { user_id: true, profile_photo: true },
    });

    res.json({ message: 'Avatar uploaded', profile_photo: user.profile_photo });
  } catch (error) {
    next(error);
  }
});

// POST /auth/forgot-password
router.post('/forgot-password', validate(schemas.forgotPassword), async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.json({ message: 'If the email exists, an OTP has been sent.' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { otp_code: otp, otp_expires_at: expiresAt },
    });

    await sendOTPEmail(email, otp);

    res.json({ message: 'If the email exists, an OTP has been sent.' });
  } catch (error) {
    next(error);
  }
});

// POST /auth/reset-password
router.post('/reset-password', validate(schemas.resetPassword), async (req, res, next) => {
  try {
    const { email, otp, new_password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid OTP or email' });
    }

    if (!user.otp_code || user.otp_code !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (!user.otp_expires_at || new Date() > user.otp_expires_at) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    const password_hash = await bcrypt.hash(new_password, 10);

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { password_hash, otp_code: null, otp_expires_at: null },
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
});

// DELETE /auth/account
router.delete('/account', authenticate, async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { user_id: req.user.userId } });
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
