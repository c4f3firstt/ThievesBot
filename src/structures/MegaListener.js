const startTimeAndToleranceToCall = 15;

//Mega Emojis
const { galleon_emoji, 
        brig_emoji, 
        sloop_emoji, 
        pesca_emoji,
        fishingpole_emoji } = require('../../config.json').emojis

module.exports = class MegaListener {
  constructor(client) {
    this.client = client;
    this.megas = [];
    this.chamadas = new Map()
  }

  getEmoji(type, showType) {

    const emojis = {
      'galeao': `${galleon_emoji}`,
      'bergantim': `${brig_emoji}`,
      'chalupa': `${sloop_emoji}`,
      'pesca': `${pesca_emoji}`
    }
    if (showType == 'pesca') return emojis['pesca']
    return emojis[type]
  }

  getMegaTitleByType(number, show) {

    const emojis = {
      '1': ':one:',
      '2': ':two:',
      '3': ':three:',
      '4': ':four:',
      '5': ':five:',
      '6': ':six:',
      '7': ':seven:',
      '8': ':eight:',
      '9': ':nine:',
      '10': ':keycap_ten:',
      'pesca': `${fishingpole_emoji}`
    }

    if (show == 'pesca') return `${emojis['pesca']} ${number}ª Aliança do Pirarucu ${emojis['pesca']}`

    return `**MEGA** ${emojis[number]} ${this.parseMegaName(show)}`
  }
  parseMegaName(megaName) {
    const after = megaName.replace('galeao', 'Galeão').replace('reputacao', 'Reputação')
    return after.charAt(0).toUpperCase() + megaName.slice(1);
  }

  registerMega(mega) {
    this.megas.push(mega);
    this.client.megaCache.add(mega)
  }

  unregisterMega(megaID) {
    this.megas.splice(this.megas.findIndex(index => index._id.toString() === megaID.toString()), 1)
    this.client.megaCache.remove(megaID.toString())
  }

  async megaLoop() {
    setInterval(async () => {
      this.megas.forEach(async mega => {
        const foundMega = await this.client.database.Megas.findOne({ _id: mega._id })
        this.checkMegaMessage(foundMega)
      })
    }, 1000 * 30)
  }

  async checkMegaMessage(mega) {
    if (!mega) return;
    let megaToSendText = `${this.getMegaTitleByType(mega.megaNumber, mega.showType)}\n\nData: \`${mega.date}\`\nHorário de \`${mega.startHour}\` às \`${mega.endHour}\`\n\n`

    const shipQuantity = {
      'galeao': 4,
      'bergantim': 3,
      'chalupa': 2,
      'pesca': 4
    }

    mega.ships.forEach((ship, i) => {
      megaToSendText += `${this.getEmoji(mega.type, mega.showType)} **${this.parseMegaName(mega.type)} ${i + 1}:** ${ship.name}\n`
      for (let k = 1; k <= shipQuantity[mega.type]; k++) {
        megaToSendText += `${k}º Marujo: ${ship.players[k - 1] ? `<@${ship.players[k - 1]}>` : ""} \n`
      }
      megaToSendText += '\n'
    })

    const fetchedMessage = await this.client.channels.cache.get(mega.channelID).messages.fetch(mega.messageID).catch(() => null)
    if (!fetchedMessage) return;

    fetchedMessage.edit({ content: megaToSendText }).catch(() => null)
  }

  stopCallToMega(megaID) {
    const timeouts = this.chamadas.get(megaID.toString())

    if (!timeouts) return

    if (timeouts[0]) clearTimeout(timeouts[0])
    if (timeouts[1]) clearTimeout(timeouts[1])
  }

  async forceCallToMega(megaID) {
    this.stopCallToMega(megaID)
    await this.client.database.Megas.updateOne({ _id: megaID }, { acceptingJoins: false })
    this.unregisterMega(megaID)
  }

  async startCallToMega(megaID, channel, minutesOf = startTimeAndToleranceToCall, minutesTo = startTimeAndToleranceToCall) {

    const timeout = setTimeout(async () => {
      channel.send(`**MEGA INICIADA!!** Contagem para a tolerância de ${minutesTo} minutos iniciada!`)
    }, 1000 * 60 * minutesOf)

    const secondTimeout = setTimeout(async () => {
      const queue_channel = await this.client.channels.fetch(this.client.config.channels.queue[0]).catch(() => null)
      const secondQueue = await this.client.channels.fetch(this.client.config.channels.queue[1]).catch(() => null)
      const thirdQueue = await this.client.channels.fetch(this.client.config.channels.queue[2]).catch(() => null)
      const fourthQueue = await this.client.channels.fetch(this.client.config.channels.queue[3]).catch(() => null)

      const mega = await this.client.database.Megas.findOneAndUpdate({ _id: megaID }, { acceptingJoins: false })
      this.unregisterMega(megaID)

      let msg = `RECRUTAMENTO ENCERRADO 



      ESTE CANAL SERÁ UTILIZADO APENAS PARA RECRUTAMENTO DA PRÓXIMA MEGA.
      
      
      
      :warning: NÃO envie mais mensagens aqui.
      :warning: Ao sair da Mega que ainda está acontecendo, avise a sua vaga em <#819970161243062292>`;

      const punishedMembers = mega.ships.reduce((a, c) => {
        c.players.forEach(b => {
          if (!queue_channel.members.has(b) && !secondQueue.members.has(b) && !thirdQueue.members.has(b) && !fourthQueue.members.has(b)) a.push(b)
        })
        return a
      }, [])

      if (punishedMembers.length > 0) {
        msg += `\n\nOs seguintes usuários não estavam nos canais de encontro: \n${punishedMembers.map(a => `<@${a}>`)}`
      }

      channel.send(msg)

    }, 1000 * 60 * (minutesOf + minutesTo))

    this.chamadas.set(megaID.toString(), [timeout, secondTimeout]);
  }
};