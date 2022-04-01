require('dotenv').config()
const { resolve } = require('path');
const ThieveClient = require('./src/ThieveClient');
const config = require('./config.json')
const BootLoader = require('./src/utils/Boot')
//const Sentry = require('@sentry/node');

//require('@sentry/tracing');

const client = new ThieveClient(
  {
    partials: ['USER', 'GUILD_MEMBER', 'MESSAGE', 'REACTION'],
    intents: [
      'GUILDS',
      'GUILD_MEMBERS',
      'GUILD_BANS',
      'GUILD_EMOJIS_AND_STICKERS',
      'GUILD_INTEGRATIONS',
      'GUILD_VOICE_STATES',
      'GUILD_MESSAGES',
      'GUILD_MESSAGE_REACTIONS',
      'DIRECT_MESSAGES'
    ]
  }, {
    commandsDirectory: resolve(__dirname, 'src', 'commands'),
    eventsDirectory: resolve(__dirname, 'src', 'events'),
    ...config
  },
);

async function start() {
  console.clear()
  console.log("================================== [ -- LORD PIRATA -- ] ==============================")
  
  //Sentry.init({
  //  dsn: process.env.SENTRY,
  //  tracesSampleRate: 1.0,
  //})

  await client.init();

  client.login(process.env.TOKEN)
    .then(() => {
      console.log('[TICKET] \x1b[33mVerificando mensagem de ticket\x1b[0m')
      new BootLoader(client)
      console.log('[INDEX] \x1b[32mAplicacao iniciada com sucesso!\x1b[0m')
    })
    .catch((e) => console.log(`[ERRO FATAL] \x1b[31mFalha ao se conectar ao Discord! ${e.message}!\x1b[0m`));
}
start();