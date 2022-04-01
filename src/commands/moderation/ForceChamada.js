const Command = require('../../structures/Command');
const { help_roles, help_categories } = require('../../../config.json').helper

module.exports = class ForceChamadaCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'forcechamada',
      aliases: ["forcarchamada", "fc"],
      cooldown: 3,
      description: "Força o encerramento da chamada",
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

    if (name === 'tdm') {
      const megaToCall = await this.client.database.Arenas.findOne({ showType: 'tdm', acceptingJoins: true });

      if (!megaToCall) return await ctx.message.channel.send('Nenhuma arena acontecendo nessa categoria');

      ctx.message.delete()

      await this.client.arenaListener.forceCallToMega(megaToCall._id)
      await this.client.arenaListener.finishCallArena(megaToCall._id, ctx.message.channel)
      return
    }

    if (name === 'naval') {
      const megaToCall = await this.client.database.Arenas.findOne({ showType: { $in: ['naval', 'semboard'] }, acceptingJoins: true });

      if (!megaToCall) return await ctx.message.channel.send('Nenhuma arena acontecendo nessa categoria');

      ctx.message.delete()

      await this.client.arenaListener.forceCallToMega(megaToCall._id)
      await this.client.arenaListener.finishCallArena(megaToCall._id, ctx.message.channel)
      return
    }

    const typeToSearch = name === 'pesca' ? 'showType' : 'megaNumber'

    const megaToCall = await this.client.database.Megas.findOne({ [typeToSearch]: name, acceptingJoins: true });

    if (!megaToCall) return await ctx.send('Nenhuma mega acontecendo nessa categoria');

    ctx.message.delete()
    this.client.megaListener.forceCallToMega(megaToCall._id)

    const queue_channel = await this.client.channels.fetch(this.client.config.channels.queue[0]).catch(() => null)
    const secondQueue = await this.client.channels.fetch(this.client.config.channels.queue[1]).catch(() => null)
    const thirdQueue = await this.client.channels.fetch(this.client.config.channels.queue[2]).catch(() => null)
    const fourthQueue = await this.client.channels.fetch(this.client.config.channels.queue[3]).catch(() => null)

    let msg = `RECRUTAMENTO ENCERRADO 



    ESTE CANAL SERÁ UTILIZADO APENAS PARA RECRUTAMENTO DA PRÓXIMA MEGA.
    
    
    
    :warning: NÃO envie mais mensagens aqui.
    :warning: Ao sair da Mega que ainda está acontecendo, avise a sua vaga em <#819970161243062292>`;

    const punishedMembers = megaToCall.ships.reduce((a, c) => {
      c.players.forEach(b => {
        if (!queue_channel.members.has(b) && !secondQueue.members.has(b) && !thirdQueue.members.has(b) && !fourthQueue.members.has(b)) a.push(b)
      })
      return a
    }, [])

    if (punishedMembers.length > 0) {
      msg += `\n\nOs seguintes usuários não estavam nos canais de encontro: \n${punishedMembers.map(a => `<@${a}>`)}`
    }

    ctx.send(msg)

  }
};