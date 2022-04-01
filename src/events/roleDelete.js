
module.exports = class RoleDelete {
  constructor(client) {
    this.client = client;
  }

  async run(role) {
    this.client.modules.get('EventLog')?.deleteRole(role)
  }
}