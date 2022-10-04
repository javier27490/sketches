const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');


const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

let manager;

let text = '♫';
let fontSize = 1200;
let fontFamily = 'sans-serif';

const typeCanvas = document.createElement('canvas');
const typeContext = typeCanvas.getContext('2d');

const sketch = ({ context, width, height }) => {

  const cell = 5;
  const cols = Math.floor(width / cell);
  const rows = Math.floor(height / cell);
  const numCells = cols * rows;

  debugger;

  typeCanvas.width = cols;
  typeCanvas.height = rows;

  const agents = [];

  for (let i = 0; i < 40; i++){
    const x = random.range(0, width);
    const y = random.range(0, height);
    agents.push(new Agent(x, y));
  }

  return ({ context, width, height }) => {

    typeContext.fillStyle = 'black';
    typeContext.fillRect(0, 0, cols, rows);

    fontSize = 190;

    typeContext.fillStyle = 'white';
    typeContext.font = `bold ${fontSize}px ${fontFamily}`;
    typeContext.textBaseline = 'top';

    const metrics = typeContext.measureText(text);
    const mx = metrics.actualBoundingBoxLeft * -1;
    const my = metrics.actualBoundingBoxAscent * -1;
    const mw = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
    const mh = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    const tx = (cols - mw) * 0.5 - mx;
    const ty = (rows - mh) * 0.5 - my;

    
    
    typeContext.save();
    typeContext.translate(tx, ty);    
    typeContext.rotate(0);
    typeContext.beginPath();
    typeContext.rect(mx, my, mw, mh);
    typeContext.stroke();
    typeContext.fillStyle = 'white';
    

    typeContext.fillText(text, 0, 0);
    typeContext.restore();

    const typeData = typeContext.getImageData(0, 0, cols, rows).data;

    context.fillStyle = 'red';
    context.fillRect(0, 0, width, height);

    context.textBaseline = 'middle';
    context.textAlign = 'center';

    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];

      for (let j = i + 1; j < agents.length; j++) {
        const other = agents[j];

        const dist = agent.pos.getDistance(other.pos);

        if (dist > 200) continue;

        context.lineWidth = math.mapRange(dist, 0, 200, 12, 1)


        context.beginPath();
        context.moveTo(agent.pos.x, agent.pos.y);
        context.lineTo(other.pos.x, other.pos.y);
        context.fillStyle = 'blue'
        context.strokeStyle = 'blue';
        context.stroke();
        


      }
 

      
    }

   

    agents.forEach(agent => {
      agent.update();
      agent.draw(context);
      agent.bounce(width, height);
    });

    for (let i = 0; i < numCells; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = col * cell;
      const y = row * cell;

      const r = typeData[i * 4 + 0];
      const g = typeData[i * 4 + 1];
      const b = typeData[i * 4 + 2];
      const a = typeData[i * 4 + 3];

      const glyph = getGlyph(r);

      context.font = `${cell * 2}px ${fontFamily}`;
      if (Math.random() < 0.9) context.font = `${cell * 6}px ${fontFamily}`;

      context.fillStyle = 'black';
      context.shadowColor = "red"
      context.shadowOffsetX = 20;
      context.shadowOffsetY = 20;
      context.shadowBlur = 5;

      

      context.save();

      context.translate(x, y);
      context.translate(cell * 0.5, cell * 0.5);
      context.fillText(glyph, 0, 0)

      context.restore();
      
    }
    

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];

      for (let j = i + 1; j < agents.length; j++) {
        const other = agents[j];

        const dist = agent.pos.getDistance(other.pos);

        if (dist > 200) continue;

        context.lineWidth = math.mapRange(dist, 0, 200, 2, 0,5)


        context.beginPath();
        context.moveTo(agent.pos.x, agent.pos.y);
        context.lineTo(other.pos.x, other.pos.y);
        context.fillStyle = 'blue'
        context.strokeStyle = 'blue';
        context.stroke();
        


      }
 
    }
    
  };
};

//canvasSketch(sketch, settings);

class Vector {
  constructor(x, y,){

    this.x = x;
    this.y = y;
  }

  getDistance(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

}

class Agent {
  constructor(x, y){
    this.pos = new Vector(x, y);
    this.vel = new Vector(random.range(-1, 1), random.range(-1, 1));
    this.radius = random.range(4, 12);
    

  }

  bounce(width, height) {
    if (this.pos.x - this.radius <= 0 || this.pos.x + this.radius>= width)   this.vel.x *= -1; this.x = width + this.radius;
    if (this.pos.y - this.radius <= 0 || this.pos.y + this.radius>= height)  this.vel.y *= -1; this.y = height + this.radius;
  }

  update() {
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
  };

  draw(context) {

    context.save();
    context.translate(this.pos.x, this.pos.y)

    context.lineWidth = 4;

    context.beginPath();
    context.arc(0, 0, this.radius, 0, Math.PI * 2);
    context.fill();
    context.shadowColor = "blue"
    context.shadowBlur = 15;
    context.stroke();

    context.restore();
  }
}

const getGlyph = (v) => {
  if (v < 50) return  '';
  if (v < 100) return '.';
  if (v < 150) return '.';
  if (v < 200) return '.';

  const glyphs = '̻'.split('');

  return random.pick(glyphs);

}



const onKeyUp = (e) => {
  text = e.key.toUpperCase();
  manager.render();
};

//document.addEventListener('keyup', onKeyUp);

const start = async () => {
  manager = await canvasSketch(sketch, settings);
};

start();