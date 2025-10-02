import { Service, ServiceEndpoint } from 'did-resolver';
import { DIDDocument } from './types';

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

export type UserNotificationResult = {
  devices: DeviceNotificationResult[];
};

export type PushMetadata = {
  devices: EncryptedDeviceMetadata[];
};

export interface NotificationLoader {
  load: (url: string, pushService: Service, msg: Uint8Array) => Promise<UserNotificationResult>;
}

export const PUSH_NOTIFICATION_SERVICE_TYPE = 'push-notification';

const defaultNotificationLoader: NotificationLoader = {
  load: async (
    url: string,
    pushService: Service,
    msg: Uint8Array
  ): Promise<UserNotificationResult> => {
    const req = new Request(url, {
      method: 'POST',
      body: JSON.stringify({
        metadata: pushService.metadata,
        message: msg
      })
    });

    const resp = await fetch(req);

    if (resp.status !== 200) {
      throw new Error(`could not send push notification, return status ${resp.status}`);
    }

    const devices: DeviceNotificationResult[] = await resp.json();
    return {
      devices
    };
  }
};

export const Notify = async (
  msg: Uint8Array,
  didDoc: DIDDocument,
  loader: NotificationLoader = defaultNotificationLoader
): Promise<UserNotificationResult[]> => {
  const pushService = (didDoc.service ?? []).find((s) => s.type === PUSH_NOTIFICATION_SERVICE_TYPE);

  if (!pushService) {
    throw new Error('no push service in did document');
  }

  if (!pushService.metadata?.devices?.length) {
    throw new Error('no devices in push service');
  }

  const serviceEndpointsUrls = [pushService.serviceEndpoint ?? []]
    .flat()
    .reduce((acc: string[], s: ServiceEndpoint | string) => {
      if (typeof s === 'string') {
        return [...acc, s];
      }
      if (typeof s.uri === 'string') {
        return [...acc, s.uri];
      }
      return acc;
    }, []);

  const promises = serviceEndpointsUrls.map(async (url) => loader.load(url, pushService, msg));

  return await Promise.all(promises);
};
