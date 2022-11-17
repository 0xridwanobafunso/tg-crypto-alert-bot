exports.channel = async (ctx) => {
  if (Object.keys(ctx.update).includes('channel_post')) {
    let { id } = ctx.update.message.chat

    if (
      ['-1001896329721', '-1001688156359', '-1001608994895'].includes(
        id.toString()
      )
    ) {
      await ctx.reply('Under development. Bye :)')
    } else
      await ctx.reply(
        "This is a private BOT. It's not available to the public on Telegram."
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
