import { Response, NextFunction, Request } from 'express';
import { extractTokenFromHeader, verifyToken } from '../utils/token.js';
import { sendError } from '../utils/response.js';
import prisma from '../config/database.js';
import { AuthRequest } from '../types/index.js';
import { logger } from '../config/logger.js';
import {
  verifySupabaseToken,
  extractSupabaseToken,
} from '../utils/supabase.js';

export type AuthType = 'USER' | 'ATTENDEE' | 'EMPTY';

/** Resolve attendeeId from the request if present */
function getAttendeeIdFromRequest(req: Request): string | undefined {
  const fromParams = (req.params as any)?.attendeeId;
  const fromBody = (req.body as any)?.attendeeId;
  const fromQuery =
    typeof (req.query as any)?.attendeeId === 'string'
      ? (req.query as any).attendeeId
      : undefined;
  return fromParams ?? fromBody ?? fromQuery ?? undefined;
}

/**
 * Flexible authentication middleware
 * - allowedTypes is an OR (any matching type grants access)
 * - If ATTENDEE is required *and* USER is not allowed, a USER token must be tied to an attendeeId (token/route) owned by that user.
 */
export const authenticate = (allowedTypes: AuthType[]) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = extractTokenFromHeader(authHeader);

      // No token case
      if (!token) {
        if (allowedTypes.includes('EMPTY')) {
          return next();
        }
        return sendError(
          res,
          'Authentication required',
          [{ field: 'token', message: 'No token provided' }],
          401
        );
      }

      const payload = verifyToken(token);
      if (!payload) {
        if (allowedTypes.includes('EMPTY')) {
          return next();
        }
        return sendError(
          res,
          'Authentication failed',
          [{ field: 'token', message: 'Invalid or expired token' }],
          401
        );
      }

      const wantsUser = allowedTypes.includes('USER');
      const wantsAttendee = allowedTypes.includes('ATTENDEE');
      const attendeeOnly = wantsAttendee && !wantsUser; // route requires attendee role specifically

      // ----- USER token branch (payload has email) -----
      if (payload.email) {
        const user = await prisma.user.findUnique({
          where: { id: payload.id },
        });
        if (!user) {
          return sendError(
            res,
            'Authentication failed',
            [{ field: 'token', message: 'User not found' }],
            401
          );
        }
        req.user = user;

        // If the route *requires* attendee role, or allows it, try to attach attendee
        if (wantsAttendee) {
          const resolvedAttendeeId =
            (payload.attendeeId as string | undefined) ??
            getAttendeeIdFromRequest(req);

          if (resolvedAttendeeId) {
            const attendee = await prisma.attendee.findFirst({
              where: {
                id: resolvedAttendeeId,
                user_id: user.id,
                is_active: true,
              },
            });
            if (attendee) {
              req.attendee = attendee;
            }
          }

          // If it’s attendee-only and we didn’t attach an attendee, block
          if (attendeeOnly && !req.attendee) {
            return sendError(
              res,
              'Forbidden',
              [
                {
                  field: 'attendeeId',
                  message:
                    'Attendee role required. Provide an attendeeId (in token, path, body, or query) that belongs to this user.',
                },
              ],
              403
            );
          }
        }

        // If the route allows USER (alone or in combination), we’re good
        if (wantsUser || (wantsAttendee && req.attendee)) {
          return next();
        }

        // USER not allowed and no attendee attached (or route requires attendee)
        return sendError(
          res,
          'Authentication failed',
          [
            {
              field: 'token',
              message: 'User token not allowed for this endpoint',
            },
          ],
          403
        );
      }

      // ----- ATTENDEE token branch (no email) -----
      if (!wantsAttendee) {
        return sendError(
          res,
          'Authentication failed',
          [
            {
              field: 'token',
              message: 'Attendee token not allowed for this endpoint',
            },
          ],
          403
        );
      }

      const attendeeId = payload.attendeeId as string | undefined;
      if (!attendeeId) {
        return sendError(
          res,
          'Authentication failed',
          [{ field: 'token', message: 'Attendee token missing attendeeId' }],
          401
        );
      }

      const attendee = await prisma.attendee.findFirst({
        where: { id: attendeeId, is_active: true },
      });
      if (!attendee) {
        return sendError(
          res,
          'Authentication failed',
          [{ field: 'token', message: 'Attendee not found or inactive' }],
          401
        );
      }

      req.attendee = attendee;
      return next();
    } catch (error) {
      logger.error('Authentication error:', error);
      return sendError(
        res,
        'Authentication error',
        [{ field: 'auth', message: 'An error occurred during authentication' }],
        500
      );
    }
  };
};

