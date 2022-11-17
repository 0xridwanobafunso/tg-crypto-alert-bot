const { Telegraf } = require('telegraf')
const { redis } = require('../helpers/redis')
const colors = require('colors')

const { getData } = require('../binance/getData')

// connect to TG as bot
const bot = new Telegraf(process.env.BOT_TOKEN)

exports.processor = async (job, done) => {
  let { id, pair, timeframe, interval, format, type } = job.data
  let title
  let username
  let first_name
  let last_name

  // if channel
  if (type == 'channel') {
    title = job.data.title
    username = job.data.username
  }

  // if group
  if (type == 'group') title = job.data.title

  // if user
  if (type == 'private') {
    first_name = job.data.first_name
    last_name = job.data.last_name
  }

  // get oldprice and oldvolume from redis
  let oldprice = await redis.get(
    `alert_${id}_${pair}_${timeframe}_${interval}_${format}_price`
  )
  let oldvolume = await redis.get(
    `alert_${id}_${pair}_${timeframe}_${interval}_${format}_volume`
  )
  let oldtps = await redis.get(
    `alert_${id}_${pair}_${timeframe}_${interval}_${format}_tps`
  )
  let oldats = await redis.get(
    `alert_${id}_${pair}_${timeframe}_${interval}_${format}_ats`
  )

  let res = await getData(pair, timeframe, oldprice, oldvolume, oldtps, oldats)

  // set new price and volume from redis
  await redis.set(
    `alert_${id}_${pair}_${timeframe}_${interval}_${format}_price`,
    res.price
  )
  await redis.set(
    `alert_${id}_${pair}_${timeframe}_${interval}_${format}_volume`,
    res.volume
  )
  await redis.set(
    `alert_${id}_${pair}_${timeframe}_${interval}_${format}_tps`,
    res.tps
  )
  await redis.set(
    `alert_${id}_${pair}_${timeframe}_${interval}_${format}_ats`,
    res.ats
  )

  // send alert with format 1
  if (format == '1') {
    await bot.telegram.sendMessage(
      id,
      `🔔${
        res.priceState == 'Increased' ? '↗️🟢' : '↙️🔴'
      } ${pair}(${timeframe}) alert every ${interval}\n\n1.) Price of ${
        res.pair
      }: ${res.price} - ${res.priceState} (${
        res.percentChangeInPrice
      }%)\n2.) TPS of ${res.pair}: ${res.tps} trades - ${
        res.tpsState
      }\n3.) ATS of ${res.pair}: ${res.ats} - ${res.atsState}\n4.) Volume: ${
        res.volume
      } - ${res.volumeState} (${res.percentChangeInVolume}%)`
    )
  }

  // send alert with format 2
  if (format == '2') {
    await bot.telegram.sendMessage(
      id,
      `🔔${
        res.priceState == 'Increased' ? '↗️🟢' : '↙️🔴'
      } ${pair}(${timeframe}) alert every ${interval}\n\n1.) Price of ${
        res.pair
      }: ${oldprice}, ${res.price} - ${res.priceState} (${
        res.percentChangeInPrice
      }%)\n2.) TPS of ${res.pair}: ${oldtps} trades, ${res.tps} trades - ${
        res.tpsState
      }\n3.) ATS of ${res.pair}: ${oldats}, ${res.ats} - ${
        res.atsState
      }\n4.) Volume: ${res.volume} - ${res.volumeState} (${
        res.percentChangeInVolume
      }%)`
    )
  }

  // send alert with format 3
  if (format == '3') {
    await bot.telegram.sendMessage(
      id,
      `🔔${
        res.priceState == 'Increased' ? '↗️🟢' : '↙️🔴'
      } ${pair}(${timeframe}) alert every ${interval}\n\n1.) Price of ${
        res.pair
      }: ${res.priceState}\n2.) TPS of ${res.pair}: ${
        res.tpsState
      }\n3.) ATS of ${res.pair}: ${res.atsState}\n4.) Volume: ${
        res.volumeState
      }`
    )
  }

  // log to console
  console.log(
    `[BOT] Alert sent successfully for alert: alert_${id}_${pair}_${timeframe}_${interval}_${format}`
      .blue.bold.underline
  )

  // callback
  done(null, '[JOB] Alert sent')
}
