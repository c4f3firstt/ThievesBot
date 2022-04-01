
module.exports = class RoleCreate {
  constructor(client) {
    this.client = client;
  }

  async run(role) {
    this.client.modules.get('EventLog')?.createRole(role)
  }
}