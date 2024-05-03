import { QueryResult } from 'pg';
import { PostgresqlProvider } from '@libs/providers';

export abstract class AbstractRepository<IEntity> {
  protected abstract postgresqlProvider: PostgresqlProvider;
  protected abstract selectFields(): string;

  protected async runQuery(query: string, values: any[], transactionId?: string): Promise<QueryResult<IEntity>> {
    const queryResult = await this.postgresqlProvider.executeQuery<IEntity>(query, values, transactionId);

    return queryResult;
  }
}
