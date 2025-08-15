import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import {
  registerValidation,
  loginValidation,
  callbackValidation,
} from '../validations/auth.validation.js';
import { validate } from '../utils/validation.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', registerValidation, validate, authController.register);

/**
 * @route POST /api/auth/callback
 * @desc Register a new user using apple
 * @access Public
 */
router.post('/callback', callbackValidation, validate, authController.callback);

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
