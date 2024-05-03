require('module-alias/register');
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ProcessingModule } from '@infrastructure/modules';
import { IProcessingConfig } from '@config/index';

import * as packageJson from '../../package.json';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(ProcessingModule);

  app.set('trust proxy', 1);

  const configService = app.get(ConfigService);
  const { port } = configService.get<IProcessingConfig>('processing');

  const swaggerConfig = new DocumentBuilder()
    .setTitle(`${packageJson.name} - PROCESSING`)
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
