import axios from 'axios';
import { rsi, ema, wma } from 'technicalindicators';
import { checkTrend } from './common';
import { TREND_TYPE } from './constant';

export const checkTechnical1h = async (__this: any, token, type) => {
  let priceData1h = await __this.cacheManager.get(`${token}_1h`);
  let priceData4h = await __this.cacheManager.get(`${token}_4h`);

  if (!priceData1h) {
    console.log('priceData1h');
    const result = await axios.get(
      `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=1h&limit=61`,
    );
    priceData1h = result?.data?.map((val) => val?.[4]);
  }

  if (!priceData4h) {
    console.log('priceData4h');

    const result = await axios.get(
      `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=4h&limit=61`,
    );
    priceData4h = result?.data?.map((val) => val?.[4]);
  }

  return checkTrendCommon(token, priceData1h, priceData4h, '1h', '4h', type);
};

export const checkTechnical4h = async (__this: any, token, type) => {
  let priceData4h = await __this.cacheManager.get(`${token}_4h`);
  let priceData1d = await __this.cacheManager.get(`${token}_1d`);

  if (!priceData4h) {
    console.log('priceData4h');

    const result = await axios.get(
      `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=4h&limit=61`,
    );
    priceData4h = result?.data?.map((val) => val?.[4]);
  }

  if (!priceData1d) {
    console.log('priceData1d');

    const result = await axios.get(
      `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=1d&limit=61`,
    );
    priceData1d = result?.data?.map((val) => val?.[4]);
  }
  return checkTrendCommon(token, priceData4h, priceData1d, '4h', '1d', type);
};

export const checkTechnical1d = async (__this: any, token, type) => {
  let priceData1d = await __this.cacheManager.get(`${token}_1d`);
  let priceData1w = await __this.cacheManager.get(`${token}_1w`);

  if (!priceData1d) {
    console.log('priceData1d');

    const result = await axios.get(
      `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=1d&limit=61`,
    );
    priceData1d = result?.data?.map((val) => val?.[4]);
  }

  if (!priceData1w) {
    console.log('priceData1w');

    const result = await axios.get(
      `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=1w&limit=61`,
    );
    priceData1w = result?.data?.map((val) => val?.[4]);
  }
  return checkTrendCommon(token, priceData1d, priceData1w, '1d', '1w', type);
};

const checkTrendCommon = async (token, price1, price2, time1, time2, type) => {
  price1.pop();
  price2.pop();
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
};
