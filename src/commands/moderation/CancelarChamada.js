const Command = require('../../structures/Command');
const { help_roles, help_categories } = require('../../../config.json').helper

module.exports = class CancelChamadaCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'cancelchamada',
      cooldown: 3,
      description: "Cancela uma chamada",
      userRole: [
        help_roles.oficial_arena.key,
        help_roles.oficial_alianca.key,
        help_roles.contramestre.key,
        help_roles.segundo_imediato.key,
        help_roles.capitao_alianca.key,
        help_roles.primeiro_imediato.key,
        help_roles.capitao.key
      ],
      category: help_categories.moderacao.name,
    });
  }

  async run(ctx) {

    const name = ctx.message.channel.name.trim().split("-").pop()

    if (name === "tdm") {
      const megaToCall = await this.client.database.Arenas.findOne({ showType: 'tdm', acceptingJoins: true });

      if (!megaToCall) return await ctx.send('Nenhuma tdm acontecendo nessa categoria');

      ctx.message.delete()

      this.client.arenaListener.stopCallToMega(megaToCall._id)

      ctx.send("Chamada para TDM cancelada!")
      return
    }

    if (name === "naval") {
      const megaToCall = await this.client.database.Arenas.findOne({ showType: { $in: ['naval', 'semboard'] }, acceptingJoins: true });

      if (!megaToCall) return await ctx.send('Nenhuma arena acontecendo nessa categoria');

      ctx.message.delete()

      this.client.arenaListener.stopCallToMega(megaToCall._id)

      ctx.send("Chamada para Arena cancelada!")
      return
    }

    const typeToSearch = name === 'pesca' ? 'showType' : 'megaNumber'

    const megaToCall = await this.client.database.Megas.findOne({ [typeToSearch]: name, acceptingJoins: true });

    if (!megaToCall) return await ctx.send('Nenhuma mega acontecendo nessa categoria');

    ctx.message.delete()

    this.client.megaListener.stopCallToMega(megaToCall._id)

    ctx.send("Chamada para mega cancelada!")
  }
};