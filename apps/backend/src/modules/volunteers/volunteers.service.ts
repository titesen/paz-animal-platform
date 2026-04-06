/**
 * @file Volunteers Service
 * @description Business logic for volunteer management
 */

import { ConflictError, NotFoundError, ValidationError } from "../../common/types/errors";
import * as authRepository from "../auth/auth.repository";
import * as repository from "./volunteers.repository";
import type {
  AssignTagDTO,
  CreateVolunteerApplicationDTO,
  CreateVolunteerDTO,
  UpdateApplicationStatusDTO,
  UpdateVolunteerDTO,
} from "./volunteers.types";

// ===== VOLUNTEER APPLICATIONS =====

/**
 * Create a new volunteer application
 */
export async function createVolunteerApplication(data: CreateVolunteerApplicationDTO) {
  // Check if email already has an application
  const existing = await repository.findAllApplications({ limit: 1000 });
  const duplicate = existing.find((app) => app.email === data.email);

  if (duplicate && duplicate.status === "PENDING") {
    throw new ConflictError("You already have a pending application", "DUPLICATE_APPLICATION");
  }

  // Create application
  return repository.createVolunteerApplication({
    ...data,
    birthDate: new Date(data.birthDate),
  });
}

/**
 * Get all volunteer applications with optional filtering
 */
export async function getAllApplications(filters?: {
  status?: "PENDING" | "APPROVED" | "REJECTED";
  limit?: number;
  offset?: number;
}) {
  return repository.findAllApplications(filters);
}

/**
 * Get application by ID
 */
export async function getApplicationById(applicationId: string) {
  const application = await repository.findVolunteerApplicationById(applicationId);

  if (!application) {
    throw new NotFoundError("Application not found", "APPLICATION_NOT_FOUND");
  }

  return application;
}

/**
 * Update application status (approve/reject)
 */
export async function updateApplicationStatus(
  applicationId: string,
  data: UpdateApplicationStatusDTO,
) {
  const application = await repository.findVolunteerApplicationById(applicationId);

  if (!application) {
    throw new NotFoundError("Application not found", "APPLICATION_NOT_FOUND");
  }

  return repository.updateApplicationStatus(applicationId, data.status, data.adminNotes);
}

/**
 * Promote approved application to active volunteer
 * Creates a user account and volunteer record
 */
export async function promoteToVolunteer(applicationId: string, data: CreateVolunteerDTO) {
  const application = await repository.findVolunteerApplicationById(applicationId);

  if (!application) {
    throw new NotFoundError("Application not found", "APPLICATION_NOT_FOUND");
  }

  if (application.status !== "APPROVED") {
    throw new ValidationError("Application must be approved first", "APPLICATION_NOT_APPROVED", {
      status: ["Only approved applications can be promoted to volunteer"],
    });
  }

  // Check if user already exists with this email
  const existingUser = await authRepository.findUserByEmail(application.email);

  if (existingUser) {
    // Check if already a volunteer
    const existingVolunteer = await repository.findVolunteerByUserId(existingUser.userId);
    if (existingVolunteer) {
      throw new ConflictError("User is already a volunteer", "ALREADY_VOLUNTEER");
    }

    // Assign VOLUNTEER role to existing user
    await authRepository.assignRoleToUser(existingUser.userId, "VOLUNTEER");

    // Create volunteer record
    return repository.createVolunteer({
      userId: existingUser.userId,
      bio: data.bio,
      availability: data.availability,
    });
  }

  // Create new user account
  const newUser = await authRepository.createUser({
    firstName: application.firstName,
    lastName: application.lastName,
    email: application.email,
    phone: application.phone,
    docNumber: application.docNumber,
    docType: "DNI",
  });

  // Assign VOLUNTEER role
  await authRepository.assignRoleToUser(newUser.userId, "VOLUNTEER");

  // Create volunteer record
  return repository.createVolunteer({
    userId: newUser.userId,
    bio: data.bio,
    availability: data.availability,
  });
}

// ===== VOLUNTEER MANAGEMENT =====

/**
 * Get all active volunteers
 */
export async function getAllVolunteers() {
  return repository.findAllVolunteers();
}

/**
 * Get volunteer by ID with tags
 */
export async function getVolunteerById(volunteerId: string) {
  const volunteer = await repository.findVolunteerWithTags(volunteerId);

  if (!volunteer) {
    throw new NotFoundError("Volunteer not found", "VOLUNTEER_NOT_FOUND");
  }

  return volunteer;
}

/**
 * Get volunteer by user ID
 */
export async function getVolunteerByUserId(userId: string) {
  const volunteer = await repository.findVolunteerByUserId(userId);

  if (!volunteer) {
    throw new NotFoundError("Volunteer not found", "VOLUNTEER_NOT_FOUND");
  }

  return repository.findVolunteerWithTags(volunteer.volunteerId);
}

/**
 * Update volunteer information
 */
export async function updateVolunteer(volunteerId: string, data: UpdateVolunteerDTO) {
  const volunteer = await repository.findVolunteerById(volunteerId);

  if (!volunteer) {
    throw new NotFoundError("Volunteer not found", "VOLUNTEER_NOT_FOUND");
  }

  return repository.updateVolunteer(volunteerId, data);
}

/**
 * Soft delete volunteer
 */
export async function deleteVolunteer(volunteerId: string) {
  const volunteer = await repository.findVolunteerById(volunteerId);

  if (!volunteer) {
    throw new NotFoundError("Volunteer not found", "VOLUNTEER_NOT_FOUND");
  }

  return repository.deleteVolunteer(volunteerId);
}

// ===== TAG MANAGEMENT =====

/**
 * Assign a tag/role to volunteer
 */
export async function assignTag(volunteerId: string, data: AssignTagDTO) {
  const volunteer = await repository.findVolunteerById(volunteerId);

  if (!volunteer) {
    throw new NotFoundError("Volunteer not found", "VOLUNTEER_NOT_FOUND");
  }

  // Verify role exists
  const roles = await repository.findAllVolunteerRoles();
  const roleExists = roles.some((role) => role.roleId === data.roleId);

  if (!roleExists) {
    throw new NotFoundError("Volunteer role not found", "ROLE_NOT_FOUND");
  }

  return repository.assignVolunteerTag(volunteerId, data.roleId);
}

/**
 * Remove a tag/role from volunteer
 */
export async function removeTag(volunteerId: string, roleId: number) {
  const volunteer = await repository.findVolunteerById(volunteerId);

  if (!volunteer) {
    throw new NotFoundError("Volunteer not found", "VOLUNTEER_NOT_FOUND");
  }

  return repository.removeVolunteerTag(volunteerId, roleId);
}

/**
 * Get all available volunteer roles
 */
export async function getAllRoles() {
  return repository.findAllVolunteerRoles();
}
