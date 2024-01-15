import { ema, rsi, wma } from 'technicalindicators';
import { checkTrend, getRandomElement } from './common';
import { API_KEY_FOREX, TREND_TYPE } from './constant';
import axios from 'axios';
import { delay } from 'rxjs';

export const checkTechnical1h = async (__this: any, token, type) => {
  let priceData1h = await __this.cacheManager.get(`${token}_1h`);
  if (!priceData1h?.length || priceData1h?.length === 0) {
    const res = await axios.get(
      `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=1h&limit=61`,
    );

    priceData1h = res?.data?.map((val) => val?.[4]);
    priceData1h?.pop();
  }

  let priceData4h = await __this.cacheManager.get(`${token}_4h`);
  if (!priceData4h?.length || priceData4h?.length === 0) {
    const res = await axios.get(
      `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=4h&limit=61`,
    );

    priceData4h = res?.data?.map((val) => val?.[4]);
    priceData4h?.pop();
  }
  return checkTrendCommon(token, priceData1h, priceData4h, '1h', '4h', type);
};

export const checkTechnical4h = async (__this: any, token, type) => {
  let priceData4h = await __this.cacheManager.get(`${token}_4h`);
  if (!priceData4h?.length || priceData4h?.length === 0) {
    const res = await axios.get(
      `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=4h&limit=61`,
    );

    priceData4h = res?.data?.map((val) => val?.[4]);
    priceData4h?.pop();
  }

  let priceData1d = await __this.cacheManager.get(`${token}_1d`);

  if (!priceData1d?.length || priceData1d?.length === 0) {
    const res = await axios.get(
      `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=1d&limit=61`,
    );

    priceData1d = res?.data?.map((val) => val?.[4]);
    priceData1d?.pop();
  }
  return checkTrendCommon(token, priceData4h, priceData1d, '4h', '1d', type);
};

export const checkTechnical1d = async (__this: any, token, type) => {
  let priceData1d = await __this.cacheManager.get(`${token}_1d`);
  if (!priceData1d?.length || priceData1d?.length === 0) {
    const res = await axios.get(
      `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=1d&limit=61`,
    );

    priceData1d = res?.data?.map((val) => val?.[4]);
    priceData1d?.pop();
  }

  let priceData1w = await __this.cacheManager.get(`${token}_1w`);
  if (!priceData1w?.length || priceData1w?.length === 0) {
    const res = await axios.get(
      `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=1w&limit=61`,
    );

    priceData1w = res?.data?.map((val) => val?.[4]);
    priceData1w?.pop();
  }

  return checkTrendCommon(token, priceData1d, priceData1w, '1d', '1w', type);
};

const checkTrendCommon = async (token, price1, price2, time1, time2, type) => {
  if (price1?.length && price2?.length) {
    const dataRsi1 = rsi({ values: price1, period: 14 });
    const dataEma1 = ema({ values: dataRsi1, period: 9 });
    const dataWma1 = wma({ values: dataRsi1, period: 45 });

    const dataRsi2 = rsi({ values: price2, period: 14 });
    const dataEma2 = ema({ values: dataRsi2, period: 9 });
    const dataWma2 = wma({ values: dataRsi2, period: 45 });

    const rsi1 = dataRsi1[dataRsi1.length - 1];
    const ema1 = dataEma1[dataEma1.length - 1];
    const wma1 = dataWma1[dataWma1.length - 1];

    const rsi2 = dataRsi2[dataRsi2.length - 1];
    const ema2 = dataEma2[dataEma2.length - 1];
    const wma2 = dataWma2[dataWma2.length - 1];

    let trend1 = null;
    let trend2 = null;

    trend1 = await checkTrend(rsi1, ema1, wma1);
    trend2 = await checkTrend(rsi2, ema2, wma2);

    const content = `\n<b>Token: </b> ${token}
  \n<b>Trending ${time1}: ${
      trend1 === 1 ? 'Up' : trend1 === 2 ? 'Down' : ''
    } </b>
  \n<b>Rsi</b>: ${rsi1} , <b>Ema</b>: ${ema1} , <b>Wma</b>: ${wma1}
  \n<b>Trending ${time2}: ${
      trend2 === 1 ? 'Up' : trend2 === 2 ? 'Down' : ''
    }</b> 
  \n<b>Rsi</b>: ${rsi2} , <b>Ema</b>: ${ema2} ,<b> Wma</b>: ${wma2}
  \n***********************************************
  `;

    if (type === TREND_TYPE.SAME_TREND) {
      if (trend1 && trend2 && trend1 == trend2) {
        return content;
      }
    }
    if (type === TREND_TYPE.REVERSE_TREND) {
      if (trend1 && trend2 && trend1 !== trend2) {
        return content;
      }
    }
  }
};

