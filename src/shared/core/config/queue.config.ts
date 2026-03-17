import { registerAs } from '@nestjs/config';

export const queueConfig = registerAs('queue', () => ({
  enabled: process.env.QUEUE_ENABLED !== 'false',
  url: process.env.QUEUE_URL ?? 'amqp://localhost:5672',
  prefetch: parseInt(process.env.QUEUE_PREFETCH ?? '10', 10),
  reconnectDelayMs: parseInt(
    process.env.QUEUE_RECONNECT_DELAY_MS ?? '5000',
    10,
  ),
  defaultQueue: process.env.QUEUE_DEFAULT_NAME ?? 'default-queue',
}));

export type QueueConfig = ReturnType<typeof queueConfig>;
