
module.exports = class ChannelCreate {
  constructor(client) {
    this.client = client;
  }

  async run(channel) {
    this.client.modules.get('EventLog')?.createChannel(channel)
  }
}