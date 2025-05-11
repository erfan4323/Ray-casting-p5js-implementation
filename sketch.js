const TILE_SIZE = 32;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE; 

class Map {
  constructor() {
    this.grid = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];
  }

  render() {
    for (var i = 0; i < MAP_NUM_ROWS; i++) {
      for (var j = 0; j < MAP_NUM_COLS; j++) {
        var tileX = j * TILE_SIZE;
        var tileY = i * TILE_SIZE;
        var tileColor = this.grid[i][j] == 1 ? "#222" : "#fff"
        stroke("#222")
        fill(tileColor);
        rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
      }
    }    
  }

  isNotInWalls(x, y) {
    if (x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT) 
      return;

    var gridX = Math.floor(x / TILE_SIZE);
    var gridY = Math.floor(y / TILE_SIZE);
    return this.grid[gridY][gridX] != 0;  
  }
}

class Player {
  constructor() {
    this.x = WINDOW_WIDTH / 2;
    this.y = WINDOW_HEIGHT / 2;
    this.radius = 7;
    this.turnDirection = 0; // -1 for left, +1 for right
    this.walkDirection = 0; // -1 for back, +1 for front
    this.rotationAngle = Math.PI / 2;
    this.moveSpeed = 2.0;
    this.rotationSpeed = 2 * (Math.PI / 180);
  }

  render() {
    noStroke();
    fill("red");
    circle(this.x, this.y, this.radius);
    stroke("red");
    line(
      this.x,
      this.y,
      this.x + Math.cos(this.rotationAngle) * 30,
      this.y + Math.sin(this.rotationAngle) * 30
    )
  }

  update() {
    this.rotationAngle += this.turnDirection * this.rotationSpeed;

    var moveStep = this.walkDirection * this.moveSpeed;
    var newPosX = this.x + Math.cos(this.rotationAngle) * moveStep;
    var newPosY = this.y + Math.sin(this.rotationAngle) * moveStep;

    if (!grid.isNotInWalls(newPosX, newPosY)) {
      this.x = newPosX;
      this.y = newPosY;
    }
  }
}

var grid = new Map();
var player = new Player();

function keyPressed() {
  if (keyCode == UP_ARROW) {
    player.walkDirection = +1;    
  }
  if (keyCode == DOWN_ARROW) {
    player.walkDirection = -1;    
  }
  if (keyCode == RIGHT_ARROW) {
    player.turnDirection = +1;
  }
  if (keyCode == LEFT_ARROW) {
    player.turnDirection = -1;
  }
}

function keyReleased() {
  player.walkDirection = 0;
  player.turnDirection = 0;
  if (keyCode == UP_ARROW) {
    player.walkDirection = 0;    
  }
  if (keyCode == DOWN_ARROW) {
    player.walkDirection = 0;    
  }
  if (keyCode == RIGHT_ARROW) {
    player.turnDirection = 0;
  }
  if (keyCode == LEFT_ARROW) {
    player.turnDirection = 0;
  }
}

function setup() {
  createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update() {
    player.update();
}

function draw() {
  update();
  background(400);
  grid.render();
  player.render();
}
