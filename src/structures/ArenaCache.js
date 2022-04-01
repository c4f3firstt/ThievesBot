const { Collection } = require("discord.js");

module.exports = class ArenaCacheClass {

  constructor(client) {
    this.client = client;
    this.arenaCache = new Collection()
  }

  async saveLoop() {
    setInterval(async () => {
      this.arenaCache.forEach(async mega => {
        await this.client.database.Arenas.updateOne({ _id: mega._id }, mega)
      })
    }, 1000 * 15)
  }

  add(mega) {
    this.arenaCache.set(mega._id.toString(), mega)
  }

  remove(megaID) {
    this.arenaCache.delete(megaID.toString())
  }

  getKeyByValue(typeToSearch, userID) {
    if (typeToSearch === 'tdm') {
      return this.arenaCache.findKey((key) => key.showType === typeToSearch && key.acceptingJoins === true && key.players.includes(userID))
    }

    return this.arenaCache.findKey((key) => key.showType !== 'tdm' && key.acceptingJoins === true && key.players.some(a => a.players.includes(userID)))
  }

  async get(megaID) {
    const inCache = this.arenaCache.get(megaID.toString())
    if (inCache) return inCache;

    const fetchedMega = await this.client.database.Arenas.findOne({ _id: megaID })
    this.set(megaID.toString(), fetchedMega)
    return fetchedMega;
  }

  set(megaID, megaData) {
    this.arenaCache.set(megaID.toString(), megaData)
  }

  async leaveTrip(megaID, userID) {
    const playerInMega = await this.get(megaID.toString())
    if (!playerInMega) return

    if (playerInMega.showType === 'tdm') {
      playerInMega.players.splice(playerInMega.players.indexOf(userID), 1);
      return true
    }

    playerInMega.players[playerInMega.players.findIndex(ship => ship.players.includes(userID))].players.splice(playerInMega.players[playerInMega.players.findIndex(ship => ship.players.includes(userID))].players.indexOf(userID), 1)

    return true
  }

  async joinTrip(megaID, userID, shipNumber) {

    const shipQuantity = {
      'galeao': 4,
      'bergantim': 3,
      'chalupa': 2
    }

    const megaToEnter = await this.get(megaID.toString())

    if (megaToEnter.showType === 'tdm') {
      if (megaToEnter.players.includes(userID)) return false
      if (megaToEnter.players.length >= megaToEnter.maxPlayers) return false
      megaToEnter.players.push(userID)
    } else {
      if (megaToEnter.players.some(ship => ship.players.includes(userID))) return false;
      if (!megaToEnter.players[(parseInt(shipNumber) - 1)] || megaToEnter.players[(parseInt(shipNumber) - 1)].players.length >= shipQuantity[megaToEnter.type]) return false;
      megaToEnter.players[(parseInt(shipNumber) - 1)].players.push(userID)
    }

    this.set(megaID.toString(), megaToEnter)
    return true
  }

  async editHour(megaID, firstHour, lastHour) {
    const megaToEnter = await this.get(megaID.toString())

    megaToEnter.startHour = firstHour;
    megaToEnter.endHour = lastHour

    this.set(megaID.toString(), megaToEnter)
  }

  async editShip(megaID, shipType) {
    const shipQuantity = {
      'galeao': 4,
      'bergantim': 3,
      'chalupa': 2
    }

    const megaToEnter = await this.get(megaID.toString())

    if (megaToEnter.type === shipType) return { content: 'ESTA ARENA JÁ POSSUI ESSE TIPO DE EMBARCAÇÃO', needToWarn: false }

    if (shipQuantity[megaToEnter.type] < shipQuantity[shipType]) {
      megaToEnter.type = shipType;
      this.set(megaID.toString(), megaToEnter)
      return { content: `O Tipo de embarcação foi alterado para ${shipType}`, needToWarn: true }
    }
    megaToEnter.type = shipType;

    const allRemovedPersons = []

    for (const ship of megaToEnter.ships) {
      for (let i = ship.players.length; i > shipQuantity[shipType]; i--) {
        const popped = ship.players.pop()
        allRemovedPersons.push(popped)
      }
    }

    this.set(megaID.toString(), megaToEnter);
    return { content: `O Tipo de embarcação foi alterado para ${shipType}`, needToWarn: true, removed: allRemovedPersons }
  }

  async removeFromAll(userID) {
    let removed = 0;
    this.arenaCache.forEach(mega => {
      if (mega.showType === 'tdm') {
        if (mega.players.includes(userID)) removed++;
        mega.players = mega.players.filter(a => a !== userID)
      } else {
        mega.players.forEach(ship => {
          if (ship.players.includes(userID)) removed++;
          ship.players = ship.players.filter(a => a !== userID);
        })
      }
      this.set(mega._id, mega)
    })

    if (removed > 0) this.client.channels.cache.get(this.client.config.channels.penalidades).send(`O usuário <@${userID}> (${userID}) foi removido de **${removed}** mega(s) após receber uma punição!`)
  }

  // Verifica se o usuario está em algum a lista aberta
  async checkUserInList(userID) {

    let arenaList = [];
    
    this.arenaCache.forEach(arena => {
      if (arena.acceptingJoins) {
        if (arena.showType === 'tdm') {
          if (arena.players.includes(userID)) {
            arenaList.push(arena);
          }
        } else {
          arena.players.forEach(ship => {
            if (ship.players.includes(userID)) {
              arenaList.push(arena);
            }
          })
        }
      }
    })

    return arenaList;
  }

}