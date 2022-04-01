const Command = require('../../structures/Command');
const { help_roles, help_categories } = require('../../../config.json').helper

module.exports = class AddTripCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'addtrip',
      cooldown: 3,
      usage: "addtripX @user",
      description: "Adiciona umm membro à uma trip",
      userRole: [
        help_roles.contramestre.key,
        help_roles.segundo_imediato.key,
        help_roles.capitao_alianca.key,
        help_roles.primeiro_imediato.key,
        help_roles.capitao.key
      ],
      category: help_categories.moderacao.name,
    });
  }

  async run(ctx, shipNumber) {
    const channel = ctx.message.channel;

    const user = ctx.args[0] ? ctx.args[0].replace(/\D+/g, '') : null

    const name = channel.name.trim().split("-").pop()

    if (!user) return ctx.send('Nenhum usuário mencionado')

    if (name === 'tdm') {
      const megaToEnter = await this.client.database.Arenas.findOne({ showType: 'tdm', acceptingJoins: true });

      if (!megaToEnter) return await ctx.send('Nenhuma arena acontecendo nessa categoria');

      const joined = await this.client.arenaCache.joinTrip(megaToEnter._id, user)
      if (!joined) return ctx.message.react(this.client.config.emojis.react_no).catch(() => null)
      return ctx.message.react(this.client.config.emojis.react_yes).catch(() => null)
    }

    if (!shipNumber) return ctx.send('Você não disse o numero da trip')

    if (name === "naval") {
      const megaToEnter = await this.client.database.Arenas.findOne({ showType: { $in: ['naval', 'semboard'] }, acceptingJoins: true });

      if (!megaToEnter) return await ctx.send('Nenhuma arena acontecendo nessa categoria');

      const joined = await this.client.arenaCache.joinTrip(megaToEnter._id, user, shipNumber)
      if (!joined) return ctx.message.react(this.client.config.emojis.react_no).catch(() => null)
      return ctx.message.react(this.client.config.emojis.react_yes).catch(() => null)
    }


    const typeToSearch = name === 'pesca' ? 'showType' : 'megaNumber'

    const megaToEnter = await this.client.database.Megas.findOne({ [typeToSearch]: name, acceptingJoins: true });

    if (!megaToEnter) return await ctx.send('Nenhuma mega acontecendo nessa categoria');

    const joined = await this.client.megaCache.joinTrip(megaToEnter._id, shipNumber, user)
    if (!joined) return ctx.message.react(this.client.config.emojis.react_no).catch(() => null)
    return ctx.message.react(this.client.config.emojis.react_yes).catch(() => null)
  }
};