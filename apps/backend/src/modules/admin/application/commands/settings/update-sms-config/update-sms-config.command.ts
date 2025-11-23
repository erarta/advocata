export class UpdateSMSConfigCommand {
  constructor(
    public readonly provider: 'twilio' | 'sms.ru' | 'smsc',
    public readonly isEnabled?: boolean,
    public readonly senderName?: string,
    public readonly apiKey?: string,
    public readonly apiSecret?: string,
    public readonly twilioAccountSid?: string,
    public readonly twilioAuthToken?: string,
    public readonly twilioPhoneNumber?: string,
    public readonly adminId?: string,
  ) {}
}
