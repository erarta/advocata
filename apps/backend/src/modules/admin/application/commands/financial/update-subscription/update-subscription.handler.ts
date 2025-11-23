import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateSubscriptionCommand } from './update-subscription.command';
import { PaymentOrmEntity } from '../../../../../payment/infrastructure/persistence/payment.orm-entity';

interface UpdateSubscriptionResult {
  success: boolean;
  message: string;
}

@CommandHandler(UpdateSubscriptionCommand)
export class UpdateSubscriptionHandler implements ICommandHandler<UpdateSubscriptionCommand> {
  constructor(
    @InjectRepository(PaymentOrmEntity)
    private readonly paymentRepository: Repository<PaymentOrmEntity>,
  ) {}

  async execute(command: UpdateSubscriptionCommand): Promise<UpdateSubscriptionResult> {
    const { subscriptionId, dto } = command;

    // TODO: When subscription table exists, find subscription by ID
    // For now, find payment by subscriptionId
    const payment = await this.paymentRepository.findOne({
      where: { subscriptionId },
    });

    if (!payment) {
      throw new NotFoundException(`Subscription with ID ${subscriptionId} not found`);
    }

    // Validate action
    if (dto.action === 'upgrade' || dto.action === 'downgrade') {
      if (!dto.tier) {
        throw new BadRequestException('Tier is required for upgrade/downgrade actions');
      }
    }

    // TODO: Validate action is allowed for current subscription status

    // Process action
    switch (dto.action) {
      case 'cancel':
        // TODO: Cancel subscription
        // TODO: Schedule cancellation at end of billing period
        payment.metadata = {
          ...payment.metadata,
          subscriptionCanceled: true,
          canceledAt: new Date().toISOString(),
        };
        break;

      case 'renew':
        // TODO: Renew subscription
        // TODO: Process payment for next period
        payment.metadata = {
          ...payment.metadata,
          subscriptionRenewed: true,
          renewedAt: new Date().toISOString(),
        };
        break;

      case 'upgrade':
      case 'downgrade':
        // TODO: Change subscription tier
        // TODO: Process prorated payment if upgrade
        // TODO: Schedule downgrade for next period
        payment.metadata = {
          ...payment.metadata,
          subscriptionTier: dto.tier,
          tierChangedAt: new Date().toISOString(),
          tierChangeAction: dto.action,
        };
        break;
    }

    await this.paymentRepository.save(payment);

    // TODO: Send notification to user

    console.log(`[SUBSCRIPTION] Updated subscription ${subscriptionId}`, {
      action: dto.action,
      tier: dto.tier,
    });

    return {
      success: true,
      message: `Subscription ${dto.action}ed successfully`,
    };
  }
}
