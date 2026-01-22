/**
 * @file Google OAuth Integration Client
 * @description Client for Google Identity Platform
 */

import { logger } from "../../config/logger";
import type { GoogleUserInfo } from "../../types";
import { ServiceUnavailableError } from "../../types/errors";

/**
 * Verify Google ID token and extract user info
 * @param idToken - Google ID token from client
 * @returns User information from Google
 */
export async function verifyGoogleIdToken(
  idToken: string,
): Promise<GoogleUserInfo> {
  // TODO: Implement Google OAuth client verification
  // Using google-auth-library package

  logger.info("Verifying Google ID token");

  throw new ServiceUnavailableError(
    "Google OAuth not yet implemented",
    "GOOGLE_OAUTH_NOT_IMPLEMENTED",
  );

  // Example implementation:
  // const { OAuth2Client } = require('google-auth-library');
  // const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  //
  // const ticket = await client.verifyIdToken({
  //   idToken,
  //   audience: env.GOOGLE_CLIENT_ID,
  // });
  //
  // const payload = ticket.getPayload();
  //
  // return {
  //   sub: payload.sub,
  //   email: payload.email,
  //   email_verified: payload.email_verified,
  //   name: payload.name,
  //   picture: payload.picture,
  // };
}
