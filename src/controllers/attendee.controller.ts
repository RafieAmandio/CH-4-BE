import { Request, Response, NextFunction } from 'express';
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
  SubmitAnswersInput,
  SubmitAnswersResponse,
  GetRecommendationsResponse,
  RecommendationResponse,
  ValidateEventResponse,
} from '../types/attendee.types.js';
import { CreateAttendeeInput } from '../types/attendee.types.js';
import { generateToken } from '../utils/token.js';
import {
  processAttendee as aiProcessAttendee,
  getRecommendations as aiGetRecommendations,
  getRecommendationsWithSingleton,
  type ProcessAttendeeRequest,
  type AttendeePayload,
  type QuestionType,
  type RecommendationItem,
} from '../utils/ai.service.js';

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
      where: { code: attendeeData.eventCode },
    });

    if (!event || !event.is_active) {
      sendError(
        res,
        'Event not found',
        [{ field: 'eventCode', message: 'Event not found or inactive' }],
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
        event_id: event.id,
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
      where: { id: event.id },
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
    const { goalsCategoryId }: UpdateGoalsCategoryInput = req.body;
    const attendeeToken = req.attendee;

    // Determine attendeeId from token
    let attendeeId: string;

    if (attendeeToken) {
      attendeeId = attendeeToken.id;
    } else {
      logger.warn('No attendee ID found in token');
      sendError(
        res,
        'Authentication required',
        [{ field: 'auth', message: 'No valid attendee authentication found' }],
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

/**
 * POST /api/attendee/answers
 * Replace-by-question (delete + createMany) to support multi-select & nulls.
 * Returns top-3 recommendations (without score) per your spec.
 */
export const submitAnswers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Get attendeeId from token instead of params
    const { answers }: SubmitAnswersInput = req.body;
    const attendeeToken = req.attendee;

    // Determine attendeeId from token
    let attendeeId: string;

    if (attendeeToken) {
      attendeeId = attendeeToken.id;
    } else {
      logger.warn('No attendee ID found in token');
      sendError(
        res,
        'Authentication required',
        [{ field: 'auth', message: 'No valid attendee authentication found' }],
        401
      );
      return;
    }

    logger.info('Submit answers called with:', {
      attendeeId,
      answersCount: answers?.length,
      hasAttendeeToken: !!attendeeToken,
    });

    // ---- Simplified ownership check since attendeeId comes from token ----
    const currentAttendee = await prisma.attendee.findUnique({
      where: { id: attendeeId, is_active: true },
      include: {
        event: true,
        profession: { include: { category: true } },
        goal: true,
      },
    });

    if (!currentAttendee) {
      logger.warn('Attendee not found:', attendeeId);
      sendError(
        res,
        'Attendee not found',
        [{ field: 'attendee', message: 'Attendee not found or inactive' }],
        404
      );
      return;
    }

    if (!currentAttendee.goals_category_id) {
      logger.warn('No goals category set:', attendeeId);
      sendError(
        res,
        'Goals category required',
        [
          {
            field: 'attendee',
            message:
              'Attendee must select a goals category before submitting answers',
          },
        ],
        400
      );
      return;
    }

    // ---- Validate questions belong to attendee's goals category ----
    const questionIds = Array.from(new Set(answers.map(a => a.questionId)));
    logger.info('Validating questions:', {
      questionIds,
      goalsCategoryId: currentAttendee.goals_category_id,
    });

    const validQuestions = await prisma.question.findMany({
      where: {
        id: { in: questionIds },
        goals_category_id: currentAttendee.goals_category_id,
        is_active: true,
      },
      select: { id: true },
    });

    const validSet = new Set(validQuestions.map(q => q.id));
    const invalid = questionIds.filter(id => !validSet.has(id));

    if (invalid.length > 0) {
      logger.warn('Invalid questions found:', invalid);
      sendError(
        res,
        'Invalid question(s)',
        invalid.map(qid => ({
          field: 'questionId',
          message: `Question ${qid} not in attendee's goals category`,
        })),
        400
      );
      return;
    }

    // ---- Replace-by-question transaction ----
    const byQuestion = new Map<string, typeof answers>();
    for (const a of answers) {
      const arr = byQuestion.get(a.questionId) ?? [];
      arr.push(a);
      byQuestion.set(a.questionId, arr);
    }

    const txs: any[] = [];
    let totalCreated = 0;

    for (const [qid, group] of byQuestion) {
      txs.push(
        prisma.attendeeAnswer.deleteMany({
          where: { attendee_id: attendeeId, question_id: qid },
        })
      );
      txs.push(
        prisma.attendeeAnswer.createMany({
          data: group.map(g => ({
            attendee_id: attendeeId,
            question_id: g.questionId,
            answer_option_id: g.answerOptionId ?? null,
            text_value: g.textValue ?? null,
            number_value: g.numberValue == null ? null : g.numberValue,
            date_value: g.dateValue ? new Date(g.dateValue) : null,
            rank: g.rank ?? null,
            weight: g.weight ?? null,
            is_active: true,
          })),
        })
      );
    }

    logger.info('Executing transaction with', txs.length, 'operations');
    const results = await prisma.$transaction(txs);

    for (const r of results) {
      if (typeof r?.count === 'number') totalCreated += r.count;
    }

    logger.info('Transaction completed. Created', totalCreated, 'answers');

    // ---- Reload answers to build AI payload ----
    const attendeeAnswers = await prisma.attendeeAnswer.findMany({
      where: { attendee_id: attendeeId, is_active: true },
      include: { question: true, answerOption: true },
    });

    const aiData: ProcessAttendeeRequest = {
      eventId: currentAttendee.event_id,
      attendee: {
        attendeeId,
        nickname: currentAttendee.nickname || 'Guest',
        profession: {
          name: currentAttendee.profession?.name,
          categoryName: currentAttendee.profession?.category?.category,
        },
        goalsCategory: { name: currentAttendee.goal?.name },
        answers: attendeeAnswers.map(ans => ({
          question: ans.question.question,
          questionType: String(ans.question.type) as QuestionType,
          answerLabel: ans.answerOption?.label ?? undefined,
          textValue: ans.text_value ?? undefined,
          numberValue:
            ans.number_value == null ? undefined : Number(ans.number_value),
          dateValue: ans.date_value ? ans.date_value.toISOString() : undefined,
          rank: ans.rank ?? undefined,
          weight: ans.weight == null ? undefined : Number(ans.weight),
        })),
      },
    };

    // ---- AI: Use singleton pattern for efficient processing ----
    let recommendations: RecommendationResponse[] = [];

    try {
      // Use singleton pattern - handles processing and recommendations in one call
      const aiRecommendations = await getRecommendationsWithSingleton(aiData);

      if (aiRecommendations?.recommendations?.length) {
        const top = aiRecommendations.recommendations
          .filter((r: RecommendationItem) => r.targetAttendeeId !== attendeeId)
          .slice(0, 3);

        logger.info('Got', top.length, 'AI recommendations');

        for (const rec of top) {
          const target = await getEnrichedAttendeeData(rec.targetAttendeeId);
          if (!target) continue;

          recommendations.push({
            targetAttendeeId: rec.targetAttendeeId,
            reasoning: rec.reasoning,
            targetAttendee: target,
          });

          // Persist recommendations
          await prisma.recommendation.upsert({
            where: {
              event_id_source_attendee_id_target_attendee_id: {
                event_id: currentAttendee.event_id,
                source_attendee_id: attendeeId,
                target_attendee_id: rec.targetAttendeeId,
              },
            },
            update: {
              score: rec.score,
              reasoning: rec.reasoning,
              is_active: true,
            },
            create: {
              event_id: currentAttendee.event_id,
              source_attendee_id: attendeeId,
              target_attendee_id: rec.targetAttendeeId,
              score: rec.score,
              reasoning: rec.reasoning,
              is_active: true,
            },
          });
        }
      }
    } catch (aiError) {
      logger.error('AI processing error:', aiError);
      // Continue without AI recommendations rather than failing completely
    }

    const payload: SubmitAnswersResponse = {
      answersProcessed: totalCreated,
      recommendations,
    };

    logger.info('Submit answers successful:', {
      answersProcessed: totalCreated,
      recommendationsCount: recommendations.length,
    });

    sendSuccess(res, 'Answers submitted successfully', payload, 200);
  } catch (error) {
    logger.error('Submit answers error:', error);
    sendError(
      res,
      'Failed to submit answers',
      [
        {
          field: 'server',
          message: 'An error occurred while submitting answers',
        },
      ],
      500
    );
  }
};

/**
 * GET /api/attendee/recommendations
 * Always triggers fresh AI recs; falls back to stored if AI is unavailable.
 * Returns score in the response, per your spec.
 * attendeeId comes from token, not params
 */
export const getRecommendations = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const attendeeToken = req.attendee;

    // Get attendeeId from token
    let attendeeId: string;

    if (attendeeToken) {
      attendeeId = attendeeToken.id;
    } else {
      logger.warn('No attendee ID found in token');
      sendError(
        res,
        'Authentication required',
        [{ field: 'auth', message: 'No valid attendee authentication found' }],
        401
      );
      return;
    }

    logger.info(
      'Get recommendations called with attendeeId from token:',
      attendeeId
    );

    // ---- Build AI payload from current data ----
    const currentAttendee = await prisma.attendee.findUnique({
      where: { id: attendeeId, is_active: true },
      include: {
        event: true,
        profession: { include: { category: true } },
        goal: true,
      },
    });

    if (!currentAttendee) {
      logger.warn('Attendee not found:', attendeeId);
      sendError(
        res,
        'Attendee not found',
        [{ field: 'attendee', message: 'Attendee not found or inactive' }],
        404
      );
      return;
    }

    const attendeeAnswers = await prisma.attendeeAnswer.findMany({
      where: { attendee_id: attendeeId, is_active: true },
      include: { question: true, answerOption: true },
    });

    const aiData: ProcessAttendeeRequest = {
      eventId: currentAttendee.event_id,
      attendee: {
        attendeeId,
        nickname: currentAttendee.nickname || 'Guest',
        profession: {
          name: currentAttendee.profession?.name,
          categoryName: currentAttendee.profession?.category?.category,
        },
        goalsCategory: { name: currentAttendee.goal?.name },
        answers: attendeeAnswers.map(ans => ({
          question: ans.question.question,
          questionType: String(ans.question.type) as QuestionType,
          answerLabel: ans.answerOption?.label ?? undefined,
          textValue: ans.text_value ?? undefined,
          numberValue:
            ans.number_value == null ? undefined : Number(ans.number_value),
          dateValue: ans.date_value ? ans.date_value.toISOString() : undefined,
          rank: ans.rank ?? undefined,
          weight: ans.weight == null ? undefined : Number(ans.weight),
        })),
      },
    };

    // ---- Always trigger fresh AI; fallback to stored if needed ----
    let recs: RecommendationResponse[] = [];

    try {
      const aiRecommendations = await getRecommendationsWithSingleton(aiData);

      if (aiRecommendations?.recommendations?.length) {
        logger.info(
          'Got',
          aiRecommendations.recommendations.length,
          'AI recommendations'
        );

        // Deactivate prior active recs for this source (optional hygiene)
        await prisma.recommendation.updateMany({
          where: {
            event_id: currentAttendee.event_id,
            source_attendee_id: attendeeId,
            is_active: true,
          },
          data: { is_active: false },
        });

        for (const rec of aiRecommendations.recommendations) {
          if (rec.targetAttendeeId === attendeeId) continue;

          // Store as active
          await prisma.recommendation.upsert({
            where: {
              event_id_source_attendee_id_target_attendee_id: {
                event_id: currentAttendee.event_id,
                source_attendee_id: attendeeId,
                target_attendee_id: rec.targetAttendeeId,
              },
            },
            update: {
              score: rec.score,
              reasoning: rec.reasoning,
              is_active: true,
            },
            create: {
              event_id: currentAttendee.event_id,
              source_attendee_id: attendeeId,
              target_attendee_id: rec.targetAttendeeId,
              score: rec.score,
              reasoning: rec.reasoning,
              is_active: true,
            },
          });

          const target = await getEnrichedAttendeeData(rec.targetAttendeeId);
          if (target) {
            recs.push({
              targetAttendeeId: rec.targetAttendeeId,
              score: rec.score,
              reasoning: rec.reasoning,
              targetAttendee: target,
            });
          }
        }
      } else {
        logger.info('No AI recommendations received, falling back to stored');
      }
    } catch (aiError) {
      logger.error(
        'AI service error, falling back to stored recommendations:',
        aiError
      );
    }

    // If no AI recs or AI failed, fallback to stored active recs
    if (recs.length === 0) {
      logger.info('Using stored recommendations as fallback');
      const stored = await prisma.recommendation.findMany({
        where: { source_attendee_id: attendeeId, is_active: true },
        orderBy: { score: 'desc' },
        take: 10,
      });

      for (const s of stored) {
        const target = await getEnrichedAttendeeData(s.target_attendee_id);
        if (target) {
          recs.push({
            targetAttendeeId: s.target_attendee_id,
            score: s.score == null ? undefined : Number(s.score),
            reasoning: s.reasoning,
            targetAttendee: target,
          });
        }
      }
    }

    const payload: GetRecommendationsResponse = {
      attendeeId,
      eventId: currentAttendee.event_id,
      recommendations: recs,
    };

    logger.info('Get recommendations successful:', {
      attendeeId,
      recommendationsCount: recs.length,
    });

    sendSuccess(res, 'Recommendations retrieved successfully', payload, 200);
  } catch (error) {
    logger.error('Get recommendations error:', error);
    sendError(
      res,
      'Failed to get recommendations',
      [
        {
          field: 'server',
          message: 'An error occurred while getting recommendations',
        },
      ],
      500
    );
  }
};

