const Command = require('../../structures/Command');
const naval = require('../../utils/NavalPerButton')
const { help_roles, help_categories } = require('../../../config.json').helper

module.exports = class NavalButtonCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'navalbutton',
      aliases: ['navalbtn'],
      cooldown: 3,
      usage: "<create/delete>",
      description: "Cria ou deleta o botão de cargo do NAVAL",
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
      return await executeNavalAction(ctx);
    }
    
    return;
  }
}

async function executeNavalAction(ctx) {
    let commandExec = ctx.args[0].toLowerCase();
    if (commandExec == 'create') {
      const NAVAL = new naval(ctx.client)
      return await NAVAL.createNAVALButton(ctx);
    } else if (commandExec == 'delete') { 
      const NAVAL = new naval(ctx.client)
      return await NAVAL.deleteNAVALButton(ctx);
    } else {
        return ctx.message.reply(`Opção inválida!`);
    }
}