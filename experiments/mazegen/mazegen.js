function randomString(len, rng = Math.random) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i=0; i<len; i++)
        text += possible.charAt(Math.floor(rng() * possible.length));

    return text;
}

function shuffled(l, rng = Math.random) {
    n = []
    li = [].concat(l)
    for (var i=0; i<l.length; i+=1) {
    	n.push(li.splice(Math.floor(rng()*li.length),1)[0])
    }
    return n
}

function pickRandom(list, rng = Math.random) {
	return list[Math.floor(rng()*list.length)]
}

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

function generateMazeGrowingTreeStart(maze) {
	maze.initialise(0b1111)
	maze.startX = Math.floor(maze.rng()*maze.width)
	maze.startY = Math.floor(maze.rng()*maze.height)
	maze.cellList = [[maze.startX, maze.startY]]
}

function generateMazeGrowingTreeStep(maze) {
	if (maze.cellList.length>0) {
		if (maze.rng()<maze.randomProbability) {
			var index = Math.floor(maze.rng()*maze.cellList.length)
		} else {
			var index = maze.cellList.length-1
		}
		var cell = maze.cellList[index]

		maze.lastCellX = cell[0]
		maze.lastCellY = cell[1]

		var dnames = shuffled(DIRNAMES, maze.rng)
		var foundWall = false
		for (var i = 0; i < dnames.length; i++) {
			var neighbour = maze.getNeighbourCoords(cell[0], cell[1], dnames[i])
			if (maze.isInMap(neighbour[0], neighbour[1]) && !maze.visited[neighbour[0]][neighbour[1]]) {
				maze.delWall(cell[0], cell[1], dnames[i])
				maze.cellList.push(neighbour)
				maze.visited[neighbour[0]][neighbour[1]] = true
				maze.lastCellX = neighbour[0]
				maze.lastCellY = neighbour[1]
				foundWall = true
				break
			}
		}
		if (!foundWall) {
			maze.cellList.splice(index, 1)
		}
		return false;
	} else {
		maze.lastCellX=-1
		maze.lastCellY=-1
		return true;
	}
}

function startPathfindDepthFirst(maze, startx, starty, endx, endy) {
	maze.pathfindStartX = startx
	maze.pathfindStartY = starty
	maze.pathfindEndX = endx
	maze.pathfindEndY = endy
	maze.path = [[startx, starty]]
	maze.visited = []
	for (var x=0; x<maze.width; x++) {
		var col = []
		for (var y=0; y<maze.height; y++) {
			col.push(false)
		}
		maze.visited.push(col)
	}
	maze.visited[startx][starty] = true
}

function stepPathfindDepthFirst(maze) {
	var currentCell = maze.path[maze.path.length-1]
	var adjacents = maze.listOpenAdjacents(currentCell[0], currentCell[1])
	var advanced = false
	for (var i=0; i<adjacents.length; i++) {
		if (!maze.visited[adjacents[i][0]][adjacents[i][1]]) {
			advanced = true
			maze.path.push(adjacents[i])
			maze.visited[adjacents[i][0]][adjacents[i][1]] = true
			if (adjacents[i][0]==maze.pathfindEndX && adjacents[i][1]==maze.pathfindEndY) {
				return true;
			}
			break;
		}
	}
	if (!advanced) {
		maze.path.pop()
		if (maze.path.length == 0) {
			console.log("Error! Could not find path.")
			return true;
		}
	}
	return false;
}

Maze = {}
Maze.cells = []
Maze.path = []
Maze.pathfindStartX = -1
Maze.pathfindStartY = -1
Maze.pathfindEndX = -1
Maze.pathfindEndY = -1
Maze.lastCellX = -1
Maze.lastCellY = -1
Maze.intervalID = -1
Maze.randomProbability = 0
Maze.visited = []
Maze.cellList = []
Maze.width = 0
Maze.height= 0
Maze.isGenerating = false
Maze.isPathfinding = false
Maze.rng = {}
Maze.initialise = function(walls = 0b1111) {
	this.rng = new Math.seedrandom(document.getElementById("seed").value);

	this.cells = []
	for (var x=0; x<this.width; x++) {
		var col = []
		for (var y=0; y<this.height; y++) {
			col.push(walls)
		}
		this.cells.push(col)
	}
	this.visited = []
	for (var x=0; x<this.width; x++) {
		var col = []
		for (var y=0; y<this.height; y++) {
			col.push(false)
		}
		this.visited.push(col)
	}

	this.path = []
	this.pathfindStartX = -1
	this.pathfindStartY = -1
	this.pathfindEndX = -1
	this.pathfindEndY = -1

	this.lastCellX = -1
	this.lastCellY = -1
	this.cellList = []
}

