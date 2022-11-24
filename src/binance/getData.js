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

  let tps = parseFloat(new BigNumber(trades).div(60)).toFixed(5)
  let ats = parseFloat(new BigNumber(volume).div(trades)).toFixed(5)

  let percentChangeInTps = new BigNumber(
    new BigNumber(new BigNumber(tps).minus(new BigNumber(oldtps))).div(oldtps)
  ).times(100)

  let _percentChangeInTps = new BigNumber(tps).gt(new BigNumber(oldtps))
    ? `+${parseFloat(percentChangeInTps).toFixed(5)}`
    : parseFloat(percentChangeInTps).toFixed(5)

  let percentChangeInAts = new BigNumber(
    new BigNumber(new BigNumber(ats).minus(new BigNumber(oldats))).div(oldats)
  ).times(100)

  let _percentChangeInAts = new BigNumber(ats).gt(new BigNumber(oldats))
    ? `+${parseFloat(percentChangeInAts).toFixed(5)}`
    : parseFloat(percentChangeInAts).toFixed(5)

  let volumeState = new BigNumber(oldvolume).lt(new BigNumber(volume))
    ? 'Increased'
    : 'Decreased'

  let tpsState = new BigNumber(oldtps).lt(new BigNumber(tps))
    ? 'Increased'
    : 'Decreased'

  let atsState = new BigNumber(oldats).lt(new BigNumber(ats))
    ? 'Increased'
    : 'Decreased'

  // _percentChangeInPrice, tps, _percentChangeInTps, ats,  _percentChangeInAts,
  // volume, _percentChangeInVolume
  // str.slice(1)]
  if (isNaN(tps)) tps = 0
  if (isNaN(ats)) ats = 0
  if (isNaN(volume)) volume = 0

  if (isNaN(_percentChangeInPrice)) _percentChangeInPrice = 0
  if (isNaN(_percentChangeInTps)) _percentChangeInTps = 0
  if (isNaN(_percentChangeInAts)) _percentChangeInAts = 0
  if (isNaN(_percentChangeInVolume)) _percentChangeInVolume = 0

  return {
    //pair
    pair,
    // price
    price: price[pair],
    percentChangeInPrice: _percentChangeInPrice,
    priceState,
    // tps and ats
    tps,
    percentChangeInTps: _percentChangeInTps,
    tpsState,
    ats,
    percentChangeInAts: _percentChangeInAts,
    atsState,
    // volume
    volume,
    percentChangeInVolume: _percentChangeInVolume,
    volumeState,
  }
}
