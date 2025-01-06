import { BasicMessage, DirectiveAttachment, Iden3AttachmentType, Iden3Directive } from './types';

/**
 * The `DirectiveManager` class provides methods to extract and propagate Iden3 directives
 * within a basic message. It includes functionality to handle message attachments and
 * manage directives of type `Iden3Directive`.
 */
export class DirectiveHelper {
  /**
   * Extracts Iden3 directives from a given message.
   * @param message - The message object containing attachments.
   * @returns An array of Iden3Directive objects extracted from the message.
   */
  static extractDirectiveFromMessage(message: BasicMessage): Iden3Directive[] {
    const attachments = message.attachments;
    if (!attachments) {
      return [];
    }
    return attachments.reduce((acc: Iden3Directive[], attachment: DirectiveAttachment) => {
      if (!attachment.data) {
        return acc;
      }
      if (attachment.data.type !== Iden3AttachmentType.Iden3Directive) {
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
  static propagateDirectiveIntoMessage(
    message: BasicMessage,
    incomingDirective: Iden3Directive[]
  ): BasicMessage {
    // add incoming directives to the existing ones
    const attachedDirectives = (message.attachments ?? [])
      .filter((att) => att.data.type === Iden3AttachmentType.Iden3Directive)
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
        (att) => att.data.type !== Iden3AttachmentType.Iden3Directive
      ),
      {
        data: {
          type: Iden3AttachmentType.Iden3Directive,
          directives: attachedDirectives
        }
      }
    ];

    return {
      ...message,
      attachments: resultedAttachments
    };
  }
}
