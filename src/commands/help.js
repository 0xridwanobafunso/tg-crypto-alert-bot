const { channel, group, user } = require('../actions/help')

exports.help = (bot) => {
  return bot.command('help', async (ctx) => {
    // channel action
    await channel(ctx)

    // group action
    await group(ctx)

    // user action
    await user(ctx)
  })
}
