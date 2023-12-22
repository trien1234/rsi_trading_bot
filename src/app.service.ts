import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import {
  checkTechnical1d,
  checkTechnical1h,
  checkTechnical4h,
} from './service';
import { cryptoPairs } from './tokens';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import axios from 'axios';
@Injectable()
export class AppService implements OnModuleInit {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  async onModuleInit() {
    global.bot.command('1h', async (msg) => {
      let content = '';
      for (const token of cryptoPairs) {
        content += await checkTechnical1h(this, token);
      }
      if (content) {
        global.bot.telegram.sendMessage(msg.chat.id, content, {
          parse_mode: 'HTML',
        });
      } else {
        global.bot.telegram.sendMessage(msg.chat.id, 'No data found!', {
          parse_mode: 'HTML',
        });
      }
    });

    global.bot.command('4h', async (msg) => {
      let content = '';
      for (const token of cryptoPairs) {
        content += await checkTechnical4h(this, token);
      }
      if (content) {
        global.bot.telegram.sendMessage(msg.chat.id, content, {
          parse_mode: 'HTML',
        });
      } else {
        global.bot.telegram.sendMessage(msg.chat.id, 'No data found!', {
          parse_mode: 'HTML',
        });
      }
    });

    global.bot.command('1d', async (msg) => {
      let content = '';
      for (const token of cryptoPairs) {
        content += await checkTechnical1d(this, token);
      }
      if (content) {
        global.bot.telegram.sendMessage(msg.chat.id, content, {
          parse_mode: 'HTML',
        });
      } else {
        global.bot.telegram.sendMessage(msg.chat.id, 'No data found!', {
          parse_mode: 'HTML',
        });
      }
    });
  }

  async getTrend() {
    const priceData1h = await this.cacheManager.get(`BTCUSDT_1h`);
    const priceData4h = await this.cacheManager.get(`BTCUSDT_4h`);
    const priceData1d = await this.cacheManager.get(`BTCUSDT_1d`);
    const priceData1w = await this.cacheManager.get(`BTCUSDT_1w`);

    console.log(
      '🚀 ~ file: app.service.ts:90 ~ AppService ~ getTrend ~ priceData1h:',
      priceData1h,
    );

    console.log(
      '🚀 ~ file: app.service.ts:95 ~ AppService ~ getTrend ~ priceData1w:',
      priceData1w,
    );
    console.log(
      '🚀 ~ file: app.service.ts:91 ~ AppService ~ getTrend ~ priceData4h:',
      priceData4h,
    );
    console.log(
      '🚀 ~ file: app.service.ts:92 ~ AppService ~ getTrend ~ priceData1d:',
      priceData1d,
    );
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async getRSI1h() {
    console.log('update cache 1h');
    for (const token of cryptoPairs) {
      const res1h = await axios.get(
        `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=1h&limit=61`,
      );

      const data1h = res1h?.data?.map((val) => val?.[4]);
      await this.cacheManager.set(`${token}_1h`, data1h, 3600000);
    }
    console.log('done');
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async getRSI4h() {
    console.log('update cache 4h');
    for (const token of cryptoPairs) {
      const res4h = await axios.get(
        `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=4h&limit=61`,
      );
      const data4h = res4h?.data?.map((val) => val?.[4]);

      await this.cacheManager.set(`${token}_4h`, data4h, 3600000);
    }
    console.log('done');
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async getRSI1d() {
    console.log('update cache 1d');
    for (const token of cryptoPairs) {
      const res1d = await axios.get(
        `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=1d&limit=61`,
      );

      const data1d = res1d?.data?.map((val) => val?.[4]);

      await this.cacheManager.set(`${token}_1d`, data1d, 3600000);
    }
    console.log('done');
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async getRSI1w() {
    console.log('update cache 1w');
    for (const token of cryptoPairs) {
      const res1w = await axios.get(
        `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=1w&limit=61`,
      );

      const data1w = res1w?.data?.map((val) => val?.[4]);

      await this.cacheManager.set(`${token}_1w`, data1w, 3600000);
    }
    console.log('done');
  }
}
