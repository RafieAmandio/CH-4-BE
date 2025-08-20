import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import {
  registerValidation,
  loginValidation,
  callbackValidation,
} from '../validations/auth.validation.js';
import { validate } from '../utils/validation.js';
import {
  authenticate,
  authenticateSupabase,
} from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', registerValidation, validate, authController.register);

/**
 * @route POST /api/auth/callback
 * @desc Handle Supabase OAuth callback
 * @access Public (requires Supabase token in Authorization header)
 */
router.post(
  '/callback',
  callbackValidation,
  validate,
  authenticateSupabase,
  authController.callback
);

/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 */
router.post('/login', loginValidation, validate, authController.login);

/**
 * @route GET /api/auth/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', authenticate, authController.getProfile);

export default router;
