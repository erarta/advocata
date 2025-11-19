import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetLawyerQuery } from './get-lawyer.query';
import { LawyerOrmEntity } from '../../../../../lawyer/infrastructure/persistence/lawyer.orm-entity';
import { UserOrmEntity } from '../../../../../identity/infrastructure/persistence/user.orm-entity';

interface LawyerStatistics {
  totalConsultations: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
  completionRate: number;
}

interface LawyerDetailResponse {
  // Personal info
  id: string;
  userId: string;
  user?: UserOrmEntity;

  // Professional info
  licenseNumber: string;
  education: string;
  experienceYears: number;
  specializations: string[];
  bio: string;
  hourlyRate: number | null;
  isAvailable: boolean;

  // Status
  status: string;
  verificationStatus: string;
  verificationNotes: string | null;

  // Statistics
  ratingValue: number;
  reviewCount: number;
  statistics?: LawyerStatistics;

  // Metadata
  createdAt: Date;
  updatedAt: Date;

  // TODO: Add these when modules are available
  // recentConsultations?: Consultation[];
  // reviews?: Review[];
  // documents?: Document[];
  // availability?: AvailabilitySchedule;
}

@QueryHandler(GetLawyerQuery)
export class GetLawyerHandler implements IQueryHandler<GetLawyerQuery> {
  constructor(
    @InjectRepository(LawyerOrmEntity)
    private readonly lawyerRepository: Repository<LawyerOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async execute(query: GetLawyerQuery): Promise<LawyerDetailResponse> {
    const { lawyerId } = query;

    // Find lawyer
    const lawyer = await this.lawyerRepository.findOne({
      where: { id: lawyerId },
    });

    if (!lawyer) {
      throw new NotFoundException(`Lawyer with ID ${lawyerId} not found`);
    }

    // Fetch user data
    const user = await this.userRepository.findOne({
      where: { id: lawyer.userId },
    });

    // TODO: Calculate statistics from consultations when module is available
    const statistics: LawyerStatistics = {
      totalConsultations: 0, // TODO: Count from consultations table
      totalEarnings: 0, // TODO: Sum from payments table
      averageRating: lawyer.ratingValue,
      totalReviews: lawyer.reviewCount,
      completionRate: 0, // TODO: Calculate from consultations
    };

    return {
      id: lawyer.id,
      userId: lawyer.userId,
      user,
      licenseNumber: lawyer.licenseNumber,
      education: lawyer.education,
      experienceYears: lawyer.experienceYears,
      specializations: lawyer.specializations,
      bio: lawyer.bio,
      hourlyRate: lawyer.hourlyRate,
      isAvailable: lawyer.isAvailable,
      status: lawyer.status,
      verificationStatus: lawyer.verificationStatus,
      verificationNotes: lawyer.verificationNotes,
      ratingValue: lawyer.ratingValue,
      reviewCount: lawyer.reviewCount,
      statistics,
      createdAt: lawyer.createdAt,
      updatedAt: lawyer.updatedAt,
    };
  }
}
