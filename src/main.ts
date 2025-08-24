import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import { LoggerFactory } from './shared/logger/util/logger.factory';

async function bootstrap() {
  const logger = LoggerFactory('application-main');
  const app = await NestFactory.create(AppModule);
  app.useLogger(logger);
  await app.listen(process.env.PORT!);
}
bootstrap();
