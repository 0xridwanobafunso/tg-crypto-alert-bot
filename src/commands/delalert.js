const { channel, group, user } = require('../actions/help')

exports.delalert = (bot) => {
  return bot.command('delalert', async (ctx) => {
    // channel action
    await channel(ctx)

    // group action
    await group(ctx)

    // user action
    await user(ctx)
  })
}
