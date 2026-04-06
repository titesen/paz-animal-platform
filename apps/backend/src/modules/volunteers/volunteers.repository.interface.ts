/**
 * @file Volunteers Repository Interface
 * @description Contract for the volunteers data access layer
 */

import type { Volunteer } from "../../common/types";
import type {
  volunteerApplications,
  volunteerRoles,
  volunteersVolunteerRoles,
} from "../../db/schema";

type VolunteerApplication = typeof volunteerApplications.$inferSelect;
type VolunteerRole = typeof volunteerRoles.$inferSelect;
type VolunteerVolunteerRole = typeof volunteersVolunteerRoles.$inferSelect;

export interface IVolunteersRepository {
  findVolunteerApplicationById(applicationId: string): Promise<VolunteerApplication | null>;
  findVolunteerByUserId(userId: string): Promise<Volunteer | null>;
  findVolunteerWithTags(volunteerId: string): Promise<
    | (Volunteer & {
        tags: { roleId: number; roleName: string; description: string | null; assignedAt: Date }[];
      })
    | null
  >;
  assignVolunteerTag(volunteerId: string, roleId: number): Promise<VolunteerVolunteerRole | null>;
  removeVolunteerTag(volunteerId: string, roleId: number): Promise<boolean>;
  findAllVolunteerRoles(): Promise<VolunteerRole[]>;
  createVolunteerApplication(data: {
    firstName: string;
    lastName: string;
    email: string;
    docNumber: string;
    phone: string;
    birthDate: Date;
    instagramHandle?: string;
    hasExperience: boolean;
    experienceDetails?: string;
    wasVolunteerBefore: boolean;
    motivation: string;
    availability: unknown;
  }): Promise<VolunteerApplication>;
  findAllApplications(filters?: {
    status?: "PENDING" | "APPROVED" | "REJECTED";
    limit?: number;
    offset?: number;
  }): Promise<VolunteerApplication[]>;
  updateApplicationStatus(
    applicationId: string,
    status: "PENDING" | "APPROVED" | "REJECTED",
    adminNotes?: string,
  ): Promise<VolunteerApplication | null>;
  createVolunteer(data: {
    userId: string;
    bio?: string;
    availability: unknown;
  }): Promise<Volunteer>;
  findAllVolunteers(): Promise<Volunteer[]>;
  findVolunteerById(volunteerId: string): Promise<Volunteer | null>;
  updateVolunteer(
    volunteerId: string,
    data: { bio?: string; availability?: unknown },
  ): Promise<Volunteer | null>;
  deleteVolunteer(volunteerId: string): Promise<Volunteer | null>;
}
