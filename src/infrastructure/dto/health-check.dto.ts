import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckDto {
  @ApiProperty({
    type: String,
    description: `App name`,
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
    description: `App version`,
  })
  @IsString()
  version: string;
}
