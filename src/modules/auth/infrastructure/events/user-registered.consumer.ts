import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QueueService } from '@infrastructure/queue/queue.service';
import { USER_REGISTERED_QUEUE } from '@modules/auth/domain/events/user-registered.event';

interface UserRegisteredPayload {
  aggregateId: string;
  email: string;
  occurredOn: string;
  eventName: string;
}

/**
 * Async consumer for `UserRegisteredEvent` messages.
 *
 * Attaches to the RabbitMQ queue on module initialisation.
 * Current behaviour: log the event and prepare any initial state
 * needed before the user completes onboarding.
 * (Actual user-profile creation happens when the user calls
 *  POST /auth/onboarding.)
 */
@Injectable()
export class UserRegisteredConsumer implements OnModuleInit {
  private readonly logger = new Logger(UserRegisteredConsumer.name);

  constructor(private readonly queueService: QueueService) {}

  async onModuleInit(): Promise<void> {
    await this.queueService.consume(
      USER_REGISTERED_QUEUE,
      (_message, payload) => {
        const event = payload as UserRegisteredPayload;
        this.logger.log(
          `UserRegisteredEvent received – authId: ${event.aggregateId}, email: ${event.email}, occurredOn: ${event.occurredOn}`,
        );
        // Onboarding is completed separately via POST /auth/onboarding.
        // Additional initial-state preparation can be added here.
        return Promise.resolve();
      },
    );
  }
}
