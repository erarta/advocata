/**
 * Create Payment Command
 *
 * Command to create a new payment for a consultation or subscription.
 */
export class CreatePaymentCommand {
  constructor(
    public readonly userId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly description: string,
    public readonly consultationId?: string,
    public readonly subscriptionId?: string,
    public readonly returnUrl?: string,
    public readonly metadata?: Record<string, any>,
  ) {}
}
