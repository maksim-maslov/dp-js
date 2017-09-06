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


    // Дальнейшую логику нужно сократить.
    // Алгоритм следующий: если переданный объект выше, ниже, левее или правее, то они не пересекается

    // if (actor.left > this.right || actor.right < this.left || actor.top > this.bottom || actor.bottom < this.top) {
    //  return false;
    // }

    // // if ((actor.left === this.right) || (actor.top === this.bottom) || (actor.right === this.left) || (actor.bottom === this.top)) {
    // //   return false;
    // // }


    if (actor.left >= this.right || actor.right <= this.left || actor.top >= this.bottom || actor.bottom <= this.top) {
      return false;
    }
    // исправлено

    if ((actor.size.x < 0) || (actor.size.y < 0)) {
      return false;
    }

    if (actor.left >= this.left && actor.top >= this.top && actor.right <= this.right && actor.bottom <= this.bottom) {
      return true;
    }

    if (actor.left < this.right) {
      if (actor.top < this.bottom || actor.bottom > this.top) {
        return true;
      }
    }

    if (actor.right > this.left) {
      if (actor.top < this.bottom || actor.bottom > this.top) {
        return true;
      }
    }

    if (actor.top < this.bottom) {
      if (actor.left < this.right || actor.right > this.left) {
        return true;
      }
    }

    if (actor.bottom > this.top) {
      if (actor.left < this.right || actor.right > this.left) {
        return true;
      }
    }
  }
}

class Level {
  constructor(grid = [], actors = []) {
    

    // тут нужно создать копии массивов, чтобы поля объекта нельзя было изменить из вне

    // this.grid = grid;
    // this.actors = actors;


    this.grid = grid.slice();
    this.actors = actors.slice();
    // исправлено


    // тут нлучше исопльзовать метод find

    // for (const item of actors) {
    //   if (item.type === 'player') {
    //     this.player = item;
    //     break;
    //   }
    // }


    this.player = actors.find(function(el) {
      return el.type === 'player';
    });
    // исправлено


    this.height = grid.length;


    // тут лучше Math.max + map

    this.width = 0;
    // if (grid.length !== 0) {
    //   for (const gridRow of this.grid) {
    //     if (typeof gridRow !== 'undefined') {
    //       this.width = grid[0].length;
    //     }
    //   }
    // }


    if (grid.length !== 0) {
      this.width = Math.max.apply(Math, grid.map(function(el) {
        return el.length;
      }));
    }
    // исправлено


    this.status = null;
    this.finishDelay = 1;
  }



  isFinished() {


    // если выражение в if равно true или false то if обычно лучше не писать
    // достаточно return <expr>

    // if ((this.status !== null) && (this.finishDelay < 0)) {
    //   return true;
    // }
    // return false;


    return ((this.status !== null) && (this.finishDelay < 0));
    // исправлено
  }

