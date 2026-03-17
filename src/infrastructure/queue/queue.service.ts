import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type PublishOptions = Record<string, unknown>;
type ConsumeOptions = Record<string, unknown>;

interface QueueMessage {
  content: Buffer;
}

interface QueueConnection {
  createChannel(): Promise<QueueChannel>;
  close(): Promise<void>;
  on(event: 'error' | 'close', listener: (error?: Error) => void): void;
}

interface QueueChannel {
  prefetch(count: number): Promise<unknown>;
  close(): Promise<void>;
  assertQueue(queue: string, options?: { durable: boolean }): Promise<unknown>;
  sendToQueue(
    queue: string,
    content: Buffer,
    options?: PublishOptions,
  ): boolean;
  consume(
    queue: string,
    onMessage: (message: QueueMessage | null) => Promise<void>,
    options?: ConsumeOptions,
  ): Promise<unknown>;
  ack(message: QueueMessage): void;
  nack(message: QueueMessage, allUpTo?: boolean, requeue?: boolean): void;
}

type QueuePayload = Buffer | string | object;

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);

  private connection: QueueConnection | null = null;

  private channel: QueueChannel | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const enabled = this.configService.get<boolean>('queue.enabled', true);
    if (!enabled) {
      this.logger.warn('Queue is disabled by QUEUE_ENABLED=false');
      return;
    }

    const queueUrl = this.configService.get<string>(
      'queue.url',
      'amqp://localhost:5672',
    );
    const prefetch = this.configService.get<number>('queue.prefetch', 10);

    const amqp = (await import('amqplib')) as unknown as {
      connect(url: string): Promise<QueueConnection>;
    };

    this.connection = await amqp.connect(queueUrl);
    this.channel = await this.connection.createChannel();
    await this.channel.prefetch(prefetch);

    this.connection.on('error', (error?: Error) => {
      this.logger.error(
        `RabbitMQ connection error: ${error?.message ?? 'unknown error'}`,
      );
    });

    this.connection.on('close', () => {
      this.logger.warn('RabbitMQ connection closed');
    });

    this.logger.log('RabbitMQ connection established');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }

    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }

    this.logger.log('RabbitMQ connection closed');
  }

  async publish(
    queueName: string,
    payload: QueuePayload,
    options?: PublishOptions,
  ): Promise<boolean> {
    const channel = this.getChannel();
    await channel.assertQueue(queueName, { durable: true });

    return channel.sendToQueue(queueName, this.serializePayload(payload), {
      persistent: true,
      contentType: 'application/json',
      ...options,
    });
  }

  async consume(
    queueName: string,
    handler: (message: QueueMessage, parsedPayload: unknown) => Promise<void>,
    options?: ConsumeOptions,
  ): Promise<void> {
    const channel = this.getChannel();

    await channel.assertQueue(queueName, { durable: true });

    await channel.consume(
      queueName,
      async (message: QueueMessage | null) => {
        if (!message) {
          return;
        }

        try {
          const parsedPayload = this.parsePayload(message);
          await handler(message, parsedPayload);
          channel.ack(message);
        } catch (error) {
          const err = error as Error;
          this.logger.error(
            `Failed to process message from queue ${queueName}: ${err.message}`,
            err.stack,
          );
          channel.nack(message, false, false);
        }
      },
      options,
    );

    this.logger.log(`Consumer attached to queue: ${queueName}`);
  }

  private getChannel(): QueueChannel {
    if (!this.channel) {
      throw new Error('QueueService is not connected.');
    }

    return this.channel;
  }

  private serializePayload(payload: QueuePayload): Buffer {
    if (Buffer.isBuffer(payload)) {
      return payload;
    }

    if (typeof payload === 'string') {
      return Buffer.from(payload);
    }

    return Buffer.from(JSON.stringify(payload));
  }

  private parsePayload(message: QueueMessage): unknown {
    const value = message.content.toString();
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as unknown;
    } catch {
      return value;
    }
  }
}
