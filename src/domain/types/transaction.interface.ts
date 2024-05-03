import { UUID } from '@libs/types';
import { ITransactionPayload } from './transaction-payload.interface';
import { TransactionStatus } from './transaction-status.enum';
import { TransactionType } from './transaction-type.enum';

export interface ITransaction extends ITransactionPayload {
  id?: UUID;
  status?: TransactionStatus;
  type: TransactionType;
  createdAt?: Date;
  updatedAt?: Date | null;
}
