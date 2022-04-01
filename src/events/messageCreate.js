const { MessageEmbed, Collection } = require('discord.js');
const CommandContext = require('../structures/CommandContext');

const cooldowns = new Collection();
const warnedUserCooldowns = new Map();

module.exports = class MessageReceive {
  constructor(client) {
    this.client = client;
  }

  async run(message) {
    if (message.author.bot) return;
    if (message.channel.type === 'dm') return;
    const config = await this.client.database.Configs.findOne({ id: 'config' })
    if (config.ignoreChannels.includes(message.channel.id)) return;

    const prefix = this.client.config.bot.prefix
    if (message.content.startsWith(`<@!${this.client.user.id}>`) || message.content.startsWith(`<@${this.client.user.id}>`)) 
      return message.reply(`🏴‍☠️ | Ahoy pirata! Meu nome é ${this.client.user.username} e estou aqui para te ajudar! Use o \`${prefix}help\` para ver todos os meus comandos!`);

    if (!message.content.toLowerCase().startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift()

    if (cmd.substring(0, 4).toLowerCase() === 'trip') {

      if (cmd.substring(0, 4) !== 'trip') return message.react('❌');

      const channelName = message.channel.name.trim().split("-").pop()

      if (channelName === 'tdm') {
        const command = this.client.commands.get('tdm')
        if (command.config.userRole && !command.config.userRole.some(a => message.member.roles.cache.has(a))) {
          return message.channel.send(`❌ | Você não possui os cargos necessarios para fazer isso!`)
        }

        if (message.content.length > 5) return message.react('❌').catch(() => null)
        const ctx = new CommandContext(this.client, message, args);

        new Promise((res, _) => {
          res(command.run(ctx));
        }).catch((e) => console.log(e));
        return
      }

      if (channelName === 'naval') {
        const command = this.client.commands.get('naval')
        if (command.config.userRole && !command.config.userRole.some(a => message.member.roles.cache.has(a))) {
          return message.channel.send(`❌ | Você não possui os cargos necessarios para fazer isso!`)
        }

        if (message.content.length > 6) return message.react('❌').catch(() => null)
        const ctx = new CommandContext(this.client, message, args);

        const shipNumber = cmd.substring(4)

        new Promise((res, _) => {
          res(command.run(ctx, shipNumber));
        }).catch((e) => console.log(e));
        return
      }

      const command = this.client.commands.get('trip')
      if (command.config.userRole && !command.config.userRole.some(a => message.member.roles.cache.has(a))) {
        return message.channel.send(`❌ | Você não possui os cargos necessarios para fazer isso!`)
      }

      if (message.content.length > 6) return message.react('❌').catch(() => null)
      const shipNumber = cmd.substring(4)
      const ctx = new CommandContext(this.client, message, args);


      new Promise((res, _) => {
        res(command.run(ctx, shipNumber));
      }).catch((e) => console.log(e));
      return
    }

    if (cmd.substring(0, 7) === 'addtrip') {
      const command = this.client.commands.get('addtrip')
      if (command.config.userRole && !command.config.userRole.some(a => message.member.roles.cache.has(a))) {
        return message.channel.send(`❌ | Você não possui os cargos necessarios para fazer isso!`)
      }
      const shipNumber = cmd.substring(7) ?? null
      const ctx = new CommandContext(this.client, message, args);

      new Promise((res, _) => {
        res(command.run(ctx, shipNumber));
      }).catch((e) => console.log(e));
      return
    }

    const command = this.client.commands.get(cmd) || this.client.commands.get(this.client.aliases.get(cmd));
    if (!command) return;

    if (!cooldowns.has(command.config.name)) cooldowns.set(command.config.name, new Collection());

    const now = Date.now();
    const timestamps = cooldowns.get(command.config.name);
    const cooldownAmount = (command.config.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
      const hasBeenWarned = warnedUserCooldowns.get(message.author.id);

      if (now < expirationTime) {
        if (hasBeenWarned) return;
        warnedUserCooldowns.set(message.author.id, true);
        const timeLeft = (expirationTime - now) / 1000;
        return message.channel.send(`🔥 | Você está em cooldown! Tempo restante: \`${timeLeft.toFixed(2)} segundos\``);
      }
    }

    timestamps.set(message.author.id, now);
    warnedUserCooldowns.set(message.author.id, false);
    setTimeout(() => {
      timestamps.delete(message.author.id);
      warnedUserCooldowns.delete(message.author.id);
    }, cooldownAmount);

    if (command.config.userRole && !command.config.userRole.some(a => message.member.roles.cache.has(a))) {
      return message.channel.send(`❌ | Você não possui os cargos necessarios para fazer isso!`)
    }

    if (command.config.clientPermissions?.length) {
      const missing = message.channel.permissionsFor(this.client.user).missing(command.config.clientPermissions);
      if (missing.length) {
        const perm = missing.join(', ');
        return message.channel.send(`❌ | Eu não tenho as seguintes permissões: ${perm}`);
      }
    }

    const ctx = new CommandContext(this.client, message, args);

    new Promise((res, _) => {
      res(command.run(ctx));
    }).catch(async (err) => {
      const errorMessage = err.stack.length > 1800 ? `${err.stack.slice(0, 1800)}...` : err.stack;
      const embed = new MessageEmbed();
      embed.setColor('#fd0000');
      embed.setDescription(`\`\`\`js\n${errorMessage}\`\`\``);
      embed.setTimestamp();

      message.channel.send({ embeds: [embed] });
    });
  }
}