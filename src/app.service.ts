import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import {
  checkGoodMh,
  checkGoodMhForex,
  checkTechnical1d,
  checkTechnical1h,
  checkTechnical4h,
} from './service';
import { cryptoPairs, forexPairs, popularToken } from './tokens';
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
    @Inject(CACHE_MANAGER) private cacheManager: Cache, // @InjectRepository(Token) // private readonly tokenRepository: Repository<Token>,
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
        description: 'Crypto ngược pha(1h-4h)',
      },
      {
        command: '1h_equal_cr',
        description: 'Crypto đồng pha(1h-4h)',
      },
      {
        command: '4h_diff_cr',
        description: 'Crypto ngược pha(4h-1d)',
      },
      {
        command: '4h_equal_cr',
        description: 'Crypto đồng pha(4h-1d)',
      },
      {
        command: '1d_diff_cr',
        description: 'Crypto ngược pha(1d-1w)',
      },
      {
        command: '1d_equal_cr',
        description: 'Crypto đồng pha(1d-1w)',
      },

      //================================================================
      {
        command: '1h_diff_fx',
        description: 'Forex ngược pha(1h-4h)',
      },
      {
        command: '1h_equal_fx',
        description: 'Forex đồng pha(1h-4h)',
      },
      {
        command: '4h_diff_fx',
        description: 'Forex ngược pha(4h-1d)',
      },
      {
        command: '4h_equal_fx',
        description: 'Forex đồng pha(4h-1d)',
      },
      {
        command: '1d_diff_fx',
        description: 'Forex ngược pha(1d-1w)',
      },
      {
        command: '1d_equal_fx',
        description: 'Forex đồng pha(1d-1w)',
      },
      {
        command: 'popular_token',
        description: 'Btc, vàng , dầu',
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

    global.bot.command('popular_token', async (msg) => {
      this.checkToken(
        checkTechnical1h,
        TREND_TYPE.SAME_TREND,
        msg,
        popularToken,
      );
      this.checkToken(
        checkTechnical1h,
        TREND_TYPE.REVERSE_TREND,
        msg,
        popularToken,
      );
      this.checkToken(
        checkTechnical4h,
        TREND_TYPE.SAME_TREND,
        msg,
        popularToken,
      );
      this.checkToken(
        checkTechnical4h,
        TREND_TYPE.REVERSE_TREND,
        msg,
        popularToken,
      );
      this.checkToken(
        checkTechnical1d,
        TREND_TYPE.SAME_TREND,
        msg,
        popularToken,
      );
      this.checkToken(
        checkTechnical1d,
        TREND_TYPE.REVERSE_TREND,
        msg,
        popularToken,
      );
    });

    global.bot.command('help', async (msg) => {
      console.log(
        '🚀 ~ file: app.service.ts:225 ~ AppService ~ global.bot.command ~ msg:',
        msg.chat.id,
      );
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
      \n /popular_token : Lấy thông tin BTC, Vàng, Dầu
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
  @Cron(CronExpression.EVERY_5_MINUTES)
  async getRSI15m() {
    for (const token of cryptoPairs) {
      await initCr(token, this, '15m');
    }
  }

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
    console.log(
      '🚀 ~ file: app.service.ts:347 ~ AppService ~ getCache ~ data1h:',
      data1h,
    );
  }

  // @Cron(CronExpression.EVERY_5_MINUTES)
  // async getRsiHasTrend() {
  //   const rsi_ema = Number(process.env.DIFFERENCE_RSI_EMA);
  //   const ema_wma = Number(process.env.DIFFERENCE_EMA_WMA);
  //   for (const token of cryptoPairs) {
  //     const res1h = await axios.get(
  //       `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=5m&limit=61`,
  //     );

  //     const price = res1h?.data?.map((val) => val?.[4]);
  //     price.pop();
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

  //     // lên 80
  //     if (!data && rsiLast > 80) {
  //       await this.tokenRepository.save({
  //         token: token,
  //         process: 1,
  //         trend: 'up',
  //       });
  //     }

  //     if (!data && rsiLast < 20) {
  //       await this.tokenRepository.save({
  //         token: token,
  //         process: 1,
  //         trend: 'downd',
  //       });
  //     }

  //     // rồi cắt xuống tẽ 3 đường

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

  //     //rsi cắt lên ema
  //     if (data?.process === 2 && data?.trend === 'up') {
  //       if (rsiLast > emaLast && emaLast < wmaLast) {
  //         await this.tokenRepository.save({
  //           id: data.id,
  //           rsi: rsiLast,
  //           price: price[price.length - 1],
  //           process: 3,
  //         });
  //       }
  //       if (rsiLast < 20) {
  //         await this.tokenRepository.delete({
  //           id: data.id,
  //         });
  //       }
  //     }

  //     if (data?.process === 2 && data?.trend === 'downd') {
  //       if (rsiLast < emaLast && emaLast > wmaLast) {
  //         await this.tokenRepository.save({
  //           process: 3,
  //           id: data.id,
  //           rsi: rsiLast,
  //           price: price[price.length - 1],
  //         });
  //       }
  //       if (rsiLast > 80) {
  //         await this.tokenRepository.delete({
  //           id: data.id,
  //         });
  //       }
  //     }

  //     // rsi cắt xuống ema (chuẩn bị vòng thứ 2)

  //     if (data?.process === 3 && data?.trend === 'up') {
  //       if (rsiLast - emaLast > 3 && emaLast - wmaLast > 2) {
  //         await this.tokenRepository.save({
  //           process: 4,
  //           id: data.id,
  //           rsi: rsiLast,
  //           price: price[price.length - 1],
  //         });
  //       }
  //       // nếu k cắt xuống mà đi lên luôn thì delete
  //       if (rsiLast > emaLast && emaLast > wmaLast) {
  //         await this.tokenRepository.delete({
  //           id: data.id,
  //         });
  //       }
  //     }

  //     if (data?.process === 3 && data?.trend === 'downd') {
  //       if (emaLast - rsiLast > 3 && wmaLast - emaLast > 2) {
  //         await this.tokenRepository.save({
  //           process: 4,
  //           id: data.id,
  //           rsi: rsiLast,
  //           price: price[price.length - 1],
  //         });
  //       }
  //       // nếu k cắt lên mà đi xuống luôn thì delete
  //       if (rsiLast < emaLast && emaLast < wmaLast) {
  //         await this.tokenRepository.delete({
  //           id: data.id,
  //         });
  //       }
  //     }

  //     //=========== chuẩn bị vòng 3 phân kì

  //     if (data?.process === 4 && data?.trend === 'up') {
  //       if (rsiLast > emaLast) {
  //         global.bot.telegram.sendMessage(768843979, `Chuẩn bị long ${token}`, {
  //           parse_mode: 'HTML',
  //         });
  //       }
  //     }

  //     if (data?.process === 4 && data?.trend === 'downd') {
  //       if (rsiLast < emaLast) {
  //         global.bot.telegram.sendMessage(
  //           768843979,
  //           `Chuẩn bị short ${token} `,
  //           {
  //             parse_mode: 'HTML',
  //           },
  //         );
  //       }
  //     }
  //   }
  // }

  // @Cron(CronExpression.EVERY_5_MINUTES)
  // async macdTrend() {
  //   for (const token of cryptoPairs) {
  //     const res5m = await axios.get(
  //       `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=5m&limit=100`,
  //     );
  //     const price = res5m?.data?.map((val) => Number(val?.[4]));
  //     price.pop();
  //     const macds = MACD.calculate({
  //       values: price,
  //       SimpleMAOscillator: false,
  //       SimpleMASignal: false,
  //       fastPeriod: 12,
  //       slowPeriod: 26,
  //       signalPeriod: 9,
  //     });
  //     const macdData = macds?.map((val) => val.histogram);
  //     const result = macdData?.reverse();
  //     checkMacdTrend(result, token);
  //   }
  // }

  // @Cron(CronExpression.EVERY_5_MINUTES)
  // async getGoodMh() {
  //   for (const token of cryptoPairs) {
  //     const data: any = await this.cacheManager.get(`${token}_good_mh`);
  //     if (!data) {
  //       checkGoodMh(this, token);
  //     }
  //   }
  // }
  // @Cron(CronExpression.EVERY_HOUR)
  // async getGoodMhForex() {
  //   for (const token of forexPairs) {
  //     const data: any = await this.cacheManager.get(`${token}_good_mh`);
  //     if (!data) {
  //       checkGoodMhForex(this, token);
  //     }
  //   }
  // }
}
