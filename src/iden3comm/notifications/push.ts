import { Service, ServiceEndpoint } from 'did-resolver';
import {
  INotificationProvider,
  INotifier,
  NotificationRequest,
  NotificationResponse,
  NotificationServiceType,
  NotificationStatus
} from './types';

export enum DeviceNotificationStatus {
  Success = 'success',
  Rejected = 'rejected',
  Failed = 'failed'
}

export type EncryptedDeviceMetadata = {
  ciphertext: string;
  alg: string;
};

export type DeviceNotificationResult = {
  device: EncryptedDeviceMetadata;
  status: DeviceNotificationStatus;
  reason: string;
};

const defaultPushNotificationPublisher: INotificationProvider = {
  type: NotificationServiceType.Push,
  send: async ({
    url,
    pushService,
    message
  }: {
    url: string;
    pushService: Service;
    message: Uint8Array;
  }): Promise<NotificationResponse> => {
    try {
      const req = new Request(url, {
        method: 'POST',
        body: JSON.stringify({
          metadata: pushService.metadata,
          message
        })
      });

      const resp = await fetch(req);

      if (resp.status !== 200) {
        throw new Error(`could not send push notification, return status ${resp.status}`);
      }

      const devices: DeviceNotificationResult[] = await resp.json();
      return {
        status: NotificationStatus.Success,
        devices
      };
    } catch (error: unknown) {
      return {
        status: NotificationStatus.Failed,
        error: (error as Error).toString()
      };
    }
  }
};

export class PushNotifier implements INotifier {
  constructor(
    private readonly _publisher: INotificationProvider = defaultPushNotificationPublisher
  ) {
    if (_publisher.type !== NotificationServiceType.Push) {
      throw new Error(`PushNotifier: publisher type ${_publisher.type} is not supported`);
    }
  }

  async notify(msg: Uint8Array, request: NotificationRequest): Promise<NotificationResponse[]> {
    const pushService = (request.didDocument.service ?? []).find(
      (s) => s.type === NotificationServiceType.Push
    );

    if (!pushService) {
      throw new Error('no push service in did document');
    }

    if (!pushService.metadata?.devices?.length) {
      throw new Error('no devices in push service');
    }

    const serviceEndpointsUrls = [pushService.serviceEndpoint ?? []]
      .flat()
      .reduce((acc: string[], s: ServiceEndpoint | string): string[] => {
        if (typeof s === 'string') {
          return [...acc, s];
        }
        if (typeof s.uri === 'string') {
          return [...acc, s.uri];
        }
        return acc;
      }, []);

    const promises = serviceEndpointsUrls.map(
      async (url): Promise<NotificationResponse> =>
        this._publisher.send({ url, pushService, message: msg })
    );

    return await Promise.all(promises);
  }
}
