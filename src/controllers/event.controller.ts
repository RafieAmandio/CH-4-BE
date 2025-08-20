import { Response } from 'express';
import { AuthRequest, PaginationQuery } from '../types/index.js';
import { CreateEventInput, UpdateEventInput } from '../types/event.types.js';
import {
  sendSuccess,
  sendError,
  sendPaginatedSuccess,
} from '../utils/response.js';
import {
  parsePagination,
  createPaginatedResponse,
} from '../utils/pagination.js';
import { logger } from '../config/logger.js';
import { Prisma, EventStatus } from '@prisma/client';
import prisma from '../config/database.js';

/**
 * Create a new event
 */
export const createEvent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const eventData: CreateEventInput = req.body;
    const userId = req.user?.id;

    if (!userId) {
      sendError(
        res,
        'Authentication required',
        [{ field: 'auth', message: 'User not authenticated' }],
        401
      );
      return;
    }

    // Create the event
    const newEvent = await prisma.event.create({
      data: {
        name: eventData.name,
        start: new Date(eventData.datetime),
        end: new Date(
          new Date(eventData.datetime).getTime() + 2 * 60 * 60 * 1000
        ), // Default 2 hours later
        detail: eventData.description,
        location_name: eventData.location,
        latitude: eventData.latitude,
        longitude: eventData.longitude,
        status: EventStatus.UPCOMING,
        current_participants: 0,
        created_by: userId,
        is_active: true,
      },
    });

    sendSuccess(res, 'Event created successfully', { event: newEvent }, 201);
  } catch (error) {
    logger.error('Create event error:', error);
    sendError(
      res,
      'Create event failed',
      [
        {
          field: 'server',
          message: 'An error occurred while creating the event',
        },
      ],
      500
    );
  }
};

/**
 * Get all events with pagination
 */
export const getEvents = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const query = req.query as PaginationQuery;
    const { page, limit, skip, search, sortBy, sortOrder } =
      parsePagination(query);

    // Build where clause for search
    const where: Prisma.EventWhereInput = search
      ? {
          AND: [
            { is_active: true },
            {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: 'insensitive' as Prisma.QueryMode,
                  },
                },
                {
                  detail: {
                    contains: search,
                    mode: 'insensitive' as Prisma.QueryMode,
                  },
                },
                {
                  location_name: {
                    contains: search,
                    mode: 'insensitive' as Prisma.QueryMode,
                  },
                },
              ],
            },
          ],
        }
      : { is_active: true };

    // Build order by clause
    const orderBy: Prisma.EventOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder || ('asc' as Prisma.SortOrder) }
      : { created_at: 'desc' as Prisma.SortOrder };

    // Get events with pagination
    const [events, totalEvents] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
            },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    // Create paginated response
    const paginatedResponse = createPaginatedResponse(
      events,
      totalEvents,
      page,
      limit
    );

    sendPaginatedSuccess(
      res,
      'Events retrieved successfully',
      paginatedResponse
    );
  } catch (error) {
    logger.error('Get events error:', error);
    sendError(
      res,
      'Failed to retrieve events',
      [
        {
          field: 'server',
          message: 'An error occurred while retrieving events',
        },
      ],
      500
    );
  }
};

/**
 * Get an event by ID
 */
export const getEventById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!event || !event.is_active) {
      sendError(
        res,
        'Event not found',
        [{ field: 'id', message: 'Event with specified ID does not exist' }],
        404
      );
      return;
    }

    sendSuccess(res, 'Event details retrieved successfully', event);
  } catch (error) {
    logger.error('Get event error:', error);
    sendError(
      res,
      'Failed to retrieve event',
      [
        {
          field: 'server',
          message: 'An error occurred while retrieving the event',
        },
      ],
      500
    );
  }
};

/**
 * Update an event by ID
 */
export const updateEvent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const eventData: UpdateEventInput = req.body;
    const userId = req.user?.id;

    if (!userId) {
      sendError(
        res,
        'Authentication required',
        [{ field: 'auth', message: 'User not authenticated' }],
        401
      );
      return;
    }

    // Check if event exists and user has permission to update
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent || !existingEvent.is_active) {
      sendError(
        res,
        'Event not found',
        [
          {
            field: 'id',
            message: 'Event with the specified ID does not exist',
          },
        ],
        404
      );
      return;
    }

    // Check if user owns the event
    if (existingEvent.created_by !== userId) {
      sendError(
        res,
        'Authorization Error',
        [
          {
            field: 'permission',
            message: 'only event creator can update this event',
          },
        ],
        403
      );
      return;
    }

    // Prepare update data
    const updateData: any = {};
    if (eventData.name !== undefined) updateData.name = eventData.name;
    if (eventData.datetime !== undefined) {
      updateData.start = new Date(eventData.datetime);
      updateData.end = new Date(
        new Date(eventData.datetime).getTime() + 2 * 60 * 60 * 1000
      );
    }
    if (eventData.description !== undefined)
      updateData.detail = eventData.description;
    if (eventData.location !== undefined)
      updateData.location_name = eventData.location;
    if (eventData.latitude !== undefined)
      updateData.latitude = eventData.latitude;
    if (eventData.longitude !== undefined)
      updateData.longitude = eventData.longitude;

    // Update the event
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
      },
    });

    sendSuccess(res, 'Event updated successfully', updatedEvent, 200);
  } catch (error) {
    logger.error('Update event error:', error);
    sendError(
      res,
      'Event update failed',
      [
        {
          field: 'server',
          message: 'An error occurred while updating the event',
        },
      ],
      500
    );
  }
};

/**
 * Delete an event by ID (soft delete)
 */
export const deleteEvent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      sendError(
        res,
        'Authentication required',
        [{ field: 'auth', message: 'User not authenticated' }],
        401
      );
      return;
    }

    // Check if event exists and user has permission to delete
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent || !existingEvent.is_active) {
      sendError(
        res,
        'Event not found',
        [
          {
            field: 'id',
            message: 'Event with the specified ID does not exist',
          },
        ],
        404
      );
      return;
    }

    // Check if user owns the event
    if (existingEvent.created_by !== userId) {
      sendError(
        res,
        'Authorization Error',
        [
          {
            field: 'permission',
            message: 'only event creator can delete this event',
          },
        ],
        403
      );
      return;
    }

    // Soft delete by setting is_active to false
    await prisma.event.update({
      where: { id },
      data: { is_active: false },
    });

    sendSuccess(res, 'Event deleted successfully', null, 200);
  } catch (error) {
    logger.error('Delete event error:', error);
    sendError(
      res,
      'Event deletion failed',
      [
        {
          field: 'server',
          message: 'An error occurred while deleting the event',
        },
      ],
      500
    );
  }
};
