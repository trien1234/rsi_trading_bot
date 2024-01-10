import axios from 'axios';
import { cryptoPairs, forexPairs } from './tokens';
import { delay, getRandomElement } from './common';
import { API_KEY_FOREX } from './constant';

export const initData = async (__this: any) => {
  console.log('initData start');
  for (const token of forexPairs) {
    await initFx(token, __this, '1h', '1h');
    await initFx(token, __this, '4h', '4h');
    await initFx(token, __this, '1day', '1d');
    await initFx(token, __this, '1week', '1w');
  }

  for (const token of cryptoPairs) {
    // await initCr(token, __this, '1m');
    // await initCr(token, __this, '5m');
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
};
