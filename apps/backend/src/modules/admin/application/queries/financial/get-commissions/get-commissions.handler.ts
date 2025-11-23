import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCommissionsQuery } from './get-commissions.query';

interface CommissionConfig {
  platform: {
    defaultRate: number;
    minAmount: number;
  };
  byConsultationType: {
    chat: number;
    video: number;
    voice: number;
    in_person: number;
    emergency: number;
  };
  byLawyerTier: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  bySubscriptionTier: {
    basic: number;
    premium: number;
    vip: number;
  };
}

@QueryHandler(GetCommissionsQuery)
export class GetCommissionsHandler implements IQueryHandler<GetCommissionsQuery> {
  async execute(query: GetCommissionsQuery): Promise<CommissionConfig> {
    // TODO: Load from database settings table or configuration service
    // For now, return default configuration

    return {
      platform: {
        defaultRate: 10, // 10% platform commission
        minAmount: 100, // Minimum 100 RUB commission
      },
      byConsultationType: {
        chat: 10,
        video: 12,
        voice: 10,
        in_person: 15,
        emergency: 15,
      },
      byLawyerTier: {
        bronze: 15, // New lawyers - higher commission
        silver: 12, // Established lawyers
        gold: 10,   // Top performers - lower commission
        platinum: 8, // Elite lawyers - lowest commission
      },
      bySubscriptionTier: {
        basic: 10,
        premium: 8,
        vip: 5,
      },
    };
  }
}
