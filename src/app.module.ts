import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { Token } from './database/tokens.entity';
import { TokenHaveTrend } from './database/tokensHaveTrend.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Token, TokenHaveTrend]),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      max: 1000,
      ttl: 1440000, // seconds
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'trendcrypto',
      entities: [join(__dirname, 'database', '*.entity.{ts,js}')],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
