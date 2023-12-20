import axios from 'axios';
import { rsi, ema, wma } from 'technicalindicators';
import {
  checkTrend,
  sendMessageTelegram1d1w,
  sendMessageTelegram1h4h,
} from './common';

export const checkTechnical1h = async (__this: any, token) => {
  const priceData1h = await axios.get(
    `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=1h&limit=61`,
  );
  const priceData4h = await axios.get(
    `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=4h&limit=61`,
  );

  const price1h = priceData1h?.data?.map((val) => val?.[4]);
  const price4h = priceData4h?.data?.map((val) => val?.[4]);
  price1h.pop();
  price4h.pop();

  const dataEsi1h = rsi({ values: price1h, period: 14 });
  const dataEma1h = ema({ values: dataEsi1h, period: 9 });
  const dataWma1h = wma({ values: dataEsi1h, period: 45 });

  const dataEsi4h = rsi({ values: price4h, period: 14 });
  const dataEma4h = ema({ values: dataEsi4h, period: 9 });
  const dataWma4h = wma({ values: dataEsi4h, period: 45 });

  const rsi1h = dataEsi1h[dataEsi1h.length - 1];
  const ema1h = dataEma1h[dataEma1h.length - 1];
  const wma1h = dataWma1h[dataWma1h.length - 1];

  const rsi4h = dataEsi4h[dataEsi4h.length - 1];
  const ema4h = dataEma4h[dataEma4h.length - 1];
  const wma4h = dataWma4h[dataWma4h.length - 1];

  let trend1h = null;
  let trend4h = null;

  trend1h = await checkTrend(rsi1h, ema1h, wma1h);
  trend4h = await checkTrend(rsi4h, ema4h, wma4h);

  if (trend1h && trend4h && trend1h !== trend4h) {
    sendMessageTelegram1h4h(
      token,
      trend1h,
      trend4h,
      { rsi: rsi1h, ema: ema1h, wma: wma1h },
      { rsi: rsi4h, ema: ema4h, wma: wma4h },
    );
  }
};

export const checkTechnical1d = async (__this: any, token) => {
  const priceData1d = await axios.get(
    `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=1d&limit=61`,
  );

  const priceData1w = await axios.get(
    `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=1w&limit=61`,
  );

  const price1d = priceData1d?.data?.map((val) => val?.[4]);
  const price1w = priceData1w?.data?.map((val) => val?.[4]);
  price1d.pop();
  price1w.pop();

  const dataEsi1d = rsi({ values: price1d, period: 14 });
  const dataEma1d = ema({ values: dataEsi1d, period: 9 });
  const dataWma1d = wma({ values: dataEsi1d, period: 45 });

  const dataEsi1w = rsi({ values: price1w, period: 14 });
  const dataEma1w = ema({ values: dataEsi1w, period: 9 });
  const dataWma1w = wma({ values: dataEsi1w, period: 45 });

  const rsi1d = dataEsi1d[dataEsi1d.length - 1];
  const ema1d = dataEma1d[dataEma1d.length - 1];
  const wma1d = dataWma1d[dataWma1d.length - 1];

  const rsi1w = dataEsi1w[dataEsi1w.length - 1];
  const ema1w = dataEma1w[dataEma1w.length - 1];
  const wma1w = dataWma1w[dataWma1w.length - 1];

  let trend1d = null;
  let trend1w = null;

  trend1d = await checkTrend(rsi1d, ema1d, wma1d);
  trend1w = await checkTrend(rsi1w, ema1w, wma1w);

  if (trend1d && trend1w && trend1d !== trend1w) {
    sendMessageTelegram1d1w(
      token,
      trend1d,
      trend1w,
      { rsi: rsi1d, ema: ema1d, wma: wma1d },
      { rsi: rsi1w, ema: ema1w, wma: wma1w },
    );
  }
};
