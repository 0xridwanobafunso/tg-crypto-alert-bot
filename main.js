const express = require('express')
const colors = require('colors')
const { bot, redis } = require('./src/bot')

const app = express()

// app.use(bot.webhookCallback('/secret-path'))

// bot.telegram.setWebhook('<URL>/secret-path')
bot.launch()

// // start server
// app.listen(3000, () =>
//   console.log('TG BOT listening on port: 3000'.green.underline.bold)
// )

// enable graceful stop
async function botGracefulExit(bot, redis, type) {
  // close redis
  await redis.disconnect()

  // stop bot
  if (['SIGINT', 'SIGTERM'].includes(type)) bot.stop(type)

  // close process
  process.exit()
}

process.once('SIGINT', () => botGracefulExit(bot, redis, 'SIGINT'))
process.once('SIGTERM', () => botGracefulExit(bot, redis, 'SIGTERM'))
process.once('SIGQUIT', () => botGracefulExit(bot, redis, 'SIGQUIT'))

process.on('unhandledRejection', async (reason, promise) => {
  console.log(reason.message)

  // close process
  process.exit()
})
