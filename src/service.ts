import axios from 'axios';
import { rsi, ema, wma } from 'technicalindicators';
import { checkTrend } from './common';

export const checkTechnical1h = async (__this: any, token) => {
  const priceData1h = await axios.get(
    `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=1h&limit=61`,
  );

  const priceData4h = await axios.get(
    `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=4h&limit=61`,
  );
  return checkTrendCommon(token, priceData1h, priceData4h, '1h', '4h');
};

export const checkTechnical4h = async (__this: any, token) => {
  const priceData4h = await axios.get(
    `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=4h&limit=61`,
  );

  const priceData1d = await axios.get(
    `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=1d&limit=61`,
  );
  return checkTrendCommon(token, priceData4h, priceData1d, '4h', '1d');
};

export const checkTechnical1d = async (__this: any, token) => {
  const priceData1d = await axios.get(
    `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=1d&limit=61`,
  );

  const priceData1w = await axios.get(
    `https://api3.binance.com/api/v3/klines?symbol=${token}&interval=1w&limit=61`,
  );
  return checkTrendCommon(token, priceData1d, priceData1w, '1d', '1w');
};

const checkTrendCommon = async (token, data1, data2, time1, time2) => {
  const price1 = data1?.data?.map((val) => val?.[4]);
  const price2 = data2?.data?.map((val) => val?.[4]);
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
  let content = '';
  if (trend1 && trend2 && trend1 !== trend2) {
    content = `\n<b>Token: </b> ${token}
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
  }
  return content;
};
