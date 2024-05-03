import { AbstractUseCase } from '@libs/base';

import { OpenAccountRequestDto } from './open-account.request.dto';
import { OpenAccountResponseDto } from './open-account.response.dto';
import { AccountService } from '@domain/services';
import { AccountType } from '@domain/types';

export class OpenAccountUseCase extends AbstractUseCase<OpenAccountRequestDto, OpenAccountResponseDto> {
  constructor(private readonly accountService: AccountService) {
    super();
  }

  async action(params: OpenAccountRequestDto): Promise<OpenAccountResponseDto> {
    await this.accountService.createAccount(AccountType.Regular, params);
  }
}
