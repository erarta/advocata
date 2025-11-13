import { SpecializationType } from '../../../domain/enums';

/**
 * RegisterLawyerCommand
 *
 * Command to register a new lawyer on the platform
 */
export class RegisterLawyerCommand {
  constructor(
    public readonly userId: string,
    public readonly licenseNumber: string,
    public readonly specializations: SpecializationType[],
    public readonly experienceYears: number,
    public readonly bio: string,
    public readonly education: string,
    public readonly hourlyRate?: number,
  ) {}
}
