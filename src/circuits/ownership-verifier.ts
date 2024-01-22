import { DID, Id } from '@iden3/js-iden3-core';

export abstract class IDOwnershipPubSignals {
  userId!: Id;
  challenge!: bigint;
  async verifyIdOwnership(sender: string, challenge: bigint): Promise<void> {
    const senderId = DID.idFromDID(DID.parse(sender));
    if (senderId.string() !== this.userId.string()) {
      throw new Error(
        `sender id is not used for proof creation, expected ${sender}, user from public signals: ${this.userId.string()}`
      );
    }
    if (challenge !== this.challenge) {
      throw new Error(
        `challenge is not used for proof creation, expected ${challenge}, challenge from public signals: ${this.challenge}  `
      );
    }
  }
}
