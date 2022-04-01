const Command = require('../../structures/Command');
const { MessageEmbed, MessageButton } = require('discord.js')
const { help_roles, help_categories } = require('../../../config.json').helper

const moment = require('moment-timezone')
moment.locale('pt-br');

module.exports = class GiveavayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'sortear',
      aliases: ['sorteio', 'giveaway'],
      cooldown: 3,
      description: "Cria um sorteio",
      userRole: [
        help_roles.segundo_imediato.key,
        help_roles.capitao_alianca.key,
        help_roles.primeiro_imediato.key,
        help_roles.capitao.key,
      ],
      category: help_categories.moderacao.name,
    });
  }

  async run(ctx) {
    ctx.send(`🎉 Bem-Vindo ao setup de sorteio ${ctx.message.author.username}. Vou te explicar rapidinho como vai ser.\nVou enviar perguntas para criar o sorteio, e tu responde do jeito que eu pedi, tudo bem? Vamos começar...\n• Em qual canal esse sorteio vai acontecer? Mencione o canal com #`)

    let channel, time, winners, award;
    let error = false

    const filter = (msg) => msg.author.id === ctx.message.author.id

    await ctx.message.channel.awaitMessages({ max: 1, filter }).then(msg => {
      msg = msg.first()
      if (!msg.mentions.channels.first()) {
        error = true
        return
      }
      channel = msg.mentions.channels.first()
    })

    if (error) return ctx.send("Errr, você inseriu uma resposta inválida na contrução do sorteio, execute o comando novamente, e cuide a digitação")

    ctx.send(`🎉 Perfeeeito, o canal do sorteio vai ser ${channel}, ok, agora vamos a quantidade de vencedores\nQuantas pessoas devem vencer esse sorteio?`)

    await ctx.message.channel.awaitMessages({ max: 1, filter }).then(msg => {
      msg = msg.first()
      if (parseInt(msg.content) <= 0 || isNaN(parseInt(msg.content)) || !isFinite(msg.content)) {
        error = true
        return
      }
      winners = parseInt(msg.content)
    })

    if (error) return ctx.send("Errr, você inseriu uma resposta inválida na contrução do sorteio, execute o comando novamente, e cuide a digitação")

    ctx.send(`🎉 Estamos Quase! Serão ${winners} vencedores então, mas... O que eles vão ganhar?\nEnvie o prêmio do sorteio (pode ser uma frase)`)

    await ctx.message.channel.awaitMessages({ max: 1, filter }).then(msg => {
      msg = msg.first()
      award = msg.content
    })

    ctx.send(`🎉 Está tudo pronto, só falta uma coisa, o tempo que esse sorteio vai acontecer. Mande um numero seguido de uma letra, exemplo \`5d\`, assim, o sorteio vai terminar em 5 dias. Use m para minutos, d para dias e h para horas `)

    await ctx.message.channel.awaitMessages({ max: 1, filter }).then(msg => {
      msg = msg.first()
      const tempo = msg.content.toLowerCase().split(/ +/g);

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
      time = Date.now() + toMilisDays + toMilisHours + toMilismin;

      if (time <= Date.now()) error = true
    })

    if (error) return ctx.send("Errr, você inseriu uma resposta inválida na contrução do sorteio, execute o comando novamente, e cuide a digitação")

    const embed = new MessageEmbed()
      .setTitle("🎉 | Sorteio Preparado!")
      .setColor("FUCHSIA")
      .setDescription(`Verifique as informações:\n\n**Canal:** ${channel}\n**Prêmio:** ${award}\n**Vencedores:** ${winners}\n**Acontecerá em:** ${moment(time).tz("America/Sao_Paulo").format('DD/MM/YYYY [às] HH:mm')}`)

    const Button1 = new MessageButton()
      .setLabel("Enviar")
      .setStyle("PRIMARY")
      .setCustomId(`{"id": "IGNORE", "type": "SEND"}`)

    const Button2 = new MessageButton()
      .setLabel("Reescrever")
      .setStyle("SECONDARY")
      .setCustomId(`{"id": "IGNORE","type": "REWRITE"}`)

    const msgSent = await ctx.send({ embeds: [embed], components: [{ type: 1, components: [Button1, Button2] }] })

    const filt = (int) => int.user.id === ctx.message.author.id

    msgSent.awaitMessageComponent({ componentType: 'BUTTON', filter: filt, max: 1 }).then(col => {
      const { type } = JSON.parse(col.customId)
      msgSent.delete()

      if (type === "REWRITE") return this.run(ctx)

      return this.createGiveaway(ctx, channel, time, winners, award)
    })
  }

  async createGiveaway(ctx, channel, time, winners, award) {

    const embed = new MessageEmbed()
      .setTitle(award)
      .setColor('BLURPLE')
      .setDescription(`Reaja com 🎉 para participar!\nAcaba ${moment(time).fromNow()}`)
      .setFooter(`${winners} ${winners > 1 ? 'Vencedores' : 'Vencedor'}`)

    channel.send({ content: "🎉 Sorteio 🎉", embeds: [embed] }).then(async msg => {

      msg.react('🎉');
      const saved = await this.client.database.Giveaways.create({
        hosterID: ctx.message.author.id,
        giveawayID: msg.id,
        channelID: channel.id,
        endsAt: time,
        maxWinners: winners,
        award,
      })
      embed.setFooter(`${msg.embeds[0].footer.text} | ID: ${saved.giveawayID}`)
      msg.edit({ content: "🎉 **Sorteio** 🎉", embeds: [embed] })
      this.client.reactionChannels.push(channel.id)
      ctx.message.channel.send("✅ | Sorteio Iniciado!")
    })


  }
};