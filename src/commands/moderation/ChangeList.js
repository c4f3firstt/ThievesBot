const Command = require('../../structures/Command');
const { help_roles, help_categories } = require('../../../config.json').helper

module.exports = class ChangeListCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'changelist',
      cooldown: 3,
      usage: "<#canal>",
      description: "Edita uma lista",
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

  async collectInput(channel, authorID) {
    let error = false
    const messagesCollected = await channel.awaitMessages({ filter: m => m.author.id === authorID, max: 1, time: 90000 }).catch(() => {
      error = true
    })
    if (error) return null
    return messagesCollected.first()
  }

  async run(ctx) {

    const channel = ctx.message.mentions.channels.first()

    if (!channel) return ctx.send('Mencione o canal da lista')

    const name = channel.name.trim().split("-").pop()

    const typeToSearch = name === 'pesca' ? 'showType' : 'megaNumber'

    const megaToCall = await this.client.database.Megas.findOne({ [typeToSearch]: name, acceptingJoins: true });

    if (!megaToCall) return await ctx.send('Nenhuma mega acontecendo nessa categoria');


    ctx.send("O que você quer alterar? [barco/hora/data]");

    const choice = await this.collectInput(ctx.message.channel, ctx.message.author.id);

    if (!choice) return ctx.send('Você demorou demais')

    const availableChoices = ["barco", "hora", "data"]

    if (!availableChoices.includes(choice.content.toLowerCase())) return ctx.send("Escolha inválida")

    if (choice.content === "hora")
      return this.changeHora(ctx, megaToCall, channel)


    if (choice.content === "barco")
      return this.changeShip(ctx, megaToCall, channel)

    if (choice.content === "data")
      return this.changeDate(ctx, megaToCall, channel)

  }

  async changeShip(ctx, mega, channel) {
    const availableMega = ['galeao', 'bergantim', 'chalupa']
    ctx.send(`Qual será o tipo de embarcação?\nDisponíveis: \`${availableMega.map(a => a.replace('galeao', 'galeão')).join("`, `")}\``);
    const newShip = await this.collectInput(ctx.message.channel, ctx.message.author.id)

    if (!newShip) return ctx.send("Demorou demais lindao!")

    const megaType = availableMega.find(n => newShip.content.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(n))

    if (!megaType) return ctx.send("Você não mencionou um tipo de embarcação válido. Tente novamente.")

    const response = await this.client.megaCache.editShip(mega._id.toString(), megaType)
    ctx.send(response.content)
    if (!response.needToWarn) return

    channel.send(`**ATENÇÃO**\nO tipo da embarcação foi alterada! Cheque na lista se você ainda possui uma embarcação!\n ${response.removed ? response.removed.map(a => `<@${a}>`)?.join("\n") : ''}`)
  }

  async changeHora(ctx, mega, channel) {
    ctx.send("Qual sera a nova hora de inicio?")
    const firstHour = await this.collectInput(ctx.message.channel, ctx.message.author.id)

    if (!firstHour) return ctx.send("Você demorou demais");

    ctx.send("Qual sera a nova hora de termino?")

    const secondHour = await this.collectInput(ctx.message.channel, ctx.message.author.id)

    if (!secondHour) return ctx.send("Você demorou demais");

    ctx.send("A hora da mega foi alterada")

    this.client.megaCache.editHour(mega._id, firstHour.content, secondHour.content)

    channel.send(`**ATENÇÃO!**\nO horário da Mega foi alterado! Cheque a mudança na lista!\n\n<@&${help_roles.marujo_alianca.key}>`)
  }
  async changeDate(ctx, mega, channel) {
    ctx.send("Qual sera a nova data?")
    const newDate = await this.collectInput(ctx.message.channel, ctx.message.author.id)

    if (!newDate) return ctx.send("Você demorou demais");

    ctx.send("A data da mega foi alterada")

    this.client.megaCache.editDate(mega._id, newDate.content)

    channel.send(`**ATENÇÃO!**\nA data da Mega foi alterada! Cheque a mudança na lista!\n\n<@&${help_roles.marujo_alianca.key}>`)
  }

};