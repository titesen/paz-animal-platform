/**
 * @file Pets Repository Interface
 * @description Contract for the pets data access layer
 */

import type { NewPet, Pet } from "../../common/types";
import type { lostPetAlerts } from "../../db/schema";

type LostPetAlert = typeof lostPetAlerts.$inferSelect;

export interface IPetsRepository {
  findPetById(petId: string): Promise<Pet | null>;
  findPets(filters: {
    page: number;
    limit: number;
    status?: string;
    sex?: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
  }): Promise<{ pets: Pet[]; total: number }>;
  createPet(petData: NewPet): Promise<Pet>;
  updatePet(petId: string, petData: Partial<NewPet>): Promise<Pet | null>;
  softDeletePet(petId: string): Promise<void>;
  updatePetStatus(petId: string, status: string): Promise<void>;
  findPetsByOwner(ownerId: string): Promise<Pet[]>;
  findActiveLostPetAlerts(): Promise<LostPetAlert[]>;
  findLostPetAlertById(alertId: string): Promise<LostPetAlert | null>;
  createLostPetAlert(data: {
    petId: string;
    lastSeenZone: string;
    contactPhone: string;
    message?: string;
    isActive: boolean;
  }): Promise<LostPetAlert>;
  resolveLostPetAlert(alertId: string): Promise<void>;
}
