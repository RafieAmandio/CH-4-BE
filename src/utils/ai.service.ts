// ai.service.ts
// Adjust the import paths below if your project structure differs.
// import { logger } from '../config/logger.js';
// import { env } from '../config/environment.js';

/** ---------- AI DTOs (shared) ---------- **/

// ---------- Types that match the AI service docs ----------

export type QuestionType =
  | 'MULTI_SELECT'
  | 'FREE_TEXT'
  | 'NUMBER'
  | 'SCALE'
  | 'DATE';

export interface AttendeeAnswer {
  question: string;
  questionType: QuestionType;
  answerLabel?: string | null;
  rank?: number | null;
  weight?: number | null;
  textValue?: string | null;
  numberValue?: number | null;
  dateValue?: string | null;
}

export interface AttendeePayload {
  attendeeId: string;
  nickname: string; // required by AI service; must be "realistic"
  profession?: {
    name?: string;
    categoryName?: string;
  };
  goalsCategory?: {
    name?: string;
  };
  answers?: AttendeeAnswer[];
}

export interface ProcessAttendeeRequest {
  eventId: string;
  attendee: AttendeePayload;
}

export interface ProcessAttendeeResponse {
  message: string;
  status: 'success' | 'error';
}

export interface RecommendationItem {
  sourceAttendeeId: string;
  targetAttendeeId: string;
  score: number;
  reasoning: string;
}

export interface RecommendationsResponse {
  eventId: string;
  recommendations: RecommendationItem[];
}

// ---------- Singleton AI Service Manager ----------

interface PendingRequest {
  eventId: string;
  attendeeId: string;
  resolve: (value: RecommendationsResponse) => void;
  reject: (reason: any) => void;
  timestamp: number;
}

