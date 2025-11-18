export class GetPopularTemplatesQuery {
  constructor(
    public readonly limit: number = 10,
    public readonly category?: string,
  ) {}
}
