import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

/**
 * Create Users Table Migration
 *
 * Creates the users table with full schema for Identity & Access Context.
 * This table stores user account information including authentication details,
 * profile data, and account status.
 */
export class CreateUsersTable1700000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'phoneNumber',
            type: 'varchar',
            length: '20',
            isUnique: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'firstName',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'lastName',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['client', 'lawyer', 'admin'],
            default: "'client'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: [
              'pending_verification',
              'active',
              'suspended',
              'banned',
              'deleted',
            ],
            default: "'pending_verification'",
          },
          {
            name: 'isPhoneVerified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'isEmailVerified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'lastLoginAt',
            type: 'timestamp',
            isNullable: true,
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

    // Create indexes for performance
    await queryRunner.createIndex(
      'users',
      new Index({
        name: 'IDX_USERS_PHONE_NUMBER',
        columnNames: ['phoneNumber'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new Index({
        name: 'IDX_USERS_EMAIL',
        columnNames: ['email'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new Index({
        name: 'IDX_USERS_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new Index({
        name: 'IDX_USERS_ROLE',
        columnNames: ['role'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new Index({
        name: 'IDX_USERS_CREATED_AT',
        columnNames: ['createdAt'],
      }),
    );

    // Add check constraints
    await queryRunner.query(`
      ALTER TABLE users
      ADD CONSTRAINT CHK_USERS_PHONE_FORMAT
      CHECK (
        "phoneNumber" ~ '^\\+[1-9][0-9]{1,14}$'
      )
    `);

    await queryRunner.query(`
      ALTER TABLE users
      ADD CONSTRAINT CHK_USERS_NAME_NOT_EMPTY
      CHECK (
        TRIM("firstName") <> '' AND
        TRIM("lastName") <> ''
      )
    `);

    // Add comment to table
    await queryRunner.query(`
      COMMENT ON TABLE users IS 'User accounts in the Advocata platform. Stores identity and access information for clients, lawyers, and admins.';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN users.role IS 'User role: client, lawyer, or admin. Determines access permissions.';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN users.status IS 'Account status: pending_verification, active, suspended, banned, or deleted.';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN users."phoneNumber" IS 'Unique phone number in E.164 format (e.g., +79991234567). Used for SMS authentication.';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN users.email IS 'Optional email address. Can be null if user registers with phone only.';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('users', 'IDX_USERS_PHONE_NUMBER');
    await queryRunner.dropIndex('users', 'IDX_USERS_EMAIL');
    await queryRunner.dropIndex('users', 'IDX_USERS_STATUS');
    await queryRunner.dropIndex('users', 'IDX_USERS_ROLE');
    await queryRunner.dropIndex('users', 'IDX_USERS_CREATED_AT');

    // Drop table
    await queryRunner.dropTable('users');
  }
}
