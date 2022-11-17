const Queue = require('bull')
const dotenv = require('dotenv')
const { readFile } = require('fs/promises')
const { join } = require('path')
const colors = require('colors')

// alert processor
const { processor } = require('../helpers/processor')

dotenv.config({ path: __dirname + '../../.env' })

exports.reInstantiate = async () => {
  // re-initialiaze alerts - if app eventually reloads
  const alerts = JSON.parse(
    await readFile(join(__dirname, '../db/alerts.json'), {
      encoding: 'utf8',
    })
  )

  for (let _alert of alerts) {
    console.log(
      `[BOT]: Re-instantiation for alert: ${_alert}`.green.bold.underline
    )
    const alert = new Queue(_alert, {
      redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
      },
    })

    // process new alert
    alert.process(processor)
  }
}
