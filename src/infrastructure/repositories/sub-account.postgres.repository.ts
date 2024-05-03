import { Inject, Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@libs/base';
import { POSTGRESQL_PROVIDER_TOKEN, PostgresqlProvider } from '@libs/providers';
import { UUID } from '@libs/types';
import { SubAccountEntity } from '@domain/entities';
import { SubAccountRepository } from '@domain/repositories';
import { Currency, ISubAccount } from '@domain/types';

@Injectable()
export class SubAccountPostgresRepository extends AbstractRepository<ISubAccount> implements SubAccountRepository {
  private readonly logger: Logger = new Logger(SubAccountPostgresRepository.name);

  constructor(
    @Inject(POSTGRESQL_PROVIDER_TOKEN)
    protected readonly postgresqlProvider: PostgresqlProvider,
  ) {
    super();
  }

  protected selectFields(): string {
    return `
      "account_id" as "accountId",
      "currency",
      "balance"::int8 as "balance",
      "hold"::int8 as "hold"
    `;
  }

  private async getMany(query: string, values: any[], transactionId?: UUID): Promise<SubAccountEntity[]> {
    const queryResult = await this.runQuery(query, values, transactionId);

    return queryResult.rows.map((row) => new SubAccountEntity(row));
  }

  private async getOne(query: string, values: any[], transactionId?: UUID): Promise<SubAccountEntity | null> {
    const queryResult = await this.runQuery(query, values, transactionId);

    return queryResult.rows[0] ? new SubAccountEntity(queryResult.rows[0]) : null;
  }

  async getByAccountId(accountId: UUID, transactionId?: UUID): Promise<SubAccountEntity[]> {
    const query = `SELECT ${this.selectFields()} FROM "public"."sub_accounts" WHERE "account_id" = $1`;
    const values = [accountId];

    return this.getMany(query, values, transactionId);
  }

  async getByAccountIdAndCurrency(
    accountId: UUID,
    currency: Currency,
    transactionId?: UUID,
  ): Promise<SubAccountEntity | null> {
    const query = `SELECT ${this.selectFields()} FROM "public"."sub_accounts" WHERE "account_id" = $1 AND "currency" = $2`;
    const values = [accountId, currency];

    return this.getOne(query, values, transactionId);
  }

  async debitForAmount(
    accountId: UUID,
    currency: Currency,
    value: number,
    transactionId?: UUID,
  ): Promise<SubAccountEntity | null> {
    const query = `
      UPDATE "public"."sub_accounts"
      SET "balance" = "balance"::int8 + $3::int8
      WHERE "account_id" = $1 AND "currency" = $2
      RETURNING ${this.selectFields()}
    `;
    const values = [accountId, currency, value];

    return this.getOne(query, values, transactionId);
  }

  async holdForAmount(
    accountId: UUID,
    currency: Currency,
    value: number,
    transactionId?: UUID,
  ): Promise<SubAccountEntity | null> {
    const query = `
      UPDATE "public"."sub_accounts"
      SET "hold" = "hold"::int8 + $3::int8
      WHERE "account_id" = $1 AND "currency" = $2 AND "balance"::int8 - "hold"::int8 - $3::int8 >= 0
      RETURNING ${this.selectFields()}
    `;
    const values = [accountId, currency, value];
    console.log('==>>>> holdForAmount', query, values);

    return this.getOne(query, values, transactionId);
  }

  async releaseForAmount(
    accountId: UUID,
    currency: Currency,
    value: number,
    transactionId?: UUID,
  ): Promise<SubAccountEntity | null> {
    const query = `
      UPDATE "public"."sub_accounts"
      SET "hold" = "hold"::int8 - $3::int8
      WHERE "account_id" = $1 AND "currency" = $2 AND "hold"::int8 - $3::int8 >= 0
      RETURNING ${this.selectFields()}
    `;
    const values = [accountId, currency, value];

    return this.getOne(query, values, transactionId);
  }

  async creditForAmount(
    accountId: UUID,
    currency: Currency,
    value: number,
    transactionId?: UUID,
  ): Promise<SubAccountEntity | null> {
    const query = `
      UPDATE "public"."sub_accounts"
      SET "balance" = "balance"::int8 - $3::int8
      WHERE "account_id" = $1 AND "currency" = $2 AND "balance"::int8 - $3::int8 >= 0
      RETURNING ${this.selectFields()}
    `;
    const values = [accountId, currency, value];

    return this.getOne(query, values, transactionId);
  }

  async save(entity: SubAccountEntity, transactionId?: UUID): Promise<SubAccountEntity | null> {
    const query = `
      INSERT INTO "public"."sub_accounts"
        ("account_id", "currency", "balance", "hold")
      VALUES
        ($1, $2, $3, $4)
      RETURNING ${this.selectFields()}
    `;
    const values = [entity.accountId, entity.currency, entity.balance, entity.hold];

    return this.getOne(query, values, transactionId);
  }
}
