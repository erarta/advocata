import { ICommand } from '@nestjs/cqrs';

export interface CommissionConfigDto {
  platform: {
    defaultRate: number;
    minAmount: number;
  };
  byConsultationType?: {
    chat: number;
    video: number;
    voice: number;
    in_person: number;
    emergency: number;
  };
  byLawyerTier?: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  bySubscriptionTier?: {
    basic: number;
    premium: number;
    vip: number;
  };
}

export class UpdateCommissionsCommand implements ICommand {
  constructor(public readonly config: CommissionConfigDto) {}
}
