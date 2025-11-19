import { ICommand } from '@nestjs/cqrs';

export interface UpdateSubscriptionDto {
  action: 'cancel' | 'renew' | 'upgrade' | 'downgrade';
  tier?: 'basic' | 'premium' | 'vip';
}

export class UpdateSubscriptionCommand implements ICommand {
  constructor(
    public readonly subscriptionId: string,
    public readonly dto: UpdateSubscriptionDto,
  ) {}
}
