import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SearchLawyersQuery } from './search-lawyers.query';
import { LawyerDto } from './lawyer.dto';
import { ILawyerRepository, LawyerSearchCriteria } from '../../../domain/repositories/lawyer.repository.interface';
import { LawyerStatus } from '../../../domain/enums';

export interface SearchLawyersResult {
  lawyers: LawyerDto[];
  total: number;
}

/**
 * SearchLawyersQueryHandler
 *
 * Searches for lawyers based on criteria
 */
@QueryHandler(SearchLawyersQuery)
export class SearchLawyersQueryHandler
  implements IQueryHandler<SearchLawyersQuery, SearchLawyersResult>
{
  constructor(
    @Inject('ILawyerRepository')
    private readonly lawyerRepository: ILawyerRepository,
  ) {}

  async execute(query: SearchLawyersQuery): Promise<SearchLawyersResult> {
    const criteria: LawyerSearchCriteria = {
      specializations: query.specializations,
      minRating: query.minRating,
      minExperience: query.minExperience,
      isAvailable: query.isAvailable,
      status: LawyerStatus.Active, // Only show active lawyers
      limit: query.limit,
      offset: query.offset,
    };

    const { lawyers, total } = await this.lawyerRepository.search(criteria);

    const lawyerDtos: LawyerDto[] = lawyers.map((lawyer) => ({
      id: lawyer.id,
      userId: lawyer.userId,
      licenseNumber: lawyer.licenseNumber.value,
      specializations: lawyer.specializations,
      experienceYears: lawyer.experience.years,
      rating: lawyer.rating.value,
      reviewCount: lawyer.rating.reviewCount,
      bio: lawyer.bio,
      education: lawyer.education,
      status: lawyer.status,
      verificationStatus: lawyer.verificationStatus,
      hourlyRate: lawyer.hourlyRate,
      isAvailable: lawyer.isAvailable,
      isVerified: lawyer.isVerified,
      canTakeConsultations: lawyer.canTakeConsultations,
      createdAt: lawyer.createdAt,
      updatedAt: lawyer.updatedAt,
    }));

    return {
      lawyers: lawyerDtos,
      total,
    };
  }
}
