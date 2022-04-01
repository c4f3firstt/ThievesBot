const Command = require('../../structures/Command');
const { help_categories, help_roles } = require('../../../config.json').helper
const { warnings } = require('../../../config.json')

const _1dayInMilis = 86400000;

module.exports = class WarnCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'warn',
      cooldown: 3,
      usage: "<user> [motvo]",
      description: "Avisa um usuário da mega",
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

    const userWarn = await this.client.database.Warns.find({ userID: user.id }, null, { sort: { warnNumber: -1 } }).limit(1)

    let createdWarn, expireDate;

    if (userWarn.length > 0) {

        let currentWarn = userWarn[0].warnNumber + 1;

        if (warnings[currentWarn] === undefined) {
          return ctx.send(`Limite de warns alcançado!! \n\n`+
          `https://tenor.com/view/n%C3%A3o-consigo-cansei-n%C3%A3o-consigo-n%C3%A3o-da-n%C3%A3o-posso-cansei-gif-13916072`);
        }

        expireDate = userWarn[0].expireAt - userWarn[0].createdAt > 0 ? userWarn[0].expireAt - userWarn[0].createdAt : 0
        
        createdWarn = await this.client.database.Warns.create({
          userID: user.id,
          warnerID: ctx.message.author.id,
          reason,
          createdAt: Date.now(),
          expireAt: Date.now() + (warnings[currentWarn].expire_days * _1dayInMilis) + expireDate,
          warnNumber: currentWarn
        })

    } else {

      // Cria primeiro warning
      createdWarn = await this.client.database.Warns.create({
        userID: user.id,
        warnerID: ctx.message.author.id,
        reason,
        createdAt: Date.now(),
        expireAt: Date.now() + (warnings["1"].expire_days * _1dayInMilis),
        warnNumber: 1
      })
    }

    ctx.send(`${ctx.message.author} avisou ${user} (#${createdWarn.warnNumber})\n**MOTIVO:** ${reason}`)

    this.client.emit('warnCreate', createdWarn);

    await user.createDM().then(chat => {
      chat.send(`Olá ${user.user.username}, estou aqui para informar que você foi avisado no servidor ${ctx.message.guild.name}\n\n**Motivo:** \`${reason}\``).catch(() => null)
    }).catch(() => null)
  }
};