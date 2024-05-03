import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IId } from '@domain/types';
import { UUID } from '@libs/types';

export class IdPayloadDto implements IId {
  @ApiProperty({
    type: String,
    format: 'uuid',
  })
  @IsUUID()
  id: UUID;
}
