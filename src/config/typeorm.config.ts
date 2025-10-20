import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('database.host'),
  port: configService.get<number>('database.port'),
  username: configService.get<string>('database.user'),
  password: configService.get<string>('database.password'),
  database: configService.get<string>('database.name'),
  autoLoadEntities: true,
  synchronize: false,
  logging: false,
  migrationsRun: true,
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  ssl:
    configService.get<string>('app.nodeEnv') === 'production'
      ? { rejectUnauthorized: false }
      : false,
});
