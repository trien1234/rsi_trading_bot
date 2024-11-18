import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Telegraf } from 'telegraf';
async function bootstrap() {
  global.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

  global.bot.launch();
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // Hoặc chỉ định danh sách các domain, ví dụ: ['http://localhost:3000']
    methods: 'GET,POST,PUT,DELETE', // Các phương thức HTTP cho phép
    allowedHeaders: 'Content-Type, Authorization', // Các header cho phép
  });
  await app.listen(3001);
}
bootstrap();
