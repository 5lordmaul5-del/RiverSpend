import { createClient } from '@supabase/supabase-js';

export function createRiverAuth({ issuerUrl, publishableKey }) {
  if (!issuerUrl || !publishableKey) {
    throw new Error('RiverAuth requires an issuer URL and publishable key');
  }

  const client = createClient(issuerUrl, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return {
    async verifyBearerToken(authorizationHeader) {
      const match = /^Bearer ([A-Za-z0-9._~-]+)$/.exec(authorizationHeader || '');
      if (!match) return null;

      // Ask the configured issuer to verify the access token and resolve its user.
      // Never trust user_metadata or claims supplied by the browser as authorization.
      const { data, error } = await client.auth.getUser(match[1]);
      if (error || !data?.user?.id) return null;

      return Object.freeze({
        subject: data.user.id,
        issuer: issuerUrl,
      });
    },
  };
}
