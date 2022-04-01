const Command = require('../../structures/Command');
const { help_categories, help_roles } = require('../../../config.json').helper

module.exports = class ClearCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'clear',
      cooldown: 1,
      description: "Limpa as mensagens de um canal",
      usage: "<Numero de Mensagens entre 2 e 100>",
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
    if (!ctx.args[0]) return ctx.send("Você não informou a quantidade de mensagens para deletar")

    if(isNaN(parseInt(ctx.args[0]))) return ctx.send("Este numero é invalido. Deve ser entre 2 e 100") 
    if (parseInt(ctx.args[0]) < 2 || parseInt(ctx.args[0]) > 100) return ctx.send("Este numero é invalido. Deve ser entre 2 e 100")

    ctx.message.channel.bulkDelete(parseInt(ctx.args[0]), true).then((msg) => {
      ctx.send(`${ctx.message.author} deletou com sucesso **${msg.size}** mensagens`)
    })
  }
};