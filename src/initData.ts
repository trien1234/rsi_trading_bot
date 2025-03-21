import axios from 'axios';
import { cryptoPairs, forexPairs } from './tokens';
import { delay, getRandomElement } from './common';
import { API_KEY_FOREX } from './constant';
import { ema, rsi, wma } from 'technicalindicators';

export const initData = async (__this: any) => {
  console.log('initData start');
  for (const token of forexPairs) {
    await initFx(token, __this, '5min', '5m');
    await initFx(token, __this, '15min', '15m');
    await initFx(token, __this, '1h', '1h');
    await initFx(token, __this, '4h', '4h');
    await initFx(token, __this, '1day', '1d');
    await initFx(token, __this, '1week', '1w');
  }

  for (const token of cryptoPairs) {
    await initCr(token, __this, '5m');
    await initCr(token, __this, '15m');
    await initCr(token, __this, '1h');
    await initCr(token, __this, '4h');
    await initCr(token, __this, '1d');
    await initCr(token, __this, '1w');
  }

  console.log('initData end');
};

export const initFx = async (token, __this, timeApi, timeCache) => {
  await delay(10000);
  const apikey = getRandomElement(API_KEY_FOREX);
  try {
    const res: any = await axios.get(
      `https://api.twelvedata.com/time_series?symbol=${token}&interval=${timeApi}&outputsize=61&apikey=${apikey}`,
    );

    const data = res?.data?.values;

    const result = data?.map((val: any) => val.close);
    const reversed = result?.reverse();
    if (reversed?.length > 0) {
      await __this.cacheManager.set(
        `${token}_${timeCache}`,
        reversed,
        1440000000,
      );
    }
    //========== api web
    const fastLength = 5;
    const slowLength = 30;
    const data1h = reversed?.map((val) => Number(val));
    const dataEmaPriceFast = ema({ values: data1h, period: fastLength });
    const dataEmaPriceSlow = ema({ values: data1h, period: slowLength });
    const macd =
      dataEmaPriceFast[dataEmaPriceFast?.length - 1] -
      dataEmaPriceSlow[dataEmaPriceSlow?.length - 1];

    const tokenDataLast = data?.[0];
    const openPrice = tokenDataLast?.open;
    const closePrice = tokenDataLast?.close;
    const change = ((closePrice - openPrice) / openPrice) * 100;
    const resToken = await __this.tokenRepository.findOne({
      where: {
        token: token,
      },
    });
    const tokenData: any = {
      ...resToken,
      token,
      type: 'FOREX',
      [`macdOld${timeCache}`]: resToken?.[`macd${timeCache}`],
      [`macd${timeCache}`]: macd || '',
    };
    tokenData[timeCache] = change?.toFixed(2);
    if (resToken) {
      tokenData.id = resToken.id;
    }

    await __this.tokenRepository.save(tokenData);

    //detect trend
    const { peaks: extremaPeaks, troughs: extremaTroughs } =
      findExtrema(reversed);
    const trend = determineTrend(extremaPeaks, extremaTroughs);
    console.log('Xu hướng hiện tại:', trend);

    detectReversal(extremaPeaks, extremaTroughs, reversed, token, timeApi);
  } catch (error) {
    console.log('🚀 ~ file: initData.ts:119 ~ initFx ~ error:', error);
  }
};

