const { connect } = require('mongoose');
const MongoModals = require('../structures/DatabaseCollections');

module.exports = class MongoDatabase {
  constructor(uri) {
    this.uri = uri;
    this.Warns = MongoModals.Warns;
    this.Avisos = MongoModals.Avisos
    this.Giveaways = MongoModals.Giveaways;
    this.Punishments = MongoModals.Punishments;
    this.Tickets = MongoModals.Tickets;
    this.Configs = MongoModals.Configs
    this.Megas = MongoModals.Megas;
    this.Users = MongoModals.Users;
    this.Arenas = MongoModals.Arenas;
  }

  createConnection() {
    return new Promise((resolve, reject) => {
      connect(this.uri, {
        useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
      }, (err) => {
        if (err) {
          console.error(`[BANCO DE DADOS]\x1b[31m Erro ao conectar ao Banco de Dados!\x1b[0m \n${err}`);

          return reject(err);
        }

        console.log('[BANCO DE DADOS]\x1b[32m Conectado com sucesso ao Banco de Dados\x1b[0m');
        return resolve();
      });
    });
  }
};