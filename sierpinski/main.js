function get(id) {
	return document.getElementById(id);
}

function choose(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

function isInt(n) {
	if (n==Math.floor(n)) {
		return true;
	} else {
		return false;
	}
}

function poltorec(r, theta){
	var x=r*Math.cos(theta);
	var y=r*Math.sin(theta);
	return [x,y]
}

function shape(sides, diameter, center) {
	if (isInt(sides) && sides>2) {
		var arr = new Array();
		var degDiff=Math.PI*2/sides;
		for (var i=0; i<sides; i++) {
			var theta = degDiff*i;
			var coords = poltorec(diameter/2, theta-Math.PI/2);
			coords[0]+=center[0];
			coords[1]+=center[1];
			arr.push(coords);
		}
		return arr;
	}
}

function generate() {
	var speed=get("speed").value;
	var sides=get("sides").value;
	fraction=get("fraction").value;
	
	canvas=get("mainCanvas");
	ctx=canvas.getContext("2d");
	
	center=[canvas.width/2, canvas.height/2];
	if (canvas.width>canvas.height) {
		diameter = canvas.height-20;
	} else {
		diameter = canvas.width-20;
	}
	
	posList=shape(sides, diameter, center);
	
	ctx.fillStyle="#FFFFFF";
	ctx.fillRect(0, 0, canvas.height, canvas.width);
	
	if (speed<=10000 && speed>=1 && isInt(sides) && sides>=3 && fraction>=0 && fraction<=1) {
		get("error").innerHTML=""
		
		ctx.fillStyle="#000000";
		ctx.beginPath()
		ctx.moveTo(posList[0][0],posList[0][1]);
		for (var i=1; i<posList.length; i++) {
			ctx.lineTo(posList[i][0],posList[i][1]);
		}
		ctx.closePath();
		ctx.fill();
		
		ctx.fillStyle="#FFFFFF"
		pos=new Array();
		pos[0]=posList[0][0];
		pos[1]=posList[0][1];
		ctx.fillRect(pos[0],pos[1],1,1);
		
		if (typeof interval !== 'undefined') {
			clearInterval(interval);
		}
		
		interval=setInterval(generateLoop, 100/speed);
	} else {
		get("error").innerHTML="Invalid input";
	}
    return false;
}

function generateLoop() {
	//if (done) {clearInterval(interval)}
	var chosen=choose(posList);
	var relx=(chosen[0]-pos[0])*fraction;
	var rely=(chosen[1]-pos[1])*fraction;
	pos[0]+=relx;
	pos[1]+=rely;
	ctx.fillRect(pos[0],pos[1],1,1);
}

function stop() {
	if (typeof interval !== 'undefined') {
		clearInterval(interval);
	}
}









