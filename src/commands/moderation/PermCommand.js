const Command = require('../../structures/Command');
const { MessageEmbed } = require('discord.js')
const { help_categories, help_roles } = require('../../../config.json').helper
const { name } = require('../../../config.json').bot

module.exports = class HelpCommand extends Command 
{
  constructor(client) {
    super(client, {
      name: 'perm',
      cooldown: 1,
      usage: "<categoria> <comando>",
      description: "Mostra as permissões dos comandos",
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

  async run(ctx) {
    if (ctx.args[0] && ctx.args[1]) {
      return getCMD(ctx);
    }
    
    return;
  }
};

function getCMD(ctx) {

    const embed = new MessageEmbed();
    let info = `Nenhuma informação para o comando \`${ctx.args[1].toLowerCase()}\``

    let cmd = ctx.client.commands.get(ctx.args[1].toLowerCase()) || ctx.client.commands.get(ctx.client.aliases.get(ctx.args[1].toLowerCase()));
    if (cmd.config.category != ctx.args[0].toLowerCase()) {
        cmd = null;
    }

    if (!cmd) {
        setEmbedFooter(embed);
        return ctx.send({ embeds: [embed.setColor('#ff0000').setDescription(info)] }); 
    } else if (!verifyUserPermission( ctx.args[0].toLowerCase(), cmd.config.name, ctx)) {
        setEmbedFooter(embed);
        return ctx.send({ embeds: [embed.setColor('#ff0000').setDescription(info)] }); 
    }

    embed.setThumbnail(ctx.client.user.displayAvatarURL())
    embed.setTitle(`Comando: ${captalize(cmd.config.name)}`);

    info = `\n**Descrição**: ${cmd.config.description}`;
    info += `\n**Cooldown**: ${cmd.config.cooldown} segundos`;
    if (cmd.config.aliases.length > 0) info += `\n**Apelido**: ${cmd.config.aliases.map((a) => `\`${a}\``).join(', ')}`;
    info += `\n**Como usar**: ${ctx.client.config.bot.prefix}${cmd.config.name} ${cmd.config.usage}`;
    info += `\n**Cargos necessários**: ${getRolesDescription(cmd.config.userRole, ctx)}\n`;

    info += `*Sintaxe: [] - Opcional | <> - Obrigatório*`;

    setEmbedFooter(embed);

    return ctx.send({ embeds: [embed.setColor('#00ffe1').setDescription(info)] });
}

function getRolesDescription(roles, ctx) {
    if (!roles) {
        return `Nenhum cargo é necessária`;
    }

    let rolemap = ctx.message.guild.roles.cache
        .filter((r) => roles.includes(r.id) )
        .map(r => r.name)
        .join("\n");

    return `\`\`\`${rolemap}\`\`\``;
}

function setEmbedFooter(embed, color = '#b880e6') {
    embed.setFooter(`© Powered by ${name}`)
    embed.setColor(color)
    embed.setTimestamp(Date.now())
}

function verifyUserPermission(category, command, ctx) { 
    if (ctx == null)
      return true;
    
    let roles = getPermissions(category, ctx.client, command)
    if (!ctx.message.member.roles.cache.some(role => roles.includes(role.id))) {
        return false;
    }
  
    return true;  
}
  
function getPermissions(category, client, command = null) {

    let allRoles = [];
    if (command == null) {  
      allRoles = client.commands
        .filter((c) => c.config.category === category)
        .map((c) => c.config?.userRole ?? verify);
    } else {
      allRoles = client.commands
        .filter((c) => c.config.category === category && c.config.name == command)
        .map((c) => c.config?.userRole ?? verify);
    }
  
    // Remove o array dentro de array, e depois remove os duplicados
    var merged = [].concat.apply([], allRoles).reduce((arr, el) => arr.concat(arr.includes(el) ? [] : [el]), []);
    
    return merged;
}

function captalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}