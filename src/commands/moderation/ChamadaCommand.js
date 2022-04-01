const Command = require('../../structures/Command');
const { help_roles, help_categories } = require('../../../config.json').helper
const { reuniao_arena } = require('../../../config.json').channels

module.exports = class ChamadaCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'chamada',
      cooldown: 3,
      usage: "[minutos] [minutos]",
      description: "Faz a chamada dos jogadores",
      userRole: [
        help_roles.oficial_arena.key,
        help_roles.oficial_alianca.key,
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

    const name = ctx.message.channel.name.trim().split("-").pop()

    let minutesOf = 15;
    let minutesTo = 15;
    
    if (ctx.args[0]) {
      if (!Number.isNaN(Number(ctx.args[0]))) {
        minutesOf = Number(ctx.args[0]);
      } else {
        return await ctx.send('Número inválido');
      }
    }

    if (ctx.args[1]) {
      if (!Number.isNaN(Number(ctx.args[1]))) {
        minutesTo = Number(ctx.args[1]);
      } else {
        return await ctx.send('Número inválido');
      }
    }

    if (name === 'tdm') {
      const megaToCall = await this.client.database.Arenas.findOne({ showType: 'tdm', acceptingJoins: true });

      if (!megaToCall) return await ctx.message.channel.send('Nenhuma arena acontecendo nessa categoria');

      ctx.message.delete()

      const mentions = megaToCall.players.map((a) => `<@${a}>\n`)

      ctx.message.channel.send(`**${minutesOf} minuto(s) para o início da TDM, dirijam-se para o canal de busca!** ${this.client.channels.cache.get(reuniao_arena)}\n\n${mentions}`)

      this.client.arenaListener.startCallToMega(megaToCall._id, ctx.message.channel, minutesOf, minutesTo)
      return
    }

    if (name === 'naval') {
      const megaToCall = await this.client.database.Arenas.findOne({ showType: { $in: ['naval', 'semboard'] }, acceptingJoins: true });

      if (!megaToCall) return await ctx.message.channel.send('Nenhuma arena acontecendo nessa categoria');

      ctx.message.delete()

      const mentions = megaToCall.players.reduce((a, c) => {
        c.players.forEach(b => a += `<@${b}>\n`)
        return a;
      }, '')

      ctx.message.channel.send(`**${minutesOf} minuto(s) para o início da Arena, dirijam-se para o canal de busca!** ${this.client.channels.cache.get(reuniao_arena)}\n\n${mentions}`)

      this.client.arenaListener.startCallToMega(megaToCall._id, ctx.message.channel, minutesOf, minutesTo)
      return
    }

    const typeToSearch = name === 'pesca' ? 'showType' : 'megaNumber'

    const megaToCall = await this.client.database.Megas.findOne({ [typeToSearch]: name, acceptingJoins: true });

    if (!megaToCall) return await ctx.message.channel.send('Nenhuma mega acontecendo nessa categoria');

    ctx.message.delete()

    const mentions = megaToCall.ships.reduce((a, c) => {
      c.players.forEach(b => a += `<@${b}>\n`)
      return a;
    }, '')

    ctx.message.channel.send(`**${minutesOf} minuto(s) para o início da mega, dirijam-se para o canal de busca!** ${this.client.channels.cache.get(this.client.config.channels.queue[0])}\n\n${mentions}`)

    this.client.megaListener.startCallToMega(megaToCall._id, ctx.message.channel, minutesOf, minutesTo)
  }
};