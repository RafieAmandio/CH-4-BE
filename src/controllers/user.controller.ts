import { Request, Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../config/logger.js';
import prisma from '../config/database.js';
import {
  parsePagination,
  createPaginatedResponse,
} from '../utils/pagination.js';

/**
 * Get all professions grouped by category
 */
export const getProfessions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      sendError(
        res,
        'Authentication required',
        [{ field: 'auth', message: 'User not authenticated' }],
        401
      );
      return;
    }

    // Fetch all active profession categories with their professions
    const categories = await prisma.professionCategory.findMany({
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
    const data = categories.map(category => ({
      categoryId: category.id,
      categoryName: category.category,
      professions: category.professions,
    }));

    sendSuccess(res, 'Professions retrieved successfully', data, 200);
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
 * Complete user registration with profession and other details
 */
export const completeUserRegistration = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    let { professionId, ...otherData } = req.body;

    if (!user) {
      sendError(
        res,
        'Authentication required',
        [{ field: 'auth', message: 'User not authenticated' }],
        401
      );
      return;
    }

    // Normalize linkedinUsername to handle edge cases from frontend
    if (otherData.linkedinUsername === 'null' || otherData.linkedinUsername === '') {
      otherData.linkedinUsername = null;
    }

    // Validate profession exists
    if (professionId) {
      const profession = await prisma.profession.findFirst({
        where: {
          id: professionId,
          is_active: true,
          deleted_at: null,
        },
      });

      if (!profession) {
        sendError(
          res,
          'Invalid profession',
          [
            {
              field: 'professionId',
              message: 'Profession does not exist or is not active',
            },
          ],
          400
        );
        return;
      }
    }

    // Update user with completion data
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: otherData.name || user.name,
        email: otherData.email || user.email,
        linkedin_username: otherData.linkedinUsername,
        photo_link: otherData.photoLink,
        profession_id: professionId,
      },
    });

    // Fetch user with profession details
    const userWithProfession = await prisma.user.findUnique({
      where: { id: updatedUser.id },
      include: {
        profession: {
          include: {
            category: true,
          },
        },
      },
    });

    // Return updated user data (excluding password)
    const responseData = {
      id: userWithProfession!.id,
      name: userWithProfession!.name,
      email: userWithProfession!.email,
      username: userWithProfession!.username,
      linkedinUsername: userWithProfession!.linkedin_username,
      photoLink: userWithProfession!.photo_link,
      profession: userWithProfession!.profession
        ? {
          id: userWithProfession!.profession.id,
          name: userWithProfession!.profession.name,
          categoryName: userWithProfession!.profession.category.category,
        }
        : null,
    };

    sendSuccess(res, 'Registration completed successfully', responseData, 200);
  } catch (error) {
    logger.error('Complete user registration error:', error);
    sendError(
      res,
      'Failed to complete registration',
      [
        {
          field: 'server',
          message: 'An error occurred while completing registration',
        },
      ],
      500
    );
  }
};

/**
 * Get the current user's profile
 */
export const getMyProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      sendError(
        res,
        'Authentication required',
        [{ field: 'auth', message: 'User not authenticated' }],
        401
      );
      return;
    }

    // Fetch user with profession details
    const userWithProfession = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profession: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!userWithProfession) {
      sendError(
        res,
        'User not found',
        [{ field: 'user', message: 'User data not found' }],
        404
      );
      return;
    }

    // Return user data (excluding password)
    const responseData = {
      id: userWithProfession.id,
      name: userWithProfession.name,
      email: userWithProfession.email,
      username: userWithProfession.username,
      linkedinUsername: userWithProfession.linkedin_username,
      photoLink: userWithProfession.photo_link,
      profession: userWithProfession.profession
        ? {
          id: userWithProfession.profession.id,
          name: userWithProfession.profession.name,
          categoryName: userWithProfession.profession.category.category,
        }
        : null,
    };

    sendSuccess(res, 'Profile retrieved successfully', responseData, 200);
  } catch (error) {
    logger.error('Get my profile error:', error);
    sendError(
      res,
      'Failed to retrieve profile',
      [
        {
          field: 'server',
          message: 'An error occurred while retrieving profile',
        },
      ],
      500
    );
  }
};

/**
 * Update the current user's profile
 */
