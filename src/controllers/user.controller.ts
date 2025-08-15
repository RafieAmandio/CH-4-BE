import { Request, Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { UpdateProfileInput } from '../types/user.types.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../config/logger.js';
import prisma from '../config/database.js';

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

    // Return user data (excluding password)
    const { password_hash: _passwordHash, ...userWithoutPassword } = user;

    sendSuccess(
      res,
      'Profile retrieved successfully',
      {
        id: userWithoutPassword.id,
        name: userWithoutPassword.name,
        email: userWithoutPassword.email,
        username: userWithoutPassword.username,
        nickname: userWithoutPassword.nickname,
        profilePhoto: userWithoutPassword.photo_link,
        createdAt: userWithoutPassword.created_at,
        updatedAt: userWithoutPassword.updated_at,
      },
      200
    );
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
    const updateData: UpdateProfileInput = req.body;

    if (!user) {
      sendError(
        res,
        'Authentication required',
        [{ field: 'auth', message: 'User not authenticated' }],
        401
      );
      return;
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: updateData.name || user.name,
        username: updateData.username || user.username,
        nickname: updateData.nickname || user.nickname,
      },
    });

    // Return updated user data (excluding password)
    const { password_hash: _passwordHash, ...userWithoutPassword } =
      updatedUser;

    sendSuccess(
      res,
      'Profile updated successfully',
      {
        id: userWithoutPassword.id,
        name: userWithoutPassword.name,
        email: userWithoutPassword.email,
        username: userWithoutPassword.username,
        nickname: userWithoutPassword.nickname,
        profilePhoto: userWithoutPassword.photo_link,
        createdAt: userWithoutPassword.created_at,
        updatedAt: userWithoutPassword.updated_at,
      },
      200
    );
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
 * Get another user's profile by ID
 */
export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Find user by ID
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        nickname: true,
        photo_link: true,
        // Don't include email, password_hash, or other sensitive data
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

    sendSuccess(
      res,
      'User profile retrieved successfully',
      {
        id: user.id,
        name: user.name,
        username: user.username,
        nickname: user.nickname,
        profilePhoto: user.photo_link,
      },
      200
    );
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
 * Upload profile photo
 */
export const uploadProfilePhoto = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    const { photoUrl } = req.body;

    if (!user) {
      sendError(
        res,
        'Authentication required',
        [{ field: 'auth', message: 'User not authenticated' }],
        401
      );
      return;
    }

    if (!photoUrl) {
      sendError(
        res,
        'Photo URL required',
        [{ field: 'photoUrl', message: 'Photo URL is required' }],
        400
      );
      return;
    }

    // Update user's photo_link
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        photo_link: photoUrl,
      },
    });

    sendSuccess(
      res,
      'Photo uploaded successfully',
      {
        profilePhoto: updatedUser.photo_link,
      },
      200
    );
  } catch (error) {
    logger.error('Upload profile photo error:', error);
    sendError(
      res,
      'Failed to upload photo',
      [
        {
          field: 'server',
          message: 'An error occurred while uploading photo',
        },
      ],
      500
    );
  }
};
