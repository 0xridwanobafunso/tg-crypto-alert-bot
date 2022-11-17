const Binance = require('node-binance-api')
const BigNumber = require('bignumber.js')
const env = require('../env')

const binance = new Binance().options({
  APIKEY: env.BINANCE_API_KEY,
  //   APISECRET: '<secret>',
})

exports.getOnlyPriceAndVolume = async (pair, timeframe) => {
  // format
  pair = pair.split('/').join('').toUpperCase()

  let price = await binance.prices(pair)

  const ticks = await binance.candlesticks(pair, timeframe)
  const last_tick = ticks[ticks.length - 1]

  let [
    time,
    open,
    high,
    low,
    close,
    volume,
    closeTime,
    assetVolume,
    trades,
    buyBaseVolume, //buy
    buyAssetVolume, //sell
    ignored,
  ] = last_tick

  let ats = parseFloat(new BigNumber(volume).div(trades)).toFixed(5)

  return {
    price: price[pair],
    volume,
    tps: trades,
    ats,
  }
}
