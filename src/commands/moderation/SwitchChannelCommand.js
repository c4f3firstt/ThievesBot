const Command = require('../../structures/Command');
const { help_categories, help_roles } = require('../../../config.json').helper

module.exports = class SwitchChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'switchchannel',
      aliases: ['stc', 'stchannel'],
      cooldown: 3,
      usage: "<user> [motvo]",
      description: "Liga/Desliga os comandos do bot em um certo canal",
      userRole: [
        help_roles.contramestre.key,
        help_roles.segundo_imediato.key,
        help_roles.capitao_alianca.key,
        help_roles.primeiro_imediato.key,
        help_roles.capitao.key,
      ],
      category: help_categories.moderacao.name,
    });
  }

  async run(ctx) {
    const channel = ctx.message.mentions.channels.first()
    if (!channel) return ctx.send('Você não mencionou nenhum canal');

    const config = await this.client.database.Configs.findOne({ id: 'config' })

    if (config.ignoreChannels.includes(channel.id)) {
      const index = config.ignoreChannels.indexOf(channel.id)
      config.ignoreChannels.splice(index, 1);
      config.save()
      ctx.send(`O canal ${channel.toString()} teve seus comandos ativados!`)
      return
    } 

    config.ignoreChannels.push(channel.id)
    config.save()
    ctx.send(`O canal ${channel.toString()} teve seus comandos desativados`)
  }
};