class AIServiceManager {
  private static instance: AIServiceManager;
  private processingQueue: Map<string, PendingRequest> = new Map();
  private processingEvents: Set<string> = new Set();
  private rateLimitDelay = 1000; // 1 second between AI calls
  private lastCallTime = 0;
  private cache = new Map<
    string,
    { data: RecommendationsResponse; timestamp: number }
  >();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): AIServiceManager {
    if (!AIServiceManager.instance) {
      AIServiceManager.instance = new AIServiceManager();
    }
    return AIServiceManager.instance;
  }

  /**
   * Get recommendations with singleton pattern - ensures only one AI call per event
   * and caches results to avoid duplicate calls
   */
  async getRecommendationsWithSingleton(
    request: ProcessAttendeeRequest
  ): Promise<RecommendationsResponse> {
    const cacheKey = `${request.eventId}:${request.attendee.attendeeId}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      log.info('Returning cached recommendations for:', cacheKey);
      return cached.data;
    }

    // Check if already processing for this event
    if (this.processingEvents.has(request.eventId)) {
      log.info(
        'Event already being processed, queuing request for:',
        request.eventId
      );
      return new Promise((resolve, reject) => {
        this.processingQueue.set(cacheKey, {
          eventId: request.eventId,
          attendeeId: request.attendee.attendeeId,
          resolve,
          reject,
          timestamp: Date.now(),
        });
      });
    }

    // Process this request
    this.processingEvents.add(request.eventId);

    try {
      // Rate limiting
      const now = Date.now();
      const timeSinceLastCall = now - this.lastCallTime;
      if (timeSinceLastCall < this.rateLimitDelay) {
        await new Promise(resolve =>
          globalThis.setTimeout(
            resolve,
            this.rateLimitDelay - timeSinceLastCall
          )
        );
      }

      log.info('Processing AI request for event:', request.eventId);

      // Process attendee data first
      await processAttendee(request);

      // Then get recommendations
      const recommendations = await getRecommendations(request);

      // Cache the result
      this.cache.set(cacheKey, {
        data: recommendations,
        timestamp: Date.now(),
      });

      // Resolve any pending requests for this event
      this.resolvePendingRequests(request.eventId, recommendations);

      this.lastCallTime = Date.now();
      return recommendations;
    } catch (error) {
      log.error('AI processing failed for event:', request.eventId, error);

      // Reject any pending requests for this event
      this.rejectPendingRequests(request.eventId, error);
      throw error;
    } finally {
      this.processingEvents.delete(request.eventId);
    }
  }

  private resolvePendingRequests(
    eventId: string,
    data: RecommendationsResponse
  ) {
    for (const [key, request] of this.processingQueue.entries()) {
      if (request.eventId === eventId) {
        request.resolve(data);
        this.processingQueue.delete(key);
      }
    }
  }

  private rejectPendingRequests(eventId: string, error: any) {
    for (const [key, request] of this.processingQueue.entries()) {
      if (request.eventId === eventId) {
        request.reject(error);
        this.processingQueue.delete(key);
      }
    }
  }

  /**
   * Clear old cache entries and pending requests
   */
  cleanup() {
    const now = Date.now();

    // Clear old cache entries
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTTL) {
        this.cache.delete(key);
      }
    }

    // Clear old pending requests (older than 30 seconds)
    for (const [key, request] of this.processingQueue.entries()) {
      if (now - request.timestamp > 30000) {
        request.reject(new Error('Request timeout'));
        this.processingQueue.delete(key);
      }
    }
  }
}

// ---------- Minimal logger (replace with your logger if you have one) ----------

const log = {
  info: (..._args: any[]) => {
    // console.log('[ai.service]', ...args);
  },
  warn: (..._args: any[]) => {
    // console.warn('[ai.service]', ...args);
  },
  error: (..._args: any[]) => {
    // console.error('[ai.service]', ...args);
  },
};

// ---------- Env + URL helpers ----------

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) {
    throw new Error(`${name} is not set`);
  }
  return v.trim();
}

/**
 * Ensure the base ends with /api (the AI endpoints are /api/v1/...)
 * If the provided base already ends with /api or /api/, keep it.
 */
function normalizeBaseUrl(rawBase: string): string {
  const base = rawBase.replace(/\/+$/, '');
  if (base.endsWith('/api')) return base;
  return `${base}/api`;
}

function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/+$/, '');
  const p = path.replace(/^\/+/, '');
  return `${b}/${p}`;
}

// ---------- Payload helpers ----------

/** Remove keys whose value is undefined or null (shallow). */
// function prune<T extends Record<string, any>>(obj: T): T {
//   return Object.fromEntries(
//     Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)
//   ) as T;
// }

/** Deeply remove undefined/null values from objects/arrays. */
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

/**
 * Light validation/normalization to catch obvious mistakes before hitting the AI API.
 * Throws with a clear message if critical fields are missing.
 */
function normalizeProcessPayload(
  input: ProcessAttendeeRequest
): ProcessAttendeeRequest {
  if (!input || typeof input !== 'object') {
    throw new Error('AI payload must be an object');
  }
  if (!input.eventId || !String(input.eventId).trim()) {
    throw new Error('eventId is required');
  }
  if (!input.attendee) {
    throw new Error('attendee object is required');
  }
  if (!input.attendee.attendeeId || !String(input.attendee.attendeeId).trim()) {
    throw new Error('attendee.attendeeId is required');
  }
  if (!input.attendee.nickname || !String(input.attendee.nickname).trim()) {
    throw new Error('attendee.nickname is required (must be a realistic name)');
  }

  // Strip null/undefined across the payload to avoid strict schema rejections.
  return pruneDeep(input);
}

// ---------- HTTP core ----------

async function postJson<TResp>(
  url: string,
  body: unknown,
  token: string
): Promise<TResp> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  // Always read the body once; we’ll try to parse JSON, but keep text for debugging.
  const rawText = await res.text();

  if (!res.ok) {
    let parsed: any = undefined;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // not json; ignore
    }
    log.error(
      `AI service error: ${res.status} ${res.statusText} for ${url}`,
      parsed ?? rawText
    );
    throw new Error(
      `AI service request failed: ${res.status} ${res.statusText}`
    );
  }

  try {
    return JSON.parse(rawText) as TResp;
  } catch {
    // Successful status but not JSON (unexpected)
    log.error(`AI service returned non-JSON for ${url}:`, rawText);
    throw new Error('AI service returned non-JSON response');
  }
}

// ---------- Public API ----------

const AI_SERVICE_URL = normalizeBaseUrl(requiredEnv('AI_SERVICE_URL'));
const AI_SERVICE_TOKEN = requiredEnv('AI_SERVICE_TOKEN');

const PROCESS_PATH = '/v1/ai/attendees/process';
const RECS_PATH = '/v1/ai/attendees/recommendations';

const PROCESS_URL = joinUrl(AI_SERVICE_URL, PROCESS_PATH);
const RECS_URL = joinUrl(AI_SERVICE_URL, RECS_PATH);

/**
 * Submit attendee data for processing/training.
 * Mirrors POST /api/v1/ai/attendees/process
 */
export async function processAttendee(
  payload: ProcessAttendeeRequest
): Promise<ProcessAttendeeResponse> {
  const clean = normalizeProcessPayload(payload);
  return postJson<ProcessAttendeeResponse>(
    PROCESS_URL,
    clean,
    AI_SERVICE_TOKEN
  );
}

/**
 * Get AI-generated recommendations for an attendee.
 * Mirrors POST /api/v1/ai/attendees/recommendations
 */
export async function getRecommendations(
  payload: ProcessAttendeeRequest // same schema as /process
): Promise<RecommendationsResponse> {
  const clean = normalizeProcessPayload(payload);
  return postJson<RecommendationsResponse>(RECS_URL, clean, AI_SERVICE_TOKEN);
}

/**
 * Get recommendations using singleton pattern - ensures efficient handling
 * of concurrent requests and proper caching
 */
export async function getRecommendationsWithSingleton(
  payload: ProcessAttendeeRequest
): Promise<RecommendationsResponse> {
  return AIServiceManager.getInstance().getRecommendationsWithSingleton(
    payload
  );
}

// ---------- Cleanup timer ----------

// Clean up old cache entries and pending requests every 5 minutes
globalThis.setInterval(
  () => {
    AIServiceManager.getInstance().cleanup();
  },
  5 * 60 * 1000
);

// ---------- Optional: tiny smoke test helper (manual) ----------
// Run with: node -e "import('./ai.service.js').then(m=>m.__smoke && m.__smoke())"
// Not exported in typings; safe to ignore in prod.

export async function __smoke() {
  try {
    const sample: ProcessAttendeeRequest = {
      eventId: '550e8400-e29b-41d4-a716-446655440000',
      attendee: {
        attendeeId: '123e4567-e89b-12d3-a456-426614174000',
        nickname: 'Alice Johnson',
        profession: { name: 'Software Engineer', categoryName: 'Technology' },
        goalsCategory: { name: 'Career Development' },
        answers: [
          {
            question: 'What are your primary career goals?',
            questionType: 'MULTI_SELECT',
            answerLabel: 'Learn new technologies',
          },
          {
            question: 'What are your primary career goals?',
            questionType: 'MULTI_SELECT',
            answerLabel: 'Network with peers',
            weight: 0.9,
          },
          {
            question: 'How many years of experience do you have?',
            questionType: 'NUMBER',
            numberValue: 5,
          },
          {
            question: 'Describe your ideal collaboration style',
            questionType: 'FREE_TEXT',
            textValue:
              'I prefer structured communication with clear goals and regular check-ins.',
          },
          {
            question: 'Rate your interest in leadership roles',
            questionType: 'SCALE',
            numberValue: 8,
          },
        ],
      },
    };

    log.info('PROCESS start');
    const proc = await processAttendee(sample);
    log.info('PROCESS ok:', proc);

    log.info('RECS start');
    const recs = await getRecommendations(sample);
    log.info('RECS ok:', recs);
  } catch (err) {
    log.error('Smoke test failed:', err);
  }
}
