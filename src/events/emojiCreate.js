
module.exports = class EmojiCreate {
  constructor(client) {
    this.client = client;
  }

  async run(emoji) {
    this.client.modules.get('EventLog')?.createEmoji(emoji)
  }
}