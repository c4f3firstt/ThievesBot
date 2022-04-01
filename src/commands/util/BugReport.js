const Command = require('../../structures/Command');
const { MessageEmbed } = require('discord.js')
const { help_categories, help_roles } = require('../../../config.json').helper
const { salaBugReport } = require('../../../config.json')
const { name } = require('../../../config.json').bot

//MUDAR o ID da sala "salaBugReport" no config.json

module.exports = class BugReport extends Command {
  constructor(client) {
    super(client, {
      name: 'bugreport',
      cooldown: 1,
      description: "Faz um report de um erro no Bot",
      userRole: [
        help_roles.marinheiro.key,
        help_roles.ajudante_bordo.key,
        help_roles.contramestre.key,
        help_roles.segundo_imediato.key,
        help_roles.capitao_alianca.key,
        help_roles.primeiro_imediato.key,
        help_roles.capitao.key
      ],
      category: help_categories.util.name,
    });
  }

  async run(ctx) {

   //Ve se a pessoa especificou um bug
   const query = ctx.args.join(' ');
   if(!query) return ctx.message.reply('**Por favor, especifique o problema. **')
   
    //Cria um embed pra equipe de suporte
   const reportEmbed = new MessageEmbed()
   .setTitle('Novo bug reportado!')
   .addField('Autor:', ctx.message.author.toString(), true)
   .addField('Motivo:', query)
   .setColor('AQUA')
   .setThumbnail(ctx.client.user.displayAvatarURL())
   .setFooter(`© Powered by ${name}`)
   .setTimestamp()
   this.client.channels.cache.get(this.client.config.channels.salaBugReport).send({ embeds: [reportEmbed] })
   //Responde o usuario que fez a denuncia
   ctx.message.channel.send("**Report efetuado com sucesso!**")
    }
  }
