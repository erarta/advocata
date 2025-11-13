/**
 * Result pattern for error handling
 *
 * Instead of throwing exceptions for business logic errors,
 * we return Result objects that can be either success or failure.
 * This makes error handling explicit and forces callers to handle errors.
 */
export class Result<T> {
  public isSuccess: boolean;
  public isFailure: boolean;
  private _error?: string;
  private _value?: T;

  private constructor(isSuccess: boolean, error?: string, value?: T) {
    if (isSuccess && error) {
      throw new Error('InvalidOperation: A result cannot be successful and contain an error');
    }
    if (!isSuccess && !error) {
      throw new Error('InvalidOperation: A failing result needs to contain an error message');
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this._error = error;
    this._value = value;

    Object.freeze(this);
  }

  public get value(): T {
    if (!this.isSuccess) {
      throw new Error('Cannot get the value of a failed result. Use errorValue() instead.');
    }

    return this._value as T;
  }

  public get error(): string {
    if (this.isSuccess) {
      throw new Error('Cannot get the error of a successful result.');
    }

    return this._error as string;
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value);
  }

  public static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error);
  }

  public static combine(results: Result<any>[]): Result<any> {
    for (const result of results) {
      if (result.isFailure) {
        return result;
      }
    }
    return Result.ok();
  }
}
