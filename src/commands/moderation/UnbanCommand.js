const Command = require('../../structures/Command');
const { help_categories, help_roles } = require('../../../config.json').helper

const { MessageEmbed } = require('discord.js')

module.exports = class UnbanCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'unban',
      cooldown: 1,
      description: "Desbane um usuário",
      usage: "<ID do usuário>",
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
    if (!ctx.args[0]) return ctx.send("Você não mencionou o id do usuário para desbanir")

    const ban = await ctx.message.guild.bans.fetch(ctx.args[0].replace(/\D+/g, '')).catch(() => null)

    if (!ban) return ctx.send("Este usuário não está banido")

    await ctx.message.guild.bans.remove(ban.user)

    ctx.send(`Usuário desbanido com sucesso!`)

    const embed = new MessageEmbed()
      .setTitle(`${ctx.message.author.tag} desbaniu ${ban.user.tag}`)
      .setColor('AQUA')
      .setFooter("UserID: " + ban.user.id)
      .setTimestamp()

    this.client.channels.cache.get(this.client.config.channels.ban).send({ embeds: [embed] })
  }
};