const Command = require('../../structures/Command');
const { help_roles, help_categories } = require('../../../config.json').helper

const moment = require('moment-timezone')
moment.locale('pt-br');

module.exports = class CreateTicketCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'createticket',
      aliases: ['ct', 'ticket', 'criarticket'],
      cooldown: 1,
      description: "Cria um ticket com o usuário mencionado",
      usage: "<menção|ID do usuário>",
      userRole: [
        help_roles.suporte.key,
        help_roles.primeiro_imediato.key,
        help_roles.capitao.key,
      ],
      category: help_categories.moderacao.name,
    });
  }

  async run(ctx) {
    if (!ctx.args[0]) return ctx.send("Você não mencionou o usuário para chamar ao ticket. Pode ser id ou menção")

    const user = await ctx.message.guild.members.fetch(ctx.args[0].replace(/\D+/g, '')).catch(() => null)

    if (!user) return ctx.send("Este usuário não está no serviodor")

    if(user.id === ctx.message.author.id) return ctx.send("Você não pode criar um ticket consigo mesmo")

    const channel = await this.client.ticketUtils.createTicket(user.id, ctx.message.author.id)

    ctx.send(`Ticket criado! ${channel}`)
  }
};