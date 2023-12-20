export const checkTrend = async (rsi, ema, wma) => {
  const rsi_ema = Number(process.env.DIFFERENCE_RSI_EMA);
  const ema_wma = Number(process.env.DIFFERENCE_EMA_WMA);
  if (rsi > ema && ema > wma) {
    if (rsi - ema > rsi_ema && ema - wma > ema_wma) {
      return 1;
    }
  }

  if (rsi < ema && ema < wma) {
    if (ema - rsi > rsi_ema && wma - ema > ema_wma) {
      return 2;
    }
  }
};

export const sendMessageTelegram1h4h = (
  token,
  trend1,
  trend2,
  data1,
  data2,
) => {
  global.bot.telegram.sendMessage(
    process.env.TELEGRAM_BOT_TOKEN_ID,
    `<b>Token: </b> ${token}
    \n<b>Trending 1h: </b> ${trend1 === 1 ? 'Up' : trend1 === 2 ? 'Down' : ''}
    \n<b>Rsi</b>: ${data1.rsi} , <b>Ema</b>: ${data1.ema} , <b>Wma</b>: ${
      data1.wma
    }
    \n<b>Trending 4h: </b> ${trend2 === 1 ? 'Up' : trend2 === 2 ? 'Down' : ''}
    \n<b>Rsi</b>: ${data2.rsi} , <b>Ema</b>: ${data2.ema} ,<b> Wma</b>: ${
      data2.wma
    }`,
    {
      parse_mode: 'HTML',
    },
  );
};

export const sendMessageTelegram1d1w = (
  token,
  trend1,
  trend2,
  data1,
  data2,
) => {
  global.bot.telegram.sendMessage(
    process.env.TELEGRAM_BOT_TOKEN_ID,
    `<b>Token: </b> ${token}
    \n<b>Trending 1d: ${trend1 === 1 ? 'Up' : trend1 === 2 ? 'Down' : ''} </b>
    \n<b>Rsi</b>: ${data1.rsi} , <b>Ema</b>: ${data1.ema} , <b>Wma</b>: ${
      data1.wma
    }
    \n<b>Trending 1w: ${trend2 === 1 ? 'Up' : trend2 === 2 ? 'Down' : ''}</b> 
    \n<b>Rsi</b>: ${data2.rsi} , <b>Ema</b>: ${data2.ema} ,<b> Wma</b>: ${
      data2.wma
    }`,
    {
      parse_mode: 'HTML',
    },
  );
};
