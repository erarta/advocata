export class UpdatePlatformConfigCommand {
  constructor(
    public readonly config: {
      name?: string;
      logoUrl?: string;
      faviconUrl?: string;
      timezone?: string;
      currency?: string;
      supportEmail?: string;
      supportPhone?: string;
      socialMedia?: Record<string, string>;
      features?: {
        maintenanceMode?: boolean;
        allowRegistrations?: boolean;
        requireEmailVerification?: boolean;
      };
      locale?: {
        defaultLanguage?: string;
        availableLanguages?: string[];
      };
    },
    public readonly adminId: string,
  ) {}
}
