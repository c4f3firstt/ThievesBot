
module.exports = class MessageDelete {
  constructor(client) {
    this.client = client;
  }

  async run(message) {
    if (message.partial) return;
    if (message.author.bot) return;

    this.client.modules.get('EventLog')?.deletedMessage(message)
  }
}