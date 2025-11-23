import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UpdateCommissionsCommand } from './update-commissions.command';

interface UpdateCommissionsResult {
  success: boolean;
  config: any;
  message: string;
}

@CommandHandler(UpdateCommissionsCommand)
export class UpdateCommissionsHandler implements ICommandHandler<UpdateCommissionsCommand> {
  async execute(command: UpdateCommissionsCommand): Promise<UpdateCommissionsResult> {
    const { config } = command;

    // Validate commission rates (must be between 0 and 100)
    this.validateRate(config.platform.defaultRate, 'Platform default rate');

    if (config.byConsultationType) {
      Object.entries(config.byConsultationType).forEach(([type, rate]) => {
        this.validateRate(rate, `Consultation type ${type}`);
      });
    }

    if (config.byLawyerTier) {
      Object.entries(config.byLawyerTier).forEach(([tier, rate]) => {
        this.validateRate(rate, `Lawyer tier ${tier}`);
      });
    }

    if (config.bySubscriptionTier) {
      Object.entries(config.bySubscriptionTier).forEach(([tier, rate]) => {
        this.validateRate(rate, `Subscription tier ${tier}`);
      });
    }

    // Validate minimum amount
    if (config.platform.minAmount < 0) {
      throw new BadRequestException('Minimum amount cannot be negative');
    }

    // TODO: Save to database settings table or configuration service
    // TODO: Log change for audit trail
    // TODO: Notify affected parties (optional)

    console.log('[COMMISSIONS] Updated commission configuration', config);

    return {
      success: true,
      config,
      message: 'Commission configuration updated successfully',
    };
  }

  private validateRate(rate: number, fieldName: string): void {
    if (rate < 0 || rate > 100) {
      throw new BadRequestException(`${fieldName} must be between 0 and 100 percent`);
    }
  }
}
