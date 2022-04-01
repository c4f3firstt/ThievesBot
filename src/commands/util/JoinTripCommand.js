const Command = require('../../structures/Command');
const { help_roles, help_categories } = require('../../../config.json').helper

module.exports = class JoinTripCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'trip',
      cooldown: 3,
      usage: "tripX",
      description: "Entra em uma tripulação",
      userRole: [
        help_roles.marujo_alianca.key
      ],
      category: help_categories.util.name,
    });
  }

  async run(ctx, shipNumber) {
    if (!ctx.message.channel.name.includes("recrutamento")) return;

    if (!shipNumber) return ctx.message.react('❌').catch(() => null)

    const name = ctx.message.channel.name.trim().split("-").pop()

    const typeToSearch = name === 'pesca' ? 'showType' : 'megaNumber'

    const megaToEnter = await this.client.database.Megas.findOne({ [typeToSearch]: name, acceptingJoins: true });
    if (!megaToEnter) return ctx.message.react(this.client.config.emojis.react_no);

    const joined = await this.client.megaCache.joinTrip(megaToEnter._id, shipNumber, ctx.message.author.id)

    if (!joined) return ctx.message.react(this.client.config.emojis.react_no).catch(() => null)
    return ctx.message.react(this.client.config.emojis.react_yes).catch(() => null)
  }
};