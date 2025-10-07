import { describe, expect, it } from 'vitest';
import { notification } from '../../src/';
import { Service } from 'did-resolver';

const pushGatewaySuccessMock = `[{"device":{"ciphertext":"sIyhw8MsRzFTMXnPvvPnjpj38vVHK9z7w/DvHzX+i/68hSjWfSDjXUA49KopWexyoVsAhenS+AS7+JkatJ3+OTlNxUD+lFrAIJUE51qBiM7l7mmkAuryybUQmOgWJCbuUU2nsWFKzIvk2ZTxcMh5EoUxYV2/0HaTmYYTDkzCKQr/oVePlHbiKwG6XjjMCuNaooSAO7UlLduEZY9CjCWBahiJ7LPHq5+SMCSpA9DdxlYe5IDY7ZT0Yg8fmEAq5+ZGvPVDzk1SdXvZNtG/2yygb3ILrSHXN81ztJRPdsEjzctqWwIhP1zEncSMnNEY4vtxEc1red4PuNT6QX0EoP/aX4LdSGIgfM3KB6yjqKBOqgIGoTFih0h/YzcC42lv4oJw0t5obX+32FM8pzQBUoXMvV0F9WpNgDcN04F3/Su9GGRLFNLXApCtj2Mh4H0qnkjMzRMO42RTd3258HYH7U8xK48hpO0Wolt+rn3jrk/JXrVQqO/9EnhCu/PJL1+AoeVtTYL0zp57OWnIAXbW98MGg0pm0MpYwH51hmHx0YLH+4Fkqj30ydcZQhV3xtAVgvKfxQOwwNz2WhIefm+fwYLVAQB4SjUMOrRQYAos7PWgoc21I0QFu52dIA4IvYYBws2Vjb1LvssdFnrd4kUYbC7THdlWONfunbp9xgofzXTrj2g=","alg":"RS512"},"status":"success","reason":""}]`;

const pushGatewayRejectedMock = `[{"device":{"ciphertext":"kIyhw8MsRzFTMXnPvvPnjpj38vVHK9z7w/DvHzX+i/68hSjWfSDjXUA49KopWexyoVsAhenS+AS7+JkatJ3+OTlNxUD+lFrAIJUE51qBiM7l7mmkAuryybUQmOgWJCbuUU2nsWFKzIvk2ZTxcMh5EoUxYV2/0HaTmYYTDkzCKQr/oVePlHbiKwG6XjjMCuNaooSAO7UlLduEZY9CjCWBahiJ7LPHq5+SMCSpA9DdxlYe5IDY7ZT0Yg8fmEAq5+ZGvPVDzk1SdXvZNtG/2yygb3ILrSHXN81ztJRPdsEjzctqWwIhP1zEncSMnNEY4vtxEc1red4PuNT6QX0EoP/aX4LdSGIgfM3KB6yjqKBOqgIGoTFih0h/YzcC42lv4oJw0t5obX+32FM8pzQBUoXMvV0F9WpNgDcN04F3/Su9GGRLFNLXApCtj2Mh4H0qnkjMzRMO42RTd3258HYH7U8xK48hpO0Wolt+rn3jrk/JXrVQqO/9EnhCu/PJL1+AoeVtTYL0zp57OWnIAXbW98MGg0pm0MpYwH51hmHx0YLH+4Fkqj30ydcZQhV3xtAVgvKfxQOwwNz2WhIefm+fwYLVAQB4SjUMOrRQYAos7PWgoc21I0QFu52dIA4IvYYBws2Vjb1LvssdFnrd4kUYbC7THdlWONfunbp9xgofzXTrj2g=","alg":"RS512"},"status":"rejected","reason" :"Push message could have been rejected by an upstream gateway because they have expired or have never been valid"}]`;

