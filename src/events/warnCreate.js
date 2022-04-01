const { warnings } = require('../../config.json')

const _1dayInMilis = 86400000;

module.exports = class WarnCreate {
  constructor(client) {
    this.client = client;
  }

  async removeRole(userID, warns) {
    const member = await this.client.guilds.cache.get(this.client.config.bot.comunityServerID).members.fetch(userID).catch(() => null)

    this.client.channels.cache.get(this.client.config.channels.penalidades)
      .send(`O usuário <@${userID}> (${userID}) recebeu uma punição! Foi sua **#${warns}** punição.`)

    this.client.megaCache.removeFromAll(userID);
    this.client.config.roles.punishment.forEach(role => {
      member.roles.remove(role)
    })
  }

  async run(warn) {
    this.client.modules.get('EventLog')?.createWarn(warn)

    const userWarn = await this.client.database.Warns.find({ userID: warn.userID }, null, { sort: { warnNumber: -1 } }).limit(1)
    await this.client.ticketUtils.createTicket(warn.userID, warn.warnerID)
    
    if (warnings[userWarn[0].warnNumber].have_punish) {
      await this.client.database.Punishments.create({
        userID: warn.userID,
        createdAt: Date.now(),
        expireAt: Date.now() + (warnings[userWarn[0].warnNumber].days_punish * _1dayInMilis),
        removedRole: this.client.config.roles.punishment
      }).then(() => this.removeRole(warn.userID, userWarn[0].warnNumber))
    }

  }
}