export const checkGoodMh = async (
  __this: any,
  tokenData,
  time1,
  time2,
  time3,
) => {
  const token = tokenData.token;
  const id = tokenData.id;
  try {
    let priceData15m = await __this.cacheManager.get(`${token}_${time1}`);
    let priceData1h = await __this.cacheManager.get(`${token}_${time2}`);
    let priceData4h = await __this.cacheManager.get(`${token}_${time3}`);

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
    if (priceData15m?.length && priceData1h?.length && priceData4h?.length) {
      const dataRsi1 = rsi({ values: priceData15m, period: 14 });
      const dataEma1 = ema({ values: dataRsi1, period: 9 });
      const dataWma1 = wma({ values: dataRsi1, period: 45 });

      const dataRsi2 = rsi({ values: priceData1h, period: 14 });
      const dataEma2 = ema({ values: dataRsi2, period: 9 });
      const dataWma2 = wma({ values: dataRsi2, period: 45 });

      const dataRsi3 = rsi({ values: priceData4h, period: 14 });
      const dataEma3 = ema({ values: dataRsi3, period: 9 });
      const dataWma3 = wma({ values: dataRsi3, period: 45 });

      const rsi1 = dataRsi1[dataRsi1.length - 1];
      const ema1 = dataEma1[dataEma1.length - 1];
      const wma1 = dataWma1[dataWma1.length - 1];

      const rsi2 = dataRsi2[dataRsi2.length - 1];
      const ema2 = dataEma2[dataEma2.length - 1];
      const wma2 = dataWma2[dataWma2.length - 1];

      const rsi3 = dataRsi3[dataRsi3.length - 1];
      const ema3 = dataEma3[dataEma3.length - 1];
      const wma3 = dataWma3[dataWma3.length - 1];

      // rsi3 < 32 &&
      //   rsi3 > ema3 &&
      //   rsi2 > 50 &&
      //   rsi2 > ema2 &&
      //   rsi1 > 65 &&
      //   rsi1 > ema1;

      // rsi3 > 40 &&
      // rsi3 < 50 &&
      // rsi3 > ema3 &&
      // rsi2 > ema2 &&
      // rsi1 > 60 &&
      // rsi1 > ema1

      if (
        rsi3 > 40 &&
        rsi3 < 50 &&
        rsi3 > ema3 &&
        rsi2 > 50 &&
        rsi2 > ema2 &&
        rsi1 > 65 &&
        rsi1 > ema1
      ) {
        global.bot.telegram.sendMessage(
          process.env.TELEGRAM_BOT_TOKEN_ID,
          `<b>Chờ buy: ${token} (Crypto)</b>`,
          {
            parse_mode: 'HTML',
          },
        );
        await __this.tokenRepository.delete({
          id: id,
        });
      }

      if (
        rsi3 < 60 &&
        rsi3 > 50 &&
        rsi3 < ema3 &&
        rsi2 < 50 &&
        rsi2 < ema2 &&
        rsi1 < 35 &&
        rsi1 < ema1
      ) {
        global.bot.telegram.sendMessage(
          process.env.TELEGRAM_BOT_TOKEN_ID,
          `<b>Chờ sell: ${token} (Crypto)</b>`,
          {
            parse_mode: 'HTML',
          },
        );
        await __this.tokenRepository.delete({
          id: id,
        });
      }
    }
  } catch (error) {
    console.log('🚀 ~ file: service.ts:77 ~ checkGoodMh ~ error:', error);
  }
};

