export class AskQuestionQuery {
  constructor(
    public readonly question: string,
    public readonly userId: string,
    public readonly lawyerId?: string,
    public readonly conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>,
  ) {}
}
