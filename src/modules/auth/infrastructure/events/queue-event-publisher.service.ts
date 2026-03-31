import { Injectable } from '@nestjs/common';
import { QueueService } from '@infrastructure/queue/queue.service';
import { IEventPublisher } from '@modules/auth/domain/services/event-publisher.service';

/**
 * Infrastructure implementation of IEventPublisher that delegates to
 * the RabbitMQ-backed QueueService.
 *
 * WHY: Keeps the application layer free of any broker-specific code.
 */
@Injectable()
export class QueueEventPublisher implements IEventPublisher {
  constructor(private readonly queueService: QueueService) {}

  async publish(queueName: string, payload: object): Promise<void> {
    await this.queueService.publish(queueName, payload);
  }
}
