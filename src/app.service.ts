import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import {
  checkTechnical1d,
  checkTechnical1h,
  checkTechnical4h,
} from './service';
import { cryptoPairs, forexPairs } from './tokens';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import axios from 'axios';
import { API_KEY_FOREX, TREND_TYPE } from './constant';
import { initCr, initData, initFx } from './initData';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './database/tokens.entity';
import { Repository } from 'typeorm';
import { ema, rsi, wma } from 'technicalindicators';
import { getRandomElement } from './common';
@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}
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

      //================================================================
      {
        command: '1h_diff_fx',
        description: 'Lấy các token forex có xu hướng ngược pha trong 1h - 4h',
      },
      {
        command: '1h_equal_fx',
        description: 'Lấy các token forex có xu hướng đồng pha trong 1h - 4h',
      },
      {
        command: '4h_diff_fx',
        description: 'Lấy các token forex có xu hướng ngược pha trong 4h - 1d',
      },
      {
        command: '4h_equal_fx',
        description: 'Lấy các token forex có xu hướng đồng pha trong 4h - 1d',
      },
      {
        command: '1d_diff_fx',
        description: 'Lấy các token forex có xu hướng ngược pha trong 1d - 1w',
      },
      {
        command: '1d_equal_fx',
        description: 'Lấy các token forex có xu hướng đồng pha trong 1d - 1w',
      },
    ]);

    global.bot.command('1h_diff_cr', async (msg) => {
      this.checkToken(
        checkTechnical1h,
        TREND_TYPE.REVERSE_TREND,
        msg,
        cryptoPairs,
      );
    });

    global.bot.command('1h_equal_cr', async (msg) => {
      this.checkToken(
        checkTechnical1h,
        TREND_TYPE.SAME_TREND,
        msg,
        cryptoPairs,
      );
    });

    global.bot.command('4h_diff_cr', async (msg) => {
      this.checkToken(
        checkTechnical4h,
        TREND_TYPE.REVERSE_TREND,
        msg,
        cryptoPairs,
      );
    });

    global.bot.command('4h_equal_cr', async (msg) => {
      this.checkToken(
        checkTechnical4h,
        TREND_TYPE.SAME_TREND,
        msg,
        cryptoPairs,
      );
    });

    global.bot.command('1d_diff_cr', async (msg) => {
      this.checkToken(
        checkTechnical1d,
        TREND_TYPE.REVERSE_TREND,
        msg,
        cryptoPairs,
      );
    });

    global.bot.command('1d_equal_cr', async (msg) => {
      this.checkToken(
        checkTechnical1d,
        TREND_TYPE.SAME_TREND,
        msg,
        cryptoPairs,
      );
    });

    //==========forex=========================

    global.bot.command('1h_diff_fx', async (msg) => {
      this.checkToken(
        checkTechnical1h,
        TREND_TYPE.REVERSE_TREND,
        msg,
        forexPairs,
      );
    });

    global.bot.command('1h_equal_fx', async (msg) => {
      this.checkToken(checkTechnical1h, TREND_TYPE.SAME_TREND, msg, forexPairs);
    });

    global.bot.command('4h_diff_fx', async (msg) => {
      this.checkToken(
        checkTechnical4h,
        TREND_TYPE.REVERSE_TREND,
        msg,
        forexPairs,
      );
    });

    global.bot.command('4h_equal_fx', async (msg) => {
      this.checkToken(checkTechnical4h, TREND_TYPE.SAME_TREND, msg, forexPairs);
    });

    global.bot.command('1d_diff_fx', async (msg) => {
      this.checkToken(
        checkTechnical1d,
        TREND_TYPE.REVERSE_TREND,
        msg,
        forexPairs,
      );
    });

    global.bot.command('1d_equal_fx', async (msg) => {
      this.checkToken(checkTechnical1d, TREND_TYPE.SAME_TREND, msg, forexPairs);
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
      \n =============================================================
      \n /1h_diff_fx : Lấy các token forex có xu hướng ngược pha trong 1h - 4h
      \n /1h_equal_fx : Lấy các token forex có xu hướng đồng pha trong 1h - 4h
      \n /4h_diff_fx : Lấy các token forex có xu hướng ngược pha trong 4h - 1d
      \n /4h_equal_fx : Lấy các token forex có xu hướng đồng pha trong 4h - 1d
      \n /1d_diff_fx : Lấy các token forex có xu hướng ngược pha trong 1d - 1w
      \n /1d_equal_fx : Lấy các token forex có xu hướng đồng pha trong 1d - 1w
      `,
        {
          parse_mode: 'HTML',
        },
      );
    });
  }

  //============================Forex==============================
  @Cron('5 0-23/1 * * *')
  async getFx1h() {
    console.log('update cache 1h fx', new Date());
    for (const token of forexPairs) {
      await initFx(token, this, '1h', '1h');
    }
  }

  @Cron('10 0-23/4 * * *')
  async getFx4h() {
    console.log('update cache 4h fx', new Date());
    for (const token of forexPairs) {
      await initFx(token, this, '4h', '4h');
    }
  }

  @Cron('20 01 * * *')
  async getFx1d() {
    console.log('update cache 1d fx', new Date());
    for (const token of forexPairs) {
      await initFx(token, this, '1day', '1d');
    }
  }
  @Cron('0 40 02 * * 1-2')
  async getFx1w() {
    console.log('update cache 1w fx', new Date());
    for (const token of forexPairs) {
      await initFx(token, this, '1week', '1w');
    }
  }

  //=============================Crypto===========================

  @Cron(CronExpression.EVERY_10_MINUTES)
  async getRSI1h() {
    for (const token of cryptoPairs) {
      await initCr(token, this, '1h');
    }
  }
  @Cron(CronExpression.EVERY_10_MINUTES)
  async getRSI4h() {
    for (const token of cryptoPairs) {
      await initCr(token, this, '4h');
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async getRSI1d() {
    for (const token of cryptoPairs) {
      await initCr(token, this, '1d');
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async getRSI1w() {
    for (const token of cryptoPairs) {
      await initCr(token, this, '1w');
    }
  }

  checkToken = async (checkTechnical, type, msg, tokens) => {
    const content = [];
    for (const token of tokens) {
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

  async getCache() {
    const data1h = await this.cacheManager.get(`XAU/USD_1h`);
    const data4h = await this.cacheManager.get(`XAU/USD_4h`);
    console.log(
      '🚀 ~ file: app.service.ts:298 ~ AppService ~ getCache ~ data1h:',
      data1h,
    );
    console.log(
      '🚀 ~ file: app.service.ts:299 ~ AppService ~ getCache ~ data4h:',
      data4h,
    );
    const data1d = await this.cacheManager.get(`XAU/USD_1d`);
    const data1w = await this.cacheManager.get(`XAU/USD_1w`);
    console.log(
      '🚀 ~ file: app.service.ts:302 ~ AppService ~ getCache ~ data1d:',
      data1d,
    );
    console.log(
      '🚀 ~ file: app.service.ts:303 ~ AppService ~ getCache ~ data1w:',
      data1w,
    );
  }

  //===============================

  // @Cron(CronExpression.EVERY_MINUTE)
  // async getRsiHasTrend() {
  //   const rsi_ema = Number(process.env.DIFFERENCE_RSI_EMA);
  //   const ema_wma = Number(process.env.DIFFERENCE_EMA_WMA);
  //   for (const token of cryptoPairs) {
  //     const res1h = await axios.get(
  //       `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=1m&limit=61`,
  //     );

  //     const price = res1h?.data?.map((val) => val?.[4]);
  //     const rsis = rsi({ values: price, period: 14 });
  //     const emas = ema({ values: rsis, period: 9 });
  //     const wmas = wma({ values: rsis, period: 45 });

  //     const rsiLast = rsis[rsis.length - 1];
  //     const emaLast = rsis[emas.length - 1];
  //     const wmaLast = rsis[wmas.length - 1];

  //     const data = await this.tokenRepository.findOne({
  //       where: {
  //         token: token,
  //       },
  //     });
  //     if (!data && rsiLast > 75) {
  //       await this.tokenRepository.save({
  //         token: token,
  //         process: 1,
  //         trend: 'up',
  //       });
  //     }

  //     if (!data && rsiLast < 25) {
  //       await this.tokenRepository.save({
  //         token: token,
  //         process: 1,
  //         trend: 'downd',
  //       });
  //     }

  //     if (data?.process === 1 && data?.trend === 'up') {
  //       if (
  //         emaLast - rsiLast > 4 &&
  //         wmaLast - emaLast > 3 &&
  //         rsiLast < 60 &&
  //         emaLast < 60 &&
  //         wmaLast < 60
  //       ) {
  //         await this.tokenRepository.save({
  //           process: 2,
  //           id: data.id,
  //         });
  //       }
  //     }

  //     if (data?.process === 2 && data?.trend === 'up') {
  //       if (rsiLast - wmaLast > 1) {
  //         global.bot.telegram.sendMessage(768843979, `${token} long`, {
  //           parse_mode: 'HTML',
  //         });
  //       }
  //     }

  //     if (data?.process === 1 && data?.trend === 'downd') {
  //       if (
  //         rsiLast - emaLast > 4 &&
  //         emaLast - wmaLast > 3 &&
  //         rsiLast > 40 &&
  //         emaLast > 40 &&
  //         wmaLast > 40
  //       ) {
  //         await this.tokenRepository.save({
  //           process: 2,
  //           id: data.id,
  //         });
  //       }
  //     }

  //     if (data?.process === 2 && data?.trend === 'downd') {
  //       if (wmaLast - rsiLast > 1) {
  //         global.bot.telegram.sendMessage(768843979, `${token} short`, {
  //           parse_mode: 'HTML',
  //         });
  //       }
  //     }
  //   }
  // }
}
