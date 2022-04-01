const Command = require('../../structures/Command');
const { help_roles, help_categories } = require('../../../config.json').helper

module.exports = class JoinTripCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'forceleave',
      aliases: ['retirada', 'removetrip'],
      cooldown: 3,
      usage: "user",
      description: "Forca um usuário a sair de uma trip",
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
    const user = ctx.args[0].replace(/\D+/g, '')

    const name = ctx.message.channel.name.trim().split("-").pop()

    if (name === 'tdm') {
      const megaIDToJoin = this.client.arenaCache.getKeyByValue('tdm', user)

      if (!megaIDToJoin) return ctx.send("Este usuário não está em nenhuma TDM!")

      const hasLeft = await this.client.arenaCache.leaveTrip(megaIDToJoin, user)

      if (!hasLeft) return ctx.send("Este usuário nao esta em nenhuma tdm")

      ctx.send('Usuário removido da TDM')
      return
    }

    if (name === 'naval') {
      const megaIDToJoin = this.client.arenaCache.getKeyByValue('naval', user)

      if (!megaIDToJoin) return ctx.send("Este usuário não está em nenhuma Arena!")

      const hasLeft = await this.client.arenaCache.leaveTrip(megaIDToJoin, user)

      if (!hasLeft) return ctx.send("Este usuário nao esta em nenhuma trip")

      ctx.send('Usuário removido da Arena')
      return
    }

    const typeToSearch = name === 'pesca' ? 'showType' : 'megaNumber'

    const megaIDToJoin = this.client.megaCache.getKeyByValue(typeToSearch, name, user)

    if (!megaIDToJoin) return ctx.send("Este usuário não está em nenhuma mega!")

    const hasLeft = await this.client.megaCache.leaveTrip(megaIDToJoin, user)

    if (!hasLeft) return ctx.send("Este usuário nao esta em nenhuma trip")

    ctx.send('Usuário removido da Mega')
  }
};