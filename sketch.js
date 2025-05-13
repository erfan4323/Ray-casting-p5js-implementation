const TILE_SIZE = 64;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE; 

const FOV_ANGLE = 60 * (Math.PI / 180);
const WALL_STRIP_WIDTH = 1;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

const MINI_MAP_SCALE_FACTOR = 0.2;

class Map {
  constructor() {
    this.grid = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
        [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1],
        [1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 7, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];
  }

  render() {
    for (var i = 0; i < MAP_NUM_ROWS; i++) {
      for (var j = 0; j < MAP_NUM_COLS; j++) {
        var tileX = j * TILE_SIZE;
        var tileY = i * TILE_SIZE;
        var tileColor = this.grid[i][j] >= 1 ? "#222" : "#fff"
        stroke("#222")
        fill(tileColor);
        rect(
          MINI_MAP_SCALE_FACTOR * tileX,
          MINI_MAP_SCALE_FACTOR * tileY,
          MINI_MAP_SCALE_FACTOR * TILE_SIZE,
          MINI_MAP_SCALE_FACTOR * TILE_SIZE
        );
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

  gridPointValue(x, y) {
    if (x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT) 
      return 0;

    var gridX = Math.floor(x / TILE_SIZE);
    var gridY = Math.floor(y / TILE_SIZE);
    return this.grid[gridY][gridX];
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
    circle(
      MINI_MAP_SCALE_FACTOR * this.x,
      MINI_MAP_SCALE_FACTOR * this.y,
      MINI_MAP_SCALE_FACTOR * this.radius
    );
    stroke("red");
    line(
      MINI_MAP_SCALE_FACTOR * this.x,
      MINI_MAP_SCALE_FACTOR * this.y,
      MINI_MAP_SCALE_FACTOR * (this.x + Math.cos(this.rotationAngle) * 30),
      MINI_MAP_SCALE_FACTOR * (this.y + Math.sin(this.rotationAngle) * 30)
    ); 
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
    this.wasHitVertical = false;

    this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
    this.isRayFacingUP = !this.isRayFacingDown;
    
    this.isRayFacingRight = this.rayAngle > (Math.PI * 1.5) || this.rayAngle < (Math.PI * 0.5);
    this.isRayFacingLeft = !this.isRayFacingRight;
  }
  
  render() {
    stroke("rgba(0, 0, 255, 0.3)");
    line(
      MINI_MAP_SCALE_FACTOR * player.x,
      MINI_MAP_SCALE_FACTOR * player.y,
      MINI_MAP_SCALE_FACTOR * this.wallHitX,
      MINI_MAP_SCALE_FACTOR * this.wallHitY
      );
  }

  cast() {
    var xIntercept, yIntercetpt;
    var xStep, yStep;
    
    ///////////////////////////////////////////
    // HORIZANTAL RAY-GRID INTERSECTION CODE///
    //////////////////////////////////////////
    var foundHorzWallHit = false;
    var hWallHitX = 0;
    var hWallHitY = 0;
    
    yIntercetpt = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
    yIntercetpt += this.isRayFacingDown ? TILE_SIZE : 0;
    
    xIntercept = player.x + (yIntercetpt - player.y) / Math.tan(this.rayAngle);

    yStep = TILE_SIZE;
    yStep *= this.isRayFacingUP ? -1 : +1;
    
    xStep = TILE_SIZE / Math.tan(this.rayAngle);
    xStep *= (this.isRayFacingLeft && xStep > 0) ? -1 : +1;
    xStep *= (this.isRayFacingRight && xStep < 0) ? -1 : +1;

    var nextHorzTouchX = xIntercept;
    var nextHorzTouchY = yIntercetpt;

    // if (this.isRayFacingUP)
    //   nextHorzTouchY--;

    while (nextHorzTouchX >= 0 && nextHorzTouchX <= WINDOW_WIDTH &&
           nextHorzTouchY >= 0 && nextHorzTouchY <= WINDOW_HEIGHT) {
      if (grid.isNotInWalls(nextHorzTouchX, nextHorzTouchY - (this.isRayFacingUP ? 1 : 0))) {
        foundHorzWallHit = true;
        hWallHitX = nextHorzTouchX;
        hWallHitY = nextHorzTouchY;
        break;
      }
      else {
        nextHorzTouchX += xStep;
        nextHorzTouchY += yStep;
      }
    }
    
    ///////////////////////////////////////////
    /// VERTICAL RAY-GRID INTERSECTION CODE////
    //////////////////////////////////////////
    var foundVertWallHit = false;
    var vWallHitX = 0;
    var vWallHitY = 0;
    
    xIntercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
    xIntercept += this.isRayFacingRight ? TILE_SIZE : 0;
    
    yIntercetpt = player.y + (xIntercept - player.x) * Math.tan(this.rayAngle);

    xStep = TILE_SIZE;
    xStep *= this.isRayFacingLeft ? -1 : +1;
    
    yStep = TILE_SIZE * Math.tan(this.rayAngle);
    yStep *= (this.isRayFacingUP && yStep > 0) ? -1 : +1;
    yStep *= (this.isRayFacingDown && yStep < 0) ? -1 : +1;

    var nextVertTouchX = xIntercept;
    var nextVertTouchY = yIntercetpt;

    // if (this.isRayFacingLeft)
    //   nextVertTouchX--;

    while (nextVertTouchX >= 0 && nextVertTouchX <= WINDOW_WIDTH &&
           nextVertTouchY >= 0 && nextVertTouchY <= WINDOW_HEIGHT) {
      if (grid.isNotInWalls(nextVertTouchX - (this.isRayFacingLeft ? 1 : 0), nextVertTouchY)) {
        foundVertWallHit = true;
        vWallHitX = nextVertTouchX;
        vWallHitY = nextVertTouchY;
        break;
      }
      else {
        nextVertTouchX += xStep;
        nextVertTouchY += yStep;
      }
    }
    ///////////////////////////////////////////
    //// CALCULATE THE SMALLEST VALUE ////////
    //////////////////////////////////////////
    var horzHitDistance = (foundHorzWallHit)
      ? distBetweenPoints(player.x, player.y, hWallHitX, hWallHitY)
      : Number.MAX_VALUE;
    var vertHitDistance = (foundVertWallHit)
      ? distBetweenPoints(player.x, player.y, vWallHitX, vWallHitY)
      : Number.MAX_VALUE;

    var isHorzLessThanVert = (horzHitDistance < vertHitDistance);
    this.wallHitX = isHorzLessThanVert ? hWallHitX : vWallHitX;
    this.wallHitY = isHorzLessThanVert ? hWallHitY : vWallHitY;
    this.distance = isHorzLessThanVert ? horzHitDistance : vertHitDistance;
    this.wasHitVertical = !isHorzLessThanVert;
  }
}

var grid = new Map();
var player = new Player();
var rays = [];


function keyPressed() {
  if (keyCode == UP_ARROW) {
    player.walkDirection = +1;    
  }
  else if (keyCode == DOWN_ARROW) {
    player.walkDirection = -1;    
  }
  else if (keyCode == RIGHT_ARROW) {
    player.turnDirection = +1;
  }
  else if (keyCode == LEFT_ARROW) {
    player.turnDirection = -1;
  }
}

function keyReleased() {
  if (keyCode == UP_ARROW) {
    player.walkDirection = 0;    
  }
  else if (keyCode == DOWN_ARROW) {
    player.walkDirection = 0;    
  }
  else if (keyCode == RIGHT_ARROW) {
    player.turnDirection = 0;
  }
  else if (keyCode == LEFT_ARROW) {
    player.turnDirection = 0;
  }
}

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

function render3DProjectedWalls() {
  for (var i = 0; i < NUM_RAYS; i++) {
    var ray = rays[i];
    var rayDistance = ray.distance * Math.cos(ray.rayAngle - player.rotationAngle);
    var distanceProjectionPlane = (WINDOW_WIDTH / 2) / Math.tan(FOV_ANGLE / 2);

    var wallStripHeight = (TILE_SIZE / rayDistance) * distanceProjectionPlane;

    var wallAlpha = 170 / rayDistance;
    var colorIntensity = ray.wasHitVertical ? 255 : 180;
    var wallColor = "rgba("+ colorIntensity +", "+ colorIntensity +", "+ colorIntensity +", "+ wallAlpha +")";
    const xOffset = ray.wasHitVertical
      ? (ray.isRayFacingLeft ? -1 : +1)
      : 0;
    const yOffset = !ray.wasHitVertical
      ? (ray.isRayFacingUP ? -1 : +1)
      : 0;

    const wallType = grid.gridPointValue(
      ray.wallHitX + xOffset,
      ray.wallHitY + yOffset
    );
    switch (wallType) {
      case 2:      
        wallColor = "rgba("+ colorIntensity +", 0, "+ colorIntensity +", "+ wallAlpha +")";
        break;
      case 3:
        wallColor = "rgba("+ colorIntensity +", "+ colorIntensity +", 0, "+ wallAlpha +")";
        break;
      case 4:
        wallColor = "rgba(0, "+ colorIntensity +", "+ colorIntensity +", "+ wallAlpha +")";
        break;
      case 5:
        wallColor = "rgba(0, 0, "+ colorIntensity +", "+ wallAlpha +")";        
        break;
      case 6: 
        wallColor = "rgba("+ colorIntensity +", 0, 0, "+ wallAlpha +")";        
        break;
      case 7:
        wallColor = "rgba(0, "+ colorIntensity +", 0, "+ wallAlpha +")";        
        break;
      default:
        break;
    }
    fill(wallColor);
    noStroke();
    rect(
      i * WALL_STRIP_WIDTH,
      (WINDOW_HEIGHT / 2) - (wallStripHeight / 2),
      WALL_STRIP_WIDTH,
      wallStripHeight
    );
  }    
}

function normalizeAngle(angle) {
  angle %= (2 * Math.PI);
  if (angle < 0)
    angle += (2 * Math.PI);
  return angle;
}

function castAllRays() {
  // starting ray position by subtracting half of the FOV
  var rayAngle = player.rotationAngle - FOV_ANGLE / 2;

  rays = [];
  for (var i = 0; i < NUM_RAYS; i++) {
    var ray = new Ray(rayAngle);
    ray.cast();
    rays.push(ray);

    rayAngle += FOV_ANGLE / NUM_RAYS;
  }
}

function distBetweenPoints(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
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
  background(100);
  render3DProjectedWalls();
  grid.render();
  for (ray of rays) {
    ray.render();
  }
  player.render();
}
