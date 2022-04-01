const { MessageAttachment } = require('discord.js')

const { goodPirate } = require('../../config.json').emojis

module.exports = class guildMemberAddEvent {
  constructor(client) {
    this.client = client;
  }

  async run(member) {
    
    const imageBuffer = await this.client.canvas.CreateWelcomeImage(member.user.username);
    const atc = new MessageAttachment(imageBuffer, 'bemvindo.png')

    await member.createDM().then(async dm => {
      await dm.send({ files: [atc], content: `<@${member.id}>, estou feliz que você tenha chegado. ${goodPirate}` }).catch(() => null)
      await dm.send(this.client.config.messages.first_welcome_message).catch(() => null)
    }).catch(() => null)

  }
};