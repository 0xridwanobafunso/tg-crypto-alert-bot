const Binance = require('node-binance-api')
const BigNumber = require('bignumber.js')
const env = require('../env')

const binance = new Binance().options({
  APIKEY: env.BINANCE_API_KEY,
  //   APISECRET: '<secret>',
})

exports.getData = async (
  pair,
  timeframe,
  oldprice,
  oldvolume,
  oldtps,
  oldats
) => {
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

  // %change in price
  let percentChangeInPrice = new BigNumber(
    new BigNumber(
      new BigNumber(price[pair]).minus(new BigNumber(oldprice))
    ).div(oldprice)
  ).times(100)

  let _percentChangeInPrice = new BigNumber(price[pair]).gt(
    new BigNumber(oldprice)
  )
    ? `+${parseFloat(percentChangeInPrice).toFixed(5)}`
    : parseFloat(percentChangeInPrice).toFixed(5)

  let priceState = new BigNumber(oldprice).lt(new BigNumber(price[pair]))
    ? 'Increased'
    : 'Decreased'

  // %change in volume
  let percentChangeInVolume = new BigNumber(
    new BigNumber(new BigNumber(volume).minus(new BigNumber(oldvolume))).div(
      oldvolume
    )
  ).times(100)

  let _percentChangeInVolume = new BigNumber(volume).gt(
    new BigNumber(oldvolume)
  )
    ? `+${parseFloat(percentChangeInVolume).toFixed(5)}`
    : parseFloat(percentChangeInVolume).toFixed(5)

  let ats = parseFloat(new BigNumber(volume).div(trades)).toFixed(5)

  let volumeState = new BigNumber(oldvolume).lt(new BigNumber(volume))
    ? 'Increased'
    : 'Decreased'

  let tpsState = new BigNumber(oldtps).lt(new BigNumber(trades))
    ? 'Increased'
    : 'Decreased'

  let atsState = new BigNumber(oldats).lt(new BigNumber(ats))
    ? 'Increased'
    : 'Decreased'

  return {
    //pair
    pair,
    // price
    price: price[pair],
    percentChangeInPrice: _percentChangeInPrice,
    priceState,
    // tps and ats
    tps: trades,
    tpsState,
    ats,
    atsState,
    // volume
    volume,
    percentChangeInVolume: _percentChangeInVolume,
    volumeState,
  }
}