export const updateMyProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    let { name, email, username, linkedinUsername, photoLink, professionId } =
      req.body;

    if (!user) {
      sendError(
        res,
        'Authentication required',
        [{ field: 'auth', message: 'User not authenticated' }],
        401
      );
      return;
    }

    // Normalize linkedinUsername to handle edge cases from frontend
    if (linkedinUsername === 'null' || linkedinUsername === '') {
      linkedinUsername = null;
    }

    // Check if username is already taken by another user
    // if (username && username !== user.username) {
    //   const existingUser = await prisma.user.findUnique({
    //     where: { username },
    //   });

    //   if (existingUser) {
    //     sendError(
    //       res,
    //       'Username already taken',
    //       [{ field: 'username', message: 'This username is already in use' }],
    //       400
    //     );
    //     return;
    //   }
    // }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        sendError(
          res,
          'Email already taken',
          [{ field: 'email', message: 'This email is already in use' }],
          400
        );
        return;
      }
    }

    // Validate profession if provided
    if (professionId) {
      const profession = await prisma.profession.findUnique({
        where: { id: professionId },
      });

      if (!profession) {
        sendError(
          res,
          'Invalid profession',
          [{ field: 'professionId', message: 'Profession not found' }],
          400
        );
        return;
      }
    }

    // Update user profile
    await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(username && { username }),
        ...(linkedinUsername !== undefined && {
          linkedin_username: linkedinUsername,
        }),
        ...(photoLink && { photo_link: photoLink }),
        ...(professionId && { profession_id: professionId }),
        updated_at: new Date(),
      },
    });

    // Fetch updated user with profession details
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profession: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!updatedUser) {
      sendError(
        res,
        'User not found',
        [{ field: 'user', message: 'Updated user data not found' }],
        404
      );
      return;
    }

    // Return updated user data
    const responseData = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      username: updatedUser.username,
      linkedinUsername: updatedUser.linkedin_username,
      photoLink: updatedUser.photo_link,
      profession: updatedUser.profession
        ? {
          id: updatedUser.profession.id,
          name: updatedUser.profession.name,
          categoryName: updatedUser.profession.category.category,
        }
        : null,
    };

    sendSuccess(res, 'Profile updated successfully', responseData, 200);
  } catch (error) {
    logger.error('Update profile error:', error);
    sendError(
      res,
      'Failed to update profile',
      [
        {
          field: 'server',
          message: 'An error occurred while updating profile',
        },
      ],
      500
    );
  }
};

/**
 * Get another user's profile by ID (public endpoint)
 */
export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Find user by ID with profession details
    const user = await prisma.user.findUnique({
      where: {
        id,
        is_active: true,
        deleted_at: null,
      },
      include: {
        profession: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!user) {
      sendError(
        res,
        'User not found',
        [{ field: 'id', message: 'User with specified id does not exist' }],
        404
      );
      return;
    }

    // Return public profile data (no email, no profession ID)
    const responseData = {
      id: user.id,
      name: user.name,
      username: user.username,
      linkedinUsername: user.linkedin_username,
      photoLink: user.photo_link,
      profession: user.profession
        ? {
          name: user.profession.name,
          categoryName: user.profession.category.category,
        }
        : null,
    };

    sendSuccess(res, 'User profile retrieved successfully', responseData, 200);
  } catch (error) {
    logger.error('Get user profile error:', error);
    sendError(
      res,
      'Failed to retrieve user profile',
      [
        {
          field: 'server',
          message: 'An error occurred while retrieving user profile',
        },
      ],
      500
    );
  }
};

/**
 * Get current user's event history
 */
export const getMyEventHistory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    const { status = 'all', sortBy = 'start', sortOrder = 'desc' } = req.query;

    if (!user) {
      sendError(
        res,
        'Authentication required',
        [{ field: 'auth', message: 'User not authenticated' }],
        401
      );
      return;
    }

    // Use standardized pagination
    const { page, limit, skip } = parsePagination(req.query);

    // Build status filter
    let statusFilter = {};
    if (status !== 'all') {
      const now = new Date();
      switch (status) {
        case 'upcoming':
          statusFilter = { start: { gt: now } };
          break;
        case 'ongoing':
          statusFilter = {
            start: { lte: now },
            end: { gte: now },
          };
          break;
        case 'completed':
          statusFilter = { end: { lt: now } };
          break;
      }
    }

    // Build sort order
    const validSortFields = ['start', 'end', 'created_at'];
    const sortField = validSortFields.includes(sortBy as string)
      ? (sortBy as string)
      : 'start';
    const order = sortOrder === 'asc' ? 'asc' : 'desc';

    let eventOrderBy: any = {};
    eventOrderBy[sortField] = order;

    // Get attendee records for this user
    const attendees = await prisma.attendee.findMany({
      where: {
        user_id: user.id,
        is_active: true,
        deleted_at: null,
        event: {
          is_active: true,
          deleted_at: null,
          ...statusFilter,
        },
      },
      include: {
        event: true,
      },
      orderBy: {
        event: eventOrderBy,
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const totalItems = await prisma.attendee.count({
      where: {
        user_id: user.id,
        is_active: true,
        deleted_at: null,
        event: {
          is_active: true,
          deleted_at: null,
          ...statusFilter,
        },
      },
    });

    // Transform data to match API contract
    const items = attendees.map(attendee => ({
      attendeeId: attendee.id,
      event: {
        id: attendee.event.id,
        name: attendee.event.name,
        start: attendee.event.start.toISOString(),
        end: attendee.event.end.toISOString(),
        detail: attendee.event.detail,
        photo_link: attendee.event.photo_link,
        location_name: attendee.event.location_name,
        location_address: attendee.event.location_address,
        location_link: attendee.event.location_link,
        link: attendee.event.link,
        status: attendee.event.status,
        current_participants: attendee.event.current_participants,
        code: attendee.event.code,
      },
      registrationDate: attendee.created_at.toISOString(),
    }));

    // Use standardized pagination response
    const responseData = {
      items,
      pagination: createPaginatedResponse(items, totalItems, page, limit),
    };

    sendSuccess(res, 'Event history retrieved successfully', responseData, 200);
  } catch (error) {
    logger.error('Get event history error:', error);
    sendError(
      res,
      'Failed to retrieve event history',
      [
        {
          field: 'server',
          message: 'An error occurred while retrieving event history',
        },
      ],
      500
    );
  }
};
