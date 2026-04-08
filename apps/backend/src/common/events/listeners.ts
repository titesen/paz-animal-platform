/**
 * @file Domain Event Listeners
 * @description Registers handlers for domain events. Import once at startup.
 *
 * Side-effects (email, analytics, etc.) are wired here so that
 * the emitting services remain decoupled from consuming logic.
 */

import { logger } from "../../config/logger";
import { eventBus } from "./eventBus";

export function registerDomainEventListeners(): void {
  eventBus.on("user.registered", (payload) => {
    logger.info({ userId: payload.userId, email: payload.email }, "Event: user registered");
    // TODO: send welcome email when email integration is ready
  });

  eventBus.on("adoption.created", (payload) => {
    logger.info(
      { applicationId: payload.applicationId, petId: payload.petId },
      "Event: adoption application created",
    );
    // TODO: notify shelter admin
  });

  eventBus.on("adoption.statusChanged", (payload) => {
    logger.info(
      { adoptionId: payload.adoptionId, newStatus: payload.newStatus },
      "Event: adoption status changed",
    );
    // TODO: notify applicant about status change
  });

  eventBus.on("donation.created", (payload) => {
    logger.info(
      { donationId: payload.donationId, amount: payload.amount },
      "Event: monetary donation created",
    );
    // TODO: send donation receipt via email
  });

  eventBus.on("donation.inKindCreated", (payload) => {
    logger.info(
      { donorName: payload.donorName, description: payload.description },
      "Event: in-kind donation received",
    );
  });

  eventBus.on("volunteer.promoted", (payload) => {
    logger.info(
      { userId: payload.userId, applicationId: payload.applicationId },
      "Event: volunteer promoted",
    );
    // TODO: send volunteer welcome pack / onboarding email
  });

  logger.info("Domain event listeners registered");
}
