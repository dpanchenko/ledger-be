import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE enum_accounts_types AS ENUM ('balance', 'regular', 'transit');
  `);

  await knex.raw(`
    CREATE TABLE "public"."accounts" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "type" enum_accounts_types NOT NULL,
      "created_at" timestamptz DEFAULT now(),
      CONSTRAINT "pk_accounts_id" PRIMARY KEY ("id")
    );
  `);

  await knex.raw(`
    CREATE INDEX "idx_accounts_type" ON "public"."accounts" ("type");
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX "idx_accounts_type"`);
  await knex.raw(`DROP TABLE "public"."accounts"`);
  await knex.raw(`DROP TYPE enum_accounts_types;`);
}