Maze.visitAll = function() {
	this.visited = []
	for (var x=0; x<this.width; x++) {
		var col = []
		for (var y=0; y<this.height; y++) {
			col.push(true)
		}
		this.visited.push(col)
	}
}

Maze.addWall = function(x, y, dir) {
	this.cells[x][y] |= DIRS[dir]
	this.cells[ x+DX[dir] ][ y+DY[dir] ] |= INVDIRS[dir]
}

Maze.delWall = function(x, y, dir) {
	this.cells[x][y] &= ~DIRS[dir]
	this.cells[ x+DX[dir] ][ y+DY[dir] ] &= ~INVDIRS[dir]
}

Maze.hasWall = function(x,y,dir) {
	return this.cells[x][y] & DIRS[dir]
}

Maze.getNeighbourCoords = function(x,y,dir) {
	return [x+DX[dir], y+DY[dir]]
}

Maze.isInMap = function(x,y) {
	return (x>=0)&&(y>=0)&&(x<this.width)&&(y<this.height)
}

Maze.startGen = function() {
	return this.startGenFunction(this, this.rng)
}

Maze.startPathfind = function(startx, starty, endx, endy) {
	return this.startPathfindFunction(this, startx, starty, endx, endy, this.rng)
}

Maze.clearInterval = function() {
	clearInterval(this.intervalID)
	this.intervalID = -1
	this.isGenerating = false
	this.isPathfinding = false
}

Maze.step = function() {
	return this.stepFunction(this, this.rng)
}

Maze.stepPathfind = function() {
	return this.stepPathfindFunction(this, this.rng)
}

Maze.updateUPS = function() {
	if (this.isGenerating) {
		clearInterval(this.intervalID)
		this.intervalID = setInterval(function(maze) {
			done = maze.step()
			if (done) {
				maze.clearInterval()
			}
			drawMaze(maze)
		}, 1000/document.getElementById("ups").value, this)
	}
	if (this.isPathfinding) {
		clearInterval(this.intervalID)
		this.intervalID = setInterval(function(maze) {
			done = maze.stepPathfind()
			if (done) {
				maze.clearInterval()
			}
			drawMaze(maze)
		}, 1000/document.getElementById("ups").value, this)
	}
}

Maze.listOpenAdjacents = function(x,y) {
	result = []
	for (var i=0; i<DIRNAMES.length; i++) { 
		dir = DIRNAMES[i]
		if (!(this.cells[x][y] & DIRS[dir])) {
			result.push([x+DX[dir], y+DY[dir]])
		}
	}
	return result
}

Maze.getStats = function() { //returns a 5-element array wher arr[n] is the number of cells with n exits
	stats = [0,0,0,0,0]
	for (var x=0; x<this.width; x++) {
		for (var y=0; y<this.height; y++) {
			stats[this.listOpenAdjacents(x,y).length] += 1
		}
	}
	return stats
}

Maze.startGenFunction = generateMazeGrowingTreeStart
Maze.stepFunction = generateMazeGrowingTreeStep
Maze.startPathfindFunction = startPathfindDepthFirst
Maze.stepPathfindFunction = stepPathfindDepthFirst

