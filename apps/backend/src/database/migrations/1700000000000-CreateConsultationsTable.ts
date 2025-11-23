import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Create Consultations Table
 *
 * Migration creates the consultations table with all necessary columns and indexes
 */
export class CreateConsultationsTable1700000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create consultations table
    await queryRunner.createTable(
      new Table({
        name: 'consultations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'clientId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'lawyerId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            isNullable: false,
            default: "'pending'",
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '10',
            isNullable: false,
            default: "'RUB'",
          },
          {
            name: 'scheduledStart',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'scheduledEnd',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'confirmedAt',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'startedAt',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'completedAt',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'cancelledAt',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'rating',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'review',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'cancellationReason',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for performance
    await queryRunner.createIndex(
      'consultations',
      new TableIndex({
        name: 'IDX_CONSULTATIONS_CLIENT_ID',
        columnNames: ['clientId'],
      }),
    );

    await queryRunner.createIndex(
      'consultations',
      new TableIndex({
        name: 'IDX_CONSULTATIONS_LAWYER_ID',
        columnNames: ['lawyerId'],
      }),
    );

    await queryRunner.createIndex(
      'consultations',
      new TableIndex({
        name: 'IDX_CONSULTATIONS_STATUS',
        columnNames: ['status'],
      }),
    );

    // Composite index for client + status (for filtering)
    await queryRunner.createIndex(
      'consultations',
      new TableIndex({
        name: 'IDX_CONSULTATIONS_CLIENT_STATUS',
        columnNames: ['clientId', 'status'],
      }),
    );

    // Composite index for lawyer + status (for filtering)
    await queryRunner.createIndex(
      'consultations',
      new TableIndex({
        name: 'IDX_CONSULTATIONS_LAWYER_STATUS',
        columnNames: ['lawyerId', 'status'],
      }),
    );

    // Index for scheduled consultations
    await queryRunner.createIndex(
      'consultations',
      new TableIndex({
        name: 'IDX_CONSULTATIONS_SCHEDULED_START',
        columnNames: ['scheduledStart'],
      }),
    );

    // Index for finding expired consultations
    await queryRunner.createIndex(
      'consultations',
      new TableIndex({
        name: 'IDX_CONSULTATIONS_CREATED_AT',
        columnNames: ['createdAt'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all indexes
    await queryRunner.dropIndex('consultations', 'IDX_CONSULTATIONS_CREATED_AT');
    await queryRunner.dropIndex('consultations', 'IDX_CONSULTATIONS_SCHEDULED_START');
    await queryRunner.dropIndex('consultations', 'IDX_CONSULTATIONS_LAWYER_STATUS');
    await queryRunner.dropIndex('consultations', 'IDX_CONSULTATIONS_CLIENT_STATUS');
    await queryRunner.dropIndex('consultations', 'IDX_CONSULTATIONS_STATUS');
    await queryRunner.dropIndex('consultations', 'IDX_CONSULTATIONS_LAWYER_ID');
    await queryRunner.dropIndex('consultations', 'IDX_CONSULTATIONS_CLIENT_ID');

    // Drop table
    await queryRunner.dropTable('consultations');
  }
}
