const Command = require('../../structures/Command');
const { help_roles, help_categories } = require('../../../config.json').helper

module.exports = class CreateTicketMessageCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'createticketmsg',
      aliases: ['ctm'],
      cooldown: 1,
      description: "Cria a mensagem de ticket",
      userRole: [
        help_roles.suporte.key,
        help_roles.primeiro_imediato.key,
        help_roles.capitao.key,
      ],
      category: help_categories.moderacao.name,
    });
  }

  async run(ctx) {
    await this.client.ticketUtils.createTicketMessage();
    ctx.send("Mensagem de ticket criada com sucesso");
  }
};