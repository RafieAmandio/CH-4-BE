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
  try {
    const supabase = getSupabaseClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error) {
      logger.error('Supabase token verification error:', error);
      return null;
    }

    return user;
  } catch (error) {
    logger.error('Supabase verification error:', error);
    return null;
  }
};

/**
 * Extract token from Authorization header
 */
export const extractSupabaseToken = (
  authHeader: string | undefined
): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};
