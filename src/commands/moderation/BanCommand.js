const Command = require('../../structures/Command');
const { help_categories, help_roles } = require('../../../config.json').helper
const { MessageEmbed } = require('discord.js')

module.exports = class BanCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ban',
      cooldown: 1,
      description: "Bane um usuário",
      usage: "<menção|ID do usuário> [motivo]",
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
    if (!ctx.args[0]) return ctx.send("Você não mencionou o usuário para banir")

    const user = await ctx.message.guild.members.fetch(ctx.args[0].replace(/\D+/g, '')).catch(() => null)

    if (!user) return ctx.send("Este usuário não está no serviodor")

    if (user.id === ctx.message.author.id) return ctx.send("Você não pode banir a si mesmo")

    if (!user.bannable) return ctx.send("Eu não tenho permissão para banir este usuário")

    const reason = ctx.args[1] ? ctx.args.slice(1).join(' ') : "Sem razão informada"

    await user.ban({ days: 7, reason })

    ctx.send(`Usuário banido com sucesso!`)

    const embed = new MessageEmbed()
      .setTitle(`${ctx.message.author.tag} baniu ${user.user.tag}`)
      .setDescription("**MOTIVO:** " + reason)
      .setColor("NOT_QUITE_BLACK")
      .setFooter("UserID: " + user.id)
      .setTimestamp()

    this.client.channels.cache.get(this.client.config.channels.ban).send({ embeds: [embed] })
  }
};