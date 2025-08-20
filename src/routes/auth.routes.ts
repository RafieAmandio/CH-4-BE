import { Router, Request, Response, NextFunction } from 'express';
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
import { logger } from '../config/logger.js';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', registerValidation, validate, authController.register);

/**
 * @swagger
 * /auth/callback:
 *   post:
 *     summary: Handle OAuth callback
 *     description: Process OAuth callback and authenticate user with Supabase token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       201:
 *         description: User created and logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User created and logged in successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  '/callback',
  (req: Request, res: Response, next: NextFunction) => {
    logger.info('=== AUTH CALLBACK ENDPOINT ACCESSED ===', {
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
      hasAuthHeader: !!req.headers.authorization,
      timestamp: new Date().toISOString(),
    });
    next();
  },
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
