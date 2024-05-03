require('module-alias/register');
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiModule } from '@infrastructure/modules';
import { IApiConfig } from '@config/index';

import * as packageJson from '../../package.json';
import { ApplicationExceptionFilter } from '@infrastructure/filters';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(ApiModule);

  app.set('trust proxy', 1);

  app.useGlobalFilters(new ApplicationExceptionFilter());
  const configService = app.get(ConfigService);
  const { port } = configService.get<IApiConfig>('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle(`${packageJson.name} - API`)
    .setDescription(packageJson.description)
    .setVersion(packageJson.version)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/docs', app, document);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors({
    credentials: true,
    origin: true,
  });
  await app.listen(port, () => Logger.log(`Listening at 0.0.0.0:${port}`, 'Server'));
}

bootstrap();