/**
 * Enrich an attendee with public-facing profile fields and shareable answers.
 * Ensures all optional fields use `undefined` (not `null`) and enums -> string.
 */
async function getEnrichedAttendeeData(targetAttendeeId: string) {
  const attendee = await prisma.attendee.findUnique({
    where: { id: targetAttendeeId },
    include: {
      profession: { include: { category: true } },
      goal: true,
      attendeeAnswers: {
        where: {
          is_active: true,
          question: { is_shareable: true },
        },
        include: {
          question: true,
          answerOption: true,
        },
      },
    },
  });

  if (!attendee) return null;

  return {
    nickname: attendee.nickname || '',
    profession: {
      name: attendee.profession?.name || '',
      categoryName: attendee.profession?.category?.category || '',
    },
    goalsCategory: {
      name: attendee.goal?.name || '',
    },
    // optional string fields → undefined (not null)
    linkedinUsername: attendee.linkedin_username ?? undefined,
    // required string in your API—fallback to empty string if null
    photoLink: attendee.photo_link ?? '',
    shareableAnswers: attendee.attendeeAnswers.map(ans => ({
      question: ans.question.question,
      // Prisma enum -> string for the outward API
      questionType: String(ans.question.type),
      // all optionals as undefined (never null)
      answerLabel: ans.answerOption?.label ?? undefined,
      textValue: ans.text_value ?? undefined,
      numberValue:
        ans.number_value == null ? undefined : Number(ans.number_value),
      dateValue: ans.date_value ? ans.date_value.toISOString() : undefined,
      rank: ans.rank ?? undefined,
    })),
  };
}

