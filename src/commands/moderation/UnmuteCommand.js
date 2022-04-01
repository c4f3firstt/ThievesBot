const Command = require('../../structures/Command');
const { help_categories, help_roles } = require('../../../config.json').helper

const { MessageEmbed } = require('discord.js')

module.exports = class UnMuteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'unmute',
      cooldown: 1,
      description: "Desmuta um usuário",
      usage: "<menção|ID do usuário>",
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
    if (!ctx.args[0]) return ctx.send("Você não mencionou o usuário para desmutar")

    const user = await ctx.message.guild.members.fetch(ctx.args[0].replace(/\D+/g, '')).catch(() => null)

    if (!user) return ctx.send("Este usuário não está no servidor")

    if (user.id === ctx.message.author.id) return ctx.send("Você não pode desmutar a si mesmo")

    user.roles.remove(this.client.config.roles.muted_role)
    ctx.send(`Usuário desmutado com sucesso!`)

    const embed = new MessageEmbed()
      .setTitle(`${ctx.message.author.tag} desmutou ${user.user.tag}`)
      .setColor("NOT_QUITE_BLACK")
      .setFooter("UserID: " + user.id)
      .setTimestamp()

    this.client.channels.cache.get(this.client.config.channels.ban).send({ embeds: [embed] })

    await this.client.database.Punishments.deleteOne({
      userID: user.id,
      removedRole: [this.client.config.roles.muted_role],
      isMute: true
    })

  }
};