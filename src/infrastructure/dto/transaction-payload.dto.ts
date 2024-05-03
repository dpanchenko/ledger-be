import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ITransactionPayload } from '@domain/types';
import { AmountPayloadDto } from './amount-payload.dto';
import { UUID } from '@libs/types';

export class TransactionPayloadDto extends AmountPayloadDto implements ITransactionPayload {
  @ApiProperty({
    type: String,
    format: 'uuid',
  })
  @IsUUID()
  debitAccount: UUID;

  @ApiProperty({
    type: String,
    format: 'uuid',
  })
  @IsUUID()
  creditAccount: UUID;
}
