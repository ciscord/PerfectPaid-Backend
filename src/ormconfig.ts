import * as PostgressConnectionStringParser from 'pg-connection-string';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const databaseUrl = process.env.DATABASE_URL;
const connectionOptions = PostgressConnectionStringParser.parse(databaseUrl);
const config: any = {
  type: 'postgres',
  host: connectionOptions.host,
  port: Number(connectionOptions.port),
  username: connectionOptions.user,
  password: connectionOptions.password,
  database: connectionOptions.database,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy(),
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  cli: {
    migrationsDir: 'src/migrations',
  },
};

if (process.env.NODE_ENV !== 'local') {
  config.ssl = {
    require: true,
    rejectUnauthorized: false,
  };
}

export = config;
