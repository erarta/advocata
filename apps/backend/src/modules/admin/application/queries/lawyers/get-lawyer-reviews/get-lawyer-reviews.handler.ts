import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetLawyerReviewsQuery } from './get-lawyer-reviews.query';
import { LawyerOrmEntity } from '../../../../../lawyer/infrastructure/persistence/lawyer.orm-entity';

interface Review {
  id: string;
  clientName: string;
  clientAvatar?: string;
  rating: number;
  comment: string;
  consultationType: string;
  createdAt: Date;
}

interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  averageRating: number;
}

@QueryHandler(GetLawyerReviewsQuery)
export class GetLawyerReviewsHandler
  implements IQueryHandler<GetLawyerReviewsQuery>
{
  constructor(
    @InjectRepository(LawyerOrmEntity)
    private readonly lawyerRepository: Repository<LawyerOrmEntity>,
  ) {}

  async execute(query: GetLawyerReviewsQuery): Promise<ReviewsResponse> {
    const { lawyerId, dto } = query;
    const { page = 1, limit = 20 } = dto;

    // Verify lawyer exists
    const lawyer = await this.lawyerRepository.findOne({
      where: { id: lawyerId },
    });

    if (!lawyer) {
      throw new NotFoundException(`Lawyer with ID ${lawyerId} not found`);
    }

    // TODO: Query reviews from consultations/reviews table when available
    // For now, return empty list with lawyer's rating
    const reviews: Review[] = [];
    const total = 0;

    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      averageRating: lawyer.ratingValue,
    };

    // TODO: Implement when reviews/consultations module is available:
    /*
    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.client', 'client')
      .leftJoinAndSelect('review.consultation', 'consultation')
      .where('consultation.lawyerId = :lawyerId', { lawyerId })
      .orderBy('review.createdAt', 'DESC');

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [reviewEntities, total] = await queryBuilder.getManyAndCount();

    const reviews = reviewEntities.map(review => ({
      id: review.id,
      clientName: `${review.client.firstName} ${review.client.lastName}`,
      clientAvatar: review.client.avatarUrl,
      rating: review.rating,
      comment: review.comment,
      consultationType: review.consultation.type,
      createdAt: review.createdAt,
    }));

    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      averageRating: lawyer.ratingValue,
    };
    */
  }
}
