module.exports = class AutoChannelModule {
  constructor(client) {
    this.client = client;
    this.categoriesToLookUp = [this.client.config.channels.chalupa_category, this.client.config.channels.bergantim_category, this.client.config.channels.galeão_category]
  }

  captalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getVoiceChannels(guild, category) {
    if (!category) return guild.channels.cache.filter((ch) => ch.type === "GUILD_VOICE" && this.categoriesToLookUp.includes(ch.parent.id))
    return guild.channels.cache.filter((ch) => ch.type === "GUILD_VOICE" && ch?.parent?.name?.toLowerCase()?.includes(category))
  }

  async run(oldState, newState) {
    const { guild } = oldState
    const joined = !!newState.channelId

    const channelId = joined ? newState.channelId : oldState.channelId
    const channel = guild.channels.cache.get(channelId)

    if (this.categoriesToLookUp.includes(channel.parentId)) {
      const acceptedCategoryNames = ['chalupa', 'bergantim', 'galeão'];
      const categoryName = acceptedCategoryNames.find((n) => channel.parent.name.toLowerCase().includes(n))
      if (!categoryName) return;

      if (joined) {
        const channels = this.getVoiceChannels(guild, categoryName)
        let hasEmpty = false;

        channels.forEach(ch => {
          if (!hasEmpty && ch.members.size === 0) hasEmpty = true
        })

        if (!hasEmpty) {
          const { type, userLimit, bitrate, parentId, permissionOverwrites, rawPosition } = channel

          guild.channels.create(`${this.captalize(categoryName)} #${channels.size + 1}`, {
            type,
            bitrate,
            userLimit,
            permissionOverwrites: permissionOverwrites.cache,
            parent: parentId,
            position: rawPosition
          })
        }
      } else if (channel.members.size === 0 && this.getVoiceChannels(guild, categoryName).size > 1) channel.delete()
    }
  }
}