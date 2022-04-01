const Command = require('../../structures/Command');
const { MessageButton, MessageEmbed, MessageSelectMenu } = require('discord.js');
const { help_categories, help_roles } = require('../../../config.json').helper

module.exports = class EmbedCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'embed',
      cooldown: 1,
      usage: "<#canal>",
      description: "Cria uma mensagem de embed",
      userRole: [
        help_roles.segundo_imediato.key,
        help_roles.capitao_alianca.key,
        help_roles.primeiro_imediato.key,
        help_roles.capitao.key
      ],
      category: help_categories.util.name,
    });
  }

  async collectInput(channel, authorID) {
    let error = false
    const messagesCollected = await channel.awaitMessages({ filter: m => m.author.id === authorID, max: 1, time: 60000 }).catch(() => {
      error = true
    })
    if (error) return null
    return messagesCollected.first()
  }

  async run(ctx) {
    const channel = ctx.message.mentions.channels.first()

    if (!channel) return ctx.send("Você precisa mencionar o canal para enviar a mensagem");

    const SendButton = new MessageButton()
      .setCustomId(`${ctx.message.id} SEND`)
      .setLabel("Enviar Mensagem")
      .setStyle("PRIMARY")

    const CancelButton = new MessageButton()
      .setCustomId(`${ctx.message.id} CANCEL`)
      .setLabel("Excluir Tudo")
      .setStyle('DANGER')

    const Select = new MessageSelectMenu()
      .setCustomId(`${ctx.message.id} SELECT`)
      .setMinValues(1)
      .setMaxValues(1)
      .setPlaceholder("Selecione o que você quer editar")
      .addOptions([{
        label: "Título",
        value: 'title',
      },
      {
        label: "Descrição",
        value: 'description',
      },
      {
        label: 'Thumbnail',
        value: 'thumbnail'
      }, {
        label: 'Imagem',
        value: 'image'
      },
      {
        label: 'Rodape',
        value: 'footer'
      }, {
        label: "Cor",
        value: 'color'
      }])

    const sent = await ctx.send({ content: "Escolha o que você quer editar", components: [{ type: 1, components: [SendButton, CancelButton] }, { type: 1, components: [Select] }] })

    const filter = (int) => {
      if (int.user.id !== ctx.message.author.id) {
        int.deferReply({ conent: "Esta interação não é para você!", ephemeral: true })
        return false
      }

      int.deferUpdate();

      if (!int.customId.startsWith(ctx.message.id)) return false
      return true
    }

    const embed = new MessageEmbed()

    const collector = ctx.message.channel.createMessageComponentCollector({ filter, idle: 90000 })

    let awaiting = false;

    collector.on('collect', async (int) => {
      if (awaiting) return ctx.send('Estou esperando algum input seu...')
      if (int.customId.endsWith('CANCEL')) {
        collector.stop()
        ctx.send('Você cancelou este embed!')
        return
      }

      if (int.customId.endsWith('SEND')) {
        collector.stop()
        channel.send({ embeds: [embed] }).catch(() => ctx.send("Ocorreu um erro ao enviar este embed! Cheque se você enviou informações válidas, e se eu tenho permissão de enviar embeds neste canal!"))
        return;
      }

      awaiting = true;
      const ya = await ctx.send('Digite o valor para este campo')
      const input = await this.collectInput(int.channel, int.user.id)
      awaiting = false

      if (!input) {
        ctx.send("VocÊ demorou muito, tente novamente")
        return
      }

      input?.delete()
      ya.delete()

      switch (int.values[0]) {
        case 'title':
        case 'description':
          embed[int.values[0]] = input.content
          break;
        case 'thumbnail':
          embed.setThumbnail(input.content)
          break;
        case 'image':
          embed.setImage(input.content)
          break;
        case 'color':
          embed.setColor(input.content)
          break;
        case 'footer':
          embed.setFooter(input.content)
          break;
      }

      if (embed.description && embed.description.length > 1) sent.edit({ embeds: [embed] })

    })
    collector.on('end', () => {
      sent.delete()
    })
  }
};
