function arrayContains(arr, val) {
	val = JSON.stringify(val)
	for (var i=0; i<arr.length; i+=1) {
		if (JSON.stringify(arr[i]) == val) {
			return true
		}
	}
	return false
}

function randomString(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i=0; i<len; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

gridWidth = 20;
gridHeight = 20;
mapWidth  = gridWidth*2  + 1
mapHeight = gridHeight*2 + 1

canvas=document.getElementById("mainCanvas");
cellWidth = Math.floor(canvas.width/mapWidth);
cellHeight = Math.floor(canvas.height/mapHeight);
wallColour = "#888888"
floorColour = "#000000"
wall = true
floor = false

map = [] //map is [x][y]

function isInMap(x,y) {
	return (x>=0)&&(y>=0)&&(x<mapWidth)&&(y<mapHeight)
}

function isValidWall(x,y) {
	return (x>=1)&&(y>=1)&&(x<mapWidth-1)&&(y<mapHeight-1)
}

function getCellWalls(cell) {
	x = cell[0]
	y = cell[1]
	n = []
	if (isValidWall(x,y-1)) {n.push([x,y-1])}
	if (isValidWall(x,y+1)) {n.push([x,y+1])}
	if (isValidWall(x+1,y)) {n.push([x+1,y])}
	if (isValidWall(x-1,y)) {n.push([x-1,y])}
	return n
}

function getWallCells(wall) {
	x = wall[0]
	y = wall[1]
	cells = []
	if (x%2==0) { //then x is even, so we must be on a horizontal wall
		cells.push([x-1, y])
		cells.push([x+1, y])
	} else { //on a vertical wall
		cells.push([x, y-1])
		cells.push([x, y+1])
	}
	return cells
}

function pickRandom(list, rng = Math.random) {
	return list[Math.floor(rng()*list.length)]
}

function updateMap() {
	// first, blank the map
	map = []
	
	for (var x=0; x<mapWidth; x+=1) {
		col = []
		for (var y=0; y<mapHeight; y+=1) {
			col.push(wall)
		}
		map.push(col)
	}

	//then comes algorithm time
	//randomised Prim's algorithm

	seed = document.getElementById("seed").value
	rng = new Math.seedrandom(seed);

	startX = Math.floor(rng()*gridWidth)
	startY = Math.floor(rng()*gridHeight)
	startX = startX*2+1
	startY = startY*2+1

	map[startX][startY] = floor

	wallList = getCellWalls([startX, startY])
	cellList = [[startX, startY]]

	while (wallList.length>0) {
		w = pickRandom(wallList, rng)
		
		//console.log("   ")
		//console.log("cellList", [].concat(cellList))
		//console.log("w",w)
		//console.log("wallList", [].concat(wallList))

		sides = getWallCells(w)
		side = -1
		if (!arrayContains(cellList,sides[0])) {
			side = sides[0]
		}
		if (!arrayContains(cellList,sides[1])) {
			side = sides[1]	
		}

		wallList.splice(wallList.indexOf(w),1)

		if (side != -1) {
			map[side[0]][side[1]] = floor
			map[w[0]][w[1]] = floor

			cellList.push(side)
			newWalls = getCellWalls(side)

			//console.log("side", [].concat(side))
			//console.log("newWalls", [].concat(newWalls))

			for (var i=0; i<newWalls.length; i=i+1) {
				if (!arrayContains(wallList, newWalls[i])) {
					wallList.push(newWalls[i])
				}
			}
		}
	}
	console.log("Done with generation")
	drawMap(map)
}

function drawMap(map) {
	ctx=canvas.getContext("2d");
	
	for (var x=0; x<mapWidth; x++) {
		for (var y=0; y<mapHeight; y++) {
			if (map[x][y]==wall) {
				ctx.fillStyle = wallColour
			} else {
				ctx.fillStyle = floorColour
			}
			ctx.fillRect(x * cellWidth, y * cellWidth, cellWidth, cellHeight);
		}
	}
}

document.getElementById("randomSeed").addEventListener("click", function() {
	document.getElementById("seed").value = randomString(Math.ceil(Math.random()*8)+4);
	updateAll();
});

function updateAll() {
	if (document.getElementById("liveUpdateMap").checked) {
		updateMap();
	}
}

document.getElementById("seed").addEventListener("input", updateAll);