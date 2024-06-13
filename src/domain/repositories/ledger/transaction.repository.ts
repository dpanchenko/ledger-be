import { UUID } from '@libs/types';
import { TransactionEntity } from '../../entities';

export abstract class TransactionRepository {
  abstract getById(id: UUID, transactionId?: UUID): Promise<TransactionEntity | null>;
  abstract save(entity: TransactionEntity, transactionId?: UUID): Promise<TransactionEntity | null>;
}
