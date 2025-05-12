const TILE_SIZE = 32;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE; 

const FOV_ANGLE = 60 * (Math.PI / 180);
const WALL_STRIP_WIDTH = 30;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

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
      return true;

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
    fill("red");
    circle(this.x, this.y, this.radius);
    /* stroke("red");
    line(
      this.x,
      this.y,
      this.x + Math.cos(this.rotationAngle) * 30,
      this.y + Math.sin(this.rotationAngle) * 30
    ); */
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

class Ray {
  constructor(rayAngle) {
    this.rayAngle = normalizeAngle(rayAngle);    
    this.wallHitX = 0;
    this.wallHitY = 0;
    this.distance = 0;

    this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
    this.isRayFacingUP = !this.isRayFacingDown;
    
    this.isRayFacingRight = this.rayAngle > (Math.PI * 1.5) || this.rayAngle < (Math.PI * 0.5);
    this.isRayFacingLeft = !this.isRayFacingRight;
  }
  
  render() {
    stroke("rgba(0, 0, 255, 0.3)");
    line(
      player.x,
      player.y,
      player.x + Math.cos(this.rayAngle) * 30,
      player.y + Math.sin(this.rayAngle) * 30
      );
  }

  cast(columnId) {
    var xIntercept, yIntercetpt;
    var xStep, yStep;
    
    console.log("is ray facing right? ", this.isRayFacingRight);

    ///////////////////////////////////////////
    // HORIZANTAL RAY-GRID INTERSECTION CODE///
    //////////////////////////////////////////
    yIntercetpt = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
    yIntercetpt += this.isRayFacingDown ? TILE_SIZE : 0;
    
    xIntercept = player.x + (yIntercetpt - player.y) / Math.tan(this.rayAngle);

    yStep = TILE_SIZE;
    yStep *= this.isRayFacingUP ? -1 : +1;
    
    xStep = TILE_SIZE / Math.tan(this.rayAngle);
    xStep *= (this.isRayFacingLeft && xStep > 0) ? -1 : +1;
    xStep *= (this.isRayFacingRight && xStep < 0) ? -1 : +1;
  }
}

var grid = new Map();
var player = new Player();
var rays = [];

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

function normalizeAngle(angle) {
  angle %= (2 * Math.PI);
  if (angle < 0)
    angle += (2 * Math.PI);
  return angle;
}

function castAllRays() {
  var columsId = 0;

  // starting ray position by subtracting half of the FOV
  var rayAngle = player.rotationAngle - FOV_ANGLE / 2;

  rays = [];
  for (var i = 0; i < 1 /* NUM_RAYS */; i++) {
    var ray = new Ray(rayAngle);
    ray.cast(columsId);
    rays.push(ray);

    rayAngle += FOV_ANGLE / NUM_RAYS;
    columsId++;
  }
}

function setup() {
  createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update() {
    player.update();
    castAllRays();
}

function draw() {
  update();
  background(400);
  grid.render();
  for (ray of rays) {
    ray.render();
  }
  player.render();
}
