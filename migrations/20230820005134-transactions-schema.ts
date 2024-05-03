import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE enum_transactions_types AS ENUM ('payment', 'fee');
  `);
  await knex.raw(`
    CREATE TYPE enum_transactions_statuses AS ENUM ('initiated', 'cancelled', 'pending', 'failed', 'done');
  `);

  await knex.raw(`
    CREATE TABLE "public"."transactions" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "type" enum_transactions_types NOT NULL,
      "status" enum_transactions_statuses NOT NULL DEFAULT 'initiated',
      "debit_account" uuid NOT NULL,
      "credit_account" uuid NOT NULL,
      "amount" int8 NOT NULL,
      "currency" enum_sub_accounts_currencies NOT NULL,
      "created_at" timestamptz DEFAULT now(),
      "updated_at" timestamptz DEFAULT NULL,
      CONSTRAINT "pk_transactions_id" PRIMARY KEY ("id"),
      CONSTRAINT "fk_transactions_debit_account" FOREIGN KEY ("debit_account") REFERENCES "public"."accounts" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
      CONSTRAINT "fk_transactions_credit_account" FOREIGN KEY ("credit_account") REFERENCES "public"."accounts" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
    );
  `);

  await knex.raw(`
    CREATE INDEX "idx_transactions_type" ON "public"."transactions" ("type");
    CREATE INDEX "idx_transactions_status" ON "public"."transactions" ("status");
    CREATE INDEX "idx_transactions_debit_account" ON "public"."transactions" ("debit_account", "status");
    CREATE INDEX "idx_transactions_credit_account" ON "public"."transactions" ("credit_account", "status");
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX "idx_transactions_credit_account"`);
  await knex.raw(`DROP INDEX "idx_transactions_debit_account"`);
  await knex.raw(`DROP INDEX "idx_transactions_status"`);
  await knex.raw(`DROP INDEX "idx_transactions_type"`);
  await knex.raw(`DROP TABLE "public"."transactions"`);
  await knex.raw(`DROP TYPE enum_transactions_statuses;`);
  await knex.raw(`DROP TYPE enum_transactions_types;`);
}
