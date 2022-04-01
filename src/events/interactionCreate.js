const { Collection } = require('discord.js');

const cooldown = new Collection();

module.exports = class InteractionCreate {
  constructor(client) {
    this.client = client;
  }

  async run(int) {
    if (!int.isButton()) return;

    let id, type, onlySupport

    try {
      const owo = JSON.parse(int.customId)
      id = owo.id
      type = owo.type
      onlySupport = owo.onlySupport
    } catch {
      return
    }

    if (!id || id === 'IGNORE') return;

    if (id === 'NAVAL') {
      switch (type) {
        case 'GET':
            int.member.roles.add(this.client.config.helper.help_roles.arena_naval.key)
            int.reply({content: "> Você será notificado sobre as partidas de Naval!", ephemeral: true})
          break;
        case 'REMOVE':
          int.member.roles.remove(this.client.config.helper.help_roles.arena_naval.key)
          int.reply({content: "> Você não será mais notificado!", ephemeral: true})
          break
      }
      return;
    }

    if (id === 'REACTION') {
      switch (type) {
        case 'GET':
            int.member.roles.add(this.client.config.helper.help_roles.arena_tdm.key)
            int.reply({content: "> Você será notificado sobre as partidas de TDM!", ephemeral: true})
          break;
        case 'REMOVE':
          int.member.roles.remove(this.client.config.helper.help_roles.arena_tdm.key)
          int.reply({content: "> Você não será mais notificado!", ephemeral: true})
          break
      }
      return;
    }

    if (id !== 'TICKET') return;

    if (onlySupport && !int.member.roles.cache.has(this.client.config.roles.support)) return int.reply({ ephemeral: true, content: "> Apenas suportes podem fazer isso!" })

    const now = Date.now();
    const cooldownAmount = 3000;

    if (cooldown.has(int.user.id)) {
      const expirationTime = cooldown.get(int.user.id) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return int.reply({ content: `> Você está executando ações rápido demais! Aguarde **${timeLeft | 0}** segundos`, ephemeral: true });
      }
    }

    cooldown.set(int.user.id, now);
    setTimeout(() => {
      cooldown.delete(int.user.id);
    }, cooldownAmount);

    switch (type) {
      case 'CREATE': {
        await int.reply({ ephemeral: true, content: "> Seu ticket será criado em alguns segundos... Aguarde" })
        const supportRole = await int.guild.roles.fetch(this.client.config.roles.support)
        if (!supportRole) return int.editReply({ ephemeral: true, content: `> Ocorreu um erro ao encontrar qual seria seu suporte!` })
        const channel = await this.client.ticketUtils.createTicket(int.user.id, supportRole)
        if (!channel) return int.editReply({ ephemeral: true, content: `> Você não pode criar um ticket consigo mesmo!` })
        int.editReply({ ephemeral: true, content: `> O suporte te aguarda em ${channel}` })
        break;
      }
      case 'CLOSE': {
        this.client.ticketUtils.closeTicket(int)
        break;
      }
      case 'REOPEN': {
        this.client.ticketUtils.reopenTicket(int);
        break;
      }
      case 'DELETE': {
        this.client.ticketUtils.deleteTicket(int);
        break;
      }
      case 'TRANSCRIPT': {
        this.client.ticketUtils.transcriptTicket(int);
        break;
      }
    }
  }
}