  actorAt(actor) {
    if (!(actor instanceof Actor) || typeof actor === 'undefined') {
      throw new Error('В метод actorAt можно передавать только объект типа Actor');
    }


    // конструкторе это поле обязательно запоняется
    // if (typeof this.grid === 'undefined') {
    //   return undefined;
    // }

    // исправлено


    // зачем эта проверка?
    // if (this.actors.length === 1) {
    //   return undefined;
    // }

    // исправлено


    // здесь достаточно return + .find

    // for (const item of this.actors) {
    //   if (actor.isIntersect(item)) {
    //     return item;
    //   }
    // }


    return this.actors.find(function(el) {
      return actor.isIntersect(el);
    });
    // исправлено


    return undefined;
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


            // здесь можно просто if (this.grid[row][cell])
            // а ещё лучше записать в this.grid[row][cell] в переменную

        // if (typeof this.grid[row][cell] !== 'undefined') {
        //   return this.grid[row][cell];
        // }


        result = this.grid[row][cell];            
        if (result) {
          return result;
        }
        // исправлено

      }
    }


    return undefined;
  }

  removeActor(actor) {
    const indexActor = this.actors.indexOf(actor);


    // лучше использовать === и !==

    // if (indexActor != -1) {
    //   this.actors.splice(indexActor, 1);
    // }


    if (indexActor !== -1) {
      this.actors.splice(indexActor, 1);
    }
    // исправлено

  }

  noMoreActors(type) {
    // здесь лучше подойдёт метод some
    for (const item of this.actors) {
      if (item.type === type) {
        return false;
      }
    }

    return true;
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
  constructor(dictionary) {
    this.dictionary = dictionary;
  }

  actorFromSymbol(symbol) {
    // эти две проверки можно убрать и ничего не изменится
    // if (typeof symbol === 'undefined') {
    //   return undefined;
    // }

    if (typeof this.dictionary === 'undefined') {
      return undefined;
    }
    return this.dictionary[symbol];
  }

  obstacleFromSymbol(symbol) {


    // эту проверку можно убрать

    // if (typeof symbol === 'undefined') {
    //   return undefined;
    // }

    // исправлено


    if (symbol === 'x') {
      return 'wall';
    } else if (symbol === '!') {
      return 'lava';


    // else можно убрать
    } 
    // else {
    //   return undefined;
    // }


    return undefined;
    // исправлено


  }

  createGrid(stringSet) {


    // const grid = [];

    // // тут можно написать через reduce и map

    // for (let i = 0; i < stringSet.length; i++) {
    //  const symbolString = stringSet[i].split('');
    //   grid[i] = [];
    //   for (let symbol of symbolString) {
    //     // это дублирование логики obstacleFromSymbol
    //     if (symbol === 'x' || symbol === '!') {
    //       grid[i].push(this.obstacleFromSymbol(symbol));
    //     } else {
    //       grid[i].push(undefined);
    //     }
    //   }
    // }
    // return grid;


    return stringSet.map(function(el) {
      return el.split('').reduce(function(memo, el) {
        if (el === 'x') {
          memo.push('wall');
        } else if (el === '!') {
          memo.push('lava');
        } else {
          memo.push(undefined);
        }
        return memo;
      }, []);
    });

    // исправлено


  }

  createActors(stringSet) {
    const actors = [];
    // let c = 0;

    for (let i = 0; i < stringSet.length; i++) {
      const symbolString = stringSet[i].split('');
      for (let k = 0; k < symbolString.length; k++) {
        const symbol = symbolString[k];
        const actorConstructor = this.actorFromSymbol(symbol);
        if (typeof actorConstructor === 'function') {
          const actor = new actorConstructor();
          if (actor instanceof Actor) {


            // push

            // actors[c] = new actorConstructor();

            actors.push(new actorConstructor(new Vector(k, i)));
            // исправлено


            // позиция должна задаваться через конструктор

            // actors[c].pos = new Vector(k, i);            
            // c++;
            // исправлено


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
    // startPos более подходящее название поля
    // исправлено
    this.startPos = pos;
  }

  handleObstacle() {
    this.pos = this.startPos;
  }
}

class Coin extends Actor {
  constructor(pos = new Vector(1, 1)) {
    super(new Vector(pos.x + 0.2, pos.y + 0.1), new Vector(0.6, 0.6));
    // вроде бы лишнее поле
    // this.startPos = pos;
    // исправлено
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
    const springVector = this.getSpringVector();
    return new Vector(this.pos.x, this.pos.y + springVector.y * time);
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

// уровни должны загружаться из файла (см. описание заданияы)
// const schemas = [
//   [
//     '         ',
//     '         ',
//     '    =    ',
//     '       o ',
//     ' @   !xxx',
//     '         ',
//     'xxx!     ',
//     '         '
//   ],
//   [
//     '      v  ',
//     '    v    ',
//     '  v      ',
//     '        o',
//     '@       x',
//     '    x    ',
//     'x        ',
//     '         '
//   ],
//   [
//     "     v                 ",
//     "                       ",
//     "                       ",
//     "                       ",
//     "                       ",
//     "  |xxx       w         ",
//     "  o                 o  ",
//     "  x               = x  ",
//     "  x  @       o o    x  ",
//     "  x       *  xxxxx  x  ",
//     "  xxxxx             x  ",
//     "      x!!!!!!!!!!!!!x  ",
//     "      xxxxxxxxxxxxxxx  ",
//     "                       "
//   ],
//   [
//     "     v                 ",
//     "                       ",
//     "                       ",
//     "                       ",
//     "                       ",
//     "  |                    ",
//     "  o                 o  ",
//     "  x               = x  ",
//     "  x  @       o o    x  ",
//     "  x          xxxxx  x  ",
//     "  xxxxx             x  ",
//     "      x!!!!!!!!!!!!!x  ",
//     "      xxxxxxxxxxxxxxx  ",
//     "                       "
//   ],
//   [
//     "        |           |  ",
//     "                       ",
//     "                       ",
//     "                       ",
//     "                       ",
//     "                       ",
//     "                       ",
//     "                       ",
//     "                       ",
//     "     |                 ",
//     "                       ",
//     " @       =      |      ",
//     "   |  o            o   ",
//     "xxxxxxxxx!!!!!!!xxxxxxx",
//     "                       "
//   ],
//   [
//     "                       ",
//     "                       ",
//     "                       ",
//     "    o                  ",
//     "    x      | x!!x=     ",
//     "         x             ",
//     "                      x",
//     "                       ",
//     "                       ",
//     "                       ",
//     "               xxx     ",
//     "                       ",
//     "                       ",
//     "       xxx  |          ",
//     " @                     ",
//     "                       ",
//     "xxx                    ",
//     "                       "
//   ],
//   [
//     "   v         v",
//     "              ",
//     "         !o!  ",
//     "              ",
//     "              ",
//     "              ",
//     "              ",
//     "         xxx  ",
//     "          o   ",
//     "  @     =     ",
//     "              ",
//     "  xxxx        ",
//     "  |           ",
//     "      xxx    x",
//     "              ",
//     "          !   ",
//     "              ",
//     "              ",
//     " o       x    ",
//     " x      x     ",
//     "       x      ",
//     "      x       ",
//     "   xx         ",
//     "              "
//   ]
// ];
// const actorDict = {
//   '@': Player,
//   'v': VerticalFireball,
//   'o': Coin,
//   'h': HorizontalFireball,
//   'f': FireRain
// }
// const parser = new LevelParser(actorDict);
// runGame(schemas, parser, DOMDisplay)
//   .then(() => console.log('Вы выиграли приз!'));


loadLevels()
  .then(function(result) {
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
      .then(() => console.log('Вы выиграли приз!'));
});

// исправлено


