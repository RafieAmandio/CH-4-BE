import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import {
  registerValidation,
  loginValidation,
} from '../validations/auth.validation';
import { validate } from '../utils/validation';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', registerValidation, validate, authController.register);

router.post('/callback', authController.callback);

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