/**
 * Supabase authentication middleware
 * Verifies Supabase token and attaches Supabase user data to request
 */
export const authenticateSupabase = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const startTime = Date.now();
  logger.info('=== SUPABASE AUTHENTICATION MIDDLEWARE STARTED ===');

  try {
    // Log request details
    logger.info('Supabase auth middleware request details:', {
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
      hasAuthHeader: !!req.headers.authorization,
      authHeaderFormat: req.headers.authorization
        ? req.headers.authorization.startsWith('Bearer ')
          ? 'Bearer format'
          : 'Non-Bearer format'
        : 'No header',
      timestamp: new Date().toISOString(),
    });

    // Extract token from Authorization header
    const token = extractSupabaseToken(req.headers.authorization);

    logger.info('Token extraction result:', {
      hasToken: !!extractSupabaseToken(req.headers.authorization),
      tokenLength: token ? token.length : 0,
      tokenPrefix: token ? token.substring(0, 10) + '...' : 'N/A',
    });

    if (!token) {
      logger.warn('Authentication failed: No Supabase token provided', {
        authHeader: req.headers.authorization
          ? 'Present but invalid format'
          : 'Missing',
      });
      sendError(
        res,
        'Authentication required',
        [{ field: 'authorization', message: 'Supabase token is required' }],
        401
      );
      return;
    }

    logger.info('Verifying Supabase token...');

    // Verify the Supabase token
    const supabaseUser = await verifySupabaseToken(token);

    logger.info('Token verification result:', {
      isValid: !!supabaseUser,
      userId: supabaseUser?.id,
      email: supabaseUser?.email,
      provider: supabaseUser?.app_metadata?.provider,
      role: supabaseUser?.role,
      emailConfirmed: supabaseUser?.email_confirmed_at ? true : false,
      phoneConfirmed: supabaseUser?.phone_confirmed_at ? true : false,
      lastSignIn: supabaseUser?.last_sign_in_at,
      userMetadataKeys: supabaseUser?.user_metadata
        ? Object.keys(supabaseUser.user_metadata)
        : [],
      appMetadataKeys: supabaseUser?.app_metadata
        ? Object.keys(supabaseUser.app_metadata)
        : [],
    });

    if (!supabaseUser || !supabaseUser.email) {
      logger.warn(
        'Authentication failed: Invalid Supabase token or missing email',
        {
          hasUser: !!supabaseUser,
          hasEmail: supabaseUser?.email ? true : false,
          tokenLength: token.length,
          tokenPrefix: token.substring(0, 10) + '...',
        }
      );
      sendError(
        res,
        'Authentication failed',
        [
          {
            field: 'token',
            message: 'Invalid Supabase token or missing email',
          },
        ],
        401
      );
      return;
    }

    logger.info(
      'Supabase user authenticated successfully, attaching to request:',
      {
        userId: supabaseUser.id,
        email: supabaseUser.email,
      }
    );

    // Attach Supabase user data to request
    req.supabaseUser = supabaseUser;

    const processingTime = Date.now() - startTime;
    logger.info('Supabase authentication middleware completed successfully:', {
      userId: supabaseUser.id,
      processingTimeMs: processingTime,
    });

    logger.info('=== SUPABASE AUTHENTICATION MIDDLEWARE COMPLETED ===');
    next();
  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error('Supabase authentication middleware failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      processingTimeMs: processingTime,
      hasToken: !!extractSupabaseToken(req.headers.authorization),
      requestUrl: req.url,
      requestMethod: req.method,
    });

    sendError(
      res,
      'Authentication error',
      [
        {
          field: 'auth',
          message: 'An error occurred during Supabase authentication',
        },
      ],
      500
    );

    logger.info('=== SUPABASE AUTHENTICATION MIDDLEWARE FAILED ===');
  }
};
