const Command = require('../../structures/Command');
const { help_categories, help_roles } = require('../../../config.json').helper

module.exports = class RerollCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'reroll',
      cooldown: 1,
      usage: "<ID do sorteio>",
      description: "Sorteia novos vencedores para um sorteio",
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

    const giveAway = await this.client.database.Giveaways.findOne({ giveawayID: ctx.args[0] })

    if (!giveAway) return ctx.send("Esse sorteio não existe")
    if (!giveAway.hasEnded) return ctx.send("Este sorteio ainda não acabou!")

    const winners = [];
    if ((giveAway.maxWinners + giveAway.winners.length) < giveAway.members) {
      for (let i = 0; i < giveAway.maxWinners; i++) {
        const sorted = giveAway.members[Math.floor(Math.random() * giveAway.members.length)]
        if ((giveAway.maxWinners + giveAway.winners.length) < giveAway.members || winners.includes(sorted) || giveAway.winners.includes(sorted)) {
          if ((giveAway.maxWinners + giveAway.winners.length) <= giveAway.members.length) i--;
          continue;
        }
        winners.push(sorted)
      }
    }

    const promisses = winners.map(async usr => {
      const member = await this.client.guilds.cache.get(this.client.config.bot.comunityServerID).members.fetch(usr)
      return {
        member,
        id: usr
      }
    })

    const winnersAtMembers = await Promise.all(promisses);

    ctx.send(`**🏆 | Novos Vencedores:**\n${winnersAtMembers.map((a, i) => `${i + 1}° - ${a.member ?? '`Usuário Não Encontrado`'} (${a.id})`).join("\n")}`)

    await this.client.database.Giveaways.updateOne({ _id: giveAway._id }, { winners })
  }
};