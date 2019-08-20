const WALL_COLOUR = "#000000"
const FLOOR_COLOUR = "#FFFFFF"
const PATH_COLOUR = "#8c1db5"
const GOAL_COLOUR = "#8c1db5"
const END_COLOUR = "#df03fc"

const MAZEGEN_PROB_OF_RANDOM = 0.2
const DIRNAMES = ["N", "E", "S", "W"]
const DIRS = {
	"N":0b0001, 
	"E":0b0010, 
	"S":0b0100, 
	"W":0b1000
}
const INVDIRS = {
	"N":0b0100, 
	"E":0b1000, 
	"S":0b0001, 
	"W":0b0010
}
const DX = {
	"N":0, 
	"E":1, 
	"S":0, 
	"W":-1
}
const DY = {
	"N":-1, 
	"E":0, 
	"S":1, 
	"W":0
}

function shuffled(l, rng = Math.random) {
    n = []
    li = [].concat(l)
    for (var i=0; i<l.length; i+=1) {
    	n.push(li.splice(Math.floor(rng()*li.length),1)[0])
    }
    return n
}

function resizeCanvasToDisplaySize(canvas) {
   // look up the size the canvas is being displayed
   const width = canvas.clientWidth;
   const height = canvas.clientHeight;

   // If it's resolution does not match change it
   if (canvas.width !== width || canvas.height !== height) {
     canvas.width = width;
     canvas.height = height;
     return true;
   }

   return false;
}

/**************************/
/* MAZE OBJECT DEFINITION */
/**************************/ 

Maze = function(width, height, rng=Math.random) {
	this.width = width
	this.height = height
	this.rng = rng

	this.cells = []
	this.visited = []

	this.generated = false

	var cellsCol, visitedCol;
	for (var x=0; x<this.width; x++) {
		cellsCol = []
		visitedCol = []
		for (var y=0; y<this.height; y++) {
			cellsCol.push(0b1111)
			visitedCol.push(false)
		}
		this.cells.push(cellsCol)
		this.visited.push(visitedCol)
	}

	this.cellList = []

	this.generate()
}

Maze.prototype.delWall = function(x, y, dir) {
	this.cells[x][y] &= ~DIRS[dir]
	this.cells[ x+DX[dir] ][ y+DY[dir] ] &= ~INVDIRS[dir]
}

Maze.prototype.isInMap = function(x,y) {
	return (x>=0)&&(y>=0)&&(x<this.width)&&(y<this.height)
}

Maze.prototype.listOpenAdjacents = function(x,y) {
	result = []
	for (var i=0; i<DIRNAMES.length; i++) { 
		dir = DIRNAMES[i]
		if (!(this.cells[x][y] & DIRS[dir])) {
			result.push([x+DX[dir], y+DY[dir]])
		}
	}
	return result
}

Maze.prototype.startGen = function() {
	this.startX = Math.floor(this.rng() * this.width)
	this.startY = Math.floor(this.rng() * this.height)

	this.cellList = [[this.startX, this.startY]]
	this.visited[this.startX][this.startY] = true
}

Maze.prototype.genStep = function() {
	if (this.cellList.length>0) {
		if (this.rng()<MAZEGEN_PROB_OF_RANDOM) {
			var index = Math.floor(this.rng()*this.cellList.length)
		} else {
			var index = this.cellList.length-1
		}
		var cell = this.cellList[index]

		var dnames = shuffled(DIRNAMES, this.rng)
		var foundWall = false
		for (var i = 0; i < dnames.length; i++) {
			var neighbour = [cell[0]+DX[dnames[i]], cell[1]+DY[dnames[i]]] //this.getNeighbourCoords(cell[0], cell[1], dnames[i])
			if (this.isInMap(neighbour[0], neighbour[1]) && !this.visited[neighbour[0]][neighbour[1]]) {
				this.delWall(cell[0], cell[1], dnames[i])
				this.cellList.push(neighbour)
				this.visited[neighbour[0]][neighbour[1]] = true
				foundWall = true
				break
			}
		}
		if (!foundWall) {
			this.cellList.splice(index, 1)
		}
		return false;
	} else {
		this.generated = true
		return true;
	}
}

Maze.prototype.generate = function() {
	this.startGen()
	var done;
	do {
		done = this.genStep()
	} while (!done)
}

