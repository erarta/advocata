/**
 * Location Value Object
 * Represents geographical coordinates with immutability
 */
export class Location {
  private constructor(
    public readonly latitude: number,
    public readonly longitude: number,
  ) {
    this.validate();
  }

  /**
   * Creates a new Location value object
   */
  static create(latitude: number, longitude: number): Location {
    return new Location(latitude, longitude);
  }

  /**
   * Validates coordinates
   */
  private validate(): void {
    if (this.latitude < -90 || this.latitude > 90) {
      throw new Error(`Invalid latitude: ${this.latitude}. Must be between -90 and 90.`);
    }

    if (this.longitude < -180 || this.longitude > 180) {
      throw new Error(`Invalid longitude: ${this.longitude}. Must be between -180 and 180.`);
    }
  }

  /**
   * Converts to PostGIS POINT format
   */
  toPostGISPoint(): string {
    return `POINT(${this.longitude} ${this.latitude})`;
  }

  /**
   * Converts to GeoJSON format
   */
  toGeoJSON(): { type: string; coordinates: number[] } {
    return {
      type: 'Point',
      coordinates: [this.longitude, this.latitude],
    };
  }

  /**
   * Checks equality
   */
  equals(other: Location): boolean {
    return (
      this.latitude === other.latitude && this.longitude === other.longitude
    );
  }
}
