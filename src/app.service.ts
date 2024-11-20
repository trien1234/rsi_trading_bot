import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Cache } from 'cache-manager';
import { ema, rsi, wma } from 'technicalindicators';
import { In, Repository } from 'typeorm';
import { TREND_TYPE } from './constant';
import { Token } from './database/tokens.entity';
import { TokenHaveTrend } from './database/tokensHaveTrend.entity';
import { initCr, initData, initFx } from './initData';
import {
  checkGoodMh,
  checkTechnical1d,
  checkTechnical1h,
  checkTechnical4h,
  checkTrendCommonToken,
  checkTrendH4,
} from './service';
import * as moment from 'moment';

import { cryptoPairs, forexPairs, popularToken } from './tokens';
import { Calendars } from './database/calendar.entity';
@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @InjectRepository(Calendars)
    private readonly calendarRepository: Repository<Calendars>,
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
      \n /1d_equal_fx : Lấy các token forex có xu hướng đồng pha trong 1d - 1w
      \n /calendar3 : Lịch kinh tế 3 sao
      \n /calendar2 : Lịch kinh tế 2 sao
      `,
        {
          parse_mode: 'HTML',
        },
      );
    });

    global.bot.command('calendar3', async (msg) => {
      const fromDate = moment()
        .add(7, 'hours')
        .subtract(1, 'd')
        .format('YYYY-MM-DD');
      const toDate = moment().add(7, 'hours').format('YYYY-MM-DD');
      const res: any = await axios.get(
        `https://economic-calendar.tradingview.com/events?from=${fromDate}T17%3A00%3A00.000Z&to=${toDate}T17%3A00%3A00.000Z&countries=US%2CAU%2CCA%2CCH%2CCN%2CEU%2CGB%2CJP`,
      );
      if (res?.data?.result?.length > 0) {
        let calendar = '';
        res?.data?.result?.map((val) => {
          if (val?.importance === 1) {
            const content = `
              \n<b>Date: ${moment(val?.date)
                .add(7, 'hours')
                .format('DD/MM/YYYY HH:mm')}</b>
              \n<b>Currency: ${val?.currency}</b>
              \n<b>Name: </b> ${val?.title}
              \n<b>Importance: ***</b>
              \n***********************************************
            `;
            calendar += content;
          }
        });
        if (calendar.length > 0) {
          global.bot.telegram.sendMessage(msg.chat.id, calendar, {
            parse_mode: 'HTML',
          });
        }
      } else {
        global.bot.telegram.sendMessage(msg.chat.id, 'No data', {
          parse_mode: 'HTML',
        });
      }
    });

    global.bot.command('calendar2', async (msg) => {
      const fromDate = moment()
        .add(7, 'hours')
        .subtract(1, 'd')
        .format('YYYY-MM-DD');
      const toDate = moment().add(7, 'hours').format('YYYY-MM-DD');
      const res: any = await axios.get(
        `https://economic-calendar.tradingview.com/events?from=${fromDate}T17%3A00%3A00.000Z&to=${toDate}T17%3A00%3A00.000Z&countries=US%2CAU%2CCA%2CCH%2CCN%2CEU%2CGB%2CJP`,
      );
      if (res?.data?.result?.length > 0) {
        let calendar = '';
        res?.data?.result?.map((val) => {
          if (val?.importance === 0) {
            const content = `
              \n<b>Date: ${moment(val?.date)
                .add(7, 'hours')
                .format('DD/MM/YYYY HH:mm')}</b>
              \n<b>Currency: ${val?.currency}</b>
              \n<b>Name: </b> ${val?.title}
              \n<b>Importance: **</b>
              \n***********************************************
            `;
            calendar += content;
          }
        });
        if (calendar.length > 0) {
          global.bot.telegram.sendMessage(msg.chat.id, calendar, {
            parse_mode: 'HTML',
          });
        }
      } else {
        global.bot.telegram.sendMessage(msg.chat.id, 'No data', {
          parse_mode: 'HTML',
        });
      }
    });
  }

  // ==========================calendar===========================
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async checkCalendar() {
    const fromDate = moment().subtract(1, 'd').format('YYYY-MM-DD');
    const toDate = moment().format('YYYY-MM-DD');
    const res: any = await axios.get(
      `https://economic-calendar.tradingview.com/events?from=${fromDate}T17%3A00%3A00.000Z&to=${toDate}T17%3A00%3A00.000Z&countries=US%2CAU%2CCA%2CCH%2CCN%2CEU%2CGB%2CJP`,
    );
    if (res?.data?.result?.length > 0) {
      const data = [];
      for (const val of res?.data?.result) {
        if (val?.importance == 1) {
          const time = moment().add(7, 'hours').unix();
          const timeCalendar = moment(val?.date).add(7, 'hours').unix();
          const timeNoti8h = moment(val?.date)
            .add(7, 'hours')
            .subtract(8, 'hours')
            .unix();
          const timeNoti4h = moment(val?.date)
            .add(7, 'hours')
            .subtract(4, 'hours')
            .unix();
          if (timeCalendar > time) {
            data.push({
              date: moment(val?.date)
                .add(7, 'hours')
                .format('DD/MM/YYYY HH:mm')
                .toString(),
              currency: val?.currency,
              title: val?.title,
              importance: val?.importance,
              timeNoti: timeNoti8h,
            });
            data.push({
              date: moment(val?.date)
                .add(7, 'hours')
                .format('DD/MM/YYYY HH:mm')
                .toString(),
              currency: val?.currency,
              title: val?.title,
              importance: val?.importance,
              timeNoti: timeNoti4h,
            });
          }
        }
      }
      await this.calendarRepository.save(data);
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkCalendarNoti() {
    const calendar = await this.calendarRepository
      .createQueryBuilder('calendars')
      .orderBy('timeNoti', 'ASC')
      .limit(1)
      .getOne();

    if (calendar) {
      const data = await this.calendarRepository
        .createQueryBuilder('calendars')
        .where(`calendars.timeNoti = :timeNoti`, {
          timeNoti: calendar.timeNoti,
        })
        .getMany();

      const ids = [];
      const currentTime = moment().add(7, 'hours').unix();
      if (data.length > 0 && currentTime > calendar.timeNoti) {
        let calendar = '';
        data?.map((val) => {
          ids.push(val.id);
          const content = `
              \n<b>Date: ${val?.date}</b>
              \n<b>Currency: ${val?.currency}</b>
              \n<b>Name: </b> ${val?.title}
              \n<b>Importance: ${val.importance === 1 ? '***' : '**'}</b>
              \n***********************************************
            `;
          calendar += content;
        });
        if (calendar.length > 0) {
          global.bot.telegram.sendMessage(
            process.env.TELEGRAM_BOT_TOKEN_ID,
            calendar,
            {
              parse_mode: 'HTML',
            },
          );
          await this.calendarRepository.delete({
            id: In(ids),
          });
        }
      }
    }
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
  @Cron('0 */5 * * * *')
  async getRSI5m() {
    for (const token of cryptoPairs) {
      await initCr(token, this, '5m');
    }
  }

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
      global.bot.telegram.sendMessage(msg.chat.id, 'No data', {
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

  async getToken() {
    const resToken = await this.tokenRepository.find();
    return resToken;
  }

  //20/11/2024

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkTrendCommonToken() {
    for (const token of cryptoPairs) {
      checkTrendCommonToken(this, token, '5m', 1500000, 'CRYPTO');
      checkTrendCommonToken(this, token, '15m', 4500000, 'CRYPTO');
      checkTrendCommonToken(this, token, '1h', 18000000, 'CRYPTO');
      checkTrendCommonToken(this, token, '4h', 72000000, 'CRYPTO');
      checkTrendCommonToken(this, token, '1d', 432000000, 'CRYPTO');
      checkTrendCommonToken(this, token, '1w', 3024000000, 'CRYPTO');
    }

    for (const token of forexPairs) {
      checkTrendCommonToken(this, token, '5m', 1500000, 'FOREX');
      checkTrendCommonToken(this, token, '15m', 4500000, 'FOREX');
      checkTrendCommonToken(this, token, '1h', 18000000, 'FOREX');
      checkTrendCommonToken(this, token, '4h', 72000000, 'FOREX');
      checkTrendCommonToken(this, token, '1d', 432000000, 'FOREX');
      checkTrendCommonToken(this, token, '1w', 3024000000, 'FOREX');
    }
  }
}
