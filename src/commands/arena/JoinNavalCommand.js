const Command = require('../../structures/Command');
const { help_roles, help_categories } = require('../../../config.json').helper

module.exports = class JoinTripCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'naval',
      cooldown: 3,
      usage: "tripX",
      description: "Entra em uma tripulação",
      userRole: [
        help_roles.arena_naval.key
      ],
      category: help_categories.arena.name
    });
  }

  async run(ctx, shipNumber) {
    const megaToEnter = await this.client.database.Arenas.findOne({ showType: { $in: ['naval', 'semboard'] }, acceptingJoins: true });
    if (!megaToEnter) return ctx.message.react(this.client.config.emojis.react_no);

    const joined = await this.client.arenaCache.joinTrip(megaToEnter._id, ctx.message.author.id, shipNumber)

    if (!joined) return ctx.message.react(this.client.config.emojis.react_no).catch(() => null)
    return ctx.message.react(this.client.config.emojis.react_yes).catch(() => null)
  }
};