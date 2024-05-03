import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    WITH acc AS (
      INSERT INTO "public"."accounts" ("type") VALUES ('balance') RETURNING *
    )
    INSERT INTO "public"."sub_accounts" ("account_id", "currency", "balance")
    VALUES
      ((SELECT "id" from acc), 'AED', 10000000000000),
      ((SELECT "id" from acc), 'USD', 10000000000000),
      ((SELECT "id" from acc), 'EUR', 10000000000000),
      ((SELECT "id" from acc), 'CAD', 10000000000000),
      ((SELECT "id" from acc), 'TRY', 10000000000000),
      ((SELECT "id" from acc), 'THB', 10000000000000);
  `);
  await knex.raw(`
    WITH acc AS (
      INSERT INTO "public"."accounts" ("type") VALUES ('transit') RETURNING "id"
    )
    INSERT INTO "public"."sub_accounts" ("account_id", "currency")
    VALUES
      ((SELECT "id" from acc), 'AED'),
      ((SELECT "id" from acc), 'USD'),
      ((SELECT "id" from acc), 'EUR'),
      ((SELECT "id" from acc), 'CAD'),
      ((SELECT "id" from acc), 'TRY'),
      ((SELECT "id" from acc), 'THB');
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DELETE FROM "public"."sub_accounts"`);
  await knex.raw(`DELETE FROM "public"."accounts"`);
}
