const { MessageEmbed } = require('discord.js')

module.exports = class EventLogModule {
  constructor(client) {
    this.client = client;
  }

  async joinChannel(voiceState) {
    const embed = new MessageEmbed()
      .setAuthor(voiceState.member.user.tag + ' Entrou numa Call', voiceState.member.user.displayAvatarURL())
      .setDescription(`**Canal:** ${voiceState.channel}\n**Categoria:** ${voiceState.channel.parent.name}`)
      .setTimestamp()
      .setColor('AQUA')
      .setFooter(`User ID: ${voiceState.member.user.id}`)

    const EventLogChannel = this.client.channels.cache.get(this.client.config.channels.event_log.voice)
    EventLogChannel.send({ embeds: [embed] })
  }

  async leftChannel(voiceState) {
    const embed = new MessageEmbed()
      .setAuthor(voiceState.member.user.tag + ' Saiu de uma Call', voiceState.member.user.displayAvatarURL())
      .setDescription(`**Canal:** ${voiceState.channel}\n**Categoria:** ${voiceState.channel.parent.name}`)
      .setTimestamp()
      .setColor('DARK_ORANGE')
      .setFooter(`User ID: ${voiceState.member.user.id}`)

    const EventLogChannel = this.client.channels.cache.get(this.client.config.channels.event_log.voice)
    EventLogChannel.send({ embeds: [embed] })
  }

  async changeChannel(oldState, newState) {

    if (oldState.channelId === newState.channelId) return;

    const embed = new MessageEmbed()
      .setAuthor(oldState.member.user.tag + ' Moveu-se para outra call', oldState.member.user.displayAvatarURL())
      .setDescription(`**Canal Antigo:** ${oldState.channel} - **Categoria:** ${oldState.channel?.parent?.name ?? "Desconhecido"}\n**Novo Canal:** ${newState.channel} - **Categoria:** ${newState.channel.parent.name ?? "Desconhecido"} `)
      .setTimestamp()
      .setColor('BLURPLE')
      .setFooter(`User ID: ${oldState.member.user.id}`)

    const audit = await this.client.guilds.cache.get(this.client.config.bot.comunityServerID).fetchAuditLogs({ limit: 1, type: 26 })

    if (audit.entries.first() && (audit.entries.first().target?.member?.user?.id === oldState.member.user.id && newState.member.id !== audit.entries.first().executor.id)) embed.setAuthor(audit.entries.first().executor.tag + ' Moveu ' + newState.member.user.tag + ' de Canal', audit.entries.first().executor.displayAvatarURL()).setColor('DARK_BLUE')

    const EventLogChannel = this.client.channels.cache.get(this.client.config.channels.event_log.voice)
    EventLogChannel.send({ embeds: [embed] })
  }

  async deletedMessage(message) {
    const embed = new MessageEmbed()
      .setAuthor('Uma mensagem de ' + message.author.tag + ' foi deletada', message.author.displayAvatarURL())
      .setDescription(`**Mensagem:** \`\`\`${message.cleanContent.length > 0 ? message.cleanContent : '[ANEXO]'}\`\`\``)
      .addField('Canal:', `${message.channel}`)
      .setTimestamp()
      .setColor('RED')
      .setFooter(`User ID: ${message.author.id}`)

    if (message.attachments?.first()) {
      embed.setImage(message.attachments.first().url)
      const links = [];
      message.attachments.each(a => {
        links.push(a.url)
      })

      embed.addField("Anexos", links.join("\n"))
    }

    const EventLogChannel = this.client.channels.cache.get(this.client.config.channels.event_log.message)
    EventLogChannel.send({ embeds: [embed] })
  }

  async editedMessage(oldMessage, newMessage) {
    const embed = new MessageEmbed()
      .setAuthor(oldMessage.author.tag + ' Editou uma Mensagem', oldMessage.author.displayAvatarURL())
      .setDescription('Mensagem Nova:', `\`\`\`${newMessage.cleanContent.length > 0 ? newMessage.cleanContent : '[ANEXO]'}\`\`\``)
      .addField('Mensagem Antiga:', `\`\`\`${oldMessage.cleanContent.length > 0 ? oldMessage.cleanContent.slice(0, 1020) : '[ANEXO]'}\`\`\``)
      .addField(`**Canal:**`, `${oldMessage.channel ?? 'THREAD'}`)
      .setTimestamp()
      .setColor('YELLOW')
      .setFooter(`User ID: ${oldMessage.author.id}`)

    if (oldMessage.attachments?.first()) {
      embed.setImage(oldMessage.attachments.first().url)

      const links = [];
      oldMessage.attachments.each(a => {
        links.push(a.url)
      })

      embed.addField("Anexos Antigos", links.join("\n"))
    }

    const EventLogChannel = this.client.channels.cache.get(this.client.config.channels.event_log.message)
    EventLogChannel.send({ embeds: [embed] })
  }

  async createEmoji(emoji) {
    emoji.author = await emoji.fetchAuthor()
    const embed = new MessageEmbed()
      .setAuthor(emoji.author.tag + ' Criou um Emoji', emoji.author.displayAvatarURL())
      .setDescription(`**Emoji Name:** ${emoji.name}\n**Emoji ID:** ${emoji.id}\n**Emoji:**`)
      .setImage(emoji.url)
      .setTimestamp()
      .setColor('DARK_GREEN')
      .setFooter(`User ID: ${emoji.author.id}`)

    const EventLogChannel = this.client.channels.cache.get(this.client.config.channels.event_log.emoji)
    EventLogChannel.send({ embeds: [embed] })
  }

  async deleteEmoji(emoji) {
    await this.client.guilds.cache.get(this.client.config.bot.comunityServerID).fetchAuditLogs({ limit: 1, type: 62 }).then(a => emoji.author = a.entries.first().executor)
    const embed = new MessageEmbed()
      .setAuthor(emoji.author.tag + ' Deletou um Emoji', emoji.author.displayAvatarURL())
      .setDescription(`**Emoji:** ${emoji.name}\n**ID:** ${emoji.id}`)
      .setTimestamp()
      .setColor('DARK_RED')
      .setFooter(`User ID: ${emoji.author.id}`)

    const EventLogChannel = this.client.channels.cache.get(this.client.config.channels.event_log.emoji)
    EventLogChannel.send({ embeds: [embed] })
  }

  async createRole(role) {
    await this.client.guilds.cache.get(this.client.config.bot.comunityServerID).fetchAuditLogs({ limit: 1, type: 30 }).then(a => role.author = a.entries.first().executor)
    const embed = new MessageEmbed()
      .setAuthor(role.author.tag + ' Criou um Cargo', role.author.displayAvatarURL())
      .setDescription(`**Cargo:** ${role.name}\n**ID:**${role.id}\n**ADMIN:** \`${role.permissions.has('ADMINISTRATOR') ? 'SIM' : 'não'}\``)
      .setTimestamp()
      .setColor(role.color)
      .setFooter(`User ID: ${role.author.id}`)

    const EventLogChannel = this.client.channels.cache.get(this.client.config.channels.event_log.role)
    EventLogChannel.send({ embeds: [embed] })
  }

  async updateRole(oldRole, newRole) {
    await this.client.guilds.cache.get(this.client.config.bot.comunityServerID).fetchAuditLogs({ limit: 1, type: 31 }).then(a => newRole.author = a.entries.first()?.executor)
    if (!newRole.author) return;
    const embed = new MessageEmbed()
      .setAuthor(newRole.author.tag + ' Atualizou um Cargo', newRole.author.displayAvatarURL())
      .addField("ANTIGO CARGO", `**Nome:** ${oldRole.name}\n**ID:**${oldRole.id}\n**ADMIN:** \`${oldRole.permissions.has('ADMINISTRATOR') ? 'SIM' : 'não'}\``)
      .addField("NOVO CARGO", `**Nome:** ${newRole.name}\n**ID:**${newRole.id}\n**ADMIN:** \`${newRole.permissions.has('ADMINISTRATOR') ? 'SIM' : 'não'}\``)
      .setTimestamp()
      .setColor(newRole.color)
      .setFooter(`User ID: ${newRole.author.id}`)

    const oldPerms = oldRole.permissions.serialize();
    const newPerms = newRole.permissions.serialize();

    const permUpdated = [];

    for (const [key, element] of Object.entries(oldPerms)) {
      if (newPerms[key] !== element) permUpdated.push(key);
    }

    if (permUpdated.length > 0) embed.addField('PERMISSOES ALTERADAS', permUpdated.join(", "))


    const EventLogChannel = this.client.channels.cache.get(this.client.config.channels.event_log.role)
    EventLogChannel.send({ embeds: [embed] })
  }

  async deleteRole(role) {
    await this.client.guilds.cache.get(this.client.config.bot.comunityServerID).fetchAuditLogs({ limit: 1, type: 32 }).then(a => role.author = a.entries.first().executor)
    const embed = new MessageEmbed()
      .setAuthor(role.author.tag + ' Deletou um Cargo', role.author.displayAvatarURL())
      .setDescription(`**Cargo:** ${role.name}\n**ID:** ${role.id}`)
      .setTimestamp()
      .setColor('DARK_RED')
      .setFooter(`User ID: ${role.author.id}`)

    const EventLogChannel = this.client.channels.cache.get(this.client.config.channels.event_log.role)
    EventLogChannel.send({ embeds: [embed] })
  }

  async createChannel(channel) {
    await this.client.guilds.cache.get(this.client.config.bot.comunityServerID).fetchAuditLogs({ limit: 1, type: 10 }).then(a => channel.author = a.entries.first().executor)
    const embed = new MessageEmbed()
      .setAuthor(channel.author.tag + ' Criou um Canal', channel.author.displayAvatarURL())
      .setDescription(`**Canal:** ${channel}\n**ID:**${channel.id}\n**Tipo**:\`${channel.type}\`\n**Categoria:** ${channel.parent ? channel.parent.name : '\`NENHUMA\`'}`)
      .setTimestamp()
      .setColor('DARK_AQUA')
      .setFooter(`User ID: ${channel.author.id}`)

    const EventLogChannel = this.client.channels.cache.get(this.client.config.channels.event_log.channel)
    EventLogChannel.send({ embeds: [embed] })
  }

  async deleteChannel(channel) {
    await this.client.guilds.cache.get(this.client.config.bot.comunityServerID).fetchAuditLogs({ limit: 1, type: 12 }).then(a => channel.author = a.entries.first().executor)
    const embed = new MessageEmbed()
      .setAuthor(channel.author.tag + ' Deletou um Canal', channel.author.displayAvatarURL())
      .setDescription(`**Canal:** ${channel.name}\n**ID:** ${channel.id}\n**Categoria:** ${channel.parent ? channel.parent.name : '\`NENHUMA\`'}`)
      .setTimestamp()
      .setColor('DARK_ORANGE')
      .setFooter(`User ID: ${channel.author.id}`)

    const EventLogChannel = this.client.channels.cache.get(this.client.config.channels.event_log.channel)
    EventLogChannel.send({ embeds: [embed] })
  }

  async nicknameChange(oldNick, member) {
    const embed = new MessageEmbed()
      .setAuthor(member.user.tag + ' Mudou seu Nick', member.user.displayAvatarURL())
      .setDescription(`**Antigo Nick:** ${oldNick ?? '`NENHUM`'}\n**Novo Nick:** ${member.nickname ?? '`NENHUM`'}`)
      .setTimestamp()
      .setColor('DARK_VIVID_PINK')
      .setFooter(`User ID: ${member.user.id}`)

    const audit = await this.client.guilds.cache.get(this.client.config.bot.comunityServerID).fetchAuditLogs({ limit: 1, type: 24 })

    if (audit.entries.first() && (audit.entries.first().target.id === member.user.id && member.user.id !== audit.entries.first().executor.id)) embed.setAuthor(audit.entries.first().executor.tag + ' Mudou o Nick de ' + member.user.tag, audit.entries.first().executor.displayAvatarURL())

    const EventLogChannel = this.client.channels.cache.get(this.client.config.channels.event_log.member)
    EventLogChannel.send({ embeds: [embed] })
  }

  async rolesChange(oldRoles, member) {
    const embed = new MessageEmbed()
      .setAuthor(member.user.tag + ' Teve seus cargos alterados', member.user.displayAvatarURL())
      .setTimestamp()
      .setColor('FUCHSIA')
      .setFooter(`User ID: ${member.user.id}`)

    const audit = await this.client.guilds.cache.get(this.client.config.bot.comunityServerID).fetchAuditLogs({ limit: 1, type: 25 })

    if (audit.entries.first() && (audit.entries.first().target.id === member.user.id && member.user.id !== audit.entries.first().executor.id)) embed.setAuthor(audit.entries.first().executor.tag + ' Mudou os Cargos de ' + member.user.tag, audit.entries.first().executor.displayAvatarURL())

    if (oldRoles.cache.size > member.roles.cache.size) {
      oldRoles.cache.forEach(role => {
        if (!member.roles.cache.has(role.id)) {
          embed.addField("Cargo Removido", role.toString());
        }
      })
    } else {
      member.roles.cache.forEach(role => {
        if (!oldRoles.cache.has(role.id)) {
          embed.addField("Cargo Adicionado", role.toString());
        }
      });
    }

    const EventLogChannel = this.client.channels.cache.get(this.client.config.channels.event_log.member)
    EventLogChannel.send({ embeds: [embed] })
  }

  async usernameChange(oldUsername, user) {
    const embed = new MessageEmbed()
      .setAuthor(user.tag + ' Mudou seu Username', user.displayAvatarURL())
      .setDescription(`**Antigo Username:** ${oldUsername}\n**Novo Username:** ${user.username}`)
      .setTimestamp()
      .setColor('GREYPLE')
      .setFooter(`User ID: ${user.id}`)

    const EventLogChannel = this.client.channels.cache.get(this.client.config.channels.event_log.member)
    EventLogChannel.send({ embeds: [embed] })

  }

  async createWarn(warn) {
    const warned = await this.client.users.fetch(warn.userID)
    const user = await this.client.users.fetch(warn.warnerID)
    const embed = new MessageEmbed()
      .setAuthor(user.tag + ' Avisou ' + warned.tag, user.displayAvatarURL())
      .setDescription(`**MOTIVO:** ${warn.reason}\n\n${warned.username} possui ${warn.warnNumber} avisos`)
      .setTimestamp()
      .setColor('LUMINOUS_VIVID_PINK')
      .setFooter(`User ID: ${warned.id}`)

    const EventLogChannel = this.client.channels.cache.get(this.client.config.channels.event_log.warn)
    EventLogChannel.send({ embeds: [embed] })
  }

  async deleteWarn(author, warned) {
    const embed = new MessageEmbed()
      .setAuthor(author.tag + ' Removeu um aviso de ' + warned.tag, author.displayAvatarURL())
      .setTimestamp()
      .setColor('LUMINOUS_VIVID_PINK')
      .setFooter(`User ID: ${warned.id}`)

    const EventLogChannel = this.client.channels.cache.get(this.client.config.channels.event_log.warn)
    EventLogChannel.send({ embeds: [embed] })
  }
};