describe('notification tests', () => {
  const id = 'did:iden3:polygon:mumbai:115gD96EyyqQhLjjNQ6s5mHRMczRRute7nUDgCH9ot';
  const pushService: Service = {
    id: `${id}#push`,
    type: notification.NotificationServiceType.Push,
    serviceEndpoint: 'http://localhost:3000/push',

    metadata: {
      devices: [
        {
          ciphertext:
            'sIyhw8MsRzFTMXnPvvPnjpj38vVHK9z7w/DvHzX+i/68hSjWfSDjXUA49KopWexyoVsAhenS+AS7+JkatJ3+OTlNxUD+lFrAIJUE51qBiM7l7mmkAuryybUQmOgWJCbuUU2nsWFKzIvk2ZTxcMh5EoUxYV2/0HaTmYYTDkzCKQr/oVePlHbiKwG6XjjMCuNaooSAO7UlLduEZY9CjCWBahiJ7LPHq5+SMCSpA9DdxlYe5IDY7ZT0Yg8fmEAq5+ZGvPVDzk1SdXvZNtG/2yygb3ILrSHXN81ztJRPdsEjzctqWwIhP1zEncSMnNEY4vtxEc1red4PuNT6QX0EoP/aX4LdSGIgfM3KB6yjqKBOqgIGoTFih0h/YzcC42lv4oJw0t5obX+32FM8pzQBUoXMvV0F9WpNgDcN04F3/Su9GGRLFNLXApCtj2Mh4H0qnkjMzRMO42RTd3258HYH7U8xK48hpO0Wolt+rn3jrk/JXrVQqO/9EnhCu/PJL1+AoeVtTYL0zp57OWnIAXbW98MGg0pm0MpYwH51hmHx0YLH+4Fkqj30ydcZQhV3xtAVgvKfxQOwwNz2WhIefm+fwYLVAQB4SjUMOrRQYAos7PWgoc21I0QFu52dIA4IvYYBws2Vjb1LvssdFnrd4kUYbC7THdlWONfunbp9xgofzXTrj2g=',
          alg: 'RS512'
        }
      ]
    }
  };
  const msg = new TextEncoder().encode(`"here can be a json protocol message from issuer"`);

  it('should notify success', async () => {
    const didDocument = {
      '@context': ['https://www.w3.org/ns/did/v1'],
      id: id,
      service: [pushService]
    };

    const publisher: notification.INotificationProvider = {
      type: notification.NotificationServiceType.Push,
      send: () =>
        Promise.resolve({
          status: notification.NotificationStatus.Success,
          devices: JSON.parse(pushGatewaySuccessMock)
        })
    };

    const notifier = new notification.PushNotifier(publisher);

    const resp = await notifier.notify(msg, { didDocument });
    expect(resp).toHaveLength(1);
    expect(resp[0].devices).toHaveLength(1);
    expect((resp[0].devices as notification.DeviceNotificationResult[])[0].status).toBe(
      notification.DeviceNotificationStatus.Success
    );
  });

  it('should throw error `no device info in push service`', async () => {
    pushService.metadata.devices = [];
    const notifier = new notification.PushNotifier();
    await expect(
      notifier.notify(msg, {
        didDocument: {
          '@context': ['https://www.w3.org/ns/did/v1'],
          id: id,
          service: [pushService]
        }
      })
    ).rejects.toThrow('no devices in push service');
  });

  it('should throw error `no push service in did document`', async () => {
    pushService.metadata = {
      devices: []
    };
    const didDocument = {
      '@context': ['https://www.w3.org/ns/did/v1'],
      id: id,
      service: []
    };
    const notifier = new notification.PushNotifier();

    await expect(notifier.notify(msg, { didDocument })).rejects.toThrow(
      'no push service in did document'
    );
  });

  it('should notify rejected device', async () => {
    pushService.serviceEndpoint = 'http://localhost:3000/push';
    pushService.metadata.devices = [
      {
        ciphertext:
          'kIyhw8MsRzFTMXnPvvPnjpj38vVHK9z7w/DvHzX+i/68hSjWfSDjXUA49KopWexyoVsAhenS+AS7+JkatJ3+OTlNxUD+lFrAIJUE51qBiM7l7mmkAuryybUQmOgWJCbuUU2nsWFKzIvk2ZTxcMh5EoUxYV2/0HaTmYYTDkzCKQr/oVePlHbiKwG6XjjMCuNaooSAO7UlLduEZY9CjCWBahiJ7LPHq5+SMCSpA9DdxlYe5IDY7ZT0Yg8fmEAq5+ZGvPVDzk1SdXvZNtG/2yygb3ILrSHXN81ztJRPdsEjzctqWwIhP1zEncSMnNEY4vtxEc1red4PuNT6QX0EoP/aX4LdSGIgfM3KB6yjqKBOqgIGoTFih0h/YzcC42lv4oJw0t5obX+32FM8pzQBUoXMvV0F9WpNgDcN04F3/Su9GGRLFNLXApCtj2Mh4H0qnkjMzRMO42RTd3258HYH7U8xK48hpO0Wolt+rn3jrk/JXrVQqO/9EnhCu/PJL1+AoeVtTYL0zp57OWnIAXbW98MGg0pm0MpYwH51hmHx0YLH+4Fkqj30ydcZQhV3xtAVgvKfxQOwwNz2WhIefm+fwYLVAQB4SjUMOrRQYAos7PWgoc21I0QFu52dIA4IvYYBws2Vjb1LvssdFnrd4kUYbC7THdlWONfunbp9xgofzXTrj2g=',
        alg: 'RS512'
      }
    ];

    const didDocument = {
      '@context': ['https://www.w3.org/ns/did/v1'],
      id: id,
      service: [pushService]
    };
    const publisher: notification.INotificationProvider = {
      type: notification.NotificationServiceType.Push,
      send: () =>
        Promise.resolve({
          status: notification.NotificationStatus.Success,
          devices: JSON.parse(pushGatewayRejectedMock)
        })
    };
    const notifier = new notification.PushNotifier(publisher);

    const resp = await notifier.notify(msg, { didDocument });
    expect(resp).toHaveLength(1);
    expect(resp[0].devices).toHaveLength(1);
    expect((resp[0].devices as notification.DeviceNotificationResult[])[0].status).toBe(
      notification.DeviceNotificationStatus.Rejected
    );
  });
});
