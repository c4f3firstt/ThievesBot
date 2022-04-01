const Command = require('../../structures/Command');
const { help_roles, help_categories } = require('../../../config.json').helper

module.exports = class DeleteMegaCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'deletemega',
      aliases: ['delmega'],
      cooldown: 3,
      usage: "",
      description: "Deleta uma Mega",
      userRole: [
        help_roles.oficial_alianca.key,
        help_roles.contramestre.key,
        help_roles.segundo_imediato.key,
        help_roles.capitao_alianca.key,
        help_roles.primeiro_imediato.key,
        help_roles.capitao.key
      ],
      category: help_categories.mega.name,
    });
  }

  async run(ctx) {

    const channel = ctx.message.mentions.channels.first() ?? ctx.message.channel;

    const name = channel.name.trim().split("-").pop()

    const typeToSearch = name === 'pesca' ? 'showType' : 'megaNumber'

    const megaToCall = await this.client.database.Megas.findOne({ [typeToSearch]: name, acceptingJoins: true });

    if (!megaToCall) return await ctx.send('Nenhuma mega acontecendo nessa categoria');

    await this.client.database.Megas.deleteOne({ _id: megaToCall._id })
    this.client.megaListener.stopCallToMega(megaToCall._id)
    this.client.megaListener.unregisterMega(megaToCall._id)

    ctx.send('Mega Deletada Com sucesso!')
  }
};