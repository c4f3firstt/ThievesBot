const { Collection } = require("discord.js");

module.exports = class MegaCacheClass {
  constructor(client) {
    this.client = client;
    this.megaCache = new Collection()
  }

  async saveLoop() {
    setInterval(async () => {
      this.megaCache.forEach(async mega => {
        await this.client.database.Megas.updateOne({ _id: mega._id }, mega)
      })
    }, 1000 * 15)
  }

  add(mega) {
    this.megaCache.set(mega._id.toString(), mega)
  }

  remove(megaID) {
    this.megaCache.delete(megaID.toString())
  }

  getKeyByValue(typeToSearch, name, userID) {
    return this.megaCache.findKey((key) => key[typeToSearch] === name && key.acceptingJoins === true && key.ships.some(a => a.players.includes(userID)))
  }

  async get(megaID) {
    const inCache = this.megaCache.get(megaID.toString())
    if (inCache) return inCache;

    const fetchedMega = await this.client.database.Megas.findOne({ _id: megaID })
    this.set(megaID.toString(), fetchedMega)
    return fetchedMega;
  }

  set(megaID, megaData) {
    this.megaCache.set(megaID.toString(), megaData)
  }

  checkIfTheUserIsInAnotherTrip(userID, megaID) {
    return this.megaCache.some(trip => {
      if (trip.fullyOpen && trip._id.toString() !== megaID.toString()) return false;
      return trip.ships.some(plrs => plrs.players.includes(userID))
    })
  }

  async leaveTrip(megaID, userID) {
    const already = this.checkIfTheUserIsInAnotherTrip(userID, megaID)
    if (!already) return false;

    const playerInMega = await this.get(megaID.toString())
    playerInMega.ships[playerInMega.ships.findIndex(ship => ship.players.includes(userID))].players.splice(playerInMega.ships[playerInMega.ships.findIndex(ship => ship.players.includes(userID))].players.indexOf(userID), 1)

    return true
  }

  async joinTrip(megaID, shipNumber, userID) {

    const shipQuantity = {
      'galeao': 4,
      'bergantim': 3,
      'chalupa': 2
    }

    const megaToEnter = await this.get(megaID.toString())

    const already = this.checkIfTheUserIsInAnotherTrip(userID, megaID)
    if (already && !megaToEnter.fullyOpen) return false;

    if (megaToEnter.ships.some(ship => ship.players.includes(userID))) return false;

    if (!megaToEnter.ships[(parseInt(shipNumber) - 1)] || megaToEnter.ships[(parseInt(shipNumber) - 1)].players.length >= shipQuantity[megaToEnter.type]) return false;

    megaToEnter.ships[(parseInt(shipNumber) - 1)].players.push(userID)
    this.set(megaID.toString(), megaToEnter)
    return true
  }

  async editHour(megaID, firstHour, lastHour) {
    const megaToEnter = await this.get(megaID.toString())

    megaToEnter.startHour = firstHour;
    megaToEnter.endHour = lastHour

    this.set(megaID.toString(), megaToEnter)
  }
  
  async editDate(megaID, newDate) {
    const megaToEnter = await this.get(megaID.toString())

    megaToEnter.date = newDate;

    this.set(megaID.toString(), megaToEnter)
  }

  async editShip(megaID, shipType) {
    const shipQuantity = {
      'galeao': 4,
      'bergantim': 3,
      'chalupa': 2
    }


    const megaToEnter = await this.get(megaID.toString())

    if (megaToEnter.type === shipType) return { content: 'ESTA MEGA JÁ POSSUI ESSE TIPO DE EMBARCAÇÃO', needToWarn: false }

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
    this.megaCache.forEach(mega => {
      mega.ships.forEach(ship => {
        if (ship.players.includes(userID)) removed++;
        ship.players = ship.players.filter(a => a !== userID);
      })
      this.set(mega._id, mega)
    })

    if (removed > 0) this.client.channels.cache.get(this.client.config.channels.penalidades).send(`O usuário <@${userID}> (${userID}) foi removido de **${removed}** mega(s) após receber uma punição!`)
  }

  async checkUserInList(userID) {
    let megaList = [];
    this.megaCache.forEach(mega => {
      if (mega.acceptingJoins) {
        mega.ships.forEach(ship => {
          if (ship.players.includes(userID)) {
            megaList.push(mega);
          }
        })
      }
    })

    return megaList;
  }
  
}