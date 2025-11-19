export class UpdateFeatureFlagCommand {
  constructor(
    public readonly flagKey: string,
    public readonly isEnabled: boolean,
    public readonly rolloutPercentage?: number,
    public readonly adminId?: string,
  ) {}
}
