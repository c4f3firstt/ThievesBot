const Command = require('../../structures/Command');
const { MessageEmbed, MessageButton } = require('discord.js')
const { help_categories, help_roles } = require('../../../config.json').helper

module.exports = class AnnouceCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'anunciar',
      aliases: ['announce'],
      cooldown: 3,
      usage: "<#canal>",
      description: "Anuncia uma mensagem em um certo canal",
      userRole: [
        help_roles.capitao.key,
        help_roles.primeiro_imediato.key
      ],
      category: help_categories.moderacao.name
    });
  }

  async run(ctx) {
    if (!ctx.message.mentions.channels.first()) return ctx.send("❌ | Você precisa mencionar o canal para anunciar")

    this.makeInteraction(ctx)
  }

  async makeInteraction(ctx) {
    const filter = (msg) => msg.author.id === ctx.message.author.id;

    const collector = ctx.message.channel.createMessageCollector({ filter, max: 1 })

    ctx.send("Envie agora a Mensagem que deseja anunciar")

    collector.on('collect', async (msg) => {
      const embed = new MessageEmbed()
        .setTitle('Você tem certeza que quer anunciar a seguinte mensagem?')
        .setFooter("Cheque bem antes de enviar")
        .setColor("RANDOM")
        .setDescription(msg.content);

      const Button1 = new MessageButton()
        .setLabel("Enviar")
        .setStyle("PRIMARY")
        .setCustomId(`{"id": "IGNORE", "type": "SEND"}`)

      const Button2 = new MessageButton()
        .setLabel("Reescrever")
        .setStyle("SECONDARY")
        .setCustomId(`{"id": "IGNORE", "type": "REWRITE"}`)

      const sentMessage = await msg.channel.send({ embeds: [embed], components: [{ type: 1, components: [Button1, Button2] }] })

      const filt = (int) => int.user.id === ctx.message.author.id

      sentMessage.awaitMessageComponent({ componentType: 'BUTTON', filter: filt, max: 1 }).then(col => {
        const { type } = JSON.parse(col.customId)
        sentMessage.delete()

        if (type === "REWRITE") return this.makeInteraction(ctx)

        ctx.message.mentions.channels.first().send(msg.content)
        ctx.send("Anúncio enviado com Sucesso")
      })
    })
  }
};