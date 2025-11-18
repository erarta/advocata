/**
 * IOtpService
 *
 * Domain service interface for OTP (One-Time Password) operations
 * Implementation will be in Infrastructure layer
 */
export interface IOtpService {
  /**
   * Generate and send OTP code to phone number
   * @param phoneNumber - Phone number in format +7XXXXXXXXXX
   * @returns Generated OTP code (for testing purposes)
   */
  generate(phoneNumber: string): Promise<string>;

  /**
   * Verify OTP code
   * @param phoneNumber - Phone number
   * @param code - OTP code to verify
   * @returns true if code is valid and not expired
   */
  verify(phoneNumber: string, code: string): Promise<boolean>;

  /**
   * Delete OTP code after successful verification
   * @param phoneNumber - Phone number
   */
  delete(phoneNumber: string): Promise<void>;

  /**
   * Resend OTP code
   * @param phoneNumber - Phone number
   * @returns New OTP code
   */
  resend(phoneNumber: string): Promise<string>;
}
