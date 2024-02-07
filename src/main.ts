import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Telegraf } from 'telegraf';
async function bootstrap() {
  global.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

  global.bot.launch();
  const app = await NestFactory.create(AppModule);
  await app.listen(3001);
}
bootstrap();
