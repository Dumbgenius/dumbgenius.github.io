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

canvas=document.getElementById("mainCanvas");
WALL_COLOUR = "#000000"
FLOOR_COLOUR = "#FFFFFF"

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

Map = {}
Map.cells = []
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


function generateMazeGrowingTree(map, rng) {
	map.initialise()
	var startX = Math.floor(rng()*map.width)
	var startY = Math.floor(rng()*map.height)
	var cellList = [[startX, startY]]

	visited = []
	for (var x=0; x<map.width; x++) {
		var col = []
		for (var y=0; y<map.height; y++) {
			col.push(false)
		}
		visited.push(col)
	}

	ppp=[].concat(cellList)

	count = 0
	
	while (cellList.length>0) {
		count+=1
		//var index = Math.floor(rng()*cellList.length)
		var index = cellList.length-1
		var cell = cellList[index]
		var dnames = shuffled(DIRNAMES, rng)
		//console.log("cell", cell[0], cell[1])
		//console.log("dnames", dnames)
		var foundWall = false
		for (var i = 0; i < dnames.length; i++) {
			var neighbour = map.getNeighbourCoords(cell[0], cell[1], dnames[i])
			//console.log("neighbour", [].concat(neighbour), dnames[i])
			if (map.isInMap(neighbour[0], neighbour[1]) && !visited[neighbour[0]][neighbour[1]]) {
				map.delWall(cell[0], cell[1], dnames[i])
				cellList.push(neighbour)
				visited[neighbour[0]][neighbour[1]] = true
				//console.log("Deleted wall", cell, dnames[i])
				foundWall = true
				break
			}
		}
		if (!foundWall) {
			cellList.splice(index, 1)
		}
	}
}

function drawMap(map) {
	var CELL_WIDTH = Math.floor(canvas.width/map.width);
	var CELL_HEIGHT = Math.floor(canvas.height/map.height);

	ctx=canvas.getContext("2d");
	ctx.fillStyle = WALL_COLOUR
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	ctx.fillStyle = FLOOR_COLOUR
	ctx.fillRect(0, 0, CELL_WIDTH*map.width, CELL_HEIGHT*canvas.height)

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
	console.log("Drawn map.")
}

function updateMap() {
	var rng = new Math.seedrandom(document.getElementById("seed").value);
	generateMazeGrowingTree(Map, rng)
	drawMap(Map)
}

function updateAll() {
	if (document.getElementById("liveUpdateMap").checked) {
		updateMap();
	}
}

document.getElementById("seed").value = randomString(Math.ceil(Math.random()*8)+4)
document.getElementById("randomSeed").addEventListener("click", function() {
	document.getElementById("seed").value = randomString(Math.ceil(Math.random()*8)+4);
	updateAll();
});


document.getElementById("seed").addEventListener("input", updateAll);

updateAll()