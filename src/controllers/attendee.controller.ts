import { Request, Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../config/logger.js';
import prisma from '../config/database.js';
import {
  ProfessionCategoryResponse,
  GoalsCategoryResponse,
  UpdateGoalsCategoryInput,
  QuestionResponse,
  UpdateGoalsCategoryResponse,
} from '../types/attendee.types.js';
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

/**
 * Get all active goals categories
 */
export const getGoalsCategories = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Get all active goals categories
    const goalsCategories = await prisma.goalsCategory.findMany({
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
    });

    // Transform the data to match the API contract
    const responseData: GoalsCategoryResponse[] = goalsCategories.map(
      category => ({
        id: category.id,
        name: category.name,
      })
    );

    sendSuccess(
      res,
      'Goals categories retrieved successfully',
      responseData,
      200
    );
  } catch (error) {
    logger.error('Get goals categories error:', error);
    sendError(
      res,
      'Failed to retrieve goals categories',
      [
        {
          field: 'server',
          message: 'An error occurred while retrieving goals categories',
        },
      ],
      500
    );
  }
};

/**
 * Update attendee's goals category and return questions
 */
export const updateGoalsCategory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { attendeeId } = req.params;
    const { goalsCategoryId }: UpdateGoalsCategoryInput = req.body;
    const user = req.user;
    const attendee = req.attendee;

    // Validate ownership
    if (user) {
      // User token - check if attendee belongs to user
      const userAttendee = await prisma.attendee.findFirst({
        where: {
          id: attendeeId,
          user_id: user.id,
          is_active: true,
        },
      });

      if (!userAttendee) {
        sendError(
          res,
          'Attendee not found',
          [
            {
              field: 'attendeeId',
              message: 'Attendee not found or does not belong to user',
            },
          ],
          404
        );
        return;
      }
    } else if (attendee) {
      // Attendee token - check if attendee ID matches
      if (attendee.id !== attendeeId) {
        sendError(
          res,
          'Unauthorized',
          [
            {
              field: 'attendeeId',
              message: 'Attendee ID does not match token',
            },
          ],
          403
        );
        return;
      }
    } else {
      sendError(
        res,
        'Authentication required',
        [{ field: 'auth', message: 'No valid authentication found' }],
        401
      );
      return;
    }

    // Check if goals category exists and is active
    const goalsCategory = await prisma.goalsCategory.findUnique({
      where: { id: goalsCategoryId },
    });

    if (!goalsCategory || !goalsCategory.is_active) {
      sendError(
        res,
        'Goals category not found',
        [
          {
            field: 'goalsCategoryId',
            message: 'Goals category not found or inactive',
          },
        ],
        404
      );
      return;
    }

    // Update attendee's goals category
    const updatedAttendee = await prisma.attendee.update({
      where: { id: attendeeId },
      data: {
        goals_category_id: goalsCategoryId,
      },
    });

    // Get questions for this goals category with answer options
    const questions = await prisma.question.findMany({
      where: {
        goals_category_id: goalsCategoryId,
        is_active: true,
        deleted_at: null,
      },
      include: {
        answerOptions: {
          where: { is_active: true, deleted_at: null },
          select: { id: true, label: true, value: true, display_order: true },
          orderBy: { display_order: 'asc' },
        },
        questionOrders: {
          where: {
            goals_category_id: goalsCategoryId,
            is_active: true,
            deleted_at: null,
          },
          select: { display_order: true },
          orderBy: { display_order: 'asc' },
          take: 1, // ensure only the one for this category
        },
      },
    });

    // Transform questions data to match API contract
    const transformedQuestions: QuestionResponse[] = questions
      .map(q => {
        const displayOrder =
          q.questionOrders?.[0]?.display_order ?? Number.MAX_SAFE_INTEGER;

        return {
          id: q.id,
          question: q.question,
          type: q.type as QuestionResponse['type'], // align Prisma enum to your union
          placeholder: q.placeholder ?? undefined, // null -> undefined
          displayOrder,
          isRequired: q.is_required,
          isShareable: q.is_shareable,
          constraints: {
            minSelect: q.min_select,
            maxSelect: q.max_select ?? undefined, // null -> undefined
            requireRanking: q.require_ranking,
            isUsingOther: q.is_using_other,
            textMaxLen: q.text_max_len ?? undefined, // null -> undefined
            numberMin: q.number_min
              ? parseFloat(q.number_min.toString())
              : undefined,
            numberMax: q.number_max
              ? parseFloat(q.number_max.toString())
              : undefined,
            numberStep: q.number_step
              ? parseFloat(q.number_step.toString())
              : undefined,
          },
          answerOptions: q.answerOptions.map(opt => ({
            id: opt.id,
            label: opt.label,
            value: opt.value ?? undefined, // null -> undefined to satisfy `value?: string`
            displayOrder: opt.display_order,
          })),
        };
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);

    // Prepare response
    const responseData: UpdateGoalsCategoryResponse = {
      attendeeId: updatedAttendee.id,
      goalsCategory: {
        id: goalsCategory.id,
        name: goalsCategory.name,
      },
      questions: transformedQuestions,
    };

    sendSuccess(res, 'Goals category updated successfully', responseData, 200);
  } catch (error) {
    logger.error('Update goals category error:', error);
    sendError(
      res,
      'Failed to update goals category',
      [
        {
          field: 'server',
          message: 'An error occurred while updating goals category',
        },
      ],
      500
    );
  }
};
