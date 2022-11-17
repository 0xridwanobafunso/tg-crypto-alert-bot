const { channel, group, user } = require('../actions/quit')

exports.quit = (bot) => {
  return bot.command('quit', async (ctx) => {
    // channel action
    await channel(ctx)

    // group action
    await group(ctx)

    // user action
    await user(ctx)
  })
}
