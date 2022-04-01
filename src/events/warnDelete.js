
module.exports = class WarnDelete {
  constructor(client) {
    this.client = client;
  }

  async run(author, warned) {
    this.client.modules.get('EventLog')?.deleteWarn(author, warned)
  }
}