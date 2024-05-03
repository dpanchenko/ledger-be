import { ClientConfig, Pool, PoolClient, QueryResult } from 'pg';

import { IPostgresConfig } from '@config/index';
import { UUID } from '@libs/types';
import { generateUuid } from '@libs/helpers';

const RELEASE_CONNECTION_TIMEOUT = 5000;

export class PostgresqlProvider {
  private provider: Pool;
  private allocatedConnections: Record<UUID, PoolClient> = {};

  constructor(private readonly postgresConfig: IPostgresConfig) {
    const config: ClientConfig = {
      user: postgresConfig.user,
      database: postgresConfig.database,
      password: postgresConfig.password,
      port: postgresConfig.port,
      host: postgresConfig.host,
    };
    this.provider = new Pool({
      ...config,
      // log: console.log,
    });

    this.provider.connect();
  }

  private async getPoolClient(): Promise<PoolClient> {
    const client = await this.provider.connect();

    return client;
  }

  public async allocateConnection(transactionId?: UUID): Promise<UUID> {
    transactionId = transactionId ?? generateUuid();

    if (!this.allocatedConnections[transactionId]) {
      this.allocatedConnections[transactionId] = await this.getPoolClient();
    }

    setTimeout(() => {
      this.releaseConnection(transactionId);
    }, RELEASE_CONNECTION_TIMEOUT);

    return transactionId;
  }

  public async releaseConnection(transactionId: UUID): Promise<void> {
    if (this.allocatedConnections[transactionId]) {
      await this.allocatedConnections[transactionId].release();
      delete this.allocatedConnections[transactionId];
    }
  }

  private getConnection(transactionId?: UUID) {
    if (this.allocatedConnections[transactionId]) {
      return this.allocatedConnections[transactionId];
    }

    return this.provider;
  }

  public executeQuery<T>(query: string, values?: any[], transactionId?: string): Promise<QueryResult<T>> {
    try {
      const cleanQuery = query.replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ');
      const connection = this.getConnection(transactionId);

      return connection.query<T>(cleanQuery, values);
    } catch (err) {
      console.error('--> DB error: ', query, values);

      throw err;
    }
  }
}
