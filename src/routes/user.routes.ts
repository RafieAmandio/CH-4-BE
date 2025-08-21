import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import {
  updateProfileValidation,
  getUserProfileValidation,
  completeRegistrationValidation,
} from '../validations/user.validation.js';
import { validate } from '../utils/validation.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @route GET /api/users/professions
 * @desc Get all professions grouped by category
 * @access Private
 */
router.get('/professions', authenticate, userController.getProfessions);

/**
 * @route POST /api/users/me/complete
 * @desc Complete user registration with profession and other details
 * @access Private
 */
router.post(
  '/me/complete',
  authenticate,
  completeRegistrationValidation,
  validate,
  userController.completeUserRegistration
);

/**
 * @route GET /api/users/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authenticate, userController.getMyProfile);

/**
 * @route GET /api/users/me/events
 * @desc Get current user's event history
 * @access Private
 */
router.get('/me/events', authenticate, userController.getMyEventHistory);

/**
 * @route PUT /api/users/me
 * @desc Update current user profile
 * @access Private
 */
router.put(
  '/me',
  authenticate,
  updateProfileValidation,
  validate,
  userController.updateMyProfile
);

/**
 * @route GET /api/users/:id
 * @desc Get user profile by ID (public)
 * @access Public
 */
router.get(
  '/:id',
  getUserProfileValidation,
  validate,
  userController.getUserProfile
);

export default router;
