import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiTags, ApiBody } from '@nestjs/swagger';

import { AmountPayloadDto } from '@infrastructure/dto';

@ApiTags('Accounts')
@ApiBearerAuth()
@Controller('accounts')
export class AccountController {
  constructor(@InjectQueue('account') private readonly accountQueue: Queue) {}

  @Post('')
  @ApiOperation({ summary: 'Open account' })
  @ApiBody({ type: AmountPayloadDto })
  @ApiResponse({
    status: 201,
    description: 'Create account is scheduled',
  })
  async openAccount(@Body() body: AmountPayloadDto): Promise<void> {
    await this.accountQueue.add('create-account', body);
  }
}
