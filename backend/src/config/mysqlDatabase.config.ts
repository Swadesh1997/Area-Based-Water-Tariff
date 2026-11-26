import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getMySQLDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  username: process.env.MYSQL_USERNAME || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'water_tariff',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  charset: 'utf8mb4',
  timezone: '+00:00',
  extra: {
    connectionLimit: 10,
    connectTimeout: 10000,
  },
});
