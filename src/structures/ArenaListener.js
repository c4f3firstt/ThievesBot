const startTimeAndToleranceToCall = 15;
const { help_roles } = require('../../config.json').helper

//Arena Emojis
const { galleon_emoji } = require('../../config.json').emojis
const { brig_emoji } = require('../../config.json').emojis
const { sloop_emoji } = require('../../config.json').emojis
const { comparena_emoji } = require('../../config.json').emojis

const { reuniao_arena } = require('../../config.json').channels

module.exports = class ArenaListener {
  constructor(client) {
    this.client = client;
    this.arenas = [];
    this.chamadas = new Map()
  }

  getEmoji(type) {

    const emojis = {
      'galeao': `${galleon_emoji}`,
      'bergantim': `${brig_emoji}`,
      'chalupa': `${sloop_emoji}`,
    }
    return emojis[type]
  }

  getMegaMention(type) {
    if (type === 'tdm') return `<@&${help_roles.arena_tdm.key}>`
    return `<@&${help_roles.arena_naval.key}>`
  }

  getMegaTitleByType(type) {
    if (type === 'tdm') return `**Lista TDM**`
    return type !== 'semboard' ? `${comparena_emoji} **ARENA NAVAL** ${comparena_emoji}` : `${comparena_emoji} **ARENA NAVAL SEM BOARDING** ${comparena_emoji}`
  }
  parseMegaName(megaName) {
    const after = megaName.replace('galeao', 'Galeão').replace('reputacao', 'Reputação')
    return after.charAt(0).toUpperCase() + megaName.slice(1);
  }

  registerArena(mega) {
    this.arenas.push(mega);
    this.client.arenaCache.add(mega)
  }

  unregisterMega(megaID) {
    this.arenas.splice(this.arenas.findIndex(index => index._id.toString() === megaID.toString()), 1)
    this.client.arenaCache.remove(megaID.toString())
  }

  async megaLoop() {
    setInterval(async () => {
      this.arenas.forEach(async mega => {
        const foundMega = await this.client.database.Arenas.findOne({ _id: mega._id })
        this.checkMegaMessage(foundMega)
      })
    }, 1000 * 30)
  }

  async checkMegaMessage(mega) {
    if (!mega) return;
    let megaToSendText = `${this.getMegaTitleByType(mega.showType)}\n${this.getMegaMention(mega.showType)}\n\nData: \`${mega.date}\`\nHorário de \`${mega.startHour}\` às \`${mega.endHour}\`\n\n`

    const shipQuantity = {
      'galeao': 4,
      'bergantim': 3,
      'chalupa': 2,
    }

    if (mega.showType === 'tdm') {
      for (let k = 1; k <= mega.maxPlayers; k++) {
        megaToSendText += `${k}º Marujo: ${mega.players[k - 1] ? `<@${mega.players[k - 1]}>` : "Vaga Disponível!"}\n`
      }
    } else {
      mega.players.forEach((ship, i) => {
        megaToSendText += `${this.getEmoji(mega.type)} **${this.parseMegaName(mega.type)} ${i + 1}:**\n`
        for (let k = 1; k <= shipQuantity[mega.type]; k++) {
          megaToSendText += `${k}º Marujo: ${ship.players[k - 1] ? `<@${ship.players[k - 1]}>` : ""} \n`
        }
        megaToSendText += '\n'
      })
    }

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
    await this.client.database.Arenas.updateOne({ _id: megaID }, { acceptingJoins: false })
    this.unregisterMega(megaID)
  }

  async startCallToMega(megaID, channel, minutesOf = startTimeAndToleranceToCall, minutesTo = startTimeAndToleranceToCall) {

    const timeout = setTimeout(async () => {
      channel.send(`**ARENA INICIADA!!** Contagem para a tolerância de ${minutesTo} minuto(s) iniciada!`)
    }, 1000 * 60 * minutesOf)

    const secondTimeout = setTimeout(async () => {
      finishCallArena(megaID, channel);
    }, 1000 * 60 * (minutesOf + minutesTo))

    this.chamadas.set(megaID.toString(), [timeout, secondTimeout]);
  }

  async finishCallArena(megaID, channel){
      const queue_channel = await this.client.channels.fetch(reuniao_arena);

      const mega = await this.client.database.Arenas.findOneAndUpdate({ _id: megaID }, { acceptingJoins: false })
      this.unregisterMega(megaID)

      let msg = `RECRUTAMENTO ENCERRADO 



      ESTE CANAL SERÁ UTILIZADO APENAS PARA RECRUTAMENTO DA PRÓXIMA ARENA.
      
      
      
      :warning: NÃO envie mais mensagens aqui.`;

      let punishedMembers = [];

      if (mega.showType === 'tdm') {
        for (let i = 0; i < mega.players.length; i++) {
          if (!queue_channel.members.has(mega.players[i])) punishedMembers.push(mega.players[i])
        }
      } else {
        punishedMembers = mega.players.reduce((a, c) => {
          c.players.forEach(b => {
            if (!queue_channel.members.has(b)) a.push(b)
          })
          return a
        }, [])
      }


      if (punishedMembers.length > 0) {
        msg += `\n\nOs seguintes usuários não estavam nos canais de encontro: \n${punishedMembers.map(a => `<@${a}>`)}`
      }

      channel.send(msg)
  }
};