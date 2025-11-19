import { ICommand } from '@nestjs/cqrs';

export interface BulkPayoutItem {
  lawyerId: string;
  method?: 'bank_transfer' | 'card' | 'wallet';
}

export class ProcessBulkPayoutsCommand implements ICommand {
  constructor(public readonly payouts: BulkPayoutItem[]) {}
}
