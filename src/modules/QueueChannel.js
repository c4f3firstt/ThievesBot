const { MessageEmbed } = require("discord.js");

module.exports = class CallQueueModule {
  constructor(client) {
    this.client = client;
    this.queue = [];
    this.loop()
  }

  async loop() {
    setInterval(() => {
      if (this.client.runningQueue) this.sendMessage()
    }, 1000 * 10)
  }

  async sendMessage() {
    const clientConfigAtDatabase = await this.client.database.Configs.findOne({ id: 'config' });
    const messageChannel = await this.client.channels.cache.get(clientConfigAtDatabase.queueChannelID).messages.fetch(clientConfigAtDatabase.queueMessageID).catch(() => null)

    const textToSend = `**Fila do <#825396005507825684>**\n\n${this.queue.map((id, index) => `${index + 1}° - <@${id}>`).join("\n")}`

    const embed = new MessageEmbed()
      .setColor('#40E0D0')
      .setDescription(textToSend)
      .setTimestamp()

    if (messageChannel && messageChannel.editable) return messageChannel.edit({ embeds: [embed] })
    const messageSent = await this.client.channels.cache.get(clientConfigAtDatabase.queueChannelID).send({ embeds: [embed] })
    clientConfigAtDatabase.queueMessageID = messageSent.id
    await clientConfigAtDatabase.save()
  }

  addUser(userID) {
    if (!this.queue.includes(userID)) this.queue.push(userID)
  }

  removeUser(userID) {
    const index = this.queue.indexOf(userID)
    if (index > -1) this.queue.splice(index, 1)
  }

  async run(oldState, newState) {

    const queueChannelID = this.client.config.channels.queue[0]

    if (!oldState.channelId && newState.channelId) {
      if (newState.channelId !== queueChannelID) return;
      return this.addUser(newState.id)
    }

    if (oldState.channelId && !newState.channelId) {
      if (oldState.channelId !== queueChannelID) return;
      return this.removeUser(newState.id)
    }

    if (oldState.channelId && newState.channelId) {
      if (oldState.channelId === queueChannelID && newState.channelId !== queueChannelID) return this.removeUser(newState.id)
      if (oldState.channelId !== queueChannelID && newState.channelId === queueChannelID) return this.addUser(newState.id)
    }
  }

};