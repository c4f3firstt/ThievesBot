const Command = require('../../structures/Command');
const { help_roles, help_categories } = require('../../../config.json').helper

module.exports = class SairTripCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'sair',
      cooldown: 3,
      description: "Sai de uma tripulação ou lista",
      userRole: [
        help_roles.marujo_alianca.key,
        help_roles.arena_tdm.key, 
        help_roles.arena_naval.key
      ],
      category: help_categories.util.name,
    });
  }

  async run(ctx) {

    if (!ctx.message.channel.name.includes("recrutamento")) return;

    const name = ctx.message.channel.name.trim().split("-").pop()

    if (name === 'tdm' || name === 'naval') {
      const megaIDToJoin = this.client.arenaCache.getKeyByValue(name, ctx.message.author.id)
      if (!megaIDToJoin) return ctx.message.react(this.client.config.emojis.react_no);
      const hasLeft = await this.client.arenaCache.leaveTrip(megaIDToJoin, ctx.message.author.id)
      if (!hasLeft) return ctx.message.react(this.client.config.emojis.react_no);
      ctx.message.react(this.client.config.emojis.react_left);
      return;
    }

    const typeToSearch = name === 'pesca' ? 'showType' : 'megaNumber'

    const megaIDToJoin = this.client.megaCache.getKeyByValue(typeToSearch, name, ctx.message.author.id)

    if (!megaIDToJoin) return ctx.message.react(this.client.config.emojis.react_no);

    const hasLeft = await this.client.megaCache.leaveTrip(megaIDToJoin, ctx.message.author.id)
    if (!hasLeft) return ctx.message.react(this.client.config.emojis.react_no);
    ctx.message.react(this.client.config.emojis.react_left);
  }
};