/**
 * Cancel Payment Command
 *
 * Command to cancel a pending payment.
 */
export class CancelPaymentCommand {
  constructor(public readonly paymentId: string) {}
}
