const Command = require('../../structures/Command');
const { help_roles, help_categories } = require('../../../config.json').helper
const { MessageEmbed, MessageButton } = require('discord.js')

//Arena Emojis
const { galleon_emoji } = require('../../../config.json').emojis
const { brig_emoji } = require('../../../config.json').emojis
const { sloop_emoji } = require('../../../config.json').emojis
const { comparena_emoji } = require('../../../config.json').emojis

module.exports = class CreateArenaCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'arena',
      cooldown: 5,
      description: "Começa a criação de uma Arena",
      usage: "<#canal>",
      userRole: [
        help_roles.oficial_arena.key,
        help_roles.contramestre.key,
        help_roles.segundo_imediato.key,
        help_roles.capitao_alianca.key,
        help_roles.primeiro_imediato.key,
        help_roles.capitao.key
      ],
      category: help_categories.arena.name,
    });
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
    const after = megaName.replace('galeao', 'Galeão')
    return after.charAt(0).toUpperCase() + megaName.slice(1);
  }

  async collectInput(channel, authorID) {
    let error = false
    const messagesCollected = await channel.awaitMessages({ filter: m => m.author.id === authorID, max: 1, time: 90000 }).catch(() => {
      error = true
    })
    if (error) return null
    return messagesCollected.first()
  }

  async run(ctx) {
    const channelToList = ctx.message.mentions.channels.first()
    if (!channelToList) return ctx.send("Você não mencionou o canal que ocorrerá esta Arena! Mencione o canal da lista")

    if (!ctx.message.guild.channels.cache.get(channelToList.id)) return ctx.send("Este canal não existe")

    const hasListInChannel = await this.client.database.Arenas.findOne({ channelID: channelToList.id, acceptingJoins: true })

    if (hasListInChannel) return ctx.send("Este canal já possui uma mega aberta!")

    const megaNumber = channelToList.name.trim().split("-").pop()

    const megaToOccur = {
      channelID: channelToList.id,
      number: megaNumber,
      players: [],
    }

    const availableMegaType = ['tdm', 'semboard', 'naval']

    ctx.send(`Qual será o tipo da Arena?\nDisponíveis: \`${availableMegaType.join("`, `")}\``);

    const getMegaType = await this.collectInput(ctx.message.channel, ctx.message.author.id)

    if (!getMegaType) return ctx.send("Você demorou muito para responder. Tente novamente.")

    const megaTypeToShow = availableMegaType.find(n => getMegaType.content.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(n))

    if (!megaTypeToShow) return ctx.send("Você não mencionou um tipo de arena válido. Tente novamente.")

    megaToOccur.showType = megaTypeToShow

    if (megaTypeToShow !== 'tdm') {

      const availableMega = ['galeao', 'chalupa']

      ctx.send(`Qual será o tipo de embarcação?\nDisponíveis: \`${availableMega.map(a => a.replace('galeao', 'galeão')).join("`, `")}\``);

      const getType = await this.collectInput(ctx.message.channel, ctx.message.author.id)

      if (!getType) return ctx.send("Você demorou muito para responder. Tente novamente.")

      const megaType = availableMega.find(n => getType.content.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(n))

      if (!megaType) return ctx.send("Você não mencionou um tipo de embarcação válido. Tente novamente.")

      megaToOccur.type = megaType
    }

    ctx.send("Quando ocorrerá esta arena? Utilize o modelo `dd/mm` - Exemplo: (08/09)")

    const getDate = await this.collectInput(ctx.message.channel, ctx.message.author.id)

    if (!getDate) return ctx.send("Você demorou muito para responder. Tente novamente.")

    const megaDate = getDate.content.replace(/^(\d{2})(\d{2}).*/, "$1/$2");

    megaToOccur.date = megaDate

    ctx.send("Em que horário essa arena vai acontecer? Utilize o modelo `HH:mm HH:mm` - Exemplo: (19:00 23:30)")

    const getTime = await this.collectInput(ctx.message.channel, ctx.message.author.id)

    if (!getTime) return ctx.send("Você demorou muito para responder. Tente novamente.")

    const megaTime = getTime.content.trim().split(" ");

    if (megaTime.length !== 2) return ctx.send("Você não disse o horário corretamente. Tente novamente.")

    megaToOccur.startHour = megaTime[0]
    megaToOccur.endHour = megaTime[1]

    ctx.send("Qual é a quantidade de navios/jogadores que estarão na Arena?")

    const getMaxShips = await this.collectInput(ctx.message.channel, ctx.message.author.id)

    if (!getMaxShips) return ctx.send("Você demorou muito para responder. Tente novamente.")

    megaToOccur.maxPlayers = parseInt(getMaxShips.content)

    if (megaToOccur.maxPlayers < 1) return ctx.send("O número de embarcações deve ser maior que 0.")

    if (megaToOccur.showType !== 'tdm') {
      for (let i = 1; i <= megaToOccur.maxPlayers; i++) {
        megaToOccur.players.push({ name: '', players: [] })
      }
    }

    let txt = `**Tipo de Arena:** ${this.parseMegaName(megaToOccur.showType)}\n **Tipo de Embarcação:** ${megaToOccur?.type ? this.parseMegaName(megaToOccur.type) : 'Sem embarcação'} **${megaToOccur.number}**\n**Acontecerá dia:** ${megaToOccur.date}\nDas \`${megaToOccur.startHour}\` até às \`${megaToOccur.endHour}\`\n**Quantidade de embarcações/jogadores**: ${megaToOccur.maxPlayers}\n\n`

    const embed = new MessageEmbed()
      .setTitle(`Verifique as Informações`)
      .setDescription(txt)
      .setFooter("Escolha entre 'Enviar a Lista', 'Adicionar Membros na Lista' ou 'Cancelar'")
      .setColor("RANDOM")
      .setTimestamp()

    const firstButton = new MessageButton()
      .setCustomId('{"id": "IGNORE", "type": "SEND_ARENA"}')
      .setLabel('Enviar')
      .setStyle("SUCCESS")

    const thirdButton = new MessageButton()
      .setCustomId('{"id": "IGNORE", "type": "CANCEL_ARENA"}')
      .setLabel('Cancelar')
      .setStyle("DANGER")

    const msg = await ctx.send({ embeds: [embed], components: [{ type: 1, components: [firstButton, thirdButton] }] })

    const filt = (int) => int.user.id === ctx.message.author.id

    msg.awaitMessageComponent({ componentType: 'BUTTON', filter: filt, max: 1 }).then(async col => {
      const { type } = JSON.parse(col.customId)
      msg.delete()

      if (type === "CANCEL_ARENA") return col.reply({ content: "Arena Cancelada! Utilize o comando novamente para começar outra" })
      if (type === "SEND_ARENA") return this.sendMega(ctx, megaToOccur)
    })
  }

  async sendMega(ctx, megaToSend) {
    let megaToSendText = `${this.getMegaTitleByType(megaToSend.showType)}\n${this.getMegaMention(megaToSend.showType)}\n\nData: \`${megaToSend.date}\`\nHorário de \`${megaToSend.startHour}\` às \`${megaToSend.endHour}\`\n\n`

    const shipQuantity = {
      'galeao': 4,
      'bergantim': 3,
      'chalupa': 2,
    }

    if (megaToSend.showType === 'tdm') {
      for (let k = 1; k <= megaToSend.maxPlayers; k++) {
        megaToSendText += `${k}º Marujo: Vaga Disponível!\n`
      }
    } else {
      megaToSend.players.forEach((ship, i) => {
        megaToSendText += `${this.getEmoji(megaToSend.type)} **${this.parseMegaName(megaToSend.type)} ${i + 1}:**\n`
        for (let k = 1; k <= shipQuantity[megaToSend.type]; k++) {
          megaToSendText += `${k}º Marujo: ${ship.players[k - 1] ? `<@${ship.players[k - 1]}>` : ""} \n`
        }
        megaToSendText += '\n'
      })
    }

    const sentMessage = await this.client.channels.cache.get(megaToSend.channelID).send({ content: megaToSendText })

    megaToSend.messageID = sentMessage.id

    const createdArenaToRegister = await this.client.database.Arenas.create(megaToSend)

    this.client.arenaListener.registerArena(createdArenaToRegister)

    ctx.send("Arena criada com sucesso!")
  }
};