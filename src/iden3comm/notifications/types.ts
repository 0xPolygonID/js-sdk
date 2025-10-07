import { Service } from 'did-resolver';
import { DIDDocument } from '../types';

export enum NotificationServiceType {
  Push = 'push-notification'
}

export enum NotificationStatus {
  Success = 'success',
  Failed = 'failed'
}

export type NotificationRequest = {
  didDocument: DIDDocument;
  [key: string]: unknown;
};

export type NotificationResponse = {
  status: NotificationStatus;
  [key: string]: unknown;
};

export interface INotifier {
  notify(msg: Uint8Array, options: NotificationRequest): Promise<NotificationResponse[]>;
}

export interface INotificationProvider {
  type: NotificationServiceType;
  send: ({
    url,
    pushService,
    message
  }: {
    url: string;
    pushService: Service;
    message: Uint8Array;
  }) => Promise<NotificationResponse>;
}
