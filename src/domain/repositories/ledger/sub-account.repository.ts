import { UUID } from '@libs/types';
import { SubAccountEntity } from '../../entities';
import { Currency } from '@domain/types';

export abstract class SubAccountRepository {
  abstract getByAccountId(id: UUID, transactionId?: UUID): Promise<SubAccountEntity[]>;
  abstract getByAccountIdAndCurrency(
    id: UUID,
    currency: Currency,
    transactionId?: UUID,
  ): Promise<SubAccountEntity | null>;
  abstract debitForAmount(
    id: UUID,
    currency: Currency,
    value: number,
    transactionId?: UUID,
  ): Promise<SubAccountEntity | null>;
  abstract holdForAmount(
    id: UUID,
    currency: Currency,
    value: number,
    transactionId?: UUID,
  ): Promise<SubAccountEntity | null>;
  abstract releaseForAmount(
    id: UUID,
    currency: Currency,
    value: number,
    transactionId?: UUID,
  ): Promise<SubAccountEntity | null>;
  abstract creditForAmount(
    id: UUID,
    currency: Currency,
    value: number,
    transactionId?: UUID,
  ): Promise<SubAccountEntity | null>;
  abstract save(entity: SubAccountEntity, transactionId?: UUID): Promise<SubAccountEntity | null>;
}
