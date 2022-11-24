const { Telegraf } = require('telegraf')
const { redis } = require('../helpers/redis')
const colors = require('colors')
const env = require('../env')

const { getData } = require('../binance/getData')

// connect to TG as bot
const bot = new Telegraf(env.BOT_TOKEN)

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

  // split pairs into array
  let _pair = pair.split(',')
  let message = ``

  for (let __p of _pair) {
    // get oldprice and oldvolume from redis
    let oldprice = await redis.get(
      `alert_${id}_${__p}_${timeframe}_${interval}_${format}_price`
    )
    let oldvolume = await redis.get(
      `alert_${id}_${__p}_${timeframe}_${interval}_${format}_volume`
    )
    let oldtps = await redis.get(
      `alert_${id}_${__p}_${timeframe}_${interval}_${format}_tps`
    )
    let oldats = await redis.get(
      `alert_${id}_${__p}_${timeframe}_${interval}_${format}_ats`
    )

    let oldpriceState = await redis.get(
      `alert_${id}_${__p}_${timeframe}_${interval}_${format}_priceState`
    )
    let oldvolumeState = await redis.get(
      `alert_${id}_${__p}_${timeframe}_${interval}_${format}_volumeState`
    )
    let oldtpsState = await redis.get(
      `alert_${id}_${__p}_${timeframe}_${interval}_${format}_tpsState`
    )
    let oldatsState = await redis.get(
      `alert_${id}_${__p}_${timeframe}_${interval}_${format}_atsState`
    )

    let res = await getData(__p, timeframe, oldprice, oldvolume, oldtps, oldats)

    // set new price and volume from redis
    await redis.set(
      `alert_${id}_${__p}_${timeframe}_${interval}_${format}_price`,
      res.price
    )
    await redis.set(
      `alert_${id}_${__p}_${timeframe}_${interval}_${format}_volume`,
      res.volume
    )
    await redis.set(
      `alert_${id}_${__p}_${timeframe}_${interval}_${format}_tps`,
      res.tps
    )
    await redis.set(
      `alert_${id}_${__p}_${timeframe}_${interval}_${format}_ats`,
      res.ats
    )

    // set states
    await redis.set(
      `alert_${id}_${__p}_${timeframe}_${interval}_${format}_priceState`,
      res.priceState
    )
    await redis.set(
      `alert_${id}_${__p}_${timeframe}_${interval}_${format}_tpsState`,
      res.tpsState
    )
    await redis.set(
      `alert_${id}_${__p}_${timeframe}_${interval}_${format}_atsState`,
      res.atsState
    )
    await redis.set(
      `alert_${id}_${__p}_${timeframe}_${interval}_${format}_volumeState`,
      res.volumeState
    )

    if (format == '1') {
      message = `${message}🔔${
        res.priceState == 'Increased' ? '↗️🟢' : '↙️🔴'
      } ${__p}(${timeframe}) alert every ${interval}\n\n1.) Price of ${
        res.pair
      }: ${res.price} - ${res.priceState}\n2.) TPS of ${res.pair}: ${
        res.tps
      } trades - ${res.tpsState}\n3.) ATS of ${res.pair}: ${res.ats} - ${
        res.atsState
      }\n4.) Volume: ${res.volume} - ${res.volumeState} (${
        res.percentChangeInVolume
      }%)\n\n`
    }

    if (format == '2') {
      message = `${message}🔔${
        res.priceState == 'Increased' ? '↗️🟢' : '↙️🔴'
      } ${__p}(${timeframe}) alert every ${interval}\n\n1.) Price of ${
        res.pair
      }: ${oldprice}, ${res.price} - ${res.priceState} (${
        res.percentChangeInPrice
      }%)\n2.) TPS of ${res.pair}: ${oldtps} trades, ${res.tps} trades - ${
        res.tpsState
      } (${res.percentChangeInTps}%)\n3.) ATS of ${res.pair}: ${oldats}, ${
        res.ats
      } - ${res.atsState} (${res.percentChangeInAts}%)\n4.) Volume: ${
        res.volume
      } - ${res.volumeState} (${res.percentChangeInVolume}%)\n\n`
    }

    if (format == '3') {
      let oldIncreased =
        oldpriceState == 'Increased' &&
        oldtpsState == 'Increased' &&
        oldatsState == 'Increased' &&
        oldvolumeState == 'Increased'

      let newIncreased =
        res.priceState == 'Increased' &&
        res.tpsState == 'Increased' &&
        res.atsState == 'Increased' &&
        res.volumeState == 'Increased'

      let oldDecreased =
        oldpriceState == 'Decreased' &&
        oldtpsState == 'Decreased' &&
        oldatsState == 'Decreased' &&
        oldvolumeState == 'Decreased'

      let newDecreased =
        res.priceState == 'Decreased' &&
        res.tpsState == 'Decreased' &&
        res.atsState == 'Decreased' &&
        res.volumeState == 'Decreased'

      if ((oldIncreased && newIncreased) || (oldDecreased && newDecreased)) {
        message = `${message}🔔${
          res.priceState == 'Increased' ? '↗️🟢' : '↙️🔴'
        } ${__p}(${timeframe}) alert\n\n1.) Price of ${res.pair}: ${
          res.priceState
        }\n2.) TPS of ${res.pair}: ${res.tpsState}\n3.) ATS of ${res.pair}: ${
          res.atsState
        }\n4.) Volume: ${res.volumeState}\n\n`
      }
    }
  }

  // if message is not empty
  if (message != '') await bot.telegram.sendMessage(id, message)

  // log to console
  console.log(
    `[BOT] Alert sent successfully for alert: alert_${id}_${pair}_${timeframe}_${interval}_${format}`
      .blue.bold.underline
  )

  // callback
  done(null, '[JOB] Alert sent')
}
