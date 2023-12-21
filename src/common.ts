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
