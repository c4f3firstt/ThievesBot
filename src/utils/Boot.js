const tdm = require('./TdmPerButton')
const naval = require('./NavalPerButton')

module.exports = class Boot {
  constructor(client) {
    console.log('[BOOT] \x1b[33mIniciando o Bot\x1b[0m')
    this.channelPermsToMute(client)
    this.ticketMessage(client).then(() => this.fetchRoles(client).then(() => this.megaLoop(client)).then(() => console.log('[BOOT] \x1b[32mProcesso iniciado com sucesso!\x1b[0m')))
  }

  async ticketMessage(client) {
    console.log('[TICKET] \x1b[33mVerificando mensagem de ticket\x1b[0m')

    const TDM = new tdm(client)
    await TDM.checkReactonMessage();
    const Naval = new naval(client)
    await Naval.checkReactionMessage();
    await client.ticketUtils.checkTicketMessage()
    console.log('[TICKET] \x1b[32mProcesso de Tickets iniciado com sucesso!\x1b[0m')
  }

  async channelPermsToMute(client) {
    client.guilds.cache.get(client.config.bot.comunityServerID).channels.cache.forEach(async ch => {
      ch.permissionOverwrites.edit(client.config.roles.mute_role, { 'SEND_MESSAGES': false, 'ADD_REACTIONS': false })
    })
  }

  async megaLoop(client) {
    console.log('[MEGA] \x1b[33mIniciando loop da Mega!\x1b[0m')
    const found = await client.database.Megas.find({ acceptingJoins: true })
    found.forEach(mega => client.megaListener.registerMega(mega))
    await client.megaListener.megaLoop()
    await client.megaCache.saveLoop()
    console.log('[MEGA] \x1b[32mProcesso iniciado com sucesso!\x1b[0m')

    console.log('[ARENA] \x1b[33mIniciando loop da Arena!\x1b[0m')

    const Afound = await client.database.Arenas.find({ acceptingJoins: true })
    Afound.forEach(mega => client.arenaListener.registerArena(mega))
    await client.arenaListener.megaLoop()
    await client.arenaCache.saveLoop()
    console.log('[ARENA] \x1b[32mProcesso iniciado com sucesso!\x1b[0m')
  }

  async fetchRoles(client) {
    console.log('[CARGOS] \x1b[33mAdquirindo todos os cargos do servidor!\x1b[0m')
    await client.guilds.cache.get(client.config.bot.comunityServerID).roles.fetch()
    console.log('[CARGOS] \x1b[32mProcesso iniciado com sucesso!\x1b[0m')
  }
}