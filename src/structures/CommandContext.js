module.exports = class CommandContext {
  constructor(client, message, args) {
    this.client = client;
    this.message = message;
    this.args = args;
  }

  async reply(emoji, text) {
    return this.message.channel.send(`${this.client.constants.emojis[emoji] || '🐛'} **|** ${this.message.author}, ${text}`);
  }

  async send(message) {
    if (typeof message === "string") {
      return this.message.channel.send({ content: message, reply: { messageReference: this.message, failIfNotExists: false } })
    }
    return this.message.channel.send(message);
  }

  async sendC(content, config) {
    return this.message.channel.send(content, config);
  }
};