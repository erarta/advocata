/**
 * VerifyPhoneCommand
 *
 * Command to verify user's phone number with OTP code
 */
export class VerifyPhoneCommand {
  constructor(
    public readonly userId: string,
    public readonly otpCode: string,
  ) {}
}
