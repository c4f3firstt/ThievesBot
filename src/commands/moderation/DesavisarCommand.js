const Command = require('../../structures/Command');
const { help_roles, help_categories } = require('../../../config.json').helper

module.exports = class DesavisarCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'globalunwarn',
      aliases: ['desavisar'],
      cooldown: 3,
      usage: "<user>",
      description: "Retira um aviso de um usuário",
      userRole: [
        help_roles.segundo_imediato.key,
        help_roles.capitao_alianca.key,
        help_roles.primeiro_imediato.key,
        help_roles.capitao.key
      ],
      category: help_categories.moderacao.name,
    });
  }

  async run(ctx) {
    if (!ctx.args[0]) return ctx.send('Você não mencionou nenhum usuário');

    let user;
    try {
      user = await ctx.message.guild.members.fetch(ctx.args[0].replace(/[<@!>]/g, ''));
    } catch {
      if (!ctx.args[0]) return ctx.send('Você não mencionou nenhum usuário');
    }

    if (!user) return ctx.send('Este usuário não está neste servidor');
    if (user.user.bot) return ctx.send('Não pode avisar os bots né aleki, tadinhos');
    if (user.id === ctx.message.author.id) return ctx.send('Nada de se avisar!')

    const userWarns = await this.client.database.Avisos.countDocuments({ userID: user.id })

    if (userWarns < 1) return ctx.send("Este usuário não possui avisos")

    await this.client.database.Avisos.deleteOne({ userID: user.id })

    ctx.send(`${ctx.message.author} removeu um aviso de ${user}`)
  }
};