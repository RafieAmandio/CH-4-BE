import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import {
  updateProfileValidation,
  getUserProfileValidation,
  uploadPhotoValidation,
} from '../validations/user.validation.js';
import { validate } from '../utils/validation.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @route GET /api/users/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authenticate, userController.getMyProfile);

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
 * @route POST /api/users/me/photo
 * @desc Upload profile photo
 * @access Private
 */
router.post(
  '/me/photo',
  authenticate,
  uploadPhotoValidation,
  validate,
  userController.uploadProfilePhoto
);

/**
 * @route GET /api/users/:id
 * @desc Get user profile by ID
 * @access Public
 */
router.get(
  '/:id',
  getUserProfileValidation,
  validate,
  userController.getUserProfile
);

export default router;
