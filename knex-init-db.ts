import * as dotenv from 'dotenv';
import knex from 'knex';

dotenv.config();

const connection = {
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: 'postgres',
};

const q = knex({
  client: 'postgres',
  connection,
});

q.raw('CREATE DATABASE ??', process.env.POSTGRES_DATABASE)
  .then(() => {
    console.log('db created');
    process.exit();
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
