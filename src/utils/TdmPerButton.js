const { MessageButton } = require('discord.js')
module.exports = class TdmPerButton {
  constructor(client) {
    this.client = client;
  }

  async checkReactonMessage() {
    let btnExiste = await this.tdmButtonExist();
    if (!btnExiste) 
      return this.createReactionMessage()

    const config = await this.getConfig()

    try {
      const hasChannel = await this.client.guilds.cache.get(this.client.config.bot.comunityServerID).channels.fetch(config.reactionChannelID)

      if (!hasChannel) 
        return this.createReactionMessage()

      const hasMessage = await hasChannel.messages.fetch(config.reactionMessageID)

      if (!hasMessage) 
        return this.createReactionMessage()
      
    } catch {
      return this.createReactionMessage()
    }
  }

  async createReactionMessage() {
    const guild = await this.client.guilds.fetch(this.client.config.bot.comunityServerID)
    const channel = await guild.channels.fetch(this.client.config.channels.arena_tdm);

    const btn = new MessageButton()
      .setCustomId('{"id": "REACTION", "type": "GET"}')
      .setEmoji('☠️')
      .setStyle('PRIMARY')
      .setLabel('Receber Cargo')

    const btn2 = new MessageButton()
      .setCustomId('{"id": "REACTION", "type": "REMOVE"}')
      .setEmoji('🏳️')
      .setStyle('DANGER')
      .setLabel('Remover Cargo')

    const msg = await channel.send({ content: 'Quer ser avisado sobre as partidas de TDM?\nPegue seu cargo no botão abaixo.', components: [{ type: 1, components: [btn, btn2] }] })

    await this.client.database.Configs.updateOne({ id: 'config' }, { reactionChannelID: msg.channel.id, reactionMessageID: msg.id })
  }

  async createTDMButton(ctx) {
    
    const config = await this.getConfig()

    try {
      const hasChannel = await this.client.guilds.cache.get(this.client.config.bot.comunityServerID).channels.fetch(config.reactionChannelID)
      if (!hasChannel) {
        await this.createReactionMessage()
        return ctx.message.reply(`Botão de TDM criado!`);
      }

      const hasMessage = await hasChannel.messages.fetch(config.reactionMessageID)
      if (!hasMessage) {
        await this.createReactionMessage()
        return ctx.message.reply(`Botão de TDM criado!`);
      }
      else
        return ctx.message.reply(`Botão de TDM já cadastrado no canal`);
      
    } catch (e) {
      await  this.createReactionMessage()
      return ctx.message.reply(`Botão de TDM criado!`);
    }
  }

  async deleteTDMButton(ctx) {
    const config = await this.getConfig()

    try {
      const hasChannel = await this.client.guilds.cache.get(this.client.config.bot.comunityServerID).channels.fetch(config.reactionChannelID)      
      if (hasChannel) {
        const hasMessage = await hasChannel.messages.fetch(config.reactionMessageID)
        if (hasMessage) {
          hasMessage.delete()
          await this.client.database.Configs.updateOne({ id: 'config' }, { reactionChannelID: hasChannel.id, reactionMessageID: '' })
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

  async tdmButtonExist() {

    const config = await this.getConfig()

    if (!config.reactionChannelID || !config.reactionMessageID) 
      return false;
    else
      return true;
  }

}