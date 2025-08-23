// ai.service.ts
// Adjust the import paths below if your project structure differs.
import { logger } from '../config/logger.js';
import { env } from '../config/environment.js';

/** ---------- AI DTOs (shared) ---------- **/

export interface AnswerForAI {
  // NOTE: use string, not Prisma enum, for cross-service compatibility
  question: string;
  questionType: string;
  answerLabel?: string;
  textValue?: string;
  numberValue?: number;
  dateValue?: string;
  rank?: number;
  weight?: number;
}

export interface AttendeeDataForAI {
  eventId: string;
  attendee: {
    attendeeId: string;
    userId?: string;
    userName: string;
    userEmail?: string;
    nickname?: string;
    linkedinUsername?: string;
    photoLink?: string;
    profession: { name: string; categoryName: string };
    goalsCategory: { name: string };
    answers: AnswerForAI[];
  };
}

export interface AIRecommendationResponse {
  eventId: string;
  recommendations: Array<{
    sourceAttendeeId: string;
    targetAttendeeId: string;
    score: number;
    reasoning: string;
  }>;
}

/** ---------- AI service calls ---------- **/

export const submitAttendeeDataToAI = async (
  attendeeData: AttendeeDataForAI
): Promise<void> => {
  try {
    const response = await fetch(
      `${env.AI_SERVICE_URL}/v1/ai/attendees/process`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.AI_SERVICE_TOKEN}`,
        },
        body: JSON.stringify(attendeeData),
      }
    );

    if (!response.ok) {
      throw new Error(
        `AI service process failed: ${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    // Fire-and-forget by design—log but do not throw
    logger.error('Failed to submit attendee data to AI service:', error);
  }
};

export const getAIRecommendations = async (
  attendeeData: AttendeeDataForAI
): Promise<AIRecommendationResponse | null> => {
  try {
    const response = await fetch(
      `${env.AI_SERVICE_URL}/v1/ai/attendees/recommendations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.AI_SERVICE_TOKEN}`,
        },
        body: JSON.stringify(attendeeData),
      }
    );

    if (!response.ok) {
      throw new Error(
        `AI service recommendations failed: ${response.status} ${response.statusText}`
      );
    }

    // Replace the body of getAIRecommendations() after the fetch() call succeeds
    const raw: unknown = await response.json();

    if (!isAIRecommendationResponse(raw)) {
      throw new Error('AI service: unexpected response shape');
    }

    const result: AIRecommendationResponse = raw; // narrowed by the type guard

    logger.info('Successfully received AI recommendations', {
      attendeeId: attendeeData.attendee.attendeeId,
      eventId: attendeeData.eventId,
      recommendationCount: result.recommendations.length,
    });

    return result;
  } catch (error) {
    logger.error('Failed to get AI recommendations:', error);
    return null;
  }
};

/**
 * Convenience helper: submit-for-training and request recommendations in parallel.
 */
export const processAttendeeWithAI = async (
  attendeeData: AttendeeDataForAI
): Promise<AIRecommendationResponse | null> => {
  try {
    const [, recs] = await Promise.all([
      submitAttendeeDataToAI(attendeeData),
      getAIRecommendations(attendeeData),
    ]);
    return recs;
  } catch (error) {
    logger.error('Failed to process attendee with AI:', error);
    return null;
  }
};

function isAIRecommendationResponse(
  data: unknown
): data is AIRecommendationResponse {
  if (!data || typeof data !== 'object') return false;
  const d = data as any;
  if (typeof d.eventId !== 'string' || !Array.isArray(d.recommendations))
    return false;
  return d.recommendations.every(
    (r: any) =>
      r &&
      typeof r.sourceAttendeeId === 'string' &&
      typeof r.targetAttendeeId === 'string' &&
      typeof r.reasoning === 'string' &&
      typeof r.score === 'number'
  );
}