export const checkGoodMhForex = async (__this: any, token) => {
  try {
    await delay(10000);
    const apikey = getRandomElement(API_KEY_FOREX);
    let priceData15m = await __this.cacheManager.get(`${token}_1h`);
    let priceData1h = await __this.cacheManager.get(`${token}_4h`);
    let priceData4h = await __this.cacheManager.get(`${token}_1d`);

    if (priceData15m.length === 0) {
      const res = await axios.get(
        `https://api.twelvedata.com/time_series?symbol=${token}&interval=1h&outputsize=61&apikey=${apikey}`,
      );

      const data = res?.data?.values;
      const result = data?.map((val: any) => val.close);
      priceData15m = result?.reverse();
    }
    if (priceData1h.length === 0) {
      const res = await axios.get(
        `https://api.twelvedata.com/time_series?symbol=${token}&interval=4h&outputsize=61&apikey=${apikey}`,
      );

      const data = res?.data?.values;
      const result = data?.map((val: any) => val.close);
      priceData1h = result?.reverse();
    }
    if (priceData4h.length === 0) {
      const res = await axios.get(
        `https://api.twelvedata.com/time_series?symbol=${token}&interval=1d&outputsize=61&apikey=${apikey}`,
      );

      const data = res?.data?.values;
      const result = data?.map((val: any) => val.close);
      priceData4h = result?.reverse();
    }

    if (priceData15m?.length && priceData1h?.length && priceData4h?.length) {
      const dataRsi1 = rsi({ values: priceData15m, period: 14 });
      const dataEma1 = ema({ values: dataRsi1, period: 9 });
      const dataWma1 = wma({ values: dataRsi1, period: 45 });

      const dataRsi2 = rsi({ values: priceData1h, period: 14 });
      const dataEma2 = ema({ values: dataRsi2, period: 9 });
      const dataWma2 = wma({ values: dataRsi2, period: 45 });

      const dataRsi3 = rsi({ values: priceData4h, period: 14 });
      const dataEma3 = ema({ values: dataRsi3, period: 9 });
      const dataWma3 = wma({ values: dataRsi3, period: 45 });

      const rsi1 = dataRsi1[dataRsi1.length - 1];
      const ema1 = dataEma1[dataEma1.length - 1];
      const wma1 = dataWma1[dataWma1.length - 1];

      const rsi2 = dataRsi2[dataRsi2.length - 1];
      const ema2 = dataEma2[dataEma2.length - 1];
      const wma2 = dataWma2[dataWma2.length - 1];

      const rsi3 = dataRsi3[dataRsi3.length - 1];
      const ema3 = dataEma3[dataEma3.length - 1];
      const wma3 = dataWma3[dataWma3.length - 1];

      if (
        rsi3 > 40 &&
        rsi3 < 50 &&
        rsi3 > ema3 &&
        rsi2 > ema2 &&
        rsi1 > 60 &&
        rsi1 > ema1
      ) {
        await __this.cacheManager.set(`${token}_good_mh`, 1, 1440000000);
        global.bot.telegram.sendMessage(
          process.env.TELEGRAM_BOT_TOKEN_ID,
          `<b>Buy và chờ buy: ${token} (Forex)</b>`,
          {
            parse_mode: 'HTML',
          },
        );
      }

      if (
        rsi3 < 60 &&
        rsi3 > 50 &&
        rsi3 < ema3 &&
        rsi2 < ema2 &&
        rsi1 < 40 &&
        rsi1 < ema1
      ) {
        await __this.cacheManager.set(`${token}_good_mh`, 1, 1440000000);
        global.bot.telegram.sendMessage(
          process.env.TELEGRAM_BOT_TOKEN_ID,
          `<b>Sell và chờ sell: ${token} (Forex)</b>`,
          {
            parse_mode: 'HTML',
          },
        );
      }
    }
  } catch (error) {
    console.log('🚀 ~ file: service.ts:260 ~ checkGoodMhForex ~ error:', error);
  }
};

export const checkTrendH4 = async (
  __this: any,
  token,
  time,
  nextTime,
  tokenType,
) => {
  const data = await __this.tokenRepository.findOne({
    where: {
      token: token,
    },
  });

  const priceData4h = await __this.cacheManager.get(`${token}_${time}`);
  if (priceData4h?.length) {
    const dataRsi3 = rsi({ values: priceData4h, period: 14 });
    const dataEma3 = ema({ values: dataRsi3, period: 9 });
    const dataWma3 = wma({ values: dataRsi3, period: 45 });

    const rsi3 = dataRsi3[dataRsi3.length - 1];
    const ema3 = dataEma3[dataEma3.length - 1];
    const wma3 = dataWma3[dataWma3.length - 1];
    if (rsi3 < 40 && rsi3 < ema3 && ema3 < wma3) {
      const model: any = {
        token: token,
        process: 1,
        trend: 'down',
        nextTime: Date.now() + nextTime, //4h  172800000 // 1h 43200000  // 15m 10800000
        type: tokenType,
      };
      if (data) {
        model.id = data.id;
      }
      await __this.tokenRepository.save(model);
    }
    if (rsi3 > 60 && rsi3 > ema3 && ema3 > wma3) {
      const model: any = {
        token: token,
        process: 1,
        trend: 'up',
        nextTime: Date.now() + nextTime, //4h  172800000 // 1h 43200000  // 15m 10800000
        type: tokenType,
      };
      if (data) {
        model.id = data.id;
      }
      await __this.tokenRepository.save(model);
    }
  }
};
