
module.exports = class ChannelDelete {
  constructor(client) {
    this.client = client;
  }

  async run(channel) {
    this.client.modules.get('EventLog')?.deleteChannel(channel)
  }
}