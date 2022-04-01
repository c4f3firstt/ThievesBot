const { Schema, model } = require('mongoose');

const warnSchema = Schema({
  userID: String,
  warnerID: String,
  reason: String,
  createdAt: String,
  expireAt: String,
  warnNumber: Number,
});

const usersSchema = Schema({
  _id: String,
  xp: String
})

const giveawaySchema = Schema({
  hosterID: String,
  giveawayID: String,
  channelID: String,
  endsAt: String,
  award: String,
  maxWinners: Number,
  winners: { type: Array, default: [] },
  members: { type: Array, default: [] },
  hasEnded: { type: Boolean, default: false },
})

const punishmentSchema = Schema({
  userID: String,
  punisherID: String,
  createdAt: String,
  expireAt: String,
  removedRole: Array,
  isMute: { type: Boolean, default: false },
})

const avisosSchema = Schema({
  userID: String,
  warnerID: String,
  reason: String,
  createdAt: String,
})

const configSchema = Schema({
  id: { type: String, unique: true, default: 'config' },
  ticketChannelID: String,
  ticketMessageID: String,
  reactionMessageID: String,
  reactionChannelID: String,
  queueChannelID: String,
  queueMessageID: String,
  navalMessageID: String,
  navalChannelID: String,
  memberCountChannelID: String,
  ignoreChannels: { type: Array, default: [] }
})

const ticketSchema = Schema({
  ticketID: Number,
  resolved: { type: Boolean, default: false },
  userID: String,
  supportID: String,
})

const megaSchema = Schema({
  megaNumber: String,
  type: String,
  showType: String,
  date: String,
  startHour: String,
  endHour: String,
  messageID: String,
  channelID: String,
  maxShips: Number,
  ships: Array,
  fullyOpen: Boolean,
  acceptingJoins: { type: Boolean, default: true },
})

const arenaSchema = Schema({
  type: String,
  number: String,
  showType: String,
  date: String,
  startHour: String,
  endHour: String,
  messageID: String,
  channelID: String,
  maxPlayers: Number,
  players: Array,
  acceptingJoins: { type: Boolean, default: true },
})

/* Ship Schema: {
name: 
players[]: userIds
}
*/
const giveaway = model('giveaways', giveawaySchema);
const warn = model('warns', warnSchema);
const punishment = model('punishments', punishmentSchema)
const ticket = model('tickets', ticketSchema)
const config = model('configs', configSchema)
const mega = model('megas', megaSchema)
const aviso = model('avisos', avisosSchema)
const user = model('users', usersSchema)
const arena = model('arenas', arenaSchema)

module.exports.Warns = warn;
module.exports.Giveaways = giveaway;
module.exports.Punishments = punishment;
module.exports.Tickets = ticket
module.exports.Configs = config
module.exports.Megas = mega
module.exports.Avisos = aviso
module.exports.Users = user
module.exports.Arenas = arena