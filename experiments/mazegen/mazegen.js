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

function rectanglesIntersect(left1, top1, right1, bottom1, left2, top2, right2, bottom2) {
  return !(left2 > right1 || 
           right2 < left1 || 
           top2 > bottom1 ||
           bottom2 < top1);
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

function generateMazeGrowingTreeStart(maze, startX=null, startY=null, skipMazeInit = false) {
	if (!skipMazeInit) {
		maze.initialise(0b1111)
	}
	if (startX == null) {
		maze.startX = Math.floor(maze.rng()*maze.width)
	} else {
		maze.startX = startX
	}

	if (startY == null) {
		maze.startY = Math.floor(maze.rng()*maze.height)
	} else {
		maze.startY = startY
	}
	maze.cellList = [[maze.startX, maze.startY]]
	maze.visited[maze.startX][maze.startY] = true
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
			new Error("Error! Could not find path.")
			return true;
		}
	}
	return false;
}

Maze = {}
Maze.cells = []
Maze.path = []
Maze.rooms = []
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

	this.rooms = []
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
	if (this.isInMap(x+DX[dir], y+DY[dir])) {
		this.cells[ x+DX[dir] ][ y+DY[dir] ] |= INVDIRS[dir]
	}
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

Maze.isNotOnEdge = function(x,y) {
	return (x>=1)&&(y>=1)&&(x<this.width-1)&&(y<this.height-1)
}

