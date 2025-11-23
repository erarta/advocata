/**
 * Refund Payment Command
 *
 * Command to refund a completed payment (full or partial).
 */
export class RefundPaymentCommand {
  constructor(
    public readonly paymentId: string,
    public readonly refundAmount: number,
    public readonly reason?: string,
  ) {}
}
