export class SearchSimilarDocumentsQuery {
  constructor(
    public readonly queryText: string,
    public readonly limit: number = 10,
    public readonly lawyerId?: string,
  ) {}
}
