import { ValidationError } from "../../shared/errors/ValidationError";

export function assertNonEmptyString(value: string, fieldName: string): void {
  if (!value?.trim()) {
    throw new ValidationError(`${fieldName} is required`);
  }
}

export function assertPositiveInteger(value: number, fieldName: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new ValidationError(`${fieldName} must be a positive integer`);
  }
}