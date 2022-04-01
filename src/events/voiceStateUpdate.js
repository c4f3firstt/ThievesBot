module.exports = class voiceStateUpdate {
  constructor(client) {
    this.client = client;
    this.categoriesToLookUp = [this.client.config.channels.chalupa_category, this.client.config.channels.bergantim_category, this.client.config.channels.galeão_category]
  }

  async run(oldState, newState) {
    if (oldState.member.user.bot) return;

    const autoChannel = this.client.modules.get('AutoChannel');
    if (autoChannel) autoChannel.run(oldState, newState)

    const callQueue = this.client.modules.get('QueueChannel')
    if (callQueue) callQueue.run(oldState, newState)

    const eventLog = this.client.modules.get('EventLog');
    if (!eventLog) return;

    if (!oldState.channelId && newState.channelId) return eventLog.joinChannel(newState)

    if (oldState.channelId && !newState.channelId) return eventLog.leftChannel(oldState)

    if (oldState.channelId && newState.channelId) return eventLog.changeChannel(oldState, newState)
  }
}