Maze.startGen = function() {
	return this.startGenFunction(this)
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

Maze.closeOffDeadEnds = function() {
	unchanged = true
	for (var x=0; x<this.width; x++) {
		for (var y=0; y<this.height; y++) {
			if(/*this.isNotOnEdge(x,y) &&*/ this.listOpenAdjacents(x,y).length==1) {
				for (var i=0; i<DIRNAMES.length; i++) { 
					this.addWall(x, y, DIRNAMES[i])
				}
				unchanged = false
			}
		}
	}
	return unchanged
}

Maze.closeOffAllDeadEnds = function() {
	var done = false
	while (!done) {
		done = this.closeOffDeadEnds()
	}
}

Maze.clearArea = function(left, top, right, bottom) {
	for (var x=left; x<=right; x++) {
		for (var y=top; y<=bottom; y++) {
			if(x>left) {
				this.delWall(x, y, "W")
			}
			if(x<right) {
				this.delWall(x, y, "E")
			}
			if(y>top) {
				this.delWall(x, y, "N")
			}
			if(y<bottom) {
				this.delWall(x, y, "S")
			}

			this.visited[x][y] = true
		}
	}
}

Maze.addRooms = function() {
	var MIN_DIM = 2
	var MAX_DIM = Math.min(9, this.width, this.height)
	var MAX_ATTEMPTS = document.getElementById("roomAttempts").value;

	for (var i=0; i<MAX_ATTEMPTS; i++) {
		var width = Math.floor(this.rng()*(MAX_DIM-MIN_DIM) + MIN_DIM)
		var height = Math.floor(this.rng()*(MAX_DIM-MIN_DIM) + MIN_DIM)
		var x = Math.floor(this.rng() * (this.width - width))
		var y = Math.floor(this.rng() * (this.height - height))
		var okayToPlace = true

		for (var j=0; j<this.rooms.length; j++) {
			if (rectanglesIntersect(x, y, x+width, y+height, this.rooms[j][0], this.rooms[j][1], this.rooms[j][2], this.rooms[j][3])) {
				okayToPlace = false;
			} 
		}
		
		if (okayToPlace) {
			this.rooms.push([x, y, x+width, y+height])
			this.clearArea(x, y, x+width, y+height)
		}
	}
}

Maze.generateFromFirstEnclosed = function() {
	for (var x=0; x<this.width; x++) {
		for (var y=0; y<this.height; y++) {
			if (this.cells[x][y] == 0b1111) {
				this.startGenFunction(this, x, y, true)
				var done = false
				while (!done) {
					done = this.step()
				}
				return true
			}
		}
	}
	return false
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

Maze.computeZones = function() {
	this.zones = []
	for (var x=0; x<this.width; x++) {
		var col = []
		for (var y=0; y<this.height; y++) {
			col.push(-1)
		}
		this.zones.push(col)
	}
	var done = false
	var id = 0
	while (!done) {
		var foundStart = false
		activeCells = []
		for (var x=0; x<this.width && !foundStart; x++) {
			for (var y=0; y<this.height && !foundStart; y++) {
				if (this.zones[x][y] == -1) {
					if (this.cells[x][y] == 0b1111) { //i.e. if enclosed
						//don't count it as a new zone
						this.zones[x][y] = -2
					} else { //it's not enclosed, so count it as a zone
						foundStart = true
						activeCells = [[x,y]]
						this.zones[x][y] = id
					}
				}
			}
		}
		if (!foundStart) {
			done = true
		}
		else {
			id+=1
		}
		while (activeCells.length>0) {
			var cell = activeCells.pop()
			var neighbours = this.listOpenAdjacents(cell[0], cell[1])
			for (var i=0; i<neighbours.length; i++) {
				if (this.zones[neighbours[i][0]][neighbours[i][1]] != id) {
					activeCells.push(neighbours[i])
					this.zones[neighbours[i][0]][neighbours[i][1]] = id
				}
			}
		}
	}
	this.numZones = id
}

Maze.computeBoundaries = function() { //ONLY lists North and West walls, to avoid double-counting.
	this.boundaries = []
	for (var x=1; x<this.width; x++) {
		for (var y=1; y<this.height; y++) {
			if (this.zones[x-1][y] != this.zones[x][y]) {
				this.boundaries.push([x, y, "W"])
			}
			if (this.zones[x][y-1] != this.zones[x][y]) {
				this.boundaries.push([x, y, "N"])
			}
		}
	}
}

Maze.breakRandomBoundary = function() {
	this.computeBoundaries()
	if (this.boundaries.length == 0) {
		return false
	}
	var index = Math.floor(this.rng() * this.boundaries.length)
	var boundary = this.boundaries[index]
	var zone1 = this.zones[boundary[0]][boundary[1]]
	var zone2 = this.zones[boundary[0]+DX[boundary[2]]][boundary[1]+DY[boundary[2]]]
	this.delWall(boundary[0], boundary[1], boundary[2])
	for (var x=0; x<this.width; x++) {
		for (var y=0; y<this.height; y++) {
			if (this.zones[x][y] == zone2) {
				this.zones[x][y] = zone1
			}
		}
	}
}

Maze.breakAllBoundaries = function() {
	this.computeZones()
	for (var i=this.zones.length; i>=0; i--) {
		this.breakRandomBoundary()
	}
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

	ctx.fillStyle = WALL_COLOUR
	for (var x=0; x<maze.width; x++) {
		for (var y=0; y<maze.width; y++) {
			if (maze.cells[x][y] == 0b1111) {
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
		ctx.moveTo(maze.path[0][0]*CELL_WIDTH + CELL_WIDTH/2, maze.path[0][1]*CELL_HEIGHT + CELL_HEIGHT/2)
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

	if (document.getElementById("showStats").checked) {
		updateStats()	
	}
	
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
	if (Maze.dungeonMode) {
		Maze.initialise(0b1111)
		Maze.clearInterval()
		Maze.addRooms()
		var maxGenAttempts = document.getElementById("roomAttempts").value * 4
		var count = 0
		while (Maze.getStats()[0] > 0 && count<maxGenAttempts) { //i.e. while enclosed cells exist
			Maze.generateFromFirstEnclosed()
			count++; //to prevent it from getting stuck forever
		}
		Maze.breakAllBoundaries()
		Maze.closeOffAllDeadEnds()
	} else {
		Maze.clearInterval()
		Maze.startGen()
		done = false
		while (!done) {
			done = Maze.step()
		}
		Maze.isGenerating = false
	}
	drawMaze(Maze)
}

function pathfindStepwise() {
	generateAtOnce()
	Maze.clearInterval()
	Maze.isPathfinding = true

	var startX = null
	var startY = null
	var endX = null
	var endY = null

	for (var x=0; x<Maze.width; x++) {
		for (var y=0; y<Maze.height; y++) {
			if (Maze.cells[x][y]!=0b1111) {
				startX=x
				startY=y
			}
		}
	}

	for (var x=Maze.width-1; x>=0; x--) {
		for (var y=Maze.height-1; y>=0; y--) {
			if (Maze.cells[x][y]!=0b1111) {
				endX=x
				endY=y
			}
		}
	}

	Maze.startPathfind(startX, startY, endX, endY)
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

	var startX = null
	var startY = null
	var endX = null
	var endY = null

	for (var x=0; x<Maze.width; x++) {
		for (var y=0; y<Maze.height; y++) {
			if (Maze.cells[x][y]!=0b1111) {
				startX=x
				startY=y
			}
		}
	}

	for (var x=Maze.width-1; x>=0; x--) {
		for (var y=Maze.height-1; y>=0; y--) {
			if (Maze.cells[x][y]!=0b1111) {
				endX=x
				endY=y
			}
		}
	}

	Maze.startPathfind(startX, startY, endX, endY)
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
	var txt = "<b>Stats:</b> The maze has "
	txt += "<b>" + String(stats[0]) + "</b> enclosed cell[s], " 
	txt += "<b>" + String(stats[1]) + "</b> dead end[s], " 
	txt += "<b>" + String(stats[2]) + "</b> passageway[s], " 
	txt += "<b>" + String(stats[3]) + "</b> T-junction[s], and " 
	txt += "<b>" + String(stats[4]) + "</b> 4-way junction[s]. " 

	Maze.computeZones()
	Maze.computeBoundaries()

	txt += "It has " + Maze.numZones + " zone[s], and " + Maze.boundaries.length + " boundary wall[s]."

	document.getElementById("statsOut").innerHTML = txt
}

function updateAll() {
	size = document.getElementById("size").value
	document.getElementById("sizeOut").innerHTML = String(size)+"x"+String(size)
	document.getElementById("randomProbabilityOut").innerHTML = String(document.getElementById("randomProbability").value)+"%";
	document.getElementById("roomAttemptsOut").innerHTML = document.getElementById("roomAttempts").value;
	document.getElementById("upsOut").innerHTML = document.getElementById("ups").value;
	Maze.randomProbability = document.getElementById("randomProbability").value/100
	Maze.clearInterval()
	Maze.width = size
	Maze.height = size
	Maze.dungeonMode = document.getElementById("dungeonMode").checked
	Maze.initialise()

	if (document.getElementById("autoGenerate").checked) {
		generateAtOnce()
	}
	if (document.getElementById("autoPathfind").checked) {
		pathfindAtOnce()
	}

	document.getElementById("dungeonSettings").hidden = !document.getElementById("dungeonMode").checked

	drawMaze(Maze)
}

document.getElementById("seed").value = "seed"

document.getElementById("size").addEventListener("input", updateAll);
document.getElementById("randomProbability").addEventListener("input", updateAll);
document.getElementById("roomAttempts").addEventListener("input", updateAll);
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
	updateAll()
});

document.getElementById("autoPathfind").addEventListener("change", function() {
	if (document.getElementById("autoPathfind").checked) {
		pathfindAtOnce()
	}
	updateAll()
});

document.getElementById("dungeonMode").addEventListener("change", function() {
	updateAll()
});

document.getElementById("showStats").addEventListener("change", function() {
	var checked = document.getElementById("showStats").checked
	document.getElementById("statsOut").hidden = !checked
	if (checked) {updateStats()}
});

updateAll()
drawMaze(Maze)