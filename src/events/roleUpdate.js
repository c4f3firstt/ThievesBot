
module.exports = class RoleUpdate {
  constructor(client) {
    this.client = client;
  }

  async run(oldRole, newRole) {
    if(oldRole === newRole) return;
    this.client.modules.get('EventLog')?.updateRole(oldRole, newRole)
  }
}