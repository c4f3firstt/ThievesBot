const Command = require('../../structures/Command');
const { help_categories, help_roles } = require('../../../config.json').helper

module.exports = class HelpCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ping',
      cooldown: 1,
      description: "Mostra o ping do bot",
      userRole: [
        help_roles.ajudante_bordo.key,
        help_roles.contramestre.key,
        help_roles.segundo_imediato.key,
        help_roles.capitao_alianca.key,
        help_roles.primeiro_imediato.key,
        help_roles.capitao.key
      ],
      category: help_categories.util.name,
    });
  }

  async run(ctx) {
    ctx.message.reply("Aguarde enquanto busco os resultados... ").then(async (msg) => {
      let message = `O ping para atualizar a mensagem foi de: \`${msg.createdTimestamp - Date.now()}ms\`\nO Ping do gateway é \`${this.client.ws.ping}ms\` `;
      msg.edit(message)
    });
  }
};
