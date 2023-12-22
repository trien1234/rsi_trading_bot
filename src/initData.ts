import axios from 'axios';
import { cryptoPairs } from './tokens';

export const initData = async (__this: any) => {
  console.log('initData start');
  for (const token of cryptoPairs) {
    const res1h = await axios.get(
      `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=1h&limit=61`,
    );

    const data1h = res1h?.data?.map((val) => val?.[4]);
    await __this.cacheManager.set(`${token}_1h`, data1h, 3600000);
  }

  for (const token of cryptoPairs) {
    const res4h = await axios.get(
      `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=4h&limit=61`,
    );
    const data4h = res4h?.data?.map((val) => val?.[4]);

    await __this.cacheManager.set(`${token}_4h`, data4h, 3600000);
  }

  for (const token of cryptoPairs) {
    const res1d = await axios.get(
      `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=1d&limit=61`,
    );

    const data1d = res1d?.data?.map((val) => val?.[4]);

    await __this.cacheManager.set(`${token}_1d`, data1d, 3600000);
  }

  for (const token of cryptoPairs) {
    const res1w = await axios.get(
      `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=1w&limit=61`,
    );

    const data1w = res1w?.data?.map((val) => val?.[4]);

    await __this.cacheManager.set(`${token}_1w`, data1w, 3600000);
  }
  console.log('initData end');
};
