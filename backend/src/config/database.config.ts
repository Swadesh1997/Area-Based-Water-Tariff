import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getPostgresDatabaseConfig } from './postgresDatabase.config';
import { getMySQLDatabaseConfig } from './mysqlDatabase.config';

/**
 * Dynamically selects database configuration based on DATABASE_TYPE environment variable
 * @returns TypeORM configuration for either PostgreSQL or MySQL
 * @default MySQL if DATABASE_TYPE is not set or invalid
 */
export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const dbType = process.env.DATABASE_TYPE?.toLowerCase() || 'mysql';

  switch (dbType) {
    case 'postgres':
    case 'postgresql':
      console.log('Using PostgreSQL database');
      return getPostgresDatabaseConfig();

    case 'mysql':
      console.log('Using MySQL database');
      return getMySQLDatabaseConfig();

    default:
      console.warn(
        `⚠️  Unknown DATABASE_TYPE: "${process.env.DATABASE_TYPE}". Defaulting to MySQL.`,
      );
      return getMySQLDatabaseConfig();
  }
};
