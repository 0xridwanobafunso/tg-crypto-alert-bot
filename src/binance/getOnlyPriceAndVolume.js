const Binance = require('node-binance-api')
const BigNumber = require('bignumber.js')
const env = require('../env')
const {
  getIntervalAndTimeframe,
} = require('../helpers/getIntervalAndTimeframe')

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

  let tps = parseFloat(new BigNumber(trades).div(60)).toFixed(5)
  let ats = parseFloat(new BigNumber(volume).div(trades)).toFixed(5)

  if (isNaN(tps)) tps = 0
  if (isNaN(ats)) ats = 0
  if (isNaN(volume)) volume = 0

  return {
    price: price[pair],
    volume,
    tps,
    ats,
    priceState: 'Decreased',
    tpsState: 'Decreased',
    atsState: 'Decreased',
    volumeState: 'Decreased',
  }
}