/**
 * Validate event by code for attendee registration
 */
export const validateEvent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { code } = req.params;
    const user = req.user; // Will be null for visitors

    // Find event by code
    const event = await prisma.event.findUnique({
      where: { code: code },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    // Check if event exists
    if (!event) {
      sendError(
        res,
        'Event not found',
        [{ field: 'code', message: 'Event with this code does not exist' }],
        404
      );
      return;
    }

    // Check if event is active
    if (!event.is_active) {
      sendError(
        res,
        'Event not available',
        [{ field: 'code', message: 'Event is no longer active' }],
        404
      );
      return;
    }

    // Check if event status allows registration (UPCOMING or ONGOING)
    if (!['UPCOMING', 'ONGOING'].includes(event.status)) {
      sendError(
        res,
        'Event not available for registration',
        [
          {
            field: 'code',
            message:
              'Event is not available for registration (must be upcoming or ongoing)',
          },
        ],
        400
      );
      return;
    }

    // Check if user is already registered for this event
    let isAlreadyIn = false;
    if (user?.id) {
      const existingAttendee = await prisma.attendee.findFirst({
        where: {
          event_id: event.id,
          user_id: user.id,
          is_active: true,
          deleted_at: null,
        },
      });
      isAlreadyIn = !!existingAttendee;
    }

    // Transform the data to match the API contract
    const responseData: ValidateEventResponse = {
      id: event.id,
      name: event.name,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
      detail: event.detail ?? undefined,
      photo_link: event.photo_link ?? undefined,
      location_name: event.location_name ?? undefined,
      location_address: event.location_address ?? undefined,
      location_link: event.location_link ?? undefined,
      latitude: event.latitude
        ? parseFloat(event.latitude.toString())
        : undefined,
      longitude: event.longitude
        ? parseFloat(event.longitude.toString())
        : undefined,
      link: event.link ?? undefined,
      status: event.status,
      current_participants: event.current_participants,
      code: event.code,
      creator: {
        id: event.creator.id,
        name: event.creator.name,
      },
      isAlreadyIn,
    };

    // If user is already registered, return error with event details
    if (isAlreadyIn) {
      const errorResponse = {
        success: false,
        message: 'Already registered for this event',
        data: responseData,
        errors: [
          {
            field: 'registration',
            message: 'You are already registered for this event',
          },
        ],
      };
      res.status(409).json(errorResponse);
      return;
    }

    sendSuccess(res, 'Event validated successfully', responseData, 200);
  } catch (error) {
    logger.error('Validate event error:', error);
    sendError(
      res,
      'Failed to validate event',
      [
        {
          field: 'server',
          message: 'An error occurred while validating the event',
        },
      ],
      500
    );
  }
};

