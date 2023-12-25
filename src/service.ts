import { ema, rsi, wma } from 'technicalindicators';
import { checkTrend } from './common';
import { TREND_TYPE } from './constant';

export const checkTechnical1h = async (__this: any, token, type) => {
  const priceData1h = await __this.cacheManager.get(`${token}_1h`);
  const priceData4h = await __this.cacheManager.get(`${token}_4h`);
  return checkTrendCommon(token, priceData1h, priceData4h, '1h', '4h', type);
};

export const checkTechnical4h = async (__this: any, token, type) => {
  const priceData4h = await __this.cacheManager.get(`${token}_4h`);
  const priceData1d = await __this.cacheManager.get(`${token}_1d`);
  return checkTrendCommon(token, priceData4h, priceData1d, '4h', '1d', type);
};

export const checkTechnical1d = async (__this: any, token, type) => {
  const priceData1d = await __this.cacheManager.get(`${token}_1d`);
  const priceData1w = await __this.cacheManager.get(`${token}_1w`);

  return checkTrendCommon(token, priceData1d, priceData1w, '1d', '1w', type);
};

const checkTrendCommon = async (token, price1, price2, time1, time2, type) => {
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
