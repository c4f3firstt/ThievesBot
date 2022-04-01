const CanvasImport = require('canvas')
const fs = require('fs')

module.exports = class CanvasMaker {
  constructor() {
    CanvasImport.registerFont('src/assets/fonts/PirateGrunge.ttf', { family: 'Pirate' })
    this.welcome = fs.readFileSync('src/assets/images/welcome.png')

    CanvasImport.CanvasRenderingContext2D.prototype.getLines = function (text, maxWidth) {
      const words = text.split(' ');
      const lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const { width } = this.measureText(`${currentLine} ${word}`);
        if (width < maxWidth) {
          currentLine += ` ${word}`;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      return lines;
    };
  }
  async CreateWelcomeImage(username) {
    const cnv = CanvasImport.createCanvas(661, 191);
    const ctx = cnv.getContext('2d');

    const welcomeImage = await CanvasImport.loadImage(this.welcome);
    ctx.drawImage(welcomeImage, 0, 0, cnv.width, cnv.height);

    ctx.font = '28px Pirate'
    ctx.fillStyle = '#D1C7AE'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const lines = ctx.getLines(`Ahoy, Pirata ${username}`, 400)
    if (lines.length > 1) {
      ctx.fillText(lines.join("\n").normalize('NFD').replace(/[\u0300-\u036f]/g, ""), 410, 60)
    } else {
      ctx.fillText(lines.join("\n").normalize('NFD').replace(/[\u0300-\u036f]/g, ""), 410, 90)
    }

    return cnv.toBuffer()
  }
};