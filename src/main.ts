import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { HttpExceptionFilter } from './error/error.filter';
import {
  ValidationPipe,
  ClassSerializerInterceptor,
  Logger,
} from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new HttpExceptionFilter(new Logger()));
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
