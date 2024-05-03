import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE enum_sub_accounts_currencies AS ENUM ('AED', 'USD', 'EUR', 'CAD', 'TRY', 'THB');
  `);

  await knex.raw(`
    CREATE TABLE "public"."sub_accounts" (
      "account_id" uuid NOT NULL,
      "currency" enum_sub_accounts_currencies NOT NULL,
      "balance" int8 NOT NULL DEFAULT 0,
      "hold" int8 NOT NULL DEFAULT 0,
      CONSTRAINT "pk_sub_accounts_account_id_currency" PRIMARY KEY ("account_id", "currency"),
      CONSTRAINT "fk_sub_accounts_accounts" FOREIGN KEY ("account_id") REFERENCES "public"."accounts" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
    );
  `);

  await knex.raw(`
    CREATE UNIQUE INDEX "idx_uq_sub_accounts_account_id_currency" ON "public"."sub_accounts" ("account_id", "currency");
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX "idx_uq_sub_accounts_account_id_currency"`);
  await knex.raw(`DROP TABLE "public"."sub_accounts"`);
  await knex.raw(`DROP TYPE enum_sub_accounts_currencies;`);
}
