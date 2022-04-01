const Command = require('../../structures/Command');
const tdm = require('../../utils/TdmPerButton')
const { help_categories, help_roles } = require('../../../config.json').helper

module.exports = class TdmButtonCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'tdmbutton',
      aliases: ['tdmbtn'],
      cooldown: 3,
      usage: "<create/delete>",
      description: "Cria ou deleta o botão de cargo do TDM",
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
    if (ctx.args[0]) {
      return await executeTDMAction(ctx);
    }
    
    return;
  }
}

async function executeTDMAction(ctx) {
    let commandExec = ctx.args[0].toLowerCase();
    if (commandExec == 'create') {
      const TDM = new tdm(ctx.client)
      return await TDM.createTDMButton(ctx);
    } else if (commandExec == 'delete') { 
      const TDM = new tdm(ctx.client)
      return await TDM.deleteTDMButton(ctx);
    } else {
        return ctx.message.reply(`Opção inválida!`);
    }
}