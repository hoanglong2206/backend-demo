export type ResultType<T, E> =
  | { success: true; value: T }
  | { success: false; error: E };

export class Result<T, E> {
  private constructor(private readonly result: ResultType<T, E>) {}

  static ok<T, E>(value: T): Result<T, E> {
    return new Result<T, E>({ success: true, value });
  }

  static fail<T, E>(error: E): Result<T, E> {
    return new Result<T, E>({ success: false, error });
  }

  isSuccess(): boolean {
    return this.result.success;
  }

  isFailure(): boolean {
    return !this.result.success;
  }

  getValue(): T {
    if (!this.result.success) {
      throw new Error('Cannot get value from a failed result.');
    }
    return this.result.value;
  }

  getError(): E {
    if (this.result.success) {
      throw new Error('Cannot get error from a successful result.');
    }
    return this.result.error;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.result.success) {
      return Result.ok<U, E>(fn(this.result.value));
    }
    return Result.fail<U, E>(this.result.error);
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.result.success) {
      return fn(this.result.value);
    }
    return Result.fail<U, E>(this.result.error);
  }
}
