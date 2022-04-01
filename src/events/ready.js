module.exports = class ReadyEvent {
  constructor(client) {
    this.client = client;
  }

  async run() {
    console.log('[READY] \x1b[32mBot se conectou com o Discord!\x1b[0m');
    setInterval(async () => {
      //THIS IS FOR THE ACTIVITY
      const atividade = this.client.config.bot.activities[Math.floor(Math.random() * this.client.config.bot.activities.length)]
      //THIS IS FOR THE ACTIVITY TYPE
      const activityTipo = this.client.config.bot.activityType[Math.floor(Math.random() * this.client.config.bot.activityType.length)]
      this.client.user.setActivity(atividade, { type: `${activityTipo}`}); // AVAIABLE OPTIONS: PLAYING, STREAMING, LISTENING, WATCHING, COMPETING
    }, 1000 * 60);
  }
};