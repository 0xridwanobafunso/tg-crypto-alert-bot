;const { Telegraf } = require('telegraf')
const env = require('./env')

// import commands
const { start } = require('./commands/start')
const { quit } = require('./commands/quit')
const { help } = require('./commands/help')
const { newalert } = require('./commands/newalert')
const { delalert } = require('./commands/delalert')

const { redis } = require('./helpers/redis')

// import alert re instalization
const { reInstantiate } = require('./helpers/reInstantiate')

// re instantiate alert if app eventually reloads
reInstantiate()

// connect to TG as bot
const bot = new Telegraf(env.BOT_TOKEN)

bot.on('channel_post', (ctx, next) => {
  ctx.update.message = ctx.update.channel_post

  return next()
})

// load bot with commands
start(bot)
help(bot)
newalert(bot, redis)
delalert(bot)
quit(bot)

// listen on sticker and on text
bot.on('sticker', (ctx) => ctx.reply('Use command: /help'))
bot.on('text', (ctx) => ctx.reply('Use command: /help'))

module.exports = { bot, redis }
