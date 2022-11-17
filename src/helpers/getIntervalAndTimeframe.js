exports.getIntervalAndTimeframe = {
  // alert interval
  intervals: ['5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d'],
  // alert interval in seconds
  seconds: {
    '5m': 300000,
    '15m': 900000,
    '30m': 1800000,
    '1h': 3600000,
    '2h': 7200000,
    '4h': 14400000,
    '6h': 21600000,
    '8h': 28800000,
    '12h': 43200000,
    '1d': 86400000,
  },
  // pair timeframe - binance
  timeframes: [
    '1m',
    '3m',
    '5m',
    '15m',
    '30m',
    '1h',
    '2h',
    '4h',
    '6h',
    '8h',
    '12h',
    '1d',
    '3d',
    '1w',
    '1M',
  ],
}
