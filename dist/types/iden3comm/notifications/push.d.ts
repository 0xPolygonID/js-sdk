import { INotificationProvider, INotifier, NotificationRequest, NotificationResponse } from './types';
export declare enum DeviceNotificationStatus {
    Success = "success",
    Rejected = "rejected",
    Failed = "failed"
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
export declare class PushNotifier implements INotifier {
    private readonly _publisher;
    constructor(_publisher?: INotificationProvider);
    notify(msg: Uint8Array, request: NotificationRequest): Promise<NotificationResponse[]>;
}
//# sourceMappingURL=push.d.ts.map