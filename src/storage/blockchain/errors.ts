import { VerifiableConstants } from '../../verifiable';

interface ErrorWithArgs {
  errorArgs: string[];
}

function isErrorWithArgs(error: unknown): error is ErrorWithArgs {
  return (
    typeof error === 'object' &&
    error !== null &&
    'errorArgs' in error &&
    Array.isArray((error as any).errorArgs)
  );
}

function extractErrorMessage(error: unknown): string {
  const errorArgs = isErrorWithArgs(error) ? error.errorArgs[0] : undefined;
  const errMsg = errorArgs || (error instanceof Error ? error.message : '');
  return errMsg;
}

function isError(error: unknown, errorMsg: string): boolean {
  const errMsg = extractErrorMessage(error);
  return errMsg.includes(errorMsg);
}

export function isIdentityDoesNotExistError(error: unknown): boolean {
  return (
    isError(error, VerifiableConstants.ERRORS.IDENTITY_DOES_NOT_EXIST) ||
    isError(error, VerifiableConstants.ERRORS.IDENTITY_DOES_NOT_EXIST_CUSTOM_ERROR)
  );
}

export function isStateDoesNotExistError(error: unknown): boolean {
  return (
    isError(error, VerifiableConstants.ERRORS.STATE_DOES_NOT_EXIST) ||
    isError(error, VerifiableConstants.ERRORS.STATE_DOES_NOT_EXIST_CUSTOM_ERROR)
  );
}

export function isRootDoesNotExistError(error: unknown): boolean {
  return (
    isError(error, VerifiableConstants.ERRORS.ROOT_DOES_NOT_EXIST) ||
    isError(error, VerifiableConstants.ERRORS.ROOT_DOES_NOT_EXIST_CUSTOM_ERROR)
  );
}
