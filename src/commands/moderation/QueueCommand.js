const Command = require('../../structures/Command');
const { help_categories, help_roles } = require('../../../config.json').helper

module.exports = class QueueCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'queue',
      cooldown: 1,
      usage: "",
      description: "Começa ou Para a fila da sala de busca",
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
    this.client.runningQueue = !this.client.runningQueue;

    ctx.send(`A fila da sala de busca está ${this.client.runningQueue ? '**rodando**' : '**parada**'}`);
  }
};
