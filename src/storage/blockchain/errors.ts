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

export function checkIdentityDoesNotExistError(error: unknown): boolean {
  const errMsg = extractErrorMessage(error);
  if (errMsg.includes(VerifiableConstants.ERRORS.IDENTITY_DOES_NOT_EXIST)) {
    return true;
  }
  return false;
}

export function checkStateDoesNotExistError(error: unknown): boolean {
  const errMsg = extractErrorMessage(error);
  if (errMsg.includes(VerifiableConstants.ERRORS.STATE_DOES_NOT_EXIST)) {
    return true;
  }
  return false;
}

export function checkRootDoesNotExistError(error: unknown): boolean {
  const errMsg = extractErrorMessage(error);
  if (errMsg.includes(VerifiableConstants.ERRORS.ROOT_DOES_NOT_EXIST)) {
    return true;
  }
  return false;
}
