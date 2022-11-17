const { channel, group, user } = require('../actions/newalert')

exports.newalert = (bot, redis) => {
  return bot.command('newalert', async (ctx) => {
    // channel action
    await channel(bot, redis)

    // group action
    await group(ctx)

    // user action
    await user(ctx)
  })
}
