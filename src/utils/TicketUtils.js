const { MessageEmbed, MessageButton, MessageAttachment } = require('discord.js')
const moment = require('moment-timezone')
module.exports = class TicketUtils {
  constructor(client) {
    this.client = client;
  }
  async checkTicketMessage() {
    const config = await this.client.database.Configs.findOne({ id: 'config' });

    if (!config.ticketChannelID || !config.ticketMessageID) return this.createTicketMessage()

    try {
      const hasChannel = await this.client.guilds.cache.get(this.client.config.bot.comunityServerID).channels.fetch(config.ticketChannelID)

      if (!hasChannel) return this.createTicketMessage()

      const hasMessage = await hasChannel.messages.fetch(config.ticketMessageID)

      if (!hasMessage) return this.createTicketMessage()
    } catch {
      return this.createTicketMessage()
    }
  }

  async createTicketMessage() {
    const guild = await this.client.guilds.fetch(this.client.config.bot.comunityServerID)
    const channel = await guild.channels.fetch(this.client.config.channels.ticket_message);

    const embed = new MessageEmbed()
      .setTitle(this.client.config.messages.ticketMessageTitle)
      .setColor('DARK_GREEN')
      .setDescription("📩 | Clique no botão para criar um ticket")

    const btn = new MessageButton()
      .setCustomId('{"id": "TICKET", "type": "CREATE"}')
      .setEmoji('📩')
      .setStyle('SECONDARY')
      .setLabel('Criar Ticket')

    const msg = await channel.send({ embeds: [embed], components: [{ type: 1, components: [btn] }] })

    await this.client.database.Configs.updateOne({ id: 'config' }, { ticketChannelID: msg.channel.id, ticketMessageID: msg.id })
  }

  async reopenTicket(interaction) {
    const UpdateTicket = await this.client.database.Tickets.findOneAndUpdate({ ticketID: parseInt(interaction.channel.name.replace(/\D+/g, '')) }, { resolved: false })

    const user = await this.client.users.fetch(UpdateTicket.userID)
    const sup = await this.client.guilds.cache.get(this.client.config.bot.comunityServerID).roles.fetch(this.client.config.roles.support)

    interaction.channel.edit({
      permissionOverwrites: [{
        id: user,
        allow: 'VIEW_CHANNEL'
      }, {
        id: sup,
        allow: 'VIEW_CHANNEL'
      }, {
        id: this.client.guilds.cache.get(this.client.config.bot.comunityServerID).roles.everyone.id,
        deny: 'VIEW_CHANNEL'
      }]
    })

    interaction.channel.edit({
      name: interaction.channel.name.replace("closed", "ticket"),
    })

    interaction.message.delete()
    interaction.channel.send({
      embeds: [{
        description: `Ticket reaberto por ${interaction.user}`,
        color: 'GREEN'
      }]
    })
  }

  async deleteTicket(interaction) {
    await interaction.reply({ content: "Este canal será excluido em breve" })
    let deleted = false;
    setTimeout(async () => {
      if (!deleted) {
        this.client.channels.cache.get(interaction.channelId).send("Ocorreu um erro ao deletar este canal, por favor, faça-o manualmente")
      }
    }, 10000)
    setTimeout(async () => {
      await interaction.channel.delete();
      deleted = true;
    }, 5000)


  }

  async closeTicket(interaction) {

    const isClosed = await this.client.database.Tickets.findOne({ ticketID: parseInt(interaction.channel.name.replace(/\D+/g, '')) })
    if (isClosed.resolved) return interaction.reply({ content: "Este ticket já está fechado!", ephemeral: true })

    const closeButton = new MessageButton()
      .setCustomId('{"id": "IGNORE", "type": "CLOSE"}')
      .setStyle('DANGER')
      .setLabel("Fechar")

    const cancelButton = new MessageButton()
      .setCustomId('{"id": "IGNORE", "type": "CANCEL"}')
      .setStyle("SECONDARY")
      .setLabel("Cancelar")

    const filter = (int) => {
      const { type } = JSON.parse(int.customId)
      if (int.user.id === interaction.user.id && (type === "CLOSE", "CANCEL")) return true
      return false
    }

    await interaction.reply({ content: "Voce tem certeza que quer fechar este ticket?", components: [{ type: 1, components: [closeButton, cancelButton] }] })
    interaction.channel.awaitMessageComponent({ filter, time: 60000, componentType: "BUTTON" }).then(async int => {

      if (int.customId === '{"id": "IGNORE", "type": "CLOSE"}') {
        const ticketID = parseInt(int.channel.name.replace(/\D+/g, ''))
        const ticketInDatabase = await this.client.database.Tickets.findOneAndUpdate({ ticketID }, { resolved: true })

        interaction.deleteReply().catch(() => null)

        const buttonOne = new MessageButton()
          .setCustomId('{"id": "TICKET", "type": "TRANSCRIPT", "onlySupport": "true"}')
          .setStyle("PRIMARY")
          .setLabel("Transcript")
          .setEmoji("📑")

        const buttonTwo = new MessageButton()
          .setCustomId('{"id": "TICKET", "type": "REOPEN", "onlySupport": "true"}')
          .setStyle("SECONDARY")
          .setLabel("Abrir")
          .setEmoji("🔓")

        const buttonThree = new MessageButton()
          .setCustomId('{"id": "TICKET", "type": "DELETE", "onlySupport": "true"}')
          .setStyle("DANGER")
          .setLabel("Excluir")
          .setEmoji("⛔")

        int.channel.send({
          embeds: [{
            description: `Ticket fechado por ${int.user}`,
            color: 'YELLOW'
          }]
        })
        int.channel.send({
          embeds: [{
            description: "```Controles de Ticket do Suporte```",
            color: '#36393F'
          }],
          components: [{ type: 1, components: [buttonOne, buttonTwo, buttonThree] }]
        })

        const user = await this.client.users.fetch(ticketInDatabase.userID)
        const sup = await this.client.guilds.cache.get(this.client.config.bot.comunityServerID).roles.fetch(this.client.config.roles.support)

        int.channel.edit({
          permissionOverwrites: [{
            id: user,
            deny: 'VIEW_CHANNEL'
          }, {
            id: sup,
            allow: 'VIEW_CHANNEL'
          }, {
            id: this.client.guilds.cache.get(this.client.config.bot.comunityServerID).roles.everyone.id,
            deny: 'VIEW_CHANNEL'
          }]
        })
        int.channel.edit({
          name: interaction.channel.name.replace("ticket", "closed"),
        })
      } else {
        await interaction.deleteReply()
      }
    }).catch(() => null)
  }

  async transcriptTicket(interaction) {
    const transcriptLogChannel = await this.client.channels.fetch(this.client.config.channels.transcript_log)

    const channel = await this.client.channels.fetch(interaction.channelId)
    const messages = await channel.messages.fetch({ limit: 100 })
    const ticket = await this.client.database.Tickets.findOne({ ticketID: parseInt(interaction.channel.name.replace(/\D+/g, '')) })

    const lines = []
    const usersInTranscript = new Map();

    await messages.each(message => {
      if (message?.partial) return;
      const inMap = usersInTranscript.get(message.author.id);
      if (!inMap) usersInTranscript.set(message.author.id, 1)
      else usersInTranscript.set(message.author.id, inMap + 1);
      lines.push(`${moment(message.createdTimestamp).tz("America/Sao_Paulo").format('DD/MM/YYYY [às] hh:mm:ss')} (${message.author.id}) ${message.author.tag}: ${message.content.length > 0 ? message.content : `[ANEXO]: ${message.attachments.size > 0 ? message.attachments.map(a => a.url).join(", ") : "Sem link de anexos"}`}`)
    })

    lines.reverse()

    const sortedMap = new Map([...usersInTranscript.entries()].sort((a, b) => b[1] - a[1]));

    let textToField = '';

    sortedMap.forEach((k, v) => {
      textToField += `\n**${k}** - <@${v}>`
    })
    const attc = new MessageAttachment(Buffer.from(lines.join('\n')), `transcript-for-${interaction.channelId}.log`)

    const embed = new MessageEmbed()
      .setAuthor(`${interaction.user.tag} criou um transcript`)
      .addField('Dono do Ticket', `<@${ticket.userID}>`, true)
      .addField('Nome do Ticket', interaction.channel.name, true)
      .setDescription(`${attc.url ? `**Link:** [Clique Aqui](${attc.url})` : ''}`)
      .addField('Usuários no transcript', textToField)
      .setTimestamp()
      .setColor('BLUE')

    transcriptLogChannel.send({ embeds: [embed], files: [attc] })
    interaction.reply({ content: '> Sucesso', ephemeral: true })
  }

  async createTicket(userID, supportRole) {
    if (!userID || !supportRole) return null
    const tickets = (await this.client.database.Tickets.countDocuments()) + 1
    const toRepeat = (4 - tickets.toString().length) < 0 ? 0 : (4 - tickets.toString().length)

    const channelName = `ticket-${"0".repeat(toRepeat)}${tickets}`

    const user = await this.client.users.fetch(userID);
    const role = await this.client.guilds.cache.get(this.client.config.bot.comunityServerID).roles.fetch(this.client.config.roles.support)

    const createdChannel = await this.client.guilds.cache.get(this.client.config.bot.comunityServerID).channels
      .create(channelName, {
        type: 'text',
        parent: this.client.config.channels.ticket_category,
        permissionOverwrites: [{
          id: user,
          allow: 'VIEW_CHANNEL'
        }, {
          id: role,
          allow: 'VIEW_CHANNEL'
        }, {
          id: this.client.guilds.cache.get(this.client.config.bot.comunityServerID).roles.everyone.id,
          deny: 'VIEW_CHANNEL'
        }],
        reason: "Sistema de Tickets"
      })

    await this.client.database.Tickets.create({
      ticketID: tickets,
      userID,
      supportID: supportRole.id,
    })

    const newEmbed = new MessageEmbed()
      .setDescription("O suporte já já chegará para te ajudar!\n Por enquanto, vá informando seu problema para agilizar no processo!")
      .setFooter("Para fechar o Ticket, clique no 🔒")
      .setColor('#49da6f')

    const newButton = new MessageButton()
      .setCustomId('{"id": "TICKET", "type": "CLOSE"}')
      .setEmoji('🔒')
      .setStyle('SECONDARY')
      .setLabel("Fechar")

    createdChannel.send({ content: `Ahoy, ${user}!\nComo posso te ajudar?`, embeds: [newEmbed], components: [{ type: 1, components: [newButton] }] })

    return createdChannel;
  }
}