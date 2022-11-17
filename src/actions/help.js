exports.channel = async (ctx) => {
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
      await ctx.reply(
        `How to use XCryptoBOT:\nThis bot sends alert of chosen pair of cryptocurrency from Binance API\n\nAvailable commands: \n1.) /start: Start the bot.\nFormat: /start\n\n2.) /help: Step on how to use bot.\nFormat: /help\n\n3.) /newalert: Create new crypto alert.\nFormat: /newalert pair [BASE/QUOTE] timeframe [1m|3m|5m|15m|30m|1h|2h|4h|6h|8h|12h|1d|3d|1w|1M] every [5m|15m|30m|1h|2h|4h|6h|8h|12h|1d] format [1|2|3]\nUsage: /newalert pair BTCUSDT timeframe 30m every 5m format 1\nSupported pairs: BTCUSDT,ETHUSDT,XRPUSDT,DOGEUSDT,BNBUSDT,ADAUSDT,SOLUSDT,MATICUSDT,DOTUSDT,AVAXUSDT,ATOMUSDT,LTCUSDT,LINKUSDT,ETCUSDT,NEARUSDT,ALGOUSDT,QNTUSDT,APEUSDT,CHRUSDT,CHRUSDT,SANDUSDT,MANAUSDT,THETAUSDT,APTUSDT,AXSUSDT,KLAYUSDT,XECUSDT,FTMUSDT,PAXGUSDT,MINAUSDT,WAVESUSDT,HOTUSDT\n\n4.) /delalert: Delete alert.\nFormat: /delalert pair [BASE/QUOTE] timeframe [1m|3m|5m|15m|30m|1h|2h|4h|6h|8h|12h|1d|3d|1w|1M] every [5m|15m|30m|1h|2h|4h|6h|8h|12h|1d] format [1|2|3]\nUsage: /delalert pair BTCUSDT timeframe 30m every 5m format 1\nSupported pairs: BTCUSDT,ETHUSDT,XRPUSDT,DOGEUSDT,BNBUSDT,ADAUSDT,SOLUSDT,MATICUSDT,DOTUSDT,AVAXUSDT,ATOMUSDT,LTCUSDT,LINKUSDT,ETCUSDT,NEARUSDT,ALGOUSDT,QNTUSDT,APEUSDT,CHRUSDT,CHRUSDT,SANDUSDT,MANAUSDT,THETAUSDT,APTUSDT,AXSUSDT,KLAYUSDT,XECUSDT,FTMUSDT,PAXGUSDT,MINAUSDT,WAVESUSDT,HOTUSDT\nNote: Max of 10 pairs can be created at once.\n\n5.) /quit: To indicate you're done with the bot\nFormat: /quit`
      )
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
