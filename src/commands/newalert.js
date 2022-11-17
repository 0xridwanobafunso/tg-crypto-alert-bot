const { channel, group, user } = require('../actions/newalert')

exports.newalert = (bot, redis) => {
  return bot.command('newalert', async (ctx) => {
    // channel action
    await channel(ctx, redis)

    // group action
    await group(ctx)

    // user action
    await user(ctx)
  })
}