// ---------- small utils ----------

function pruneDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map(v => pruneDeep(v))
      .filter(v => v !== undefined && v !== null) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, any>)
      .map(([k, v]) => [k, pruneDeep(v)])
      .filter(([, v]) => v !== undefined && v !== null);
    return Object.fromEntries(entries) as T;
  }
  return value;
}

// function pick<T extends Record<string, any>, K extends keyof T>(
//   obj: T,
//   keys: readonly K[]
// ): Pick<T, K> {
//   const out: Partial<T> = {};
//   for (const k of keys) {
//     if (Object.prototype.hasOwnProperty.call(obj, k)) {
//       out[k] = obj[k];
//     }
//   }
//   return out as Pick<T, K>;
// }

// ---------- domain → AI mapping ----------

/**
 * Map various representations to the AI’s expected QuestionType literal.
 * Supports numeric enums (0..n) and already-correct strings.
 */
function mapQuestionType(input: any): QuestionType {
  // Adjust the numeric mapping if your enum is different:
  const numericMap: Record<number, QuestionType> = {
    0: 'FREE_TEXT',
    1: 'NUMBER',
    2: 'DATE',
    3: 'SCALE',
    4: 'MULTI_SELECT',
  };

  if (typeof input === 'number' && numericMap[input]) {
    return numericMap[input];
  }
  if (typeof input === 'string') {
    const up = input.toUpperCase();
    if (
      up === 'FREE_TEXT' ||
      up === 'NUMBER' ||
      up === 'DATE' ||
      up === 'SCALE' ||
      up === 'MULTI_SELECT'
    ) {
      return up as QuestionType;
    }
  }
  // Last-resort coercion
  return String(input).toUpperCase() as QuestionType;
}

