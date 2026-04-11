/**
 * @file Google OAuth Integration Client
 * @description Client for Google Identity Platform
 */

import { OAuth2Client } from "google-auth-library";
import { env } from "../../config/env";
import { logger } from "../../config/logger";
import type { GoogleUserInfo } from "../../common/types";
import { BadRequestError, ServiceUnavailableError } from "../../common/errors";

const client = env.GOOGLE_CLIENT_ID ? new OAuth2Client(env.GOOGLE_CLIENT_ID) : null;

/**
 * Verify Google ID token and extract user info
 * @param idToken - Google ID token from client
 * @returns User information from Google
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleUserInfo> {
  if (!client || !env.GOOGLE_CLIENT_ID) {
    throw new ServiceUnavailableError(
      "Google OAuth is not configured",
      "GOOGLE_OAUTH_NOT_CONFIGURED",
    );
  }

  logger.info("Verifying Google ID token");

  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.email) {
    throw new BadRequestError("Invalid Google ID token", "INVALID_GOOGLE_TOKEN");
  }

  return {
    sub: payload.sub!,
    email: payload.email,
    email_verified: payload.email_verified ?? false,
    name: payload.name ?? payload.email.split("@")[0],
    picture: payload.picture,
  };
}
