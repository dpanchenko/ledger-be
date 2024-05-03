import * as dotenv from 'dotenv';
import { Knex } from 'knex';

dotenv.config();

const knexConfiguration = {
  client: 'postgresql',
  connection: {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
  },
  migrations: {
    tableName: 'knex_migrations',
  },
};

const knexConfigForCompliledJs = {
  ...knexConfiguration,
  migrations: {
    ...knexConfiguration,
    loadExtensions: ['.js'],
  },
};

export const config: { [key: string]: Knex.Config } = {
  development: knexConfiguration,
  production: knexConfigForCompliledJs,
};

export default config;
