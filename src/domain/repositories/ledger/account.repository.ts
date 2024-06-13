import { UUID } from '@libs/types';
import { AccountEntity } from '../../entities';
import { AccountType, Currency } from '@domain/types';

export abstract class AccountRepository {
  abstract getById(id: UUID, transactionId?: UUID): Promise<AccountEntity | null>;
  abstract getByType(type: AccountType, transactionId?: UUID): Promise<AccountEntity[]>;
  abstract create(type: AccountType, currencies: Currency[], transactionId?: UUID): Promise<AccountEntity | null>;
  abstract save(entity: AccountEntity, transactionId?: UUID): Promise<AccountEntity | null>;
}
