const Command = require('../../structures/Command');
const { MessageEmbed } = require('discord.js')
const { help_categories, help_roles } = require('../../../config.json').helper
const moment = require('moment-timezone')

module.exports = class AvisosCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'globalwarns',
      aliases: ['avisos'],
      cooldown: 3,
      usage: "<user>",
      description: "Mostra os avisos de um usuário",
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
    if (!ctx.args[0]) return ctx.send('Você não mencionou nenhum usuário');

    let user;
    try {
      user = await ctx.message.guild.members.fetch(ctx.args[0].replace(/[<@!>]/g, ''));
    } catch {
      if (!ctx.args[0]) return ctx.send('Você não mencionou nenhum usuário');
    }

    if (!user) return ctx.send('Este usuário não está neste servidor');
    if (user.user.bot) return ctx.send('Não pode avisar os bots né aleki, tadinhos');

    const userWarns = await this.client.database.Avisos.find({ userID: user.id }, null, { sort: { createdAt: 1 } })

    if (userWarns.length < 1) return ctx.send("Este usuário não possui avisos")

    const embed = new MessageEmbed()
      .setTitle(`Avisos no Servidor de: \`${user.user.tag}\`\ `)
      .setColor('#ff0000')
      .setFooter('User ID: ' + user.id)

    moment.locale('pt-br');

    await userWarns.map(async (warn, i) => {
      embed.addField(`Aviso #${i + 1}`, `**Avisado por: ${await ctx.message.guild.members.fetch(warn.warnerID)}**\n**Motivo:** ${warn.reason}\n**Avisado em:** ${moment(parseInt(warn.createdAt)).tz("America/Sao_Paulo").format('DD/MM/YYYY [às] HH:mm:ss')}\n`)
    })

    ctx.send({ embeds: [embed] })
  }
};