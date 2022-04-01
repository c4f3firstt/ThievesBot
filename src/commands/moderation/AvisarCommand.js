const Command = require('../../structures/Command');
const { help_categories, help_roles } = require('../../../config.json').helper

module.exports = class AvisarCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'globalwarn',
      aliases: ['avisar'],
      cooldown: 3,
      usage: "<user> [motvo]",
      description: "Avisa um usuário no servidor geral",
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

    if (!user) return ctx.send('Este usuário não está no servidor!');
    if (user.user.bot) return ctx.send('Não pode avisar os bots né aleki, tadinhos');
    if (user.id === ctx.message.author.id) return ctx.send('Nada de se avisar!')

    if (!ctx.message.guild.members.cache.get(user.id)) return ctx.send('Este usuário não está no servidor!');

    let reason = ctx.args.slice(1).join(' ');
    if (!reason) reason = 'Sem Razão Informada'

    await this.client.database.Avisos.create({
      userID: user.id,
      warnerID: ctx.message.author.id,
      reason,
      createdAt: Date.now(),
    })

    ctx.send(`${ctx.message.author} avisou ${user}\n**MOTIVO:** ${reason}`)

    await user.createDM().then(chat => {
      chat.send(`Olá ${user.user.username}, estou aqui para informar que você foi avisado no servidor ${ctx.message.guild.name}\n\n**Motivo:** \`${reason}\``).catch(() => null)
    }).catch(() => null)
  }
};