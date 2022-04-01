
module.exports = class MessageUpdate {
  constructor(client) {
    this.client = client;
  }

  async run(oldMessage, newMessage) {
    if (oldMessage.partial) return;
    if (oldMessage.author.bot) return;

    this.client.modules.get('EventLog')?.editedMessage(oldMessage, newMessage)
  }
}