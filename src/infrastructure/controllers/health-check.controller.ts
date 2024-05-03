import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { HealthCheckDto } from '../dto';

import * as packageJson from '../../../package.json';

@ApiTags('HealthCheck')
@Controller('')
export class HealthCheckController {
  @Get('')
  @ApiOperation({ summary: 'HealthCheck' })
  @ApiResponse({ status: 200, type: HealthCheckDto })
  async healthcheck(): Promise<HealthCheckDto> {
    return {
      name: packageJson.name,
      version: packageJson.version,
    };
  }
}
