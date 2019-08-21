const WALL_COLOUR = "#000000"
const FLOOR_COLOUR = "#FFFFFF"
const PATH_COLOUR = "#8c1db5"
const GOAL_COLOUR = "#8c1db5"
const END_COLOUR = "#df03fc"

const MAZEGEN_PROB_OF_RANDOM = 0.1
const CELL_SIZE_TARGET = 45
const MAX_MAZE_DIMENSION = 20
const MAX_ACCEPTABLE_DIMENSION_PROPORTION = 1.3

const TAP_DURATION = 500 //milliseconds
const DEBOUNCE_DURATION = 5 //milliseconds

const COMPLETION_MESSAGES = [
	"Nice!",
	"Excellent!",
	"Awesome!",
	"Great!",
	"Fantastic!"
]


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

function pickRandom(arr, rng = Math.random) {
	return arr[Math.floor(rng() * arr.length)]
}

function round(value, decimals=0) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function getTotalOffset(e) {
	var totalOffsetX = 0;
	var totalOffsetY = 0;
	var currentElement = e.target;

	do {
	    totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
	    totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
	}
	while(currentElement = currentElement.offsetParent)

	return {x:totalOffsetX, y:totalOffsetY}
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
				ctx.fillRect(Math.round(x*CELL_WIDTH), Math.round(y*CELL_HEIGHT), Math.round((x+1)*CELL_WIDTH)-Math.round(x*CELL_WIDTH), 1)
			}
			if (this.cells[x][y] & DIRS["S"]) {
				ctx.fillRect(Math.round(x*CELL_WIDTH), Math.round((y+1)*CELL_HEIGHT -1), Math.round((x+1)*CELL_WIDTH)-Math.round(x*CELL_WIDTH), 1)
			}
			if (this.cells[x][y] & DIRS["W"]) {
				ctx.fillRect(Math.round(x*CELL_WIDTH), Math.round(y*CELL_HEIGHT), 1, Math.round((y+1)*CELL_HEIGHT)-Math.round(y*CELL_HEIGHT))
			}
			if (this.cells[x][y] & DIRS["E"]) {
				ctx.fillRect(Math.round((x+1)*CELL_WIDTH -1), Math.round(y*CELL_HEIGHT), 1, Math.round((y+1)*CELL_HEIGHT)-Math.round(y*CELL_HEIGHT))
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
Game.state = ""
Game.states = {}
Game.clickStartTime = Date.now()
Game.clickStartX = 0
Game.clickStartY = 0

Game.newMaze = function() {
	var width = Math.floor(this.canvas.width/CELL_SIZE_TARGET)
	var height = Math.floor(this.canvas.height/CELL_SIZE_TARGET)

	if (width > height && width > MAX_MAZE_DIMENSION) {
		width = MAX_MAZE_DIMENSION
		var csize = this.canvas.width / width
		height = Math.floor(this.canvas.height/csize)
	}
	if (height > width && height > MAX_MAZE_DIMENSION) {
		height = MAX_MAZE_DIMENSION
		var csize = this.canvas.height / height
		width = Math.floor(this.canvas.width/csize)
	}

	this.maze = new Maze(width, height)
	this.mazeDrawn = false
	this.path = [[0,0]]
}

Game.update = function() {
	// var now = Date.now()
	this.states[this.state].update(this)
}

Game.registerState = function(name, enterFunction, updateFunction, leaveFunction) {
	//allow null in place of a function
	if (enterFunction === null) {
		enterFunction = function(thisRef) {}
	}
	if (updateFunction === null) {
		updateFunction = function(thisRef) {}
	} 
	if (leaveFunction === null) {
		leaveFunction = function(thisRef) {}
	}
	//check for duplicates
	if (this.states[name] !== undefined) {
		throw new Error("State " + name + "already exists")
		return false
	}
	//actually register the state
	this.states[name] = {enter:enterFunction, update:updateFunction, leave:leaveFunction}
	return true
}

Game.changeState = function(newState) {
	console.log(this.state + "->" + newState)

	if (this.states[name] === undefined) {
		throw new Error("State " + newState + "does not exist")
		return false
	}
	this.states[this.state].leave(this)
	this.states[newState].enter(this)
	this.state = newState
	this.lastChangedState = Date.now()
	return true
}

Game.draw = function() {
	if (resizeCanvasToDisplaySize(Game.canvas)) {
		this.resize()
	}

	if (this.state == "maze" || this.state == "mazeComplete") {
		if (!this.mazeDrawn) {
			this.maze.draw(this.mazeCanvas)
			this.mazeDrawn = true
		}

		this.CELL_WIDTH = this.canvas.width/this.maze.width;
		this.CELL_HEIGHT = this.canvas.height/this.maze.height;
		this.CELL_SIZE = Math.min(this.CELL_WIDTH, this.CELL_HEIGHT)

		var ctx = this.canvas.getContext("2d")
		ctx.drawImage(this.mazeCanvas, 0, 0)

		ctx.strokeStyle = GOAL_COLOUR
		ctx.lineWidth = this.CELL_SIZE/5
		ctx.beginPath()
		ctx.arc(this.goalX*this.CELL_WIDTH + this.CELL_WIDTH/2, this.goalY*this.CELL_HEIGHT + this.CELL_HEIGHT/2, this.CELL_SIZE/3, 0, 2*Math.PI)
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
		ctx.arc(this.path[0][0]*this.CELL_WIDTH+this.CELL_WIDTH/2, this.path[0][1]*this.CELL_HEIGHT+this.CELL_HEIGHT/2, this.CELL_SIZE/3.1, 0, 2*Math.PI)
		ctx.fill()
		ctx.closePath()

		ctx.fillStyle = END_COLOUR
		var lastPath = this.path[this.path.length-1]
		ctx.beginPath()
		ctx.arc(lastPath[0]*this.CELL_WIDTH + this.CELL_WIDTH/2, lastPath[1]*this.CELL_HEIGHT + this.CELL_HEIGHT/2, this.CELL_SIZE/3, 0, 2*Math.PI)
		ctx.fill()
		ctx.closePath()

		if (this.state == "mazeComplete") {
			ctx.strokeStyle = GOAL_COLOUR
			ctx.fillStyle = FLOOR_COLOUR

			var elapsedSeconds = (Date.now() - this.lastChangedState)/1000

			var canvasDiag = Math.sqrt(this.canvas.height*this.canvas.height + this.canvas.width*this.canvas.width)
			var sizeAdd = canvasDiag * elapsedSeconds * elapsedSeconds * 2
			var sizeFactor = (sizeAdd / (this.CELL_SIZE)) + 1;

			ctx.lineWidth = sizeFactor*Math.min(this.CELL_WIDTH/5, this.CELL_HEIGHT/5)
			ctx.beginPath()
			ctx.arc(this.goalX*this.CELL_WIDTH + this.CELL_WIDTH/2, this.goalY*this.CELL_HEIGHT + this.CELL_HEIGHT/2, sizeAdd + this.CELL_SIZE/3, 0, 2*Math.PI)
			ctx.stroke()
			ctx.fill()
			ctx.closePath()
		}
		else {
			var fadeInAlpha = 1.0-((Date.now()-this.lastChangedState)/250)
			if (fadeInAlpha>0) {
				ctx.fillStyle = FLOOR_COLOUR
				ctx.globalAlpha = fadeInAlpha
				ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
				ctx.globalAlpha = 1.0
			}
		}
	}
}

Game.tap = function(x, y) {
	if (this.state == "maze") {
		var cellX = Math.floor(x/this.CELL_WIDTH)
		var cellY = Math.floor(y/this.CELL_HEIGHT)

		for (var i=0; i<this.path.length; i++) {
			if (cellX == this.path[i][0] && cellY == this.path[i][1]) {
				this.path.splice(i+1, this.path.length) //cut off the rest of the path
			}
		}
	}
}

Game.mousedown = function(x, y) {
	this.clickStartTime = Date.now()
	this.clickStartX = x
	this.clickStartY = y

	var cellX = Math.floor(x/this.CELL_WIDTH)
	var cellY = Math.floor(y/this.CELL_HEIGHT)

	var lastPath = this.path[this.path.length-1]

	if (cellX == lastPath[0] && cellY == lastPath[1]) {
		this.dragging = true
	}
}

Game.mouseup = function(x, y) {
	this.dragging = false
	var tapDuration = Date.now()-this.clickStartTime
	if (tapDuration < TAP_DURATION && tapDuration > DEBOUNCE_DURATION) {
		var cellX = Math.floor(x/this.CELL_WIDTH)
		var cellY = Math.floor(y/this.CELL_HEIGHT)
		var startCellX = Math.floor(this.clickStartX/this.CELL_WIDTH)
		var startCellY = Math.floor(this.clickStartY/this.CELL_HEIGHT)
		if (cellX == startCellX && cellY == startCellY) {
			this.tap(x, y)
		}
	}
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

Game.resize = function() { //TODO: make this detect if it's actually an orientation change???
	resizeCanvasToDisplaySize(this.canvas)
	this.mazeCanvas.width = this.canvas.width
	this.mazeCanvas.height = this.canvas.height
	this.mazeDrawn = false

	if (this.maze !== undefined) {
		this.CELL_WIDTH = this.canvas.width/this.maze.width;
		this.CELL_HEIGHT = this.canvas.height/this.maze.height;
		if (this.CELL_WIDTH/this.CELL_HEIGHT > MAX_ACCEPTABLE_DIMENSION_PROPORTION || this.CELL_HEIGHT/this.CELL_WIDTH > MAX_ACCEPTABLE_DIMENSION_PROPORTION) {
			this.changeState("startup") //restart, it's gonna look horrible
		}
	}
}


/***************/
/* GAME STATES */
/***************/

Game.registerState("",
	null,
	null,
	null)

Game.registerState("startup", 
	null,
	function(thisRef) {
		thisRef.resize()
		thisRef.changeState("maze")
	},
	null)

Game.registerState("maze", 
	function(thisRef) {
		thisRef.newMaze()
		thisRef.mazeStartedTime = Date.now()

		thisRef.goalX = thisRef.maze.width-1
		thisRef.goalY = thisRef.maze.height-1
	},
	function(thisRef) {
		var lastPath = thisRef.path[thisRef.path.length-1]
		if (lastPath[0] == thisRef.goalX && lastPath[1] == thisRef.goalY) {
			thisRef.changeState("mazeComplete")
		}
	},
	null)

Game.registerState("mazeComplete",
	null,
	function(thisRef) {
		var now = Date.now()
		if (now - thisRef.lastChangedState > 1000) {
			thisRef.mazeTimeTaken = now - thisRef.mazeStartedTime
			thisRef.changeState("showScore")
		}
	},
	null)

Game.registerState("showScore",
	function(thisRef) {
		$(".showScore").fadeIn()
		$("#congratsSpan").html(pickRandom(COMPLETION_MESSAGES))
		$("#scoreSpan1").html("Finished in")
		$("#scoreNumberSpan").html(round(thisRef.mazeTimeTaken/1000, 1))
		$("#scoreSpan2").html("seconds")
	},
	null,
	null)


/********************/
/* LET'S GET GAMING */
/********************/

Game.canvas = document.getElementById("mainCanvas")
Game.mazeCanvas = document.createElement("canvas")
Game.changeState("startup")
Game.update()

setInterval(function() {Game.update()}, 1000/60)
setInterval(function() {Game.draw()}, 1000/60)

Game.canvas.addEventListener("touchstart", function(e) {var offset=getTotalOffset(e); Game.mousedown(e.changedTouches[0].clientX - offset.x, e.changedTouches[0].clientY - offset.y);})
Game.canvas.addEventListener("touchmove",  function(e) {var offset=getTotalOffset(e); Game.mousemove(e.changedTouches[0].clientX - offset.x, e.changedTouches[0].clientY - offset.y);})
Game.canvas.addEventListener("touchend",   function(e) {var offset=getTotalOffset(e); Game.mouseup  (e.changedTouches[0].clientX - offset.x, e.changedTouches[0].clientY - offset.y);})
Game.canvas.addEventListener("mousedown",  function(e) {var offset=getTotalOffset(e); Game.mousedown(e.clientX - offset.x, e.clientY - offset.y)})
Game.canvas.addEventListener("mousemove",  function(e) {var offset=getTotalOffset(e); Game.mousemove(e.clientX - offset.x, e.clientY - offset.y)})
Game.canvas.addEventListener("mouseup",    function(e) {var offset=getTotalOffset(e); Game.mouseup  (e.clientX - offset.x, e.clientY - offset.y)})
Game.canvas.addEventListener("resize", function(e) {Game.resize()})
