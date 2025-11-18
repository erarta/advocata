import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Create Emergency Calls Table with PostGIS
 * Creates table for storing emergency legal assistance calls
 * Includes PostGIS extension for geospatial queries
 */
export class CreateEmergencyCallsTable1732000000000
  implements MigrationInterface
{
  name = 'CreateEmergencyCallsTable1732000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable PostGIS extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis;`);

    // Create emergency_calls table
    await queryRunner.query(`
      CREATE TABLE emergency_calls (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        lawyer_id UUID,
        location GEOGRAPHY(POINT, 4326) NOT NULL,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        address TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        accepted_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

        -- Constraints
        CONSTRAINT fk_emergency_calls_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE,

        CONSTRAINT fk_emergency_calls_lawyer
          FOREIGN KEY (lawyer_id)
          REFERENCES lawyers(id)
          ON DELETE SET NULL,

        CONSTRAINT chk_emergency_calls_status
          CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),

        CONSTRAINT chk_emergency_calls_latitude
          CHECK (latitude >= -90 AND latitude <= 90),

        CONSTRAINT chk_emergency_calls_longitude
          CHECK (longitude >= -180 AND longitude <= 180)
      );
    `);

    // Create spatial index on location column
    await queryRunner.query(`
      CREATE INDEX idx_emergency_calls_location
      ON emergency_calls
      USING GIST(location);
    `);

    // Create index on status for fast filtering
    await queryRunner.query(`
      CREATE INDEX idx_emergency_calls_status
      ON emergency_calls(status);
    `);

    // Create index on user_id for user queries
    await queryRunner.query(`
      CREATE INDEX idx_emergency_calls_user_id
      ON emergency_calls(user_id);
    `);

    // Create index on lawyer_id for lawyer queries
    await queryRunner.query(`
      CREATE INDEX idx_emergency_calls_lawyer_id
      ON emergency_calls(lawyer_id)
      WHERE lawyer_id IS NOT NULL;
    `);

    // Create index on created_at for time-based queries
    await queryRunner.query(`
      CREATE INDEX idx_emergency_calls_created_at
      ON emergency_calls(created_at DESC);
    `);

    // Create composite index for active calls queries
    await queryRunner.query(`
      CREATE INDEX idx_emergency_calls_active
      ON emergency_calls(status, created_at)
      WHERE status IN ('pending', 'accepted');
    `);

    // Create trigger to automatically update location from lat/lng
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_emergency_call_location()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_emergency_calls_update_location
      BEFORE INSERT OR UPDATE ON emergency_calls
      FOR EACH ROW
      EXECUTE FUNCTION update_emergency_call_location();
    `);

    // Create trigger to update updated_at timestamp
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_emergency_call_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_emergency_calls_update_timestamp
      BEFORE UPDATE ON emergency_calls
      FOR EACH ROW
      EXECUTE FUNCTION update_emergency_call_timestamp();
    `);

    // Add last_known_location column to lawyers table if not exists
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'lawyers'
          AND column_name = 'last_known_location'
        ) THEN
          ALTER TABLE lawyers
          ADD COLUMN last_known_location GEOGRAPHY(POINT, 4326);

          CREATE INDEX idx_lawyers_last_known_location
          ON lawyers
          USING GIST(last_known_location)
          WHERE last_known_location IS NOT NULL;

          ALTER TABLE lawyers
          ADD COLUMN last_location_updated_at TIMESTAMP WITH TIME ZONE;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_emergency_calls_update_timestamp ON emergency_calls;`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_emergency_calls_update_location ON emergency_calls;`,
    );

    // Drop trigger functions
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS update_emergency_call_timestamp;`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS update_emergency_call_location;`,
    );

    // Drop indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_emergency_calls_active;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_emergency_calls_created_at;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_emergency_calls_lawyer_id;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_emergency_calls_user_id;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_emergency_calls_status;`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_emergency_calls_location;`,
    );

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS emergency_calls;`);

    // Remove lawyer location columns
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'lawyers'
          AND column_name = 'last_known_location'
        ) THEN
          DROP INDEX IF EXISTS idx_lawyers_last_known_location;
          ALTER TABLE lawyers DROP COLUMN IF EXISTS last_known_location;
          ALTER TABLE lawyers DROP COLUMN IF EXISTS last_location_updated_at;
        END IF;
      END $$;
    `);
  }
}
