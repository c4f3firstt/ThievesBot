const { MessageButton } = require('discord.js')
module.exports = class NavalPerButton {
  constructor(client) {
    this.client = client;
  }
  async checkReactionMessage() {
    const config = await this.getConfig()

    if (!config.navalChannelID || !config.navalMessageID) return this.createReactionMessage()

    try {
      const hasChannel = await this.client.guilds.cache.get(this.client.config.bot.comunityServerID).channels.fetch(config.navalChannelID).catch(() => null)

      if (!hasChannel) return this.createReactionMessage()

      const hasMessage = await hasChannel.messages.fetch(config.navalMessageID)

      if (!hasMessage) return this.createReactionMessage()
    } catch {
      return this.createReactionMessage()
    }
  }

  async createReactionMessage() {
    const guild = await this.client.guilds.fetch(this.client.config.bot.comunityServerID)
    const channel = await guild.channels.fetch(this.client.config.channels.arena_naval);

    const btn = new MessageButton()
      .setCustomId('{"id": "NAVAL", "type": "GET"}')
      .setEmoji('☠️')
      .setStyle('PRIMARY')
      .setLabel('Receber Cargo')

    const btn2 = new MessageButton()
      .setCustomId('{"id": "NAVAL", "type": "REMOVE"}')
      .setEmoji('🏳️')
      .setStyle('DANGER')
      .setLabel('Remover Cargo')

    const msg = await channel.send({ content: 'Quer ser avisado sobre as partidas de Naval?\nPegue seu cargo no botão abaixo.', components: [{ type: 1, components: [btn, btn2] }] })

    await this.client.database.Configs.updateOne({ id: 'config' }, { navalChannelID: msg.channel.id, navalMessageID: msg.id })
  }

  async createNAVALButton(ctx) {
    
    const config = await this.getConfig()

    try {
      const hasChannel = await this.client.guilds.cache.get(this.client.config.bot.comunityServerID).channels.fetch(config.navalChannelID).catch(() => null)
      if (!hasChannel) {
        await this.createReactionMessage()
        return ctx.message.reply(`Botão de NAVAL criado!`);
      }

      const hasMessage = await hasChannel.messages.fetch(config.navalMessageID)
      if (!hasMessage) {
        await this.createReactionMessage()
        return ctx.message.reply(`Botão de NAVAL criado!`);
      }
      else
        return ctx.message.reply(`Botão de NAVAL já cadastrado no canal`);
      
    } catch (e) {
      await  this.createReactionMessage()
      return ctx.message.reply(`Botão de NAVAL criado!`);
    }
  }

  async deleteNAVALButton(ctx) {
    const config = await this.getConfig()

    try {
      const hasChannel = await this.client.guilds.cache.get(this.client.config.bot.comunityServerID).channels.fetch(config.navalChannelID).catch(() => null)
      if (hasChannel) {
        const hasMessage = await hasChannel.messages.fetch(config.navalMessageID)
        if (hasMessage) {
          hasMessage.delete()
          await this.client.database.Configs.updateOne({ id: 'config' }, { navalChannelID: hasChannel.id, navalMessageID: '' })
          return ctx.message.reply('Botão excluído!');
        }        
      }

      return ctx.message.reply('Botão não existe ou foi excluído anteriormente!');
      
    } catch (e) {
      return ctx.message.reply('Botão não existe ou foi excluído anteriormente!');
    }
  }

  async getConfig() {
    return await this.client.database.Configs.findOne({ id: 'config' });
  }
}