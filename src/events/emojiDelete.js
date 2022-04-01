
module.exports = class EmojiDelete {
  constructor(client) {
    this.client = client;
  }

  async run(emoji) {
    this.client.modules.get('EventLog')?.deleteEmoji(emoji)
  }
}