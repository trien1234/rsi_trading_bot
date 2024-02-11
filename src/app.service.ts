import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Cache } from 'cache-manager';
import { ema, rsi, wma } from 'technicalindicators';
import { Repository } from 'typeorm';
import { TREND_TYPE } from './constant';
import { Token } from './database/tokens.entity';
import { TokenHaveTrend } from './database/tokensHaveTrend.entity';
import { initCr, initData, initFx } from './initData';
import {
  checkGoodMh,
  checkTechnical1d,
  checkTechnical1h,
  checkTechnical4h,
  checkTrendH4,
} from './service';
import { cryptoPairs, forexPairs, popularToken } from './tokens';
@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @InjectRepository(TokenHaveTrend)
    private readonly tokenHaveTrendRepository: Repository<TokenHaveTrend>,
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

  @Cron('0 */15 * * * *')
  async getFx15m() {
    for (const token of forexPairs) {
      await initFx(token, this, '15min', '15m');
    }
  }

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

  @Cron('0 */15 * * * *')
  async getRSI15m() {
    for (const token of cryptoPairs) {
      await initCr(token, this, '15m');
    }
  }

  @Cron('7 0-23/1 * * *')
  async getRSI1h() {
    for (const token of cryptoPairs) {
      await initCr(token, this, '1h');
    }
  }
  @Cron('17 0-23/4 * * *')
  async getRSI4h() {
    for (const token of cryptoPairs) {
      await initCr(token, this, '4h');
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async getRSI1d() {
    for (const token of cryptoPairs) {
      await initCr(token, this, '1d');
    }
  }

  @Cron('0 50 02 * * 1-2')
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

  async webhook(body) {
    console.log('🚀 ~ webhook', body);
    global.bot.telegram.sendMessage(
      process.env.TELEGRAM_BOT_TOKEN_XAU_ID,
      `<b>${body?.text}</b>`,
      {
        parse_mode: 'HTML',
      },
    );
  }

  @Cron('0 */15 * * * *')
  async getRsiHasTrend() {
    for (const token of cryptoPairs) {
      let priceData15m: any = await this.cacheManager.get(`${token}_15m`);
      let priceData1h: any = await this.cacheManager.get(`${token}_1h`);
      let priceData4h: any = await this.cacheManager.get(`${token}_4h`);
      let priceData1d: any = await this.cacheManager.get(`${token}_1d`);

      if (!priceData15m?.length || priceData15m?.length === 0) {
        const res = await axios.get(
          `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=15m&limit=61`,
        );

        priceData15m = res?.data?.map((val) => val?.[4]);
        priceData15m?.pop();
      }
      if (!priceData1h?.length || priceData1h?.length === 0) {
        const res = await axios.get(
          `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=1h&limit=61`,
        );

        priceData1h = res?.data?.map((val) => val?.[4]);
        priceData1h?.pop();
      }
      if (!priceData4h?.length || priceData4h?.length === 0) {
        const res = await axios.get(
          `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=4h&limit=61`,
        );

        priceData4h = res?.data?.map((val) => val?.[4]);
        priceData4h?.pop();
      }
      if (!priceData1d?.length || priceData1d?.length === 0) {
        const res = await axios.get(
          `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=1d&limit=61`,
        );

        priceData1d = res?.data?.map((val) => val?.[4]);
        priceData1d?.pop();
      }
      const checkToken = async (price, time) => {
        const rsis = rsi({ values: price, period: 14 });
        const emas = ema({ values: rsis, period: 9 });
        const wmas = wma({ values: rsis, period: 45 });

        const rsiLast = rsis[rsis.length - 1];
        const emaLast = emas[emas.length - 1];
        const wmaLast = wmas[wmas.length - 1];

        const data = await this.tokenHaveTrendRepository.findOne({
          where: {
            token: token,
            time: time,
            type: 'CRYPTO',
          },
        });

        // lên 80
        if (rsiLast > 80) {
          const dataModel: any = {
            token: token,
            process: 1,
            trend: 'up',
            time: time,
            type: 'CRYPTO',
          };
          if (data) {
            dataModel.id = data.id;
          }
          await this.tokenHaveTrendRepository.save(dataModel);
        }

        if (rsiLast < 20) {
          const dataModel: any = {
            token: token,
            process: 1,
            trend: 'downd',
            time: time,
            type: 'CRYPTO',
          };
          if (data) {
            dataModel.id = data.id;
          }
          await this.tokenHaveTrendRepository.save(dataModel);
        }

        // rồi cắt xuống tẽ 3 đường
        if (data?.process === 1 && data?.trend === 'up') {
          if (rsiLast < emaLast && emaLast < wmaLast) {
            global.bot.telegram.sendMessage(
              process.env.TELEGRAM_BOT_TOKEN_MY_ID,
              `<b>Chờ đến kháng cự gần nhất, phân kì hoặc fibo 0.5 buy: ${token} time: ${time}</b>`,
              {
                parse_mode: 'HTML',
              },
            );
            await this.tokenHaveTrendRepository.delete({
              id: data.id,
            });
          }
        }

        if (data?.process === 1 && data?.trend === 'downd') {
          if (rsiLast > emaLast && emaLast > wmaLast) {
            global.bot.telegram.sendMessage(
              process.env.TELEGRAM_BOT_TOKEN_MY_ID,
              `<b>Chờ đến kháng cự gần nhất, phân kì hoặc fibo 0.5 sell: ${token} time: ${time}</b>`,
              {
                parse_mode: 'HTML',
              },
            );
            await this.tokenHaveTrendRepository.delete({
              id: data.id,
            });
          }
        }
      };

      checkToken(priceData15m, '15m');
      checkToken(priceData1h, '1h');
      checkToken(priceData4h, '4h');
      checkToken(priceData1d, '1d');
    }
  }

  @Cron('19 0-23/4 * * *')
  async checkTrendH4Cr() {
    for (const token of cryptoPairs) {
      checkTrendH4(this, token, '4h', 172800000, 'CRYPTO');
    }
  }

  @Cron('19 0-23/4 * * *')
  async checkTrendH4Fx() {
    for (const token of forexPairs) {
      checkTrendH4(this, token, '4h', 172800000, 'FOREX');
    }
  }

  @Cron('0 */15 * * * *')
  async checkGoodMh() {
    const data = await this.tokenRepository
      .createQueryBuilder('tokens')
      .where('tokens.nextTime < :value and tokens.type = :type', {
        value: Date.now(),
        type: 'CRYPTO',
      })
      .getMany();
    console.log('🚀 ~ AppService ~ checkGoodMh ~ data:', data);

    if (data.length > 0) {
      for (const token of data) {
        checkGoodMh(this, token, '15m', '1h', '4h', 'CRYPTO');
      }
    }
  }

  @Cron('0 */17 * * * *')
  async checkGoodMhFx() {
    const data = await this.tokenRepository
      .createQueryBuilder('tokens')
      .where('tokens.nextTime < :value and tokens.type = :type', {
        value: Date.now(),
        type: 'FOREX',
      })
      .getMany();

    if (data.length > 0) {
      for (const token of data) {
        checkGoodMh(this, token, '15m', '1h', '4h', 'FOREX');
      }
    }
  }
}
