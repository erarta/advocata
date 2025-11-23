import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetGeographicAnalyticsQuery } from './get-geographic-analytics.query';
import { UserOrmEntity } from '../../../../../identity/infrastructure/persistence/user.orm-entity';
import { LawyerOrmEntity } from '../../../../../lawyer/infrastructure/persistence/lawyer.orm-entity';
import { UserRole } from '../../../../../identity/domain/enums/user-role.enum';

interface GeographicAnalyticsResult {
  cities: Array<{
    name: string;
    users: number;
    lawyers: number;
    consultations: number;
    revenue: number;
    coordinates?: { lat: number; lng: number };
  }>;
  topCities: Array<{ city: string; metric: number }>;
  coverage: {
    citiesCount: number;
    lawyersPerCity: number;
    usersPerCity: number;
  };
}

// Major Russian cities with coordinates
const RUSSIAN_CITIES = [
  {
    name: 'Санкт-Петербург',
    coordinates: { lat: 59.9343, lng: 30.3351 },
  },
  {
    name: 'Москва',
    coordinates: { lat: 55.7558, lng: 37.6173 },
  },
  {
    name: 'Казань',
    coordinates: { lat: 55.8304, lng: 49.0661 },
  },
  {
    name: 'Новосибирск',
    coordinates: { lat: 55.0084, lng: 82.9357 },
  },
  {
    name: 'Екатеринбург',
    coordinates: { lat: 56.8389, lng: 60.6057 },
  },
  {
    name: 'Нижний Новгород',
    coordinates: { lat: 56.2965, lng: 43.9361 },
  },
  {
    name: 'Челябинск',
    coordinates: { lat: 55.1644, lng: 61.4368 },
  },
  {
    name: 'Самара',
    coordinates: { lat: 53.1952, lng: 50.1002 },
  },
];

@QueryHandler(GetGeographicAnalyticsQuery)
export class GetGeographicAnalyticsHandler
  implements IQueryHandler<GetGeographicAnalyticsQuery>
{
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
    @InjectRepository(LawyerOrmEntity)
    private readonly lawyerRepo: Repository<LawyerOrmEntity>,
    // TODO: Inject ConsultationRepository when available
  ) {}

  async execute(
    query: GetGeographicAnalyticsQuery,
  ): Promise<GeographicAnalyticsResult> {
    const { city } = query.dto;

    // Get total counts
    const totalUsers = await this.userRepo.count();
    const totalLawyers = await this.lawyerRepo.count();

    // TODO: Get actual geographic data from user profiles or consultations
    // For now, simulate distribution across major cities
    const cities = await Promise.all(
      RUSSIAN_CITIES.map(async (cityData, index) => {
        // Simulate data distribution
        // St. Petersburg gets 40%, Moscow 30%, others split the rest
        let userPercentage: number;
        if (index === 0) userPercentage = 0.4; // St. Petersburg
        else if (index === 1) userPercentage = 0.3; // Moscow
        else userPercentage = 0.3 / (RUSSIAN_CITIES.length - 2);

        const users = Math.floor(totalUsers * userPercentage);
        const lawyers = Math.floor(totalLawyers * userPercentage);

        return {
          name: cityData.name,
          users,
          lawyers,
          consultations: 0, // TODO: Count from consultations
          revenue: 0, // TODO: Calculate from payments
          coordinates: cityData.coordinates,
        };
      }),
    );

    // Sort by users to get top cities
    const topCities = cities
      .sort((a, b) => b.users - a.users)
      .slice(0, 5)
      .map((city) => ({
        city: city.name,
        metric: city.users,
      }));

    // Calculate coverage stats
    const citiesWithLawyers = cities.filter((c) => c.lawyers > 0).length;
    const avgLawyersPerCity =
      citiesWithLawyers > 0
        ? totalLawyers / citiesWithLawyers
        : 0;
    const avgUsersPerCity =
      cities.length > 0 ? totalUsers / cities.length : 0;

    return {
      cities: city
        ? cities.filter((c) => c.name.toLowerCase().includes(city.toLowerCase()))
        : cities,
      topCities,
      coverage: {
        citiesCount: citiesWithLawyers,
        lawyersPerCity: Number(avgLawyersPerCity.toFixed(1)),
        usersPerCity: Number(avgUsersPerCity.toFixed(1)),
      },
    };
  }
}
