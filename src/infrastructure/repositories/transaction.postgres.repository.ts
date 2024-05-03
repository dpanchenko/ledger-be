import { Inject, Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@libs/base';
import { POSTGRESQL_PROVIDER_TOKEN, PostgresqlProvider } from '@libs/providers';
import { UUID } from '@libs/types';
import { TransactionEntity } from '@domain/entities';
import { TransactionRepository } from '@domain/repositories';
import { ITransaction } from '@domain/types';

@Injectable()
export class TransactionPostgresRepository extends AbstractRepository<ITransaction> implements TransactionRepository {
  private readonly logger: Logger = new Logger(TransactionPostgresRepository.name);

  constructor(
    @Inject(POSTGRESQL_PROVIDER_TOKEN)
    protected readonly postgresqlProvider: PostgresqlProvider,
  ) {
    super();
  }

  protected selectFields(): string {
    return `
      "id",
      "status",
      "type",
      "debit_account" as "debitAccount",
      "credit_account" as "creditAccount",
      "amount"::int8 as "amount",
      "currency",
      "created_at" as "createdAt",
      "updated_at" as "updatedAt"
    `;
  }

  private async getMany(query: string, values: any[], transactionId?: UUID): Promise<TransactionEntity[]> {
    const queryResult = await this.runQuery(query, values, transactionId);

    return queryResult.rows.map((row) => new TransactionEntity(row));
  }

  private async getOne(query: string, values: any[], transactionId?: UUID): Promise<TransactionEntity | null> {
    const queryResult = await this.runQuery(query, values, transactionId);

    return queryResult.rows[0] ? new TransactionEntity(queryResult.rows[0]) : null;
  }

  async getById(id: UUID, transactionId?: UUID): Promise<TransactionEntity | null> {
    const query = `SELECT ${this.selectFields()} FROM "public"."transactions" WHERE "id" = $1`;
    const values = [id];

    return this.getOne(query, values, transactionId);
  }

  async save(entity: TransactionEntity, transactionId?: UUID): Promise<TransactionEntity | null> {
    const query = `
      INSERT INTO "public"."transactions"
        ("id", "status", "type", "debit_account", "credit_account", "amount", "currency", "created_at", "updated_at")
      VALUES
        ($1, $2, $3, $4, $5, $6::int8, $7, $8, $9)
      ON CONFLICT (id)
      DO UPDATE SET
        "status" = EXCLUDED."status",
        "updated_at" = now()
      RETURNING ${this.selectFields()}
    `;
    const values = [
      entity.id,
      entity.status,
      entity.type,
      entity.debitAccount,
      entity.creditAccount,
      entity.amount,
      entity.currency,
      entity.createdAt,
      entity.updatedAt,
    ];

    return this.getOne(query, values, transactionId);
  }
}
