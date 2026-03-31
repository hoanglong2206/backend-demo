/**
 * Interface for publishing domain events to an external messaging system.
 *
 * WHY: Decouples the application layer from the concrete queue technology
 * (RabbitMQ, Redis Streams, etc.). Use-cases inject this interface and
 * never know which broker is in use.
 */
export interface IEventPublisher {
  /**
   * Serialize and send an event payload to the specified queue.
   */
  publish(queueName: string, payload: object): Promise<void>;
}
