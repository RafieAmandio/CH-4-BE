import { Request, Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../config/logger.js';
import prisma from '../config/database.js';
import { ProfessionCategoryResponse } from '../types/attendee.types.js';

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
            (category) => ({
                categoryId: category.id,
                categoryName: category.category,
                professions: category.professions.map((profession) => ({
                    id: profession.id,
                    name: profession.name,
                })),
            })
        );

        sendSuccess(
            res,
            'Professions retrieved successfully',
            responseData,
            200
        );
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

