module.exports = class guildMemberUdpdate {
  constructor(client) {
    this.client = client;
  }

  async run(oldMember, newMember) {
    if (oldMember === newMember) return;
    if (oldMember.user.bot) return;

    const eventLog = this.client.modules.get('EventLog');
    if(!eventLog) return;

    if(oldMember.nickname !== newMember.nickname) eventLog.nicknameChange(oldMember.nickname, newMember)
    if(oldMember.roles.cache !== newMember.roles.cache) eventLog.rolesChange(oldMember.roles, newMember)
    if(oldMember.user.username !== newMember.user.username) eventLog.usernameChange(oldMember.user.username, newMember.user)
  }
};