function drawMaze(maze) {
	var canvas=document.getElementById("mainCanvas");
	var ctx=canvas.getContext("2d");
	
	var WALL_COLOUR = "#000000"
	var VISITED_COLOUR = "#FFFFFF"
	var UNVISITED_COLOUR = "#CCCCCC"
	var IN_LIST_COLOUR = "#ffe3e3"
	var LAST_CELL_COLOUR = "#ff0000"

	var PATH_START_COLOUR = "#03befc"
	var PATH_GOAL_COLOUR = "#03befc"
	var PATH_END_COLOUR = "#89009c"
	var PATH_COLOUR = "#df03fc"

	var CELL_WIDTH = Math.floor(canvas.width/maze.width);
	var CELL_HEIGHT = Math.floor(canvas.height/maze.height);


	ctx.fillStyle = "#FFFFFF"
	ctx.fillRect(0, 0, canvas.width, canvas.height)

	ctx.fillStyle = VISITED_COLOUR
	ctx.fillRect(0, 0, CELL_WIDTH*maze.width, CELL_HEIGHT*maze.height)

	ctx.fillStyle = UNVISITED_COLOUR
	for (var x=0; x<maze.width; x++) {
		for (var y=0; y<maze.width; y++) {
			if (!maze.visited[x][y]) {
				ctx.fillRect(x*CELL_WIDTH, y*CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT)
			}
		}
	}

	ctx.fillStyle = IN_LIST_COLOUR
	for (var i=0; i<maze.cellList.length; i++) {
		c = maze.cellList[i]
		ctx.fillRect(c[0]*CELL_WIDTH, c[1]*CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT)

	}

	ctx.fillStyle = LAST_CELL_COLOUR
	ctx.fillRect(maze.lastCellX*CELL_WIDTH, maze.lastCellY*CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT)

	ctx.fillStyle = WALL_COLOUR
	for (var x=0; x<maze.width; x++) {
		for (var y=0; y<maze.width; y++) {
			if (maze.hasWall(x,y,"N")) {
				ctx.fillRect(x*CELL_WIDTH, y*CELL_HEIGHT, CELL_WIDTH, 1)
			}
			if (maze.hasWall(x,y,"S")) {
				ctx.fillRect(x*CELL_WIDTH, y*CELL_HEIGHT + CELL_HEIGHT-1, CELL_WIDTH, 1)
			}
			if (maze.hasWall(x,y,"W")) {
				ctx.fillRect(x*CELL_WIDTH, y*CELL_HEIGHT, 1, CELL_HEIGHT)
			}
			if (maze.hasWall(x,y,"E")) {
				ctx.fillRect(x*CELL_WIDTH + CELL_WIDTH-1, y*CELL_HEIGHT, 1, CELL_HEIGHT)
			}
		}
	}

	if (maze.path.length > 0) {
		ctx.strokeStyle = PATH_COLOUR
		ctx.lineWidth = Math.max(1, CELL_WIDTH/4)
		ctx.beginPath()
		ctx.moveTo(maze.path[0][0]*CELL_WIDTH + CELL_WIDTH/2, maze.path[0][0]*CELL_HEIGHT + CELL_HEIGHT/2)
		for (var i=1; i<maze.path.length; i++) {
			var x = maze.path[i][0]*CELL_WIDTH + CELL_WIDTH/2
			var y = maze.path[i][1]*CELL_HEIGHT + CELL_HEIGHT/2
			ctx.lineTo(x,y)
		}
		ctx.stroke()
		ctx.closePath()

		ctx.fillStyle = PATH_END_COLOUR
		ctx.beginPath()
		var x = maze.path[maze.path.length-1][0]*CELL_WIDTH + CELL_WIDTH/2
		var y = maze.path[maze.path.length-1][1]*CELL_HEIGHT + CELL_HEIGHT/2
		ctx.arc(x,y, CELL_WIDTH/4, 0, 2*Math.PI)
		ctx.fill()
		ctx.closePath()
	}

	ctx.fillStyle = PATH_START_COLOUR
	ctx.beginPath()
	ctx.arc(maze.pathfindStartX*CELL_WIDTH + CELL_WIDTH/2, maze.pathfindStartY*CELL_HEIGHT + CELL_HEIGHT/2, CELL_WIDTH/3, 0, 2*Math.PI)
	ctx.fill()
	ctx.closePath()

	ctx.fillStyle = PATH_GOAL_COLOUR
	ctx.beginPath()
	ctx.arc(maze.pathfindEndX*CELL_WIDTH + CELL_WIDTH/2, maze.pathfindEndY*CELL_HEIGHT + CELL_HEIGHT/2, CELL_WIDTH/3, 0, 2*Math.PI)
	ctx.fill()
	ctx.closePath()

	updateStats()
}

