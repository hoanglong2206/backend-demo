/**
 * Base class for all domain exceptions.
 *
 * WHY: Domain exceptions represent business rule violations
 * that are part of the ubiquitous language. They are thrown
 * when invariants are broken or business rules are violated.
 *
 * Each exception carries a unique `code` for programmatic
 * identification and a human-readable `message` for logging.
 */
export abstract class DomainException extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