Maze.prototype.draw = function(canvas) {
	var ctx=canvas.getContext("2d");

	var CELL_WIDTH = canvas.width/this.width;
	var CELL_HEIGHT = canvas.height/this.height;

	ctx.fillStyle = FLOOR_COLOUR
	ctx.fillRect(0, 0, canvas.width, canvas.height)

	ctx.fillStyle = WALL_COLOUR
	for (var x=0; x<this.width; x++) {
		for (var y=0; y<this.height; y++) {
			if (this.cells[x][y] & DIRS["N"]) {
				ctx.fillRect(Math.floor(x*CELL_WIDTH), Math.floor(y*CELL_HEIGHT), Math.floor(CELL_WIDTH), 1)
			}
			if (this.cells[x][y] & DIRS["S"]) {
				ctx.fillRect(Math.floor(x*CELL_WIDTH), Math.floor(y*CELL_HEIGHT + CELL_HEIGHT-1), Math.floor(CELL_WIDTH), 1)
			}
			if (this.cells[x][y] & DIRS["W"]) {
				ctx.fillRect(Math.floor(x*CELL_WIDTH), Math.floor(y*CELL_HEIGHT), 1, Math.floor(CELL_HEIGHT))
			}
			if (this.cells[x][y] & DIRS["E"]) {
				ctx.fillRect(Math.floor(x*CELL_WIDTH + CELL_WIDTH-1), Math.floor(y*CELL_HEIGHT), 1, Math.floor(CELL_HEIGHT))
			}
		}
	}
}


/******************/
/* GAME FUNCTIONS */
/******************/

Game = {}
Game.path = [[0,0]]
Game.mazeDrawn = false
Game.dragging = false
Game.state = "maze"

Game.update = function() {
	if (this.state == "maze") {
		this.goalX = this.maze.width-1
		this.goalY = this.maze.height-1
		var lastPath = this.path[this.path.length-1]
		if (lastPath[0] == this.goalX && lastPath[1] == this.goalY) {
			this.state = "transition1"
			this.transitionStartTime = Date.now()
		}
	}
	if (this.state == "transition1") {
		if (Date.now() - this.transitionStartTime > 1000) {
			this.maze = new Maze(this.maze.width, this.maze.height)
			this.mazeDrawn = false
			this.path = [[0,0]]
			this.state = "maze"
			this.transitionStartTime = Date.now()
		}
	}
}

Game.draw = function() {
	if (this.state == "maze" || this.state == "transition1" || this.state == "transition2") {
		if (!this.mazeDrawn) {
			this.maze.draw(this.mazeCanvas)
			this.mazeDrawn = true
		}

		this.CELL_WIDTH = this.canvas.width/this.maze.width;
		this.CELL_HEIGHT = this.canvas.height/this.maze.height;

		var ctx = this.canvas.getContext("2d")
		ctx.drawImage(this.mazeCanvas, 0, 0)

		ctx.strokeStyle = GOAL_COLOUR
		ctx.lineWidth = Math.min(this.CELL_WIDTH/5, this.CELL_HEIGHT/5)
		ctx.beginPath()
		ctx.arc(this.goalX*this.CELL_WIDTH + this.CELL_WIDTH/2, this.goalY*this.CELL_HEIGHT + this.CELL_HEIGHT/2, this.CELL_WIDTH/3, 0, 2*Math.PI)
		ctx.stroke()
		ctx.closePath()

		if (Game.path.length > 1) {
			ctx.strokeStyle = PATH_COLOUR
			ctx.lineWidth = Math.min(this.CELL_WIDTH/3, this.CELL_HEIGHT/3)
			ctx.beginPath()
			ctx.moveTo(Game.path[0][0]*this.CELL_WIDTH + this.CELL_WIDTH/2, Game.path[0][1]*this.CELL_HEIGHT + this.CELL_HEIGHT/2)
			for (var i=0; i<Game.path.length; i++) {
				ctx.lineTo(Game.path[i][0]*this.CELL_WIDTH + this.CELL_WIDTH/2, Game.path[i][1]*this.CELL_HEIGHT + this.CELL_HEIGHT/2)
			}
			ctx.stroke()
			ctx.closePath()
		}

		ctx.fillStyle = PATH_COLOUR
		ctx.beginPath()
		ctx.arc(this.CELL_WIDTH/2, this.CELL_HEIGHT/2, this.CELL_WIDTH/3.1, 0, 2*Math.PI)
		ctx.fill()
		ctx.closePath()

		ctx.fillStyle = END_COLOUR
		var lastPath = this.path[this.path.length-1]
		ctx.beginPath()
		ctx.arc(lastPath[0]*this.CELL_WIDTH + this.CELL_WIDTH/2, lastPath[1]*this.CELL_HEIGHT + this.CELL_HEIGHT/2, this.CELL_WIDTH/3, 0, 2*Math.PI)
		ctx.fill()
		ctx.closePath()

		if (this.state == "transition1") {
			ctx.strokeStyle = GOAL_COLOUR
			ctx.fillStyle = FLOOR_COLOUR

			var sizeAdd = this.canvas.height * ((Date.now() - this.transitionStartTime)/1000) * ((Date.now() - this.transitionStartTime)/1000) * 1.6
			var sizeFactor = (sizeAdd / (this.CELL_WIDTH/3)) + 1;

			ctx.lineWidth = Math.min(this.CELL_WIDTH/5, sizeFactor*this.CELL_HEIGHT/5)
			ctx.beginPath()
			ctx.arc(this.goalX*this.CELL_WIDTH + this.CELL_WIDTH/2, this.goalY*this.CELL_HEIGHT + this.CELL_HEIGHT/2, sizeAdd + this.CELL_WIDTH/3, 0, 2*Math.PI)
			ctx.stroke()
			ctx.fill()
			ctx.closePath()
		}
		else {
			var fadeInAlpha = 1.0-((Date.now()-this.transitionStartTime)/250)
			if (fadeInAlpha>0) {
				ctx.fillStyle = FLOOR_COLOUR
				ctx.globalAlpha = fadeInAlpha
				ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
				ctx.globalAlpha = 1.0
			}
		}
	}
}