export const initCr = async (token, __this, time) => {
  const res = await axios.get(
    `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=${time}&limit=61`,
  );
  const data = res?.data?.map((val) => val?.[4]);
  data?.pop();

  if (data?.length > 0) {
    await __this.cacheManager.set(`${token}_${time}`, data, 1440000000);
  }

  const fastLength = 5;
  const slowLength = 30;
  const data1h = data?.map((val) => Number(val));
  const dataEmaPriceFast = ema({ values: data1h, period: fastLength });
  const dataEmaPriceSlow = ema({ values: data1h, period: slowLength });
  const macd =
    dataEmaPriceFast[dataEmaPriceFast?.length - 1] -
    dataEmaPriceSlow[dataEmaPriceSlow?.length - 1];

  const tokenDataLast = res?.data?.[res?.data?.length - 1];
  const openPrice = tokenDataLast?.[1];
  const closePrice = tokenDataLast?.[4];
  const change = ((closePrice - openPrice) / openPrice) * 100;
  const resToken = await __this.tokenRepository.findOne({
    where: {
      token: token,
    },
  });
  const tokenData: any = {
    ...resToken,
    token,
    type: 'CRYPTO',
    [`macdOld${time}`]: resToken?.[`macd${time}`],
    [`macd${time}`]: macd || '',
  };
  tokenData[time] = change?.toFixed(2);
  if (resToken) {
    tokenData.id = resToken.id;
  }

  await __this.tokenRepository.save(tokenData);
};

export const getTrendFx = async (__this: any, time) => {
  const upToken = [];
  const downToken = [];
  for (const token of forexPairs) {
    const priceData = await __this.cacheManager.get(`${token}_${time}`);
    const { peaks: extremaPeaks, troughs: extremaTroughs } =
      findExtrema(priceData);
    const trend = determineTrend(extremaPeaks, extremaTroughs);
    if (trend == 'up') {
      upToken.push(token);
    }
    if (trend == 'down') {
      upToken.push(downToken);
    }
  }
  global.bot.telegram.sendMessage(
    process.env.TELEGRAM_BOT_TOKEN_XAU_ID,
    `<b> Xu hướng TĂNG ${time} : ${upToken?.toString()}</b><br/>`,
    `<b> Xu hướng GIẢM ${time} : ${upToken?.toString()}</b>`,
    {
      parse_mode: 'HTML',
    },
  );
};

function findExtrema(prices) {
  const peaks = [];
  const troughs = [];

  for (let i = 1; i < prices.length - 1; i++) {
    const prevSlope = prices[i] - prices[i - 1];
    const nextSlope = prices[i + 1] - prices[i];

    if (prevSlope > 0 && nextSlope < 0) {
      peaks.push({ index: i, value: prices[i] });
    } else if (prevSlope < 0 && nextSlope > 0) {
      troughs.push({ index: i, value: prices[i] });
    }
  }

  return { peaks, troughs };
}
function determineTrend(peaks, troughs) {
  function isUptrend(points) {
    let count = 0;
    for (let i = 1; i < points.length; i++) {
      if (points[i].value > points[i - 1].value) {
        count++;
      } else {
        count--;
      }
    }
    return count > 0;
  }

  const peakTrend = isUptrend(peaks);
  const troughTrend = isUptrend(troughs);

  if (peakTrend && troughTrend) return 'up';
  if (!peakTrend && !troughTrend) return 'down';
  return 'sideways';
}

function detectReversal(peaks, troughs, prices, token, time) {
  const trend = determineTrend(peaks, troughs);
  const lastFourPrices = prices.slice(-4);

  if (lastFourPrices.length < 4) return;

  const [p1, p2, p3, p4] = lastFourPrices;

  if (trend === 'down' && p2 > p1 && p4 > p3 && p3 > p1 && p4 > p2) {
    global.bot.telegram.sendMessage(
      process.env.TELEGRAM_BOT_TOKEN_XAU_ID,
      `<b> Cảnh báo: Xu hướng có thể đảo chiều sang TĂNG: ${token} time: ${time}</b>`,
      {
        parse_mode: 'HTML',
      },
    );
  }

  if (trend === 'up' && p2 < p1 && p4 < p3 && p3 < p1 && p4 < p2) {
    global.bot.telegram.sendMessage(
      process.env.TELEGRAM_BOT_TOKEN_XAU_ID,
      `<b> Cảnh báo: Xu hướng có thể đảo chiều sang GIẢM: ${token} time: ${time}</b>`,
      {
        parse_mode: 'HTML',
      },
    );
  }
}
