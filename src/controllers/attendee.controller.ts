import { Request, Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../config/logger.js';
import prisma from '../config/database.js';
import { ProfessionCategoryResponse } from '../types/attendee.types.js';
import { CreateAttendeeInput } from '../types/attendee.types.js';
import { generateToken } from '../utils/token.js';

/**
 * Get all professions grouped by category
 */
export const getProfessions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get all active profession categories with their professions
    const professionCategories = await prisma.professionCategory.findMany({
      where: {
        is_active: true,
        deleted_at: null,
      },
      include: {
        professions: {
          where: {
            is_active: true,
            deleted_at: null,
          },
          select: {
            id: true,
            name: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: {
        category: 'asc',
      },
    });

    // Transform the data to match the API contract
    const responseData: ProfessionCategoryResponse[] = professionCategories.map(
      category => ({
        categoryId: category.id,
        categoryName: category.category,
        professions: category.professions.map(profession => ({
          id: profession.id,
          name: profession.name,
        })),
      })
    );

    sendSuccess(res, 'Professions retrieved successfully', responseData, 200);
  } catch (error) {
    logger.error('Get professions error:', error);
    sendError(
      res,
      'Failed to retrieve professions',
      [
        {
          field: 'server',
          message: 'An error occurred while retrieving professions',
        },
      ],
      500
    );
  }
};

/**
 * Create a new attendee for an event
 */
export const createAttendee = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const attendeeData: CreateAttendeeInput = req.body;

    const user = req.user; // Will be null for visitors

    // Check if event exists and is active
    const event = await prisma.event.findUnique({
      where: { id: attendeeData.eventId },
    });

    if (!event || !event.is_active) {
      sendError(
        res,
        'Event not found',
        [{ field: 'eventId', message: 'Event not found or inactive' }],
        404
      );
      return;
    }

    // Check if profession exists and is active
    const profession = await prisma.profession.findUnique({
      where: { id: attendeeData.professionId },
    });

    if (!profession || !profession.is_active) {
      sendError(
        res,
        'Profession not found',
        [
          {
            field: 'professionId',
            message: 'Profession not found or inactive',
          },
        ],
        404
      );
      return;
    }

    // Create the attendee
    const newAttendee = await prisma.attendee.create({
      data: {
        event_id: attendeeData.eventId,
        user_id: user?.id || null,
        user_email: attendeeData.userEmail || user?.email || null,
        nickname: attendeeData.nickname,
        profession_id: attendeeData.professionId,
        linkedin_username:
          attendeeData.linkedinUsername || user?.linkedin_username || null,
        photo_link: attendeeData.photoLink,
        goals_category_id: null,
        is_active: true,
      },
    });

    // Update event participant count
    await prisma.event.update({
      where: { id: attendeeData.eventId },
      data: {
        current_participants: { increment: 1 },
      },
    });

    const responseData: any = {
      attendeeId: newAttendee.id,
    };

    if (user) {
      // Generate enhanced user token with attendee info
      const enhancedToken = generateToken({
        id: user.id,
        email: user.email,
        attendeeId: newAttendee.id,
      });
      responseData.accessToken = enhancedToken;
    } else {
      // Generate visitor token (attendeeId as main id)
      const visitorToken = generateToken({
        attendeeId: newAttendee.id, // For visitors, id IS the attendeeId
        // No email for visitors
      });
      responseData.accessToken = visitorToken;
    }

    sendSuccess(res, 'Attendee registered successfully', responseData, 201);
  } catch (error) {
    logger.error('Create attendee error:', error);
    sendError(
      res,
      'Attendee registration failed',
      [
        {
          field: 'server',
          message: 'An error occurred while registering attendee',
        },
      ],
      500
    );
  }
};
