import { register } from 'tsconfig-paths';

register({
  baseUrl: __dirname,
  paths: {
    '@modules/*': ['modules/*'],
    '@domain/*': ['domain/*'],
    '@application/*': ['application/*'],
    '@infrastructure/*': ['infrastructure/*'],
    '@common/*': ['common/*'],
    '@config/*': ['config/*'],
  },
});

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from '@common/filters/all-exceptions.filter';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const port = configService.get<number>('port') ?? 3000;
  await app.listen(port);
}

void bootstrap();
