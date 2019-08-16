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

function generateMazeGrowingTreeStart(map) {
	map.initialise(0b1111)
	map.startX = Math.floor(map.rng()*map.width)
	map.startY = Math.floor(map.rng()*map.height)
	map.cellList = [[map.startX, map.startY]]
}

function generateMazeGrowingTreeStep(map) {
	if (map.cellList.length>0) {
		if (map.rng()<map.randomProbability) {
			var index = Math.floor(map.rng()*map.cellList.length)
		} else {
			var index = map.cellList.length-1
		}
		var cell = map.cellList[index]

		map.lastCellX = cell[0]
		map.lastCellY = cell[1]

		var dnames = shuffled(DIRNAMES, map.rng)
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
Map.randomProbability = 0
Map.visited = []
Map.cellList = []
Map.width = 0
Map.height= 0
Map.isGenerating = false
Map.rng = {}
Map.initialise = function(walls = 0b1111) {
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

Map.startGen = function() {
	return this.startGenFunction(this, this.rng)
}

Map.stopGenerating = function() {
	clearInterval(this.intervalID)
	this.intervalID = -1
	this.isGenerating = false
}

Map.step = function() {
	return this.stepFunction(this, this.rng)
}

Map.updateUPS = function() {
	if (this.isGenerating) {
		clearInterval(this.intervalID)
		this.intervalID = setInterval(function(map) {
			done = map.step()
			if (done) {
				map.stopGenerating()
			}
			drawMap(map)
		}, 1000/document.getElementById("ups").value, this)
	}
}

Map.startGenFunction = generateMazeGrowingTreeStart
Map.stepFunction = generateMazeGrowingTreeStep

function drawMap(map) {
	var canvas=document.getElementById("mainCanvas");
	var ctx=canvas.getContext("2d");
	
	var WALL_COLOUR = "#000000"
	var VISITED_COLOUR = "#FFFFFF"
	var UNVISITED_COLOUR = "#CCCCCC"
	var IN_LIST_COLOUR = "#ffe3e3"
	var LAST_CELL_COLOUR = "#ff0000"

	var CELL_WIDTH = Math.floor(canvas.width/map.width);
	var CELL_HEIGHT = Math.floor(canvas.height/map.height);


	ctx.fillStyle = "#FFFFFF"
	ctx.fillRect(0, 0, canvas.width, canvas.height)

	ctx.fillStyle = VISITED_COLOUR
	ctx.fillRect(0, 0, CELL_WIDTH*map.width, CELL_HEIGHT*map.height)

	ctx.fillStyle = UNVISITED_COLOUR
	for (var x=0; x<map.width; x++) {
		for (var y=0; y<map.width; y++) {
			if (!map.visited[x][y]) {
				ctx.fillRect(x*CELL_WIDTH, y*CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT)
			}
		}
	}

	ctx.fillStyle = IN_LIST_COLOUR
	for (var i=0; i<map.cellList.length; i++) {
		c = map.cellList[i]
		ctx.fillRect(c[0]*CELL_WIDTH, c[1]*CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT)

	}

	ctx.fillStyle = LAST_CELL_COLOUR
	ctx.fillRect(map.lastCellX*CELL_WIDTH, map.lastCellY*CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT)

	ctx.fillStyle = WALL_COLOUR
	for (var x=0; x<map.width; x++) {
		for (var y=0; y<map.width; y++) {
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
}

function generateStepwise() {
	Map.stopGenerating()
	Map.isGenerating = true
	Map.startGen()
	drawMap(Map)
	Map.intervalID = setInterval(function(map) {
		done = map.step()
		if (done) {
			Map.stopGenerating()
		}
		drawMap(map)
	}, 1000/document.getElementById("ups").value, Map)
}

function generateAtOnce() {
	Map.stopGenerating()
	var rng = new Math.seedrandom(document.getElementById("seed").value);
	Map.startGen(rng)
	done = false
	while (!done) {
		done = Map.step(rng)
	}
	Map.isGenerating = false
	drawMap(Map)
}

function updateAll() {
	size = document.getElementById("size").value
	document.getElementById("sizeOut").innerHTML = String(size)+"x"+String(size)
	document.getElementById("randomProbabilityOut").innerHTML = String(document.getElementById("randomProbability").value)+"%";
	document.getElementById("upsOut").innerHTML = document.getElementById("ups").value;
	Map.randomProbability = document.getElementById("randomProbability").value/100
	Map.stopGenerating()
	Map.width = size
	Map.height = size
	Map.initialise()

	if (document.getElementById("autoGenerate").checked) {
		generateAtOnce()
	}

	drawMap(Map)
}

document.getElementById("seed").value = "seed"

document.getElementById("size").addEventListener("input", updateAll);
document.getElementById("randomProbability").addEventListener("input", updateAll);
document.getElementById("ups").addEventListener("input", function() {
	Map.updateUPS();
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

document.getElementById("autoGenerate").addEventListener("change", function() {
	if (document.getElementById("autoGenerate").checked) {
		generateAtOnce()
	}
});

updateAll()
drawMap(Map)