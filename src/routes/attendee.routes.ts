import { Router } from 'express';
import * as attendeeController from '../controllers/attendee.controller.js';
import {
    getProfessionsValidation,
} from '../validations/attendee.validation.js';
import { validate } from '../utils/validation.js';

const router = Router();

/**
 * @route GET /api/attendee/professions
 * @desc Get all professions grouped by category
 * @access Public
 */
router.get(
    '/professions',
    getProfessionsValidation,
    validate,
    attendeeController.getProfessions
);

export default router;