function generateStepwise() {
	Maze.clearInterval()
	Maze.isGenerating = true
	Maze.startGen()
	drawMaze(Maze)
	Maze.intervalID = setInterval(function(maze) {
		done = maze.step()
		if (done) {
			Maze.clearInterval()
		}
		drawMaze(maze)
	}, 1000/document.getElementById("ups").value, Maze)
}

function generateAtOnce() {
	Maze.clearInterval()
	Maze.startGen()
	done = false
	while (!done) {
		done = Maze.step()
	}
	Maze.isGenerating = false
	drawMaze(Maze)
}

function pathfindStepwise() {
	generateAtOnce()

	Maze.clearInterval()
	Maze.isPathfinding = true
	Maze.startPathfind(0, 0, Maze.width-1, Maze.height-1)
	drawMaze(Maze)
	Maze.intervalID = setInterval(function(maze) {
		done = maze.stepPathfind()
		if (done) {
			Maze.clearInterval()
		}
		drawMaze(maze)
	}, 1000/document.getElementById("ups").value, Maze)
}

function pathfindAtOnce() {
	generateAtOnce()

	Maze.clearInterval()
	Maze.startPathfind(0, 0, Maze.width-1, Maze.height-1)
	done = false
	while (!done) {
		done = Maze.stepPathfind()
	}
	Maze.isPathfinding = false
	Maze.visitAll()
	drawMaze(Maze)
}

function updateStats() {
	var stats = Maze.getStats()
	var txt = "The maze has "
	txt += "<b>" + String(stats[0]) + "</b> enclosed cell[s], " 
	txt += "<b>" + String(stats[1]) + "</b> dead end[s], " 
	txt += "<b>" + String(stats[2]) + "</b> passageway[s], " 
	txt += "<b>" + String(stats[3]) + "</b> T-junction[s], and " 
	txt += "<b>" + String(stats[4]) + "</b> 4-way junction[s]." 

	document.getElementById("statsOut").innerHTML = txt
}

function updateAll() {
	size = document.getElementById("size").value
	document.getElementById("sizeOut").innerHTML = String(size)+"x"+String(size)
	document.getElementById("randomProbabilityOut").innerHTML = String(document.getElementById("randomProbability").value)+"%";
	document.getElementById("upsOut").innerHTML = document.getElementById("ups").value;
	Maze.randomProbability = document.getElementById("randomProbability").value/100
	Maze.clearInterval()
	Maze.width = size
	Maze.height = size
	Maze.initialise()

	if (document.getElementById("autoGenerate").checked) {
		generateAtOnce()
	}
	if (document.getElementById("autoPathfind").checked) {
		pathfindAtOnce()
	}

	drawMaze(Maze)
}

document.getElementById("seed").value = "seed"

document.getElementById("size").addEventListener("input", updateAll);
document.getElementById("randomProbability").addEventListener("input", updateAll);
document.getElementById("ups").addEventListener("input", function() {
	Maze.updateUPS();
	document.getElementById("upsOut").innerHTML = document.getElementById("ups").value;
});

document.getElementById("randomSeed").addEventListener("click", function() {
	document.getElementById("seed").value = randomString(Math.ceil(Math.random()*8)+4);
	if (document.getElementById("autoGenerate").checked) {
		updateAll()
	}
});

document.getElementById("generateStepwiseButton").addEventListener("click", function() {
	generateStepwise()
});

document.getElementById("generateAtOnceButton").addEventListener("click", function() {
	generateAtOnce()
});

document.getElementById("pathfindStepwiseButton").addEventListener("click", function() {
	pathfindStepwise()
});

document.getElementById("pathfindAtOnceButton").addEventListener("click", function() {
	pathfindAtOnce()
});

document.getElementById("autoGenerate").addEventListener("change", function() {
	if (document.getElementById("autoGenerate").checked) {
		generateAtOnce()
	}
});

document.getElementById("autoPathfind").addEventListener("change", function() {
	if (document.getElementById("autoPathfind").checked) {
		pathfindAtOnce()
	}
});

updateAll()
drawMaze(Maze)