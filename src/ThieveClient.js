const { Client, Collection } = require('discord.js');
const FileUtil = require('./utils/FileUtil')
const path = require('path')
const EventManager = require('./structures/EventManager');
const CanvasMaker = require('./structures/Canvas');
const Database = require('./database/CreateConnection')
const TimeListener = require('./structures/TimeListener');
const TicketUtils = require('./utils/TicketUtils');
const MegaListener = require('./structures/MegaListener');
const MegaCache = require('./structures/MegaCache');
const ArenaCache = require('./structures/ArenaCache');
const ArenaListener = require('./structures/ArenaListener');

module.exports = class ThievesClient extends Client {
  constructor(options = {}, config) {
    super(options);

    this.config = config;
    this.database = new Database(process.env.DATABASE);
    this.modules = new Collection();
    this.commands = new Collection();
    this.aliases = new Collection();
    this.canvas = new CanvasMaker();
    this.events = new EventManager(this);
    this.ticketUtils = new TicketUtils(this)
    this.megaListener = new MegaListener(this);
    this.megaCache = new MegaCache(this)
    this.arenaListener = new ArenaListener(this);
    this.arenaCache = new ArenaCache(this)
    this.ignoredEvents = []
    this.reactionChannels = []
    this.runningQueue = false
  }
  async init() {
    console.log('[BANCO DE DADOS] \x1b[33mInicializando...\x1b[0m')
    await this.database.createConnection();
    console.log('[MODULOS] \x1b[33mCarregando modulos...\x1b[0m')
    await this.loadModules();
    console.log('[EVENTOS] \x1b[33mIgnorando eventos...\x1b[0m')
    await this.ignoreEvents()
    console.log('[COMANDOS] \x1b[33mCarregando comandos...\x1b[0m')
    await this.loadCommands(this.config.commandsDirectory);
    console.log('[EVENTOS] \x1b[33mCarregando eventos...\x1b[0m')
    await this.loadEvents(this.config.eventsDirectory);
    console.log('[WORKER] \x1b[33mIniciando processo de Time Listener...\x1b[0m')
    new TimeListener(this).start()

    return true;
  }

  async ignoreEvents() {
    const allEvts = this.config.EventLogListeners
    for (const evt in allEvts) {
      if (!allEvts[evt]) this.ignoredEvents.push(evt)
    }
  }

  async loadModules() {
    const allModules = this.config.modules;

    for (const mod in allModules) {
      if (allModules[mod]) this.loadOneModule(mod)
    }
  }

  loadOneModule(moduleName) {
    try {
      const moduleFile = require(path.resolve(`src/modules/${moduleName}.js`))
      const mod = new moduleFile(this);

      this.modules.set(moduleName, mod)
    } catch {
      throw new Error("[MODULOS] \x1b[31mModulo inexistente!\x1b[0m")
    }
  }

  login(token) {
    return super.login(token);
  }

  async loadCommand(NewCommand, filepath) {
    const command = new NewCommand(this);

    command.dir = filepath;

    this.commands.set(command.config.name, command);
    this.aliases.set(command.config.name, command.config.name);
    command.config.aliases.forEach((a) => this.aliases.set(a, command.config.name));
  }

  loadCommands(directory) {
    return FileUtil.readDirectory(directory, (...args) => this.loadCommand(...args));
  }

  loadEvents(directory) {
    return FileUtil.readDirectory(directory, (Event, filepath) => {
      const eventName = FileUtil.filename(filepath)
      if (!this.ignoredEvents.includes(eventName)) {
        this.events.add(eventName, filepath, new Event(this));
      }
    });
  }
};