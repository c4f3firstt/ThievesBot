const Command = require('../../structures/Command');
const { help_categories, help_roles } = require('../../../config.json').helper

module.exports = class CheckListCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'checklist',
      cooldown: 1,
      description: "Verifica se o usuario está em alguma lista",
      usage: "<user>",
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

    const user = ctx.args[0] ? ctx.args[0].replace(/\D+/g, '') : null
    if (!user) 
        return ctx.send('Nenhum usuário mencionado')

    let isInList = false;
    let message = `O usuário <@${user}> (${user}) está nas seguintes listas: \n\n`;
    
    let megaList = await this.client.megaCache.checkUserInList(user);
    if (megaList.length > 0) {
      isInList = true;
      message += `${createListMega(megaList)}`;
    }

    let arenaList = await this.client.arenaCache.checkUserInList(user);
    if (arenaList.length > 0) {
      isInList = true;
      message += `${createListArena(arenaList)}`;
    }

    if (isInList){
      ctx.message.channel.send(message);
    } else {
      ctx.message.channel.send(`O usuário <@${user}> (${user}) está em **NENHUMA** lista`);
    }
  }
};

function createListMega(megaList) {
  let str = ``;

  if (megaList.length > 0) {
    for (let mega of megaList) {
      str += `- **Mega ${mega.megaNumber}** do dia \`${mega.date}\` \n`;
    }
  }

  return str;
}

function createListArena(arenaList) {
  let str = ``;

  if (arenaList.length > 0) {
    for (let arena of arenaList) {
      str += `- **Arena ${arena.number}** do dia \`${arena.date}\` \n`;
    }
  }

  return str;
}