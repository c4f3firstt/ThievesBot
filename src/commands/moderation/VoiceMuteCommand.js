const Command = require('../../structures/Command');
const { help_categories, help_roles } = require('../../../config.json').helper
const { MessageEmbed } = require('discord.js')

module.exports = class VoiceMuteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'voicemute',
      aliases: ['vm'],
      cooldown: 1,
      description: "Muta um usuário em voz",
      usage: "<menção|ID do usuário> [motivo] | <tempo>",
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
    if (!ctx.args[0]) return ctx.send("Você não mencionou o usuário para mutar")

    const user = await ctx.message.guild.members.fetch(ctx.args[0].replace(/\D+/g, '')).catch(() => null)

    if (!user) return ctx.send("Este usuário não está no servidor")

    if (user.id === ctx.message.author.id) return ctx.send("Você não pode mutar a si mesmo")

    const reason = ctx.args[1] ? ctx.args.slice(1).join(' ').split("|")[0] : "Sem razão informada"

    const timeStr = ctx.message.content.split("|")
    if (!timeStr[1]) return ctx.send("Você não especificou o tempo do mute.")

    const tempo = timeStr[1].toLowerCase().split(/ +/g);

    let days = '0';
    let hours = '0';
    let min = '0';

    tempo.forEach((tmp) => {
      if (tmp.indexOf('m') > -1) min = tmp.replace(/\D+/g, '');
      if (tmp.indexOf('h') > -1) hours = tmp.replace(/\D+/g, '');
      if (tmp.indexOf('d') > -1) days = tmp.replace(/\D+/g, '');
    });

    const toMilisDays = parseInt(days) * 1000 * 60 * 60 * 24;
    const toMilisHours = parseInt(hours) * 1000 * 60 * 60;
    const toMilismin = parseInt(min) * 1000 * 60;
    const time = Date.now() + toMilisDays + toMilisHours + toMilismin;

    if (time <= Date.now()) return ctx.send('Tempo inválido!')

    user.voice.setMute(true, reason)

    ctx.send(`Usuário mutado com sucesso!`)

    const embed = new MessageEmbed()
      .setTitle(`${ctx.message.author.tag} mutou ${user.user.tag}`)
      .setDescription("**MOTIVO:** " + reason)
      .setColor("NOT_QUITE_BLACK")
      .setFooter("UserID: " + user.id)
      .setTimestamp()

    this.client.channels.cache.get(this.client.config.channels.ban).send({ embeds: [embed] })

    await this.client.database.Punishments.create({
      userID: user.id,
      punisherID: ctx.message.author.id,
      createdAt: Date.now(),
      expireAt: time,
      isMute: true
    })
  }
};