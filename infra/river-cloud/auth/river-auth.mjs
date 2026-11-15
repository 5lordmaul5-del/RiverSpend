const USER_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createRiverAuth({ issuerUrl, publishableKey }) {
  if (!issuerUrl || !publishableKey) {
    throw new Error('RiverAuth requires an issuer URL and publishable key');
  }

  const userEndpoint = new URL('/auth/v1/user', issuerUrl);

  return {
    async verifyBearerToken(authorizationHeader) {
      const match = /^Bearer ([A-Za-z0-9._~-]+)$/.exec(authorizationHeader || '');
      if (!match) return null;

      let response;
      try {
        response = await fetch(userEndpoint, {
          method: 'GET',
          headers: {
            apikey: publishableKey,
            authorization: `Bearer ${match[1]}`,
            accept: 'application/json',
          },
          signal: AbortSignal.timeout(5000),
        });
      } catch {
        const error = new Error('identity_provider_unavailable');
        error.status = 503;
        throw error;
      }

      if (response.status === 401 || response.status === 403) return null;
      if (!response.ok) {
        const error = new Error('identity_provider_unavailable');
        error.status = 503;
        throw error;
      }

      const user = await response.json();
      if (typeof user?.id !== 'string' || !USER_ID_PATTERN.test(user.id)) return null;

      // Only the identity issuer's verified user ID becomes the RiverCloud subject.
      // Never trust user_metadata or browser-supplied claims for authorization.
      return Object.freeze({
        subject: user.id,
        issuer: userEndpoint.origin,
      });
    },
  };
}