Game.mousedown = function(x, y) {
	var cellX = Math.floor(x/this.CELL_WIDTH)
	var cellY = Math.floor(y/this.CELL_HEIGHT)

	var lastPath = this.path[this.path.length-1]

	if (cellX == lastPath[0] && cellY == lastPath[1]) {
		this.dragging = true
	}
}

Game.mouseup = function(x, y) {
	this.dragging = false
}

Game.mousemove = function(x, y) {
	var cellX = Math.floor(x/this.CELL_WIDTH)
	var cellY = Math.floor(y/this.CELL_HEIGHT)
	if (this.dragging) {
		var lastPath = this.path[this.path.length-1]

		if (cellX != lastPath[0] || cellY != lastPath[1]) { //we've moved!
			if (this.path.length >= 2) {
				var lastButOne = this.path[this.path.length-2]
				if (cellX == lastButOne[0] && cellY == lastButOne[1]) {
					this.path.splice(this.path.length-1, 1) //we've gone backwards, remove the last bit of the path
					// this.draw()
					return true
				}
			}
			var adjacents = this.maze.listOpenAdjacents(lastPath[0], lastPath[1])
			for (var i=0; i<adjacents.length; i++) {
				if (cellX == adjacents[i][0] && cellY == adjacents[i][1]) {
					//we've advanced! add it to the path
					this.path.push(adjacents[i])
					// this.draw()
					return true
				}
			}
		}
	}
}


/********************/
/* LET'S GET GAMING */
/********************/

const CELL_SIZE_TARGET = 50

Game.canvas = document.getElementById("mainCanvas")
resizeCanvasToDisplaySize(Game.canvas)
Game.mazeCanvas = document.createElement("canvas")
Game.mazeCanvas.width = Game.canvas.width
Game.mazeCanvas.height = Game.canvas.height
Game.maze = new Maze(Math.floor(Game.canvas.width/CELL_SIZE_TARGET), Math.floor(Game.canvas.height/CELL_SIZE_TARGET))
Game.update()

setInterval(function() {Game.update()}, 1000/60)
setInterval(function() {Game.draw()}, 1000/60)

Game.canvas.addEventListener("touchstart", function(e) {Game.mousedown(e.changedTouches[0].clientX, e.changedTouches[0].clientY)})
Game.canvas.addEventListener("touchend", function(e) {Game.mouseup(e.changedTouches[0].clientX, e.changedTouches[0].clientY)})
Game.canvas.addEventListener("touchmove", function(e) {Game.mousemove(e.changedTouches[0].clientX, e.changedTouches[0].clientY)})


