'use strict';

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  plus(vector) {
    if (!(vector instanceof Vector)) {
      throw  new Error('В метод Plus можно передавать только объект типа Vector');
    }
    return new Vector(this.x + vector.x, this.y + vector.y);
  }

  times(multiplier) {
    return new Vector(this.x * multiplier, this.y * multiplier);
  }
}

class Actor {
  constructor(pos = new Vector(0, 0), size = new Vector (1, 1), speed = new Vector (0, 0)) {
    if (!(pos instanceof Vector) || !(size instanceof Vector) || !(speed instanceof Vector)) {
      throw  new Error('В конструктор класса Actor можно передавать только объекты типа Vector');
    }
    this.pos = pos;
    this.size = size;
    this.speed = speed;
  }

  act() {

  }

  get left() {
    return this.pos.x;
  }

  get top() {
    return this.pos.y;
  }

  get right() {
    return this.pos.x + this.size.x;
  }

  get bottom() {
    return this.pos.y + this.size.y;
  }

  get type() {
    return 'actor';
  }

  isIntersect(actor) {
    if (!(actor instanceof Actor)) {
      throw new Error('В метод isIntersect можно передавать только объект типа Actor');
    }

    if (actor === this) {
      return false;
    }

    return actor.bottom > this.top && actor.top < this.bottom && actor.right > this.left && actor.left < this.right;  
  }
}

class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid.slice();
    this.actors = actors.slice();
    this.player = actors.find(el => el.type === 'player');
    this.height = grid.length;
    this.width = Math.max(0, ...grid.map(el => el.length));  
    this.status = null;
    this.finishDelay = 1;
  }



  isFinished() {
    return this.status !== null && this.finishDelay < 0;
  }

  actorAt(actor) {
    if (!(actor instanceof Actor) || typeof actor === 'undefined') {
      throw new Error('В метод actorAt можно передавать только объект типа Actor');
    }
    return this.actors.find(el => actor.isIntersect(el));   
  }

  obstacleAt(pos, size) {
    if (!(pos instanceof Vector) || !(size instanceof Vector)) {
      throw new Error('В метод obstacleAt можно передавать только объекты типа Vector');
    }

    const x1 = Math.floor(pos.x);
    const y1 = Math.floor(pos.y);
    const x2 = Math.ceil(pos.x + size.x);
    const y2 = Math.ceil(pos.y + size.y);

    if (x1 < 0 || x2 > this.width || y1 < 0) {
      return 'wall';
    }

    if (y2 > this.height) {
      return 'lava';
    }

    let result = [];
    for (let row = y1; row < y2; row++) {
      for (let cell = x1; cell < x2; cell++) {
        result = this.grid[row][cell];            
        if (result) {
          return result;
        }       
      }
    }
  }

  removeActor(actor) {
    const indexActor = this.actors.indexOf(actor);
    if (indexActor !== -1) {
      this.actors.splice(indexActor, 1);
    }
  }

  noMoreActors(type) {
    return !this.actors.some(el => el.type === type)
  }

  playerTouched(type, actor) {
    if (this.status !== null) {
      return;
    }

    if (type === 'lava' || type === 'fireball') {
      this.status = 'lost';
    }

    if (type === 'coin' && actor.type === 'coin') {
      this.removeActor(actor);
      if (this.noMoreActors('coin')) {
        this.status = 'won';
      }
    }
  }
}

class LevelParser {
  constructor(dictionary = {}) {
    this.dictionary = dictionary;
  }

  actorFromSymbol(symbol) {
    return this.dictionary[symbol];
  }

  obstacleFromSymbol(symbol) {
    if (symbol === 'x') {
      return 'wall';
    } else if (symbol === '!') {
      return 'lava';
    }
  }

  createGrid(stringSet) {
    return stringSet.map(el => el.split('').map(el => this.obstacleFromSymbol(el)));
  }

  createActors(stringSet) {
    const actors = [];
    for (let i = 0; i < stringSet.length; i++) {
      const symbolString = stringSet[i].split('');
      for (let k = 0; k < symbolString.length; k++) {
        const symbol = symbolString[k];
        const actorConstructor = this.actorFromSymbol(symbol);
        if (typeof actorConstructor === 'function') {
          const actor = new actorConstructor(new Vector(k, i));
          if (actor instanceof Actor) {
            actors.push(actor);
          }
        }
      }
    }
    return actors;
  }

  parse(stringSet) {
    return new Level(this.createGrid(stringSet), this.createActors(stringSet));
  }
}

class Fireball extends Actor {
  constructor(pos = new Vector(0, 0), speed = new Vector(0, 0)) {
    super(pos, new Vector(1, 1), speed);
  }

  get type() {
    return 'fireball';
  }

  getNextPosition(time = 1) {
    return this.pos.plus(this.speed.times(time));
  }

  handleObstacle() {
    this.speed = this.speed.times(-1);
  }

  act(time, level) {
    const nextPosition = this.getNextPosition(time);
    if (level.obstacleAt(nextPosition, this.size)) {
      this.handleObstacle();
    } else {
      this.pos = nextPosition;
    }
  }
}

class HorizontalFireball extends Fireball{
  constructor(pos = new Vector(1, 1)) {
    super(pos, new Vector(2, 0));
  }
}

class VerticalFireball extends Fireball{
  constructor(pos = new Vector(1, 1)) {
    super(pos, new Vector(0, 2));
  }
}

class FireRain extends Fireball{
  constructor(pos = new Vector(1, 1)) {
    super(pos, new Vector(0, 3));
    this.startPos = pos;
  }

  handleObstacle() {
    this.pos = this.startPos;
  }
}

class Coin extends Actor {
  constructor(pos = new Vector(0, 0)) {
    super(pos);    
    this.pos = this.pos.plus(new Vector(0.2, 0.1));
    this.size = new Vector(0.6, 0.6);
    this.posInit = new Vector(this.pos.x, this.pos.y);
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * Math.PI * 2;
  }

  get type() {
    return 'coin';
  }

  updateSpring(time = 1) {
    this.spring += this.springSpeed * time;
  }

  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist);
  }

  getNextPosition(time = 1) {
    this.updateSpring(time);
    return this.posInit.plus(this.getSpringVector());
  }

  act(time) {
    this.pos = this.getNextPosition(time);
  }
}


class Player extends Actor {
  constructor(pos = new Vector(1, 1)) {
    super(new Vector(pos.x, pos.y - 0.5), new Vector(0.8, 1.5), new Vector(0, 0));
  }

  get type() {
    return 'player';
  }
}

loadLevels()
  .then((result) => {
    const schema = JSON.parse(result);  
    const actorDict = {
      '@': Player,
      '|': VerticalFireball,
      'o': Coin,
      '=': HorizontalFireball,
      'v': FireRain
    };
    const parser = new LevelParser(actorDict);    
    runGame(schema, parser, DOMDisplay)
      .then(() => alert('Вы выиграли приз!'));
});



