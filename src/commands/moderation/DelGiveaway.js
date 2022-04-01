const Command = require('../../structures/Command');
const { help_roles, help_categories } = require('../../../config.json').helper

module.exports = class DelGiveavayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'delete',
      aliases: ['deletesorteio', 'dessortear', 'delsorteio'],
      cooldown: 1,
      description: "Deleta um sorteio",
      usage: "<ID do Sorteio>",
      userRole: [
        help_roles.segundo_imediato.key,
        help_roles.capitao_alianca.key,
        help_roles.primeiro_imediato.key,
        help_roles.capitao.key,
      ],
      category: help_categories.moderacao.name,
    });
  }

  async run(ctx) {
    if (!ctx.args[0]) return ctx.send("Você não informou o id do sorteio para deletar")

    const giveAway = await this.client.database.Giveaways.findOneAndDelete({ giveawayID: ctx.args[0] })

    if(!giveAway) return ctx.send("Esse sorteio não existe")

    ctx.send("Sorteio deletado com sucesso")

    this.client.reactionChannels.splice(this.client.reactionChannels.findIndex((id) => id === giveAway.channelID), 1);
  }
};