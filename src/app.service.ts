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
      global.bot.telegram.sendMessage(
        msg.chat.id,
        'The system is searching ...',
        {
          parse_mode: 'HTML',
        },
      );
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
      global.bot.telegram.sendMessage(
        msg.chat.id,
        'The system is searching ...',
        {
          parse_mode: 'HTML',
        },
      );
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
      global.bot.telegram.sendMessage(
        msg.chat.id,
        'The system is searching ...',
        {
          parse_mode: 'HTML',
        },
      );
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
    console.log('done');
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async getRSI() {
    console.log('update cache');
    for (const token of cryptoPairs) {
      const res1h = await axios.get(
        `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=1h&limit=61`,
      );

      const res4h = await axios.get(
        `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=4h&limit=61`,
      );

      const res1d = await axios.get(
        `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=1d&limit=61`,
      );

      const res1w = await axios.get(
        `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=1w&limit=61`,
      );
      const data1h = res1h?.data?.map((val) => val?.[4]);
      const data4h = res4h?.data?.map((val) => val?.[4]);
      const data1d = res1d?.data?.map((val) => val?.[4]);
      const data1w = res1w?.data?.map((val) => val?.[4]);

      await this.cacheManager.set(`${token}_1h`, data1h, 0);
      await this.cacheManager.set(`${token}_4h`, data4h, 0);
      await this.cacheManager.set(`${token}_1d`, data1d, 0);
      await this.cacheManager.set(`${token}_1w`, data1w, 0);
    }
    console.log('done');
  }

  // @Cron(CronExpression.EVERY_DAY_AT_1AM)
  // async getRSI1D() {
  //   console.log('pending job 1d');
  //   for (const token of cryptoPairs) {
  //     setTimeout(() => {
  //       checkTechnical1d(this, token);
  //     }, 500);
  //   }
  // }
}
