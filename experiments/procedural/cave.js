function hash(s) {
  var hash = 0, i, chr, len;
  if (s.length === 0) return hash;
  for (i = 0, len = s.length; i < len; i++) {
    chr   = s.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

function randomString(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i=0; i<len; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

function decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
}

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return "#"+decimalToHex(Math.round(r * 255),2) + decimalToHex(Math.round(g * 255),2) + decimalToHex(Math.round(b * 255),2)
}

width = 100;
height = 100;
canvas=document.getElementById("mainCanvas");
cellWidth = canvas.width/width;
cellHeight = canvas.height/height;
wallColour = "#888888"
floorColour = "#000000"
highlightFloorColour = "#111122"
highlightWallColour = "#999966"
wall = true
floor = false

map = []
regions = []
regionList = []
oldRegion = 0

function generateMap(seed) {
	var cellMap=[];
	
	rng = new Math.seedrandom(seed);
	
	
	for (var i=0; i<width; i++) {
		var tmp=[];
		for (var j=0; j<height; j++) {
			if (rng()<startChance) {
				tmp.push(true);
			} else {
				tmp.push(false);
			}
		}
		cellMap.push(tmp);
	}
	
	return cellMap;
}

function countAliveNeighbours(map, x, y) {
	var count = 0;
	for (var i=-1; i<=1; i++) {
		for (var j=-1; j<=1; j++) {
			var neighbour_x = x+i;
			var neighbour_y = y+j;
			//If we're looking at the middle point
			if (i == 0 && j == 0) {
				//Do nothing, we don't want to add ourselves in!
			}
			//In case the index we're looking at it off the edge of the map
			else if(neighbour_x<0 || neighbour_y<0 || neighbour_x>=width || neighbour_y>=height){
				count += 1;
			}
			//Otherwise, a normal check of the neighbour
			else if(map[neighbour_x][neighbour_y]){
				count += 1;
			}
		}
	}
	return count;
}

function cellStep(map) {
	var newMap = map;
	for (var x=0; x<width; x++) {
		for (var y=0; y<height; y++) {
			neighbours = countAliveNeighbours(map, x, y)
            //The new value is based on our simulation rules
            //First, if a cell is alive but has too few neighbours, kill it.
            if(map[x][y]){
                if (neighbours < starveLimit){
                    newMap[x][y] = false;
                } else if (neighbours > overpopLimit){
                    newMap[x][y] = false;
                } else {
                    newMap[x][y] = true;
                }
            } //Otherwise, if the cell is dead now, check if it has the right number of neighbours to be 'born'
            else {
                if (neighbours > birthLimit){
                    newMap[x][y] = true;
                }
                else {
                    newMap[x][y] = false;
                }
            }
		}
	}
	return newMap;
}

function drawMap(map) {
	ctx=canvas.getContext("2d");
	
	for (var x=0; x<width; x++) {
		for (var y=0; y<height; y++) {
			if (document.getElementById("colourMap").checked) {
				ctx.fillStyle = regionList[regions[x][y]][2]
			} else {
				if (map[x][y]==wall) {
					ctx.fillStyle = wallColour
				} else {
					ctx.fillStyle = floorColour
				}
			}
			ctx.fillRect(x * cellWidth, y * cellWidth, cellWidth, cellHeight);
		}
	}
}

function drawMapHighlight(map, highlight) {
	ctx=canvas.getContext("2d");
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	ctx.fillStyle = wallColour;
	
	for (var x=0; x<width; x++) {
		for (var y=0; y<height; y++) {
			if (map[x][y]==wall) {
				if (regions[x][y]==highlight) {
					ctx.fillStyle = highlightWallColour;
				} else {
					ctx.fillStyle = wallColour;
				}
			}
			else {
				if (regions[x][y]==highlight) {
					ctx.fillStyle = highlightFloorColour;
				} else {
					ctx.fillStyle = floorColour;
				}
			}
			ctx.fillRect(x * cellWidth, y * cellWidth, cellWidth, cellHeight);
		}
	}
}

function updateMap() {	
	birthLimit = document.getElementById("birthLimit").value;
	starveLimit = document.getElementById("starveLimit").value;
	overpopLimit = document.getElementById("overpopLimit").value;
	startChance = document.getElementById("startChance").value / 20;
	
	map = generateMap(document.getElementById("seed").value);
	
	steps = document.getElementById("steps").value;
	if (steps==11) { //i.e. "MAX"
		do {
			var x = hash(map.toString()) //kinda odd method i know, but was running into problems where x an y were always equal
			map = cellStep(map);
			var y = hash(map.toString())
		} while (x!=y) //repeat until increments have no effect
	} else {	
		for (var i=0; i<steps; i++) {
			map = cellStep(map);
		}
	}
	
	regions = getRegions(map)
	drawMap(map);
}

function updateAll() {
	if (document.getElementById("steps").value == 11) {
		document.getElementById("stepsOut").innerHTML = "MAX"
	} else {
		document.getElementById("stepsOut").innerHTML = document.getElementById("steps").value;
	}
	
	document.getElementById("birthLimitOut").innerHTML = document.getElementById("birthLimit").value;
	document.getElementById("starveLimitOut").innerHTML = document.getElementById("starveLimit").value;
	document.getElementById("overpopLimitOut").innerHTML = document.getElementById("overpopLimit").value;
	document.getElementById("startChanceOut").innerHTML = document.getElementById("startChance").value*5;
	
	if (document.getElementById("liveUpdateMap").checked) {
		updateMap();
	}
}

function getRegions(map) {
	var processed = [];
	
	for (var i=0; i<width; i++) {
		var tmp=[];
		for (var j=0; j<height; j++) {
			tmp.push(0);
		}
		processed.push(tmp);
	}
	
	var check = function(x, y, id, target) {
		if (map[x][y] == target) {
			processed[x][y] = id;
			size+=1
			if (x-1>=0) {
				if (!processed[x-1][y]) {check(x-1, y, id, target)}
			}
			if (y-1>=0) {
				if (!processed[x][y-1]) {check(x, y-1, id, target)}
			}
			if (x+1<width) {
				if (!processed[x+1][y]) {check(x+1, y, id, target)}
			}
			if (y+1<height) {
				if (!processed[x][y+1]) {check(x, y+1, id, target)}
			}
		}
	};
	
	var regionID=1;
	regionList = [[-1,0,"#000000"]];
	
	for (var x=0; x<width; x++) {
		for (var y=0; y<height; y++) {
			if (!processed[x][y]) {
				var size=0
				check(x, y, regionID, map[x][y]);
				if (map[x][y]==wall) {
					regionList.push([size,map[x][y], wallColour]);
				} else {
					regionList.push([size,map[x][y], HSVtoRGB(Math.random(), 1, Math.random()/5+0.2)]);
				}
				
				regionID+=1;
			}
		}
	}
	
	return processed;
}








document.getElementById("mainCanvas").addEventListener("mousemove", function(e) {
	var mouseX = e.clientX - Math.floor(canvas.getBoundingClientRect().left);
	var mouseY = e.clientY - Math.floor(canvas.getBoundingClientRect().top);
	var hoverX = Math.floor(mouseX/cellWidth);
	var hoverY = Math.floor(mouseY/cellHeight);
	
	document.getElementById("x").innerHTML = hoverX;
	document.getElementById("y").innerHTML = hoverY;
	document.getElementById("region").innerHTML = regions[hoverX][hoverY];	
	document.getElementById("size").innerHTML = regionList[regions[hoverX][hoverY]][0];	
	
	if (regions[hoverX][hoverY] != oldRegion) {
		oldRegion = regions[hoverX][hoverY]
		drawMapHighlight(map, regions[hoverX][hoverY]);
	}
})

document.getElementById("mainCanvas").addEventListener("mouseleave", function(e) {
	drawMap(map)
	document.getElementById("x").innerHTML = 0;
	document.getElementById("y").innerHTML = 0;
})

document.getElementById("randomSeed").addEventListener("click", function() {
	document.getElementById("seed").value = randomString(Math.ceil(Math.random()*8)+4);
	updateAll();
});

document.getElementById("stepsOut").innerHTML = document.getElementById("steps").value;
document.getElementById("birthLimitOut").innerHTML = document.getElementById("birthLimit").value;
document.getElementById("starveLimitOut").innerHTML = document.getElementById("starveLimit").value;
document.getElementById("overpopLimitOut").innerHTML = document.getElementById("overpopLimit").value;
document.getElementById("startChanceOut").innerHTML = document.getElementById("startChance").value;

document.getElementById("steps").addEventListener("input", updateAll);
document.getElementById("birthLimit").addEventListener("input", updateAll);
document.getElementById("starveLimit").addEventListener("input", updateAll);
document.getElementById("overpopLimit").addEventListener("input", updateAll);
document.getElementById("startChance").addEventListener("input", updateAll);
document.getElementById("colourMap").addEventListener("change", function() {drawMap(map)});

updateAll()