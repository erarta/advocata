import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { ProcessBulkPayoutsCommand } from './process-bulk-payouts.command';
import { ProcessPayoutCommand } from '../process-payout/process-payout.command';
import { ProcessPayoutDto } from '../../../../presentation/dtos/financial/process-payout.dto';

interface BulkPayoutResult {
  success: boolean;
  processed: number;
  failed: number;
  results: Array<{
    lawyerId: string;
    success: boolean;
    error?: string;
    payoutId?: string;
    amount?: number;
  }>;
}

@CommandHandler(ProcessBulkPayoutsCommand)
export class ProcessBulkPayoutsHandler implements ICommandHandler<ProcessBulkPayoutsCommand> {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(command: ProcessBulkPayoutsCommand): Promise<BulkPayoutResult> {
    const { payouts } = command;

    let processed = 0;
    let failed = 0;
    const results: any[] = [];

    // Process each payout individually
    for (const payout of payouts) {
      try {
        const dto: ProcessPayoutDto = {
          method: payout.method || 'bank_transfer',
          notes: 'Bulk payout processing',
        };

        const result = await this.commandBus.execute(
          new ProcessPayoutCommand(payout.lawyerId, dto),
        );

        processed++;
        results.push({
          lawyerId: payout.lawyerId,
          success: true,
          payoutId: result.payoutId,
          amount: result.amount,
        });
      } catch (error) {
        failed++;
        results.push({
          lawyerId: payout.lawyerId,
          success: false,
          error: error.message,
        });
      }
    }

    return {
      success: failed === 0,
      processed,
      failed,
      results,
    };
  }
}
