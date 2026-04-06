/**
 * @file Adoptions Repository Interface
 * @description Contract for the adoptions data access layer
 */

import type { AdoptionApplication, NewAdoptionApplication } from "../../common/types";

export interface IAdoptionsRepository {
  findAdoptionById(adoptionId: string): Promise<AdoptionApplication | null>;
  createAdoptionApplication(data: NewAdoptionApplication): Promise<AdoptionApplication>;
  updateAdoptionStatus(adoptionId: string, status: string): Promise<AdoptionApplication | null>;
  findAdoptionsByUser(userId: string): Promise<AdoptionApplication[]>;
  findAllAdoptions(): Promise<AdoptionApplication[]>;
}
