/**
 * Create Emergency Call Command
 * Command for creating a new emergency call
 */
export class CreateEmergencyCallCommand {
  constructor(
    public readonly userId: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly address: string,
    public readonly notes?: string,
  ) {}
}