/**
 * Build a realistic nickname from whatever user info you may have.
 * The AI service requires a “realistic” looking name.
 */
function buildNickname(attendee: any): string {
  const nickname =
    attendee?.nickname ||
    attendee?.name ||
    attendee?.fullName ||
    attendee?.user?.name ||
    attendee?.user?.username ||
    (attendee?.user?.email ? attendee.user.email.split('@')[0] : '') ||
    attendee?.email?.split?.('@')?.[0];

  return (nickname && String(nickname).trim()) || 'Guest';
}

/**
 * Accepts a loose attendee object (possibly your domain model or the frontend payload)
 * and returns a strictly shaped AttendeePayload the AI service accepts.
 */
function toAiAttendeePayload(loose: any): AttendeePayload {
  // profession/category can arrive in a lot of shapes; pick only what the AI expects
  const profession = loose?.profession ?? loose?.job ?? {};
  const goals = loose?.goalsCategory ?? loose?.goal ?? {};

  const answersArray: any[] =
    loose?.answers ?? loose?.attendeeAnswers ?? loose?.responses ?? [];

  const answers = Array.isArray(answersArray)
    ? answersArray.map(ans => {
        // Many backends store different field names; normalize.
        const question =
          ans?.question?.question ?? ans?.questionText ?? ans?.question ?? '';

        const answerLabel =
          ans?.answerLabel ??
          ans?.optionLabel ??
          ans?.answerOption?.label ??
          undefined;

        // numbers can be strings; coerce where safe
        const numberValueRaw =
          ans?.numberValue ??
          ans?.valueNumber ??
          ans?.number_value ??
          undefined;

        const weightRaw = ans?.weight ?? ans?.answerWeight ?? undefined;

        const dateValueRaw =
          ans?.dateValue ?? ans?.valueDate ?? ans?.date_value ?? undefined;

        const textValueRaw =
          ans?.textValue ?? ans?.valueText ?? ans?.text_value ?? undefined;

        const rankRaw = ans?.rank ?? undefined;

        return pruneDeep({
          question,
          questionType: mapQuestionType(
            ans?.questionType ??
              ans?.type ??
              ans?.question?.type ??
              ans?.question_type
          ),
          answerLabel,
          rank: rankRaw === '' ? undefined : rankRaw,
          weight:
            weightRaw === '' || weightRaw === null || weightRaw === undefined
              ? undefined
              : Number(weightRaw),
          textValue: textValueRaw,
          numberValue:
            numberValueRaw === '' ||
            numberValueRaw === null ||
            numberValueRaw === undefined
              ? undefined
              : Number(numberValueRaw),
          dateValue:
            dateValueRaw instanceof Date
              ? dateValueRaw.toISOString()
              : dateValueRaw,
        });
      })
    : [];

  const attendeeId =
    loose?.attendeeId ?? loose?.id ?? loose?.attendee_id ?? loose?.uuid;

  const nickname = buildNickname(loose);

  const aiPayload: AttendeePayload = pruneDeep({
    attendeeId,
    nickname,
    profession: {
      name:
        profession?.name ??
        profession?.title ??
        profession?.profession_name ??
        undefined,
      categoryName:
        profession?.categoryName ??
        profession?.category?.category ??
        profession?.category ??
        profession?.industry ??
        undefined,
    },
    goalsCategory: {
      name: goals?.name ?? goals?.goal_name ?? goals?.categoryName ?? undefined,
    },
    answers,
  });

  return aiPayload;
}

