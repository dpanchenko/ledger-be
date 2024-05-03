import { Inject, Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@libs/base';
import { POSTGRESQL_PROVIDER_TOKEN, PostgresqlProvider } from '@libs/providers';
import { UUID } from '@libs/types';
import { AccountEntity } from '@domain/entities';
import { AccountRepository } from '@domain/repositories';
import { AccountType, Currency, IAccount } from '@domain/types';

@Injectable()
export class AccountPostgresRepository extends AbstractRepository<IAccount> implements AccountRepository {
  private readonly logger: Logger = new Logger(AccountPostgresRepository.name);

  constructor(
    @Inject(POSTGRESQL_PROVIDER_TOKEN)
    protected readonly postgresqlProvider: PostgresqlProvider,
  ) {
    super();
  }

  protected selectFields(): string {
    return `
      "id",
      "type",
      "created_at" as "createdAt"
    `;
  }

  private async getMany(query: string, values: any[], transactionId?: UUID): Promise<AccountEntity[]> {
    const queryResult = await this.runQuery(query, values, transactionId);

    return queryResult.rows.map((row) => new AccountEntity(row));
  }

  private async getOne(query: string, values: any[], transactionId?: UUID): Promise<AccountEntity | null> {
    const queryResult = await this.runQuery(query, values, transactionId);

    return queryResult.rows[0] ? new AccountEntity(queryResult.rows[0]) : null;
  }

  async getById(id: UUID, transactionId?: UUID): Promise<AccountEntity | null> {
    const query = `SELECT ${this.selectFields()} FROM "public"."accounts" WHERE "id" = $1`;
    const values = [id];

    return this.getOne(query, values, transactionId);
  }

  async getByType(type: AccountType, transactionId?: UUID): Promise<AccountEntity[]> {
    const query = `SELECT ${this.selectFields()} FROM "public"."accounts" WHERE "type" = $1`;
    const values = [type];

    return this.getMany(query, values, transactionId);
  }

  async create(type: AccountType, currencies: Currency[], transactionId?: UUID): Promise<AccountEntity | null> {
    const query = `
      WITH
        "acc" AS (
          INSERT INTO "public"."accounts"
            ("type")
          VALUES
            ($1)
          ON CONFLICT ("id")
          DO NOTHING
          RETURNING *
        ),
        "sub" AS (
          INSERT INTO "public"."sub_accounts" ("account_id", "currency")
          VALUES
            ${currencies.map((currency) => `((SELECT "id" from "acc"), '${currency}')`).join(',')}
          ON CONFLICT ("account_id", "currency")
          DO NOTHING
        )
        SELECT ${this.selectFields()} from "acc"
    `;
    const values = [type];

    return this.getOne(query, values, transactionId);
  }

  async save(entity: AccountEntity, transactionId?: UUID): Promise<AccountEntity | null> {
    const query = `
      INSERT INTO "public"."accounts"
        ("id", "type", "created_at")
      VALUES
        ($1, $2, $3)
      ON CONFLICT (id)
      DO UPDATE SET
        "type" = EXCLUDED."type"
      RETURNING ${this.selectFields()}
    `;
    const values = [entity.id, entity.type, entity.createdAt];

    return this.getOne(query, values, transactionId);
  }
}
