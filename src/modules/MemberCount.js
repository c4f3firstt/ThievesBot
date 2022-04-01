module.exports = class MemberCountModule {
  constructor(client) {
    this.client = client;
    this.currentCount = 0;
    this.start();
  }

  async start() {
    setInterval(async () => {
      const config = await this.client.database.Configs.findOne({ id: 'config' })
      const guild = await this.client.guilds.fetch(this.client.config.bot.comunityServerID).catch(() => null)
      const counterChannel = await this.client.channels.fetch(config.memberCountChannelID).catch(() => null)

      if (!counterChannel) {
        this.currentCount = guild.membersCount
        this.createChannel(config, guild)
        return;
      }

      if (guild.membersCount !== this.currentCount) {
        this.currentCount = guild.membersCount
        counterChannel.setName(`${this.client.config.messages.memberCountTextInChannelName}: ${guild.memberCount}`)
      }
    }, 1000 * 60 * 10)
  }

  async createChannel(config, guild) {
    const createdChannel = await guild.channels.create(`${this.client.config.messages.memberCountTextInChannelName}: ${guild.memberCount}`, {
      type: 'GUILD_VOICE'
    }).catch(e => console.log(e))
    config.memberCountChannelID = createdChannel.id
    await config.save()
  }
};