import {
  MigrationInterface,
  QueryRunner,
  Table,
  Index,
  TableForeignKey,
} from 'typeorm';

/**
 * Create Lawyers Table Migration
 *
 * Creates the lawyers table with full schema for Lawyer Management Context.
 * This table stores lawyer profiles, verification status, specializations,
 * ratings, and availability information.
 */
export class CreateLawyersTable1700000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create lawyers table
    await queryRunner.createTable(
      new Table({
        name: 'lawyers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'licenseNumber',
            type: 'varchar',
            length: '30',
            isUnique: true,
          },
          {
            name: 'specializations',
            type: 'text',
            comment: 'Comma-separated list of specializations',
          },
          {
            name: 'experienceYears',
            type: 'int',
          },
          {
            name: 'ratingValue',
            type: 'decimal',
            precision: 3,
            scale: 2,
            default: 0,
          },
          {
            name: 'reviewCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'bio',
            type: 'text',
          },
          {
            name: 'education',
            type: 'text',
          },
          {
            name: 'status',
            type: 'enum',
            enum: [
              'pending_verification',
              'active',
              'inactive',
              'suspended',
              'banned',
              'deleted',
            ],
            default: "'pending_verification'",
          },
          {
            name: 'verificationStatus',
            type: 'enum',
            enum: [
              'not_submitted',
              'pending',
              'in_review',
              'approved',
              'rejected',
              'documents_requested',
            ],
            default: "'not_submitted'",
          },
          {
            name: 'verificationNotes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'hourlyRate',
            type: 'int',
            isNullable: true,
            comment: 'Hourly rate in kopecks (1 RUB = 100 kopecks)',
          },
          {
            name: 'isAvailable',
            type: 'boolean',
            default: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create foreign key to users table
    await queryRunner.createForeignKey(
      'lawyers',
      new TableForeignKey({
        name: 'FK_LAWYERS_USER',
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Create indexes for performance
    await queryRunner.createIndex(
      'lawyers',
      new Index({
        name: 'IDX_LAWYERS_USER_ID',
        columnNames: ['userId'],
      }),
    );

    await queryRunner.createIndex(
      'lawyers',
      new Index({
        name: 'IDX_LAWYERS_LICENSE_NUMBER',
        columnNames: ['licenseNumber'],
      }),
    );

    await queryRunner.createIndex(
      'lawyers',
      new Index({
        name: 'IDX_LAWYERS_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'lawyers',
      new Index({
        name: 'IDX_LAWYERS_VERIFICATION_STATUS',
        columnNames: ['verificationStatus'],
      }),
    );

    await queryRunner.createIndex(
      'lawyers',
      new Index({
        name: 'IDX_LAWYERS_IS_AVAILABLE',
        columnNames: ['isAvailable'],
      }),
    );

    await queryRunner.createIndex(
      'lawyers',
      new Index({
        name: 'IDX_LAWYERS_RATING',
        columnNames: ['ratingValue'],
      }),
    );

    await queryRunner.createIndex(
      'lawyers',
      new Index({
        name: 'IDX_LAWYERS_CREATED_AT',
        columnNames: ['createdAt'],
      }),
    );

    // Composite indexes for common queries
    await queryRunner.createIndex(
      'lawyers',
      new Index({
        name: 'IDX_LAWYERS_STATUS_AVAILABLE',
        columnNames: ['status', 'isAvailable'],
      }),
    );

    await queryRunner.createIndex(
      'lawyers',
      new Index({
        name: 'IDX_LAWYERS_VERIFICATION_CREATED',
        columnNames: ['verificationStatus', 'createdAt'],
      }),
    );

    // Add check constraints
    await queryRunner.query(`
      ALTER TABLE lawyers
      ADD CONSTRAINT CHK_LAWYERS_EXPERIENCE_POSITIVE
      CHECK (
        "experienceYears" >= 0 AND
        "experienceYears" <= 100
      )
    `);

    await queryRunner.query(`
      ALTER TABLE lawyers
      ADD CONSTRAINT CHK_LAWYERS_RATING_RANGE
      CHECK (
        "ratingValue" >= 0 AND
        "ratingValue" <= 5
      )
    `);

    await queryRunner.query(`
      ALTER TABLE lawyers
      ADD CONSTRAINT CHK_LAWYERS_REVIEW_COUNT_POSITIVE
      CHECK (
        "reviewCount" >= 0
      )
    `);

    await queryRunner.query(`
      ALTER TABLE lawyers
      ADD CONSTRAINT CHK_LAWYERS_HOURLY_RATE_POSITIVE
      CHECK (
        "hourlyRate" IS NULL OR
        "hourlyRate" > 0
      )
    `);

    await queryRunner.query(`
      ALTER TABLE lawyers
      ADD CONSTRAINT CHK_LAWYERS_LICENSE_FORMAT
      CHECK (
        LENGTH(TRIM("licenseNumber")) >= 5
      )
    `);

    // Add comments to table and columns
    await queryRunner.query(`
      COMMENT ON TABLE lawyers IS 'Lawyer profiles in the Advocata platform. Stores professional information, verification status, and ratings.';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN lawyers."userId" IS 'Reference to the user account. One user can have one lawyer profile.';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN lawyers."licenseNumber" IS 'Unique lawyer license number (адвокатский номер). Used for verification.';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN lawyers.specializations IS 'Comma-separated list of legal specializations (e.g., traffic_accidents,criminal_law).';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN lawyers.status IS 'Lawyer account status: pending_verification, active, inactive, suspended, banned, or deleted.';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN lawyers."verificationStatus" IS 'Verification process status: not_submitted, pending, in_review, approved, rejected, or documents_requested.';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN lawyers."ratingValue" IS 'Average rating from 0 to 5 based on client reviews.';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN lawyers."reviewCount" IS 'Total number of reviews received from clients.';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN lawyers."hourlyRate" IS 'Hourly consultation rate in kopecks (100 kopecks = 1 RUB).';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN lawyers."isAvailable" IS 'Whether the lawyer is currently available to take consultations.';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    await queryRunner.dropForeignKey('lawyers', 'FK_LAWYERS_USER');

    // Drop indexes
    await queryRunner.dropIndex('lawyers', 'IDX_LAWYERS_USER_ID');
    await queryRunner.dropIndex('lawyers', 'IDX_LAWYERS_LICENSE_NUMBER');
    await queryRunner.dropIndex('lawyers', 'IDX_LAWYERS_STATUS');
    await queryRunner.dropIndex('lawyers', 'IDX_LAWYERS_VERIFICATION_STATUS');
    await queryRunner.dropIndex('lawyers', 'IDX_LAWYERS_IS_AVAILABLE');
    await queryRunner.dropIndex('lawyers', 'IDX_LAWYERS_RATING');
    await queryRunner.dropIndex('lawyers', 'IDX_LAWYERS_CREATED_AT');
    await queryRunner.dropIndex('lawyers', 'IDX_LAWYERS_STATUS_AVAILABLE');
    await queryRunner.dropIndex('lawyers', 'IDX_LAWYERS_VERIFICATION_CREATED');

    // Drop table
    await queryRunner.dropTable('lawyers');
  }
}
