const { MessageEmbed } = require('discord.js')
const moment = require('moment')

module.exports = class TimeListener {
  constructor(client) {
    this.client = client;
  }
  start() {
    setInterval(async () => {
      const warns = await this.client.database.Warns.find({ expireAt: { $lte: Date.now() } })
      const punishments = await this.client.database.Punishments.find({ expireAt: { $lte: Date.now() } })
      const giveaways = await this.client.database.Giveaways.find({})

      warns.forEach(a => this.endedWarn(a))
      punishments.forEach(a => this.endedPunishment(a))
      giveaways.forEach(a => this.checkGiveaway(a))
    }, 1000 * 60)
  }

  async endedPunishment(punishment) {
    const user = await this.client.guilds.cache.get(this.client.config.bot.comunityServerID).members.fetch(punishment.userID).catch(() => null)
    if (user) {
      if (punishment.isMute) {
        if (punishment.removedRoles?.length > 0) {
          user.roles.remove(punishment.removedRoles[0])
        } else
          user.voice.setMute(false)
      } else
        punishment.removedRole.forEach(a => {
          user.roles.add(a);
        })
    }
    await this.client.database.Punishments.deleteOne({ _id: punishment._id })
  }

  async endedWarn(warn) {
    return this.client.database.Warns.deleteOne({ _id: warn._id })
  }

  async checkGiveaway(giveaway) {
    const giveawayChannel = await this.client.channels.fetch(giveaway.channelID).catch(() => null)
    const giveawayMessage = await giveawayChannel?.messages?.fetch(giveaway.giveawayID).catch(() => null)

    if (!giveawayChannel || !giveawayMessage) return this.client.database.Giveaways.deleteOne({ _id: giveaway._id })
    if (giveaway.hasEnded) return;

    const oldDescription = giveawayMessage.embeds[0].description

    const embed = new MessageEmbed(giveawayMessage.embeds[0])
      .setDescription(`Reaja com 🎉 para participar!\nAcaba ${moment(parseInt(giveaway.endsAt)).fromNow()}`)

    if (embed.description == oldDescription) return;

    if (giveaway.endsAt <= (Date.now() + 30000)) {
      const winners = [];
      for (let i = 0; i < giveaway.maxWinners; i++) {
        const sorted = giveaway.members[Math.floor(Math.random() * giveaway.members.length)]
        if (winners.includes(sorted)) {
          if (giveaway.maxWinners <= giveaway.members.length) i--;
          continue;
        }
        winners.push(sorted)
      }

      const promisses = winners.map(async usr => {
        const member = await this.client.guilds.cache.get(this.client.config.bot.comunityServerID).members.fetch(usr).catch(() => null)
        return {
          member,
          id: usr
        }
      })

      const winnersAtMembers = await Promise.all(promisses);

      embed.setDescription(`**Vencedores:**\n${winnersAtMembers.map((a, i) => `${i + 1}° - ${a.member ?? '`Usuário Não Encontrado`'} (${a.id})`).join("\n")}`)

      giveawayMessage.edit({ content: '🏆 Sorteio Finalizado 🏆', embeds: [embed] })
      giveawayChannel.send({
        content: `Parabéns aos vencedores: \n${winnersAtMembers.map((a) => `${a.member ?? 'Membro não encontrado'}`)}`
      })
      await this.client.database.Giveaways.updateOne({ giveawayID: giveaway.giveawayID }, { hasEnded: true, winners })
      this.client.reactionChannels.splice(this.client.reactionChannels.findIndex((id) => id === giveaway.channelID), 1);
      return;
    }

    giveawayMessage.edit({ content: giveawayMessage.content, embeds: [embed] })
  }
};