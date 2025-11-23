/**
 * Capture Payment Command
 *
 * Command to capture (confirm) a payment that is waiting for capture.
 * Used for two-step payment flow.
 */
export class CapturePaymentCommand {
  constructor(
    public readonly paymentId: string,
    public readonly amount?: number, // Optional for partial capture
  ) {}
}
