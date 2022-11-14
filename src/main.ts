if (!process.env.IS_TS_NODE) {
  require('module-alias/register');
}
import { ConfigService } from '@nestjs/config';
import { AppModule } from '@app/app.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = await app.get(ConfigService);

  app.setGlobalPrefix('/api');

  const PORT = config.get('PORT') || 3000;

  await app.listen(PORT, () => console.log(`App started on port: ${PORT}`));
}

bootstrap();
