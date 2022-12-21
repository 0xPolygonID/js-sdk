// DeviceRegistrationRequestMessage represent Iden3message for register device request
import { MediaType, ProtocolMessage } from '../';

// DeviceRegistrationRequestMessage represent Iden3message for register device request
export type DeviceRegistrationRequestMessage = {
  id: string;
  typ?: MediaType;
  type: ProtocolMessage;
  thid?: string;
  body?: DeviceRegistrationRequestMessageBody;
  from?: string;
  to?: string;
};

// DeviceRegistrationRequestMessageBody is struct the represents body for register device request request
export type DeviceRegistrationRequestMessageBody = {
  app_id: string;
  push_token: string;
};
