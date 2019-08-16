function arrayContains(arr, val) {
	val = JSON.stringify(val)
	for (var i=0; i<arr.length; i+=1) {
		if (JSON.stringify(arr[i]) == val) {
			return true
		}
	}
	return false
}

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

MAP_WIDTH = 20;
MAP_HEIGHT = 20;
GENERATION_STEP_DELAY = 40

canvas=document.getElementById("mainCanvas");
WALL_COLOUR = "#000000"
VISITED_COLOUR = "#FFFFFF"
UNVISITED_COLOUR = "#CCCCCC"
IN_LIST_COLOUR = "#ffe3e3"
LAST_CELL_COLOUR = "#ff0000"

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

function generateMazeGrowingTreeStart(map, rng) {
	map.initialise(0b1111)
	map.startX = Math.floor(rng()*map.width)
	map.startY = Math.floor(rng()*map.height)
	map.cellList = [[map.startX, map.startY]]
}

function generateMazeGrowingTreeStep(map, rng) {
	var PROBABILITY_OF_RANDOM = 0.1

	if (map.cellList.length>0) {
		if (rng()<PROBABILITY_OF_RANDOM) {
			var index = Math.floor(rng()*map.cellList.length)
		} else {
			var index = map.cellList.length-1
		}
		var cell = map.cellList[index]

		map.lastCellX = cell[0]
		map.lastCellY = cell[1]

		var dnames = shuffled(DIRNAMES, rng)
		var foundWall = false
		for (var i = 0; i < dnames.length; i++) {
			var neighbour = map.getNeighbourCoords(cell[0], cell[1], dnames[i])
			if (map.isInMap(neighbour[0], neighbour[1]) && !map.visited[neighbour[0]][neighbour[1]]) {
				map.delWall(cell[0], cell[1], dnames[i])
				map.cellList.push(neighbour)
				map.visited[neighbour[0]][neighbour[1]] = true
				map.lastCellX = neighbour[0]
				map.lastCellY = neighbour[1]
				foundWall = true
				break
			}
		}
		if (!foundWall) {
			map.cellList.splice(index, 1)
		}
		return false;
	} else {
		map.lastCellX=-1
		map.lastCellY=-1
		return true;
	}
}

Map = {}
Map.cells = []
Map.lastCellX = -1
Map.lastCellY = -1
Map.intervalID = -1
Map.visited = []
Map.cellList = []
Map.width = MAP_WIDTH
Map.height= MAP_HEIGHT
Map.initialise = function(walls = 0b1111) {
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
}

Map.addWall = function(x, y, dir) {
	this.cells[x][y] |= DIRS[dir]
	this.cells[ x+DX[dir] ][ y+DY[dir] ] |= INVDIRS[dir]
}

Map.delWall = function(x, y, dir) {
	this.cells[x][y] &= ~DIRS[dir]
	this.cells[ x+DX[dir] ][ y+DY[dir] ] &= ~INVDIRS[dir]
}

Map.hasWall = function(x,y,dir) {
	return this.cells[x][y] & DIRS[dir]
}

Map.getNeighbourCoords = function(x,y,dir) {
	return [x+DX[dir], y+DY[dir]]
}

Map.isInMap = function(x,y) {
	return (x>=0)&&(y>=0)&&(x<this.width)&&(y<this.height)
}

Map.startGenFunction = generateMazeGrowingTreeStart
Map.stepFunction = generateMazeGrowingTreeStep

function drawMap(map) {
	var CELL_WIDTH = Math.floor(canvas.width/map.width);
	var CELL_HEIGHT = Math.floor(canvas.height/map.height);

	ctx=canvas.getContext("2d");
	ctx.fillStyle = "#FFFFFF"
	ctx.fillRect(0, 0, canvas.width, canvas.height)

	for (var x=0; x<map.width; x++) {
		for (var y=0; y<map.width; y++) {
			if (x==map.lastCellX && y==map.lastCellY) {
				ctx.fillStyle = LAST_CELL_COLOUR
			}
			else if (arrayContains(map.cellList, [x,y])) {
				ctx.fillStyle = IN_LIST_COLOUR
			}
			else if (map.visited[x][y]) {
				ctx.fillStyle = VISITED_COLOUR
			}
			else {
				ctx.fillStyle = UNVISITED_COLOUR
			}
			ctx.fillRect(x*CELL_WIDTH, y*CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT)

			ctx.fillStyle = WALL_COLOUR
			if (map.hasWall(x,y,"N")) {
				ctx.fillRect(x*CELL_WIDTH, y*CELL_HEIGHT, CELL_WIDTH, 1)
			}
			if (map.hasWall(x,y,"S")) {
				ctx.fillRect(x*CELL_WIDTH, y*CELL_HEIGHT + CELL_HEIGHT-1, CELL_WIDTH, 1)
			}
			if (map.hasWall(x,y,"W")) {
				ctx.fillRect(x*CELL_WIDTH, y*CELL_HEIGHT, 1, CELL_HEIGHT)
			}
			if (map.hasWall(x,y,"E")) {
				ctx.fillRect(x*CELL_WIDTH + CELL_WIDTH-1, y*CELL_HEIGHT, 1, CELL_HEIGHT)
			}
		}
	}
	console.log("Drawn map.")
}

function generateStepwise() {
	var rng = new Math.seedrandom(document.getElementById("seed").value);
	Map.startGenFunction(Map, rng)
	drawMap(Map)
	clearInterval(Map.intervalID)
	Map.intervalID = -1
	Map.intervalID = setInterval(function(map, rng) {
		done = map.stepFunction(map, rng)
		if (done) {
			clearInterval(map.intervalID)
			map.intervalID = -1
		}
		drawMap(map)
	}, GENERATION_STEP_DELAY, Map, rng)
}

function generateAtOnce() {
	var rng = new Math.seedrandom(document.getElementById("seed").value);
	Map.startGenFunction(Map, rng)
	done = false
	while (!done) {
		done = Map.stepFunction(Map, rng)
	}
	drawMap(Map)
}

document.getElementById("seed").value = "seed"
document.getElementById("randomSeed").addEventListener("click", function() {
	document.getElementById("seed").value = randomString(Math.ceil(Math.random()*8)+4);
});

document.getElementById("generateStepwiseButton").addEventListener("click", function() {
	generateStepwise()
});

document.getElementById("generateAtOnceButton").addEventListener("click", function() {
	generateAtOnce()
});

Map.initialise()
drawMap(Map)