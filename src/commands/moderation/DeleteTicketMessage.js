const Command = require('../../structures/Command');
const { help_roles, help_categories } = require('../../../config.json').helper

module.exports = class DeleteTicketMessageCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'deleteticketmsg',
      aliases: ['dtm'],
      cooldown: 1,
      description: "Deleta a mensagem de ticket",
      usage: "",
      userRole: [
        help_roles.suporte.key,
        help_roles.primeiro_imediato.key,
        help_roles.capitao.key,
      ],
      category: help_categories.moderacao.name,
    });
  }

  async run(ctx) {
    const config = await this.client.database.Configs.findOne({ id: 'config' });

    if (!config.ticketChannelID || !config.ticketMessageID) return this.createTicketMessage()

    const ticketChannel = this.client.channels.cache.get(config.ticketChannelID);
    if (!ticketChannel) return ctx.send("O canal do ticket não existe!")

    const message = await ticketChannel.messages.fetch(config.ticketMessageID).catch(() => null);
    if (!message) return ctx.send("A mensagem do ticket já não existe!")
    message.delete();
    ctx.send("Mensagem deletada com sucesso!")
  }
};