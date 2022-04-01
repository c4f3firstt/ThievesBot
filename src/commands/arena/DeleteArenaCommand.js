const Command = require('../../structures/Command');
const { help_roles, help_categories } = require('../../../config.json').helper

module.exports = class DeleteMegaCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'deletearena',
      aliases: ['delarena'],
      cooldown: 3,
      usage: "",
      description: "Deleta uma Arena",
      userRole: [
        help_roles.oficial_arena.key,
        help_roles.contramestre.key,
        help_roles.segundo_imediato.key,
        help_roles.capitao_alianca.key,
        help_roles.primeiro_imediato.key,
        help_roles.capitao.key
      ],
      category: help_categories.arena.name,
    });
  }

  async run(ctx) {

    const channel = ctx.message.mentions.channels.first() ?? ctx.message.channel;

    const name = channel.name.trim().split("-").pop()

    if (name === 'tdm') {
      const megaToCall = await this.client.database.Arenas.findOne({ showType: name, acceptingJoins: true });

      if (!megaToCall) return await ctx.send('Nenhuma tdm acontecendo nessa categoria');

      await this.client.database.Arenas.deleteOne({ _id: megaToCall._id })
      this.client.arenaListener.stopCallToMega(megaToCall._id)
      this.client.arenaListener.unregisterMega(megaToCall._id)

      ctx.send('Arena Deletada Com sucesso!')
      return
    }

    const megaToCall = await this.client.database.Arenas.findOne({ showType: { $in: ['naval', 'semboard'] }, acceptingJoins: true });

    if (!megaToCall) return await ctx.send('Nenhuma arena acontecendo nessa categoria');

    await this.client.database.Arenas.deleteOne({ _id: megaToCall._id })
    this.client.arenaListener.stopCallToMega(megaToCall._id)
    this.client.arenaListener.unregisterMega(megaToCall._id)

    ctx.send('Arena Deletada Com sucesso!')
  }
};