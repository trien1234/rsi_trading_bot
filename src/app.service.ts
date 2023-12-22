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
import { TREND_TYPE } from './constant';
import { initData } from './initData';
@Injectable()
export class AppService implements OnModuleInit {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  async onModuleInit() {
    await initData(this);

    global.bot.telegram.setMyCommands([
      {
        command: 'help',
        description: 'Hướng dẫn',
      },
      {
        command: '1h_diff_cr',
        description: 'Lấy các token crypto có xu hướng ngược pha trong 1h - 4h',
      },
      {
        command: '1h_equal_cr',
        description: 'Lấy các token crypto có xu hướng đồng pha trong 1h - 4h',
      },
      {
        command: '4h_diff_cr',
        description: 'Lấy các token crypto có xu hướng ngược pha trong 4h - 1d',
      },
      {
        command: '4h_equal_cr',
        description: 'Lấy các token crypto có xu hướng đồng pha trong 4h - 1d',
      },
      {
        command: '1d_diff_cr',
        description: 'Lấy các token crypto có xu hướng ngược pha trong 1d - 1w',
      },
      {
        command: '1d_equal_cr',
        description: 'Lấy các token crypto có xu hướng đồng pha trong 1d - 1w',
      },
    ]);

    global.bot.command('1h_diff_cr', async (msg) => {
      this.checkToken(checkTechnical1h, TREND_TYPE.REVERSE_TREND, msg);
    });

    global.bot.command('1h_equal_cr', async (msg) => {
      this.checkToken(checkTechnical1h, TREND_TYPE.SAME_TREND, msg);
    });

    global.bot.command('4h_diff_cr', async (msg) => {
      this.checkToken(checkTechnical4h, TREND_TYPE.REVERSE_TREND, msg);
    });

    global.bot.command('4h_equal_cr', async (msg) => {
      this.checkToken(checkTechnical4h, TREND_TYPE.SAME_TREND, msg);
    });

    global.bot.command('1d_diff_cr', async (msg) => {
      this.checkToken(checkTechnical1d, TREND_TYPE.REVERSE_TREND, msg);
    });

    global.bot.command('1d_equal_cr', async (msg) => {
      this.checkToken(checkTechnical1d, TREND_TYPE.SAME_TREND, msg);
    });

    global.bot.command('help', async (msg) => {
      global.bot.telegram.sendMessage(
        msg.chat.id,
        `
      \n /1h_diff_cr : Lấy các token crypto có xu hướng ngược pha trong 1h - 4h
      \n /1h_equal_cr : Lấy các token crypto có xu hướng đồng pha trong 1h - 4h
      \n /4h_diff_cr : Lấy các token crypto có xu hướng ngược pha trong 4h - 1d
      \n /4h_equal_cr : Lấy các token crypto có xu hướng đồng pha trong 4h - 1d
      \n /1d_diff_cr : Lấy các token crypto có xu hướng ngược pha trong 1d - 1w
      \n /1d_equal_cr : Lấy các token crypto có xu hướng đồng pha trong 1d - 1w
      `,
        {
          parse_mode: 'HTML',
        },
      );
    });
  }

  async getTrend() {
    global.bot.telegram.setMyCommands([
      {
        command: 'help',
        description: 'Hướng dẫn',
      },
      {
        command: '1h_diff_cr',
        description: 'Lấy các token crypto có xu hướng ngược pha trong 1h - 4h',
      },
      {
        command: '1h_equal_cr',
        description: 'Lấy các token crypto có xu hướng đồng pha trong 1h - 4h',
      },
      {
        command: '4h_diff_cr',
        description: 'Lấy các token crypto có xu hướng ngược pha trong 4h - 1d',
      },
      {
        command: '4h_equal_cr',
        description: 'Lấy các token crypto có xu hướng đồng pha trong 4h - 1d',
      },
      {
        command: '1d_diff_cr',
        description: 'Lấy các token crypto có xu hướng ngược pha trong 1d - 1w',
      },
      {
        command: '1d_equal_cr',
        description: 'Lấy các token crypto có xu hướng đồng pha trong 1d - 1w',
      },
    ]);
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

  checkToken = async (checkTechnical, type, msg) => {
    const content = [];
    for (const token of cryptoPairs) {
      const data = await checkTechnical(this, token, type);
      if (data) {
        content.push(data);
      }
    }
    if (content.length > 0) {
      let batchSize = 10;
      for (let i = 0; i < content.length; i = i + 10) {
        const data = content.slice(i, batchSize);

        if (data.length > 0) {
          global.bot.telegram.sendMessage(msg.chat.id, data.toString(), {
            parse_mode: 'HTML',
          });
        }

        batchSize += 10;
      }
    } else {
      global.bot.telegram.sendMessage(msg.chat.id, 'No data found!', {
        parse_mode: 'HTML',
      });
    }
  };
}
