import { VerifiableConstants } from '../../verifiable';

export function checkIdentityDoesNotExistError(error: unknown): boolean {
  const identityNotExistErr = ((error as unknown as { errorArgs: string[] })?.errorArgs ?? [])[0];
  const errMsg = identityNotExistErr || (error as unknown as Error).message;
  if (errMsg.includes(VerifiableConstants.ERRORS.IDENTITY_DOES_NOT_EXIST)) {
    return true;
  }
  return false;
}

export function checkStateDoesNotExistError(error: unknown): boolean {
  const stateNotExistErr = ((error as unknown as { errorArgs: string[] })?.errorArgs ?? [])[0];
  const errMsg = stateNotExistErr || (error as unknown as Error).message;
  if (errMsg.includes(VerifiableConstants.ERRORS.STATE_DOES_NOT_EXIST)) {
    return true;
  }
  return false;
}
