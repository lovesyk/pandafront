import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import Configuration from './configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  //const config: Configuration = app.get(Configuration);
  await app.listen(3000);
}
bootstrap();
