import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

/**
 * TypeORM Data Source for Migrations
 *
 * This config is used by TypeORM CLI for running migrations
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'advocata',
  password: process.env.DB_PASSWORD || 'advocata_dev_password',
  database: process.env.DB_DATABASE || 'advocata',

  // Entity patterns
  entities: ['src/**/*.orm-entity.ts'],

  // Migration settings
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',

  // Logging
  logging: process.env.NODE_ENV === 'development',

  // Synchronize is disabled - use migrations instead
  synchronize: false,
});

export default AppDataSource;
