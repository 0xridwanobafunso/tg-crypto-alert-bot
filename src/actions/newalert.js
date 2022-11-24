const Queue = require('bull')
const { writeFile, readFile } = require('fs/promises')
const env = require('../env')
const { join } = require('path')
const colors = require('colors')

const {
  getIntervalAndTimeframe,
} = require('../helpers/getIntervalAndTimeframe')
const { getPairAndFormat } = require('../helpers/getPairAndFormat')

const { getOnlyPriceAndVolume } = require('../binance/getOnlyPriceAndVolume')

// alert processor
const { processor } = require('../helpers/processor')

exports.channel = async (ctx, redis) => {
  if (Object.keys(ctx.update).includes('channel_post')) {
    let { id } = ctx.update.message.chat

    if (
      [
        '-1001896329721',
        '-1001688156359',
        '-1001608994895',
        '-1001848903622',
      ].includes(id.toString())
    ) {
      // --------------------------------------------------------------------------
      // if sender is a channel
      let text = ctx.update.message.text.split(' ')

      if (text.length == 9) {
        if (
          text[1] == 'pair' &&
          text[3] == 'timeframe' &&
          text[5] == 'every' &&
          text[7] == 'format'
        ) {
          if (
            getIntervalAndTimeframe.timeframes.includes(text[4]) &&
            getIntervalAndTimeframe.intervals.includes(text[6]) &&
            getPairAndFormat.format.includes(text[8])
          ) {
            let pair = text[2]
            let timeframe = text[4]
            let interval = text[6]
            let format = text[8]

            if (pair.split(',').length <= 10) {
              const isValidPair = pair
                .split(',')
                .every((value, index, array) => {
                  return getPairAndFormat.pair.includes(value) ? true : false
                })

              if (isValidPair) {
                let { id, title, username, type } = ctx.update.message.chat

                // read alerts from file
                let alerts = JSON.parse(
                  await readFile(join(__dirname, '../db/alerts.json'), {
                    encoding: 'utf8',
                  })
                )

                if (
                  !alerts.includes(
                    `alert_${id}_${pair}_${timeframe}_${interval}_${format}`
                  )
                ) {
                  // create alert queue
                  const alert = new Queue(
                    `alert_${id}_${pair}_${timeframe}_${interval}_${format}`,
                    {
                      redis: {
                        host: env.REDIS_HOST,
                        port: env.REDIS_PORT,
                        password: env.REDIS_PASSWORD,
                      },
                    }
                  )

                  // split pairs into array
                  let _pair = pair.split(',')

                  for (let __p of _pair) {
                    // current price, volume, tps, and ats before creating alert
                    const {
                      price,
                      volume,
                      tps,
                      ats,
                      priceState,
                      tpsState,
                      atsState,
                      volumeState,
                    } = await getOnlyPriceAndVolume(__p, timeframe)

                    // save current price, volume, tps, and ats to redis before creating alert
                    await redis.set(
                      `alert_${id}_${__p}_${timeframe}_${interval}_${format}_price`,
                      price
                    )
                    await redis.set(
                      `alert_${id}_${__p}_${timeframe}_${interval}_${format}_volume`,
                      volume
                    )
                    await redis.set(
                      `alert_${id}_${__p}_${timeframe}_${interval}_${format}_tps`,
                      tps
                    )
                    await redis.set(
                      `alert_${id}_${__p}_${timeframe}_${interval}_${format}_ats`,
                      ats
                    )

                    // default state to decreased
                    await redis.set(
                      `alert_${id}_${__p}_${timeframe}_${interval}_${format}_priceState`,
                      priceState
                    )
                    await redis.set(
                      `alert_${id}_${__p}_${timeframe}_${interval}_${format}_tpsState`,
                      tpsState
                    )
                    await redis.set(
                      `alert_${id}_${__p}_${timeframe}_${interval}_${format}_atsState`,
                      atsState
                    )
                    await redis.set(
                      `alert_${id}_${__p}_${timeframe}_${interval}_${format}_volumeState`,
                      volumeState
                    )
                  }

                  // process new alert
                  alert.process(processor)
                  alert.add(
                    {
                      // pair details
                      pair,
                      timeframe,
                      interval,
                      format,
                      // channel details
                      id,
                      title,
                      username,
                      type,
                    },
                    {
                      repeat: {
                        every: getIntervalAndTimeframe.seconds[interval],
                      },
                    }
                  )

                  // add new alert
                  alerts.push(
                    `alert_${id}_${pair}_${timeframe}_${interval}_${format}`
                  )

                  // write new alert to file
                  await writeFile(
                    join(__dirname, '../db/alerts.json'),
                    JSON.stringify(alerts)
                  )

                  console.log(
                    `[BOT]: Alert created for alert_${id}_${pair}_${timeframe}_${interval}_${format}`
                      .green.bold.underline
                  )

                  // send bot reply
                  await ctx.reply(
                    `${pair}(${timeframe}) alert created. This channel will receive alert every ${interval}. Thanks :)`
                  )
                } else
                  await ctx.reply(`${pair} alert has been created previously`)
              } else await ctx.reply('Use command: /help')
            } else await ctx.reply('Use command: /help')
          } else await ctx.reply('Use command: /help')
        } else await ctx.reply('Use command: /help')
      } else await ctx.reply('Use command: /help')
      // ----------------------------------------------------------------------------------
    } else
      await ctx.reply(
        "This is a private BOT. It's not available to the public channel on Telegram."
      )
  }
}

exports.group = async (ctx) => {
  if (ctx.update.message.chat.type == 'group')
    await ctx.reply('This BOT is not available for group(s)')
}

exports.user = async (ctx) => {
  if (ctx.update.message.chat.type == 'private')
    await ctx.reply('This BOT is not available for user(s)')
}
