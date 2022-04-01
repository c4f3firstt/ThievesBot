module.exports = class Command {
  constructor(client, options) {
    this.client = client;

    this.config = {
      name: options.name || null,
      category: options.category || 'util',
      aliases: options.aliases || [],
      description: options.description || "",
      usage: options.usage || "",
      cooldown: options.cooldown || 2,
      userRole: options.userRole || null,
      clientPermissions: options.clientPermissions || null,
      devsOnly: options.devsOnly || false,
    };

    this.dir = null;
  }
};