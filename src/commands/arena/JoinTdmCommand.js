const Command = require('../../structures/Command');
const { help_roles, help_categories } = require('../../../config.json').helper

module.exports = class JoinTripCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'tdm',
      cooldown: 3,
      usage: "trip",
      description: "Entra numa trip",
      userRole: [
        help_roles.arena_tdm.key
      ],
      category: help_categories.arena.name
    });
  }

  async run(ctx) {
    const megaToEnter = await this.client.database.Arenas.findOne({ showType: 'tdm', acceptingJoins: true });
    if (!megaToEnter) return ctx.message.react(this.client.config.emojis.react_no);

    const joined = await this.client.arenaCache.joinTrip(megaToEnter._id, ctx.message.author.id)

    if (!joined) return ctx.message.react(this.client.config.emojis.react_no).catch(() => null)
    return ctx.message.react(this.client.config.emojis.react_yes).catch(() => null)
  }
};