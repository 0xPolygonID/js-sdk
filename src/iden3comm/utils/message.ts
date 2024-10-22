import { MediaType } from '../constants';
import {
  Attachment,
  BasicMessage,
  EnvelopeStub,
  HeaderStub,
  Iden3AttachmentType,
  Iden3Directive,
  ProtocolMessage
} from '../types';

/**
 * creates empty basic message
 *
 * @returns BasicMessage
 */
export const basicMessageFactory = (): BasicMessage => {
  return {
    id: '',
    typ: '' as MediaType,
    thid: '',
    type: '' as ProtocolMessage,
    body: {},
    from: '',
    to: ''
  };
};

/**
 * create empty envelope stub
 *
 * @returns EnvelopeStub
 */
export const envelopeStubFactory = (): EnvelopeStub => {
  return {
    protected: ''
  };
};

/**
 * create empty header stub
 *
 * @returns {HeaderStub}
 */
export const headerStubFactory = (): HeaderStub => {
  return {
    typ: '' as MediaType
  };
};

/**
 * Extracts Iden3 directives from a given message.
 * @param message - The message object containing attachments.
 * @returns An array of Iden3Directive objects extracted from the message.
 */
export function extractDirectiveFromMessage(message: BasicMessage): Iden3Directive[] {
  const attachments = message.attachments;
  if (!attachments) {
    return [];
  }
  return attachments.reduce((acc: Iden3Directive[], attachment: Attachment) => {
    if (!attachment.data) {
      return acc;
    }
    if (attachment.data.type !== Iden3AttachmentType.Iden3Directives) {
      return acc;
    }
    const directives = attachment.data.directives;
    return directives?.length ? [...acc, ...directives] : acc;
  }, []);
}

/**
 * Propagates incoming directives into a basic message.
 * @param message - The basic message to propagate directives into.
 * @param incomingDirective - The incoming directives to add to the existing ones.
 * @returns The updated basic message with the attached directives.
 */
export function propagateDirectiveIntoMessage(
  message: BasicMessage,
  incomingDirective: Iden3Directive[]
): BasicMessage {
  // add incoming directives to the existing ones
  const attachedDirectives = (message.attachments ?? [])
    .filter((att) => att.data.type === Iden3AttachmentType.Iden3Directives)
    .reduce((acc: Iden3Directive[], att) => {
      const dir = att.data.directives;
      return [...acc, ...dir];
    }, incomingDirective);

  if (!attachedDirectives.length) {
    return message;
  }

  // merge directives attachment with existing attachments
  const resultedAttachments = [
    ...(message.attachments ?? []).filter(
      (att) => att.data.type !== Iden3AttachmentType.Iden3Directives
    ),
    {
      data: {
        type: Iden3AttachmentType.Iden3Directives,
        directives: attachedDirectives
      }
    }
  ];

  return {
    ...message,
    attachments: resultedAttachments
  };
}
