
module.exports = class MessageReactionAdd {
  constructor(client) {
    this.client = client;
  }

  async run(reaction, user) {
    const { message } = reaction;
    const channelsToLookUp = [...this.client.config.channels.reaction, ...this.client.reactionChannels];
    if (!channelsToLookUp.includes(message.channel.id)) return;

    const Handler = async () => {
      if (reaction.emoji.id === this.client.config.emojis.verify) {
        const member = await this.client.guilds.cache.get(this.client.config.bot.comunityServerID).members.fetch(user.id)
        member.roles.add(this.client.config.roles.verify)
        reaction.users.remove(user.id)
        user.send(this.client.config.messages.welcomeMessageToSendToUserDM).catch(() => null);
      }

      if (reaction.emoji.name === "🎉") {
        if (!message.embeds[0]?.footer?.text) return

        const [_, gid] = message.embeds[0].footer.text.split("|")

        if (!gid || gid.replace(/\D+/g, '') === "") return

        const GiveAway = await this.client.database.Giveaways.findOne({
          giveawayID: gid.replace(/\D+/g, ''),
          hasEnded: false
        })
        if (!GiveAway) return;
        if (GiveAway.members.includes(user.id)) return
        await this.client.database.Giveaways.updateOne({
          giveawayID: gid.replace(/\D+/g, ''),
          hasEnded: false
        }, { $push: { members: user.id } })
      }
    };

    if (message.partial) {
      await reaction.fetch().catch(() => null)
      await message.fetch().catch(() => null)
      Handler();
    } else {
      Handler();
    }
  }
}