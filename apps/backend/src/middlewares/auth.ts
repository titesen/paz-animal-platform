/**
 * @file Authentication & Authorization Middleware
 * @description JWT verification and role-based access control (RBAC)
 */

import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { db } from "../db";
import { volunteers, volunteersVolunteerRoles, volunteerRoles } from "../db/schema";
import type { AuthenticatedRequest, JWTPayload } from "../types";
import { ForbiddenError, UnauthorizedError } from "../types/errors";

/**
 * Verifies JWT token and attaches user to request
 * Usage: Apply to protected routes that require authentication
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or invalid authorization header");
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;

    // Attach user info to request for downstream use
    (req as AuthenticatedRequest).user = {
      userId: decoded.userId,
      email: decoded.email,
      roles: decoded.roles,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError("Invalid token"));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError("Token expired"));
    } else {
      next(error);
    }
  }
}

/**
 * Optional authentication - doesn't fail if no token provided
 * Useful for endpoints that work differently for authenticated vs anonymous users
 */
export function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // No token provided - continue as anonymous
      next();
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;

    (req as AuthenticatedRequest).user = {
      userId: decoded.userId,
      email: decoded.email,
      roles: decoded.roles,
    };

    next();
  } catch (error) {
    // Invalid token - continue as anonymous (don't throw error)
    next();
  }
}

/**
 * Require specific roles to access a route
 * Must be used AFTER authenticate middleware
 * @param allowedRoles - Array of role names that can access this route
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const hasRole = authReq.user.roles.some((role) =>
      allowedRoles.includes(role),
    );

    if (!hasRole) {
      throw new ForbiddenError(
        `Access denied. Required roles: ${allowedRoles.join(" or ")}`,
      );
    }

    next();
  };
}

/**
 * Require at least one of the specified roles
 * Alias for requireRole for better semantic clarity
 */
export const requireAnyRole = requireRole;

/**
 * Require ALL specified roles
 * User must have every role in the list
 */
export function requireAllRoles(...requiredRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const hasAllRoles = requiredRoles.every((role) =>
      authReq.user.roles.includes(role),
    );

    if (!hasAllRoles) {
      throw new ForbiddenError(
        `Access denied. Required all roles: ${requiredRoles.join(", ")}`,
      );
    }

    next();
  };
}

/**
 * Check if user owns the resource
 * Useful for endpoints like "update own profile" or "delete own comment"
 * @param getUserIdFromRequest - Function to extract resource owner ID from request
 */
export function requireOwnership(
  getUserIdFromRequest: (req: Request) => string,
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const resourceOwnerId = getUserIdFromRequest(req);

    // Admins can bypass ownership check
    if (authReq.user.roles.includes("ADMIN")) {
      next();
      return;
    }

    if (authReq.user.userId !== resourceOwnerId) {
      throw new ForbiddenError("You can only modify your own resources");
    }

    next();
  };
}

/**
 * Require volunteer to have specific tag(s)
 * Must be used AFTER authenticate and requireRole('VOLUNTEER') middlewares
 * @param requiredTags - Array of volunteer role names (tags) required
 * @example requireVolunteerTag('CONTENT_MANAGER', 'EVENT_ORGANIZER')
 */
export function requireVolunteerTag(...requiredTags: string[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;

      if (!authReq.user) {
        throw new UnauthorizedError("Authentication required");
      }

      // Admins bypass tag checks
      if (authReq.user.roles.includes("ADMIN")) {
        next();
        return;
      }

      // Get volunteer record for this user
      const volunteer = await db
        .select()
        .from(volunteers)
        .where(eq(volunteers.userId, authReq.user.userId))
        .limit(1);

      if (!volunteer.length) {
        throw new ForbiddenError("You must be a registered volunteer to access this resource");
      }

      // Get volunteer's assigned tags/roles
      const volunteerTags = await db
        .select({
          roleName: volunteerRoles.name,
        })
        .from(volunteersVolunteerRoles)
        .innerJoin(
          volunteerRoles,
          eq(volunteersVolunteerRoles.roleId, volunteerRoles.roleId),
        )
        .where(eq(volunteersVolunteerRoles.volunteerId, volunteer[0].volunteerId));

      const volunteerTagNames = volunteerTags.map((t) => t.roleName);

      // Check if volunteer has at least one required tag
      const hasRequiredTag = requiredTags.some((tag) =>
        volunteerTagNames.includes(tag),
      );

      if (!hasRequiredTag) {
        throw new ForbiddenError(
          `Access denied. Required volunteer tags: ${requiredTags.join(" or ")}`,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
