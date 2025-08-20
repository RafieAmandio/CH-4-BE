import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/environment.js';
import { logger } from '../config/logger.js';

/**
 * Supabase client instance
 */
let supabaseClient: SupabaseClient | null = null;

/**
 * Initialize Supabase client
 */
export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    supabaseClient = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return supabaseClient;
};

/**
 * Verify Supabase token and get user data
 */
export const verifySupabaseToken = async (token: string) => {
  const startTime = Date.now();
  logger.info('=== SUPABASE TOKEN VERIFICATION STARTED ===');

  try {
    logger.info('Verifying Supabase token:', {
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 20) + '...',
      timestamp: new Date().toISOString(),
    });

    const supabase = getSupabaseClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    const processingTime = Date.now() - startTime;

    if (error) {
      logger.warn('Supabase token verification failed with error:', {
        error: error.message,
        errorCode: error.status,
        processingTimeMs: processingTime,
      });
      return null;
    }

    if (!user) {
      logger.warn('Supabase token verification failed: No user returned', {
        processingTimeMs: processingTime,
      });
      return null;
    }

    logger.info('Supabase token verification successful:', {
      userId: user.id,
      email: user.email,
      provider: user.app_metadata?.provider,
      role: user.role,
      emailConfirmed: user.email_confirmed_at ? true : false,
      phoneConfirmed: user.phone_confirmed_at ? true : false,
      lastSignIn: user.last_sign_in_at,
      createdAt: user.created_at,
      processingTimeMs: processingTime,
    });

    logger.info('=== SUPABASE TOKEN VERIFICATION COMPLETED ===');
    return user;
  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error('Supabase verification error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      tokenLength: token.length,
      processingTimeMs: processingTime,
    });
    logger.info('=== SUPABASE TOKEN VERIFICATION FAILED ===');
    return null;
  }
};

/**
 * Extract token from Authorization header
 */
export const extractSupabaseToken = (
  authHeader: string | undefined
): string | null => {
  logger.info('Extracting Supabase token from authorization header:', {
    hasHeader: !!authHeader,
    headerLength: authHeader?.length || 0,
    startsWithBearer: authHeader?.startsWith('Bearer ') || false,
    headerPrefix: authHeader ? authHeader.substring(0, 20) + '...' : 'N/A',
  });

  if (!authHeader) {
    logger.warn('Token extraction failed: No authorization header');
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    logger.warn('Token extraction failed: Invalid format (not Bearer)', {
      receivedHeader: authHeader.substring(0, 20) + '...',
    });
    return null;
  }

  const token = parts[1];

  logger.info('Token extracted successfully:', {
    tokenLength: token.length,
    tokenPrefix: token.substring(0, 20) + '...',
  });

  return token;
};
