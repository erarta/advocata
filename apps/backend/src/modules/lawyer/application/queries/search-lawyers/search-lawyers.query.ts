import { SpecializationType } from '../../../domain/enums';

/**
 * SearchLawyersQuery
 *
 * Query to search for lawyers by various criteria
 */
export class SearchLawyersQuery {
  constructor(
    public readonly specializations?: SpecializationType[],
    public readonly minRating?: number,
    public readonly minExperience?: number,
    public readonly isAvailable?: boolean,
    public readonly limit: number = 20,
    public readonly offset: number = 0,
  ) {}
}
