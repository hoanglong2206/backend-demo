/**
 * Base class for all domain entities.
 *
 * WHY: Every entity needs an identity (id) and timestamps.
 * By centralizing this, we enforce consistency and avoid
 * repeating the same fields in every entity.
 *
 */
export abstract class BaseEntity {
  protected readonly _id: string;
  protected readonly _createdAt: Date;
  protected _updatedAt: Date;
  protected _deletedAt: Date | null;

  constructor(
    id: string,
    createdAt?: Date,
    updatedAt?: Date,
    deletedAt?: Date | null,
  ) {
    this._id = id;
    this._createdAt = createdAt ?? new Date();
    this._updatedAt = updatedAt ?? new Date();
    this._deletedAt = deletedAt ?? null;
  }

  get id(): string {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  isDeleted(): boolean {
    return this._deletedAt !== null;
  }

  softDelete(): void {
    if (this.isDeleted()) throw new Error('Entity is already deleted.');
    this._deletedAt = new Date();
    this.touch();
  }

  /**
   * Two entities are equal if they have the same identity,
   * regardless of their attribute values.
   */
  public equals(other: BaseEntity): boolean {
    if (!(other instanceof BaseEntity)) return false;
    return this._id === other._id;
  }

  protected touch(): void {
    this._updatedAt = new Date();
  }
}
