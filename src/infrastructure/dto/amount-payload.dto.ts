import { IsEnum, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Currency, IAmountPayload } from '@domain/types';

export class AmountPayloadDto implements IAmountPayload {
  @ApiProperty({
    type: Number,
  })
  @IsNumber()
  @Transform(({ value }) => Number(value) * 10000)
  amount: number;

  @ApiProperty({
    enum: Currency,
  })
  @IsEnum(Currency)
  currency: Currency;
}
