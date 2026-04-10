/**
 * @file Domain Event Bus
 * @description Typed EventEmitter for inter-module communication.
 *
 * Modules emit domain events after completing key operations.
 * Listeners handle side-effects (notifications, logging, analytics)
 * without coupling the emitting module to the consuming one.
 */

import { EventEmitter } from "node:events";
import { logger } from "../../config/logger";

// ===== DOMAIN EVENT TYPES =====

export interface UserRegisteredEvent {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AdoptionCreatedEvent {
  applicationId: string;
  clientId: string;
  petId: string;
}

export interface AdoptionStatusChangedEvent {
  adoptionId: string;
  previousStatus: string;
  newStatus: string;
}

export interface DonationCreatedEvent {
  donationId: string;
  userId: string | null;
  amount: string;
  currency: string;
}

export interface InKindDonationCreatedEvent {
  donorName: string;
  description: string;
  receivedById: string;
}

export interface VolunteerPromotedEvent {
  userId: string;
  applicationId: string;
}

// ===== EVENT MAP =====

export interface DomainEventMap {
  "user.registered": UserRegisteredEvent;
  "adoption.created": AdoptionCreatedEvent;
  "adoption.statusChanged": AdoptionStatusChangedEvent;
  "donation.created": DonationCreatedEvent;
  "donation.inKindCreated": InKindDonationCreatedEvent;
  "volunteer.promoted": VolunteerPromotedEvent;
}

export type DomainEventName = keyof DomainEventMap;

// ===== TYPED EVENT BUS =====

class DomainEventBus {
  private emitter = new EventEmitter();

  constructor() {
    // Prevent memory-leak warnings for many listeners
    this.emitter.setMaxListeners(20);
  }

  emit<E extends DomainEventName>(event: E, payload: DomainEventMap[E]): void {
    logger.debug({ event, payload }, "Domain event emitted");
    this.emitter.emit(event, payload);
  }

  on<E extends DomainEventName>(
    event: E,
    handler: (payload: DomainEventMap[E]) => void | Promise<void>,
  ): void {
    this.emitter.on(event, (payload: DomainEventMap[E]) => {
      try {
        const result = handler(payload);
        // Catch unhandled promise rejections from async listeners
        if (result instanceof Promise) {
          result.catch((err) => {
            logger.error({ err, event }, "Async domain event handler failed");
          });
        }
      } catch (err) {
        logger.error({ err, event }, "Domain event handler failed");
      }
    });
  }
}

export const eventBus = new DomainEventBus();