/**
 * Converts an incoming request body to the strictly-typed ProcessAttendeeRequest
 * expected by the AI service. It:
 *   - accepts either a { eventId, attendee: {...} } shape, or
 *     a { eventId, ...attendeeFields } shape (loose)
 *   - strips unknown keys
 *   - ensures nickname is present
 */
function toProcessRequest(body: any): ProcessAttendeeRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Body must be an object');
  }

  // Support both { eventId, attendee: {...} } and { eventId, ...attendeeFields }
  const eventId = body.eventId ?? body.event_id ?? body?.event?.id;

  const attendeeSource = body.attendee ? body.attendee : body;

  const attendee = toAiAttendeePayload(attendeeSource);

  if (!eventId || !String(eventId).trim()) {
    throw new Error('eventId is required');
  }
  if (!attendee.attendeeId || !String(attendee.attendeeId).trim()) {
    throw new Error('attendee.attendeeId is required');
  }
  if (!attendee.nickname || !String(attendee.nickname).trim()) {
    throw new Error('attendee.nickname is required');
  }

  const req: ProcessAttendeeRequest = {
    eventId: String(eventId),
    attendee,
  };

  return pruneDeep(req);
}

// ---------- controllers ----------

/**
 * POST /attendees/process
 * Proxies the payload to AI /api/v1/ai/attendees/process after sanitizing.
 */
export async function processAttendeeController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const aiReq = toProcessRequest(req.body);
    const resp = await aiProcessAttendee(aiReq);
    res.status(200).json(resp);
  } catch (err: any) {
    // Prefer specific status codes where possible
    const message = err?.message || 'Failed to process attendee';
    // If the error looks like a validation issue, return 400
    if (/required/i.test(message) || /Body must be an object/i.test(message)) {
      return res.status(400).json({ status: 'error', message });
    }
    next(err);
  }
}

/**
 * POST /attendees/recommendations
 * Proxies the payload to AI /api/v1/ai/attendees/recommendations after sanitizing.
 */
export async function getAttendeeRecommendationsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const aiReq = toProcessRequest(req.body);
    const resp = await aiGetRecommendations(aiReq);
    res.status(200).json(resp);
  } catch (err: any) {
    const message = err?.message || 'Failed to get recommendations';
    if (/required/i.test(message) || /Body must be an object/i.test(message)) {
      return res.status(400).json({ status: 'error', message });
    }
    next(err);
  }
}

// ---------- optional: schema-guard middleware (if you want a quick check) ----------
// If you already have zod/celebrate/joi validators in attendee.validation.ts, keep using them.
// This minimal guard catches obvious client mistakes before we touch the AI service.

export function requireEventAndAttendee(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // This will throw if obviously broken.
    toProcessRequest(req.body);
    next();
  } catch (err: any) {
    return res
      .status(400)
      .json({ status: 'error', message: err?.message || 'Invalid payload' });
  }
}
