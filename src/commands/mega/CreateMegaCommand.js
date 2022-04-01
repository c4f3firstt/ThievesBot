const Command = require('../../structures/Command');
const { MessageEmbed, MessageButton } = require('discord.js')
const { help_roles, help_categories } = require('../../../config.json').helper

//Mega Emojis
const { galleon_emoji } = require('../../../config.json').emojis
const { brig_emoji } = require('../../../config.json').emojis
const { sloop_emoji } = require('../../../config.json').emojis
const { pesca_emoji } = require('../../../config.json').emojis
const { fishingpole_emoji } = require('../../../config.json').emojis

//Companies Emojis
const { compMercante_emoji } = require('../../../config.json').emojis
const { compOuro_emoji } = require('../../../config.json').emojis
const { compAlmas_emoji } = require('../../../config.json').emojis
const { compReaper_emoji } = require('../../../config.json').emojis

module.exports = class CreateMegaCommand extends Command {
  
  constructor(client) {
    super(client, {
      name: 'mega',
      cooldown: 5,
      description: "Começa a criação de uma Mega",
      usage: "<#canal>",
      userRole: [
        help_roles.oficial_alianca.key,
        help_roles.contramestre.key,
        help_roles.segundo_imediato.key,
        help_roles.capitao_alianca.key,
        help_roles.primeiro_imediato.key,
        help_roles.capitao.key
      ],
      category: help_categories.mega.name,
    });
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
    if (!channelToList) return ctx.send("Você não mencionou o canal que ocorrerá esta mega! Mencione o canal da lista")

    if (!ctx.message.guild.channels.cache.get(channelToList.id)) return ctx.send("Este canal não existe")

    const hasListInChannel = await this.client.database.Megas.findOne({ channelID: channelToList.id, acceptingJoins: true })

    if (hasListInChannel) return ctx.send("Este canal já possui uma mega aberta!")

    const megaNumber = channelToList.name.trim().split("-").pop()

    const megaToOccur = {
      channelID: channelToList.id,
      megaNumber,
      ships: [],
    }

    const availableMegaType = ['reputacao', 'hardfarm', 'pesca']

    ctx.send(`Qual será o tipo da Mega?\nDisponíveis: \`${availableMegaType.map(a => a.replace('reputacao', 'reputação')).join("`, `")}\``);

    const getMegaType = await this.collectInput(ctx.message.channel, ctx.message.author.id)

    if (!getMegaType) return ctx.send("Você demorou muito para responder. Tente novamente.")

    const megaTypeToShow = availableMegaType.find(n => getMegaType.content.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(n))

    if (!megaTypeToShow) return ctx.send("Você não mencionou um tipo de mega válido. Tente novamente.")

    megaToOccur.showType = megaTypeToShow

    const availableMega = ['galeao', 'bergantim', 'chalupa']

    ctx.send(`Qual será o tipo de embarcação?\nDisponíveis: \`${availableMega.map(a => a.replace('galeao', 'galeão')).join("`, `")}\``);

    const getType = await this.collectInput(ctx.message.channel, ctx.message.author.id)

    if (!getType) return ctx.send("Você demorou muito para responder. Tente novamente.")

    const megaType = availableMega.find(n => getType.content.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(n))

    if (!megaType) return ctx.send("Você não mencionou um tipo de embarcação válido. Tente novamente.")

    megaToOccur.type = megaType

    ctx.send("As pessoas que quiserem entrar nessa mega podem estar inscritas em outras? `[NÃO/Sim]`")

    const getYesOrNo = await this.collectInput(ctx.message.channel, ctx.message.author.id)

    if (!getYesOrNo) return ctx.send("Você demorou muito para responder. Tente novamente.")

    megaToOccur.fullyOpen = getYesOrNo.content.toLowerCase() === "sim";

    ctx.send("Quando ocorrerá esta mega? Utilize o modelo `dd/mm` - Exemplo: (08/09)")

    const getDate = await this.collectInput(ctx.message.channel, ctx.message.author.id)

    if (!getDate) return ctx.send("Você demorou muito para responder. Tente novamente.")

    const megaDate = getDate.content.replace(/^(\d{2})(\d{2}).*/, "$1/$2");

    megaToOccur.date = megaDate

    ctx.send("Em que horário essa mega vai acontecer? Utilize o modelo `HH:mm HH:mm` - Exemplo: (19:00 23:30)")

    const getTime = await this.collectInput(ctx.message.channel, ctx.message.author.id)

    if (!getTime) return ctx.send("Você demorou muito para responder. Tente novamente.")

    const megaTime = getTime.content.trim().split(" ");

    if (megaTime.length !== 2) return ctx.send("Você não disse o horário corretamente. Tente novamente.")

    megaToOccur.startHour = megaTime[0]
    megaToOccur.endHour = megaTime[1]

    ctx.send("Qual é a quantidade de navios que estarão no mega?")

    const getMaxShips = await this.collectInput(ctx.message.channel, ctx.message.author.id)

    if (!getMaxShips) return ctx.send("Você demorou muito para responder. Tente novamente.")

    megaToOccur.maxShips = parseInt(getMaxShips.content)

    if (megaToOccur.maxShips < 1) return ctx.send("O número de embarcações deve ser maior que 0.")

    if (megaToOccur.showType !== "pesca") {
      ctx.send(`A partir de agora, digite o nome da embarcação. Envie os emojis tamém, por exemplo: Mercante ${compMercante_emoji}, Ouro ${compOuro_emoji}, Almas ${compAlmas_emoji} ou Ceifador ${compReaper_emoji} `)
      for (let i = 1; i <= megaToOccur.maxShips; i++) {
        ctx.send(`Qual o nome para o **${this.parseMegaName(megaToOccur.type)} ${i}:** `)
        const name = await this.collectInput(ctx.message.channel, ctx.message.author.id)
        if (!name) return ctx.send("Você demorou muito para responder. Tente novamente.")
        megaToOccur.ships.push({ name: name.content, players: [] })
      }
    } else {
      ctx.send("Qual é a edição dessa pesca? Exemplo: `18`")
      const getEdition = await this.collectInput(ctx.message.channel, ctx.message.author.id)
      if (!getEdition) return ctx.send("Você demorou muito para responder. Tente novamente.")
      megaToOccur.megaNumber = getEdition.content

      for (let i = 1; i <= megaToOccur.maxShips; i++) {
        megaToOccur.ships.push({ name: '', players: [] })
      }
    }

    let txt = `**Tipo de Mega:** ${this.parseMegaName(megaToOccur.showType)}\n **Tipo de Embarcação:** ${this.parseMegaName(megaToOccur.type)} **${megaToOccur.megaNumber}**\n**Acontecerá dia:** ${megaToOccur.date}\nDas \`${megaToOccur.startHour}\` até às \`${megaToOccur.endHour}\`\n**Quantidade de embarcações**: ${megaToOccur.maxShips}\n\n**Embarcações:**\n\n`

    megaToOccur.ships.forEach((ship, i) => {
      txt += `**${this.parseMegaName(megaToOccur.type)} ${i + 1}:** ${ship.name}\n`
    })

    const embed = new MessageEmbed()
      .setTitle(`Verifique as Informações`)
      .setDescription(txt)
      .setFooter("Escolha entre 'Enviar a Lista', 'Adicionar Membros na Lista' ou 'Cancelar'")
      .setColor("RANDOM")
      .setTimestamp()

    const firstButton = new MessageButton()
      .setCustomId('{"id": "IGNORE", "type": "SEND_MEGA"}')
      .setLabel('Enviar')
      .setStyle("SUCCESS")

    const secondButton = new MessageButton()
      .setCustomId('{"id": "IGNORE", "type": "ADD_MEGA"}')
      .setLabel('Adicionar Membros')
      .setStyle("PRIMARY")

    const thirdButton = new MessageButton()
      .setCustomId('{"id": "IGNORE", "type": "CANCEL_MEGA"}')
      .setLabel('Cancelar')
      .setStyle("DANGER")

    const msg = await ctx.send({ embeds: [embed], components: [{ type: 1, components: [firstButton, secondButton, thirdButton] }] })

    const filt = (int) => int.user.id === ctx.message.author.id

    msg.awaitMessageComponent({ componentType: 'BUTTON', filter: filt, max: 1 }).then(async col => {
      const { type } = JSON.parse(col.customId)
      msg.delete()

      if (type === "CANCEL_MEGA") return col.reply({ content: "Mega Cancelada! Utilize o comando novamente para começar outra" })
      if (type === "SEND_MEGA") return this.sendMega(ctx, megaToOccur)
      if (type === "ADD_MEGA") return this.addUsersToMega(ctx, megaToOccur)
    })
  }

  async addUsersToMega(ctx, megaToSend) {
    ctx.send("Diga em qual embarcação o usuário será adicionado, em seguida, mande o id/mencione o usuário, exemplo: `2 52818561082165862`")
    const getShip = await this.collectInput(ctx.message.channel, ctx.message.author.id)

    const [ship, user] = getShip.content.split(" ")

    if (!ship || !user) {
      ctx.send("Você não digitou o nome corretamente. Tente novamente.")
      return this.addUsersToMega(ctx, megaToSend)
    }

    const shipIndex = parseInt(ship);

    if (shipIndex < 1 || shipIndex > megaToSend.maxShips) {
      ctx.send("Você digitou um número inválido. Tente novamente.")
      return this.addUsersToMega(ctx, megaToSend)
    }

    const shipQuantity = {
      'galeao': 4,
      'bergantim': 3,
      '': 2,
    }

    if (megaToSend.ships[shipIndex - 1].players.length >= shipQuantity[megaToSend.type]) {
      ctx.send("Esta embarcação já está cheia!")
      return this.addUsersToMega(ctx, megaToSend)
    }

    const member = await ctx.message.guild.members.fetch(user.replace(/[<@!>]/g, '')).catch(() => null)
    if (!member) {
      ctx.send('Este usuário não está no servidor')
      return this.addUsersToMega(ctx, megaToSend)
    }

    megaToSend.ships[shipIndex - 1].players.push(member.id)

    let txt = `**Tipo de Mega:** ${this.parseMegaName(megaToSend.type)}-${this.parseMegaName(megaToSend.showType)} **${megaToSend.megaNumber}**\n**Acontecerá dia:** ${megaToSend.date}\nDas \`${megaToSend.startHour}\` até às \`${megaToSend.endHour}\`\n**Quantidade de embarcações**: ${megaToSend.maxShips}\n\n**Embarcações:**\n\n`

    megaToSend.ships.forEach((ship, i) => {
      txt += `**${this.parseMegaName(megaToSend.type)} ${i + 1}:** ${ship.name}\n`
    })

    const embed = new MessageEmbed()
      .setTitle(`Usuário Adicionado! Verifique as Informações`)
      .setDescription(txt)
      .setFooter("Escolha entre 'Enviar a Lista', 'Adicionar Membros na Lista' ou 'Cancelar'")
      .setColor("RANDOM")
      .setTimestamp()

    const firstButton = new MessageButton()
      .setCustomId('{"id": "IGNORE", "type": "SEND_MEGA"}')
      .setLabel('Enviar')
      .setStyle("SUCCESS")

    const secondButton = new MessageButton()
      .setCustomId('{"id": "IGNORE", "type": "ADD_MEGA"}')
      .setLabel('Adicionar Membros')
      .setStyle("PRIMARY")

    const thirdButton = new MessageButton()
      .setCustomId('{"id": "IGNORE", "type": "CANCEL_MEGA"}')
      .setLabel('Cancelar')
      .setStyle("DANGER")

    const msg = await ctx.send({ embeds: [embed], components: [{ type: 1, components: [firstButton, secondButton, thirdButton] }] })

    const filt = (int) => int.user.id === ctx.message.author.id

    msg.awaitMessageComponent({ componentType: 'BUTTON', filter: filt, max: 1 }).then(async col => {
      const { type } = JSON.parse(col.customId)
      msg.delete()

      if (type === "CANCEL_MEGA") return col.reply({ content: "Mega Cancelada! Utilize o comando novamente para começar outra" })
      if (type === "SEND_MEGA") return this.sendMega(ctx, megaToSend)
      if (type === "ADD_MEGA") return this.addUsersToMega(ctx, megaToSend)
    })
  }

  async sendMega(ctx, megaToSend) {
    let megaToSendText = `${this.getMegaTitleByType(megaToSend.megaNumber, megaToSend.showType)}\n<@&${help_roles.marujo_alianca.key}>\n\nData: \`${megaToSend.date}\`\nHorário de \`${megaToSend.startHour}\` às \`${megaToSend.endHour}\`\n\n`

    const shipQuantity = {
      'galeao': 4,
      'bergantim': 3,
      'chalupa': 2,
      'pesca': 4
    }

    megaToSend.ships.forEach((ship, i) => {
      megaToSendText += `${this.getEmoji(megaToSend.type, megaToSend.showType)} **${this.parseMegaName(megaToSend.type)} ${i + 1}:** ${ship.name}\n`
      for (let k = 1; k <= shipQuantity[megaToSend.type]; k++) {
        megaToSendText += `${k}º Marujo: ${ship.players[k - 1] ? `<@${ship.players[k - 1]}>` : ""} \n`
      }
      megaToSendText += '\n'
    })

    const sentMessage = await this.client.channels.cache.get(megaToSend.channelID).send({ content: megaToSendText })

    megaToSend.messageID = sentMessage.id

    const createdMegaToRegister = await this.client.database.Megas.create(megaToSend)

    this.client.megaListener.registerMega(createdMegaToRegister)

    ctx.send("Mega criada com sucesso!")
  }
};