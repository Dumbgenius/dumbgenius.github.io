function get(id) {
	return document.getElementById(id);
}

function choose(list) {
	return list[Math.floor(Math.random()*list.length)]
}

//add string.format if it's not already there
if (!String.prototype.format) {
    String.prototype.format = function() {
        var str = this.toString();
        if (!arguments.length)
            return str;
        var args = typeof arguments[0],
            args = (("string" == args || "number" == args) ? arguments : arguments[0]);
        for (arg in args)
            str = str.replace(RegExp("\\{" + arg + "\\}", "gi"), args[arg]);
        return str;
    }
}

function generateTechnobabble() {
	particle=[
		"neutron",
		"electron",
		"proton",
		"quark",
		"huon",
		"tachyon",
		"neutrino",
		"photon",
		"ion"
	];
	material=[
		"neutronium",
		"strange matter",
		"dark matter",
		"titanium",
		"red matter",
		"star alloy"
	];
	particle_thing=[
		"shield",
		"deflector",
		"beam",
		"torpedo",
		"missile",
		"blaster",
		"capacitor"
	];
	verb=[
		"ionize",
		"enable",
		"activate",
		"overcharge"
	];
	object=[
		"gate",
		"engine",
		"drive",
		"alloy",
		"capacitor"
	];
	adjective=[
		"neutronic",
		"flux",
		"photonic",
		"time-warp", 
		"space-time"
	];
	combiner=[
		"","","","","","","","",
		"hyper-",
		"mega-",
		"super-",
		"ultra-",
		"maxi-"
	];
	
	sentence=[
		"Quickly, {verb} the {particle} {particle_thing} - they have {adjective} {object}s!",
		"It looks like some kind of {combiner}{adjective} {object}.",
		"They've got {particle} {combiner}{particle_thing}s! We need to {verb} the {adjective} {object}!",
		"It's simple - the {object} sends {particle}s into a block of solid {material}, causing the {adjective} {particle_thing} to {verb}."
	];
	
	var out=choose(sentence).format(
	{particle:choose(particle), 
	material:choose(material), 
	particle_thing:choose(particle_thing),
	verb:choose(verb),
	object:choose(object),
	adjective:choose(adjective),
	combiner:choose(combiner)
	});

	return out
}

function generateName() {
	return choose(["Bob", "Bill", "Ben", "Bart", "Barry", "Beth", "Belle"])
}


function generate() {
	generator=get("generatorSelect").value;
	console.log(generator);
	
	if (generator=="technobabble") {
		out=generateTechnobabble();
	}
	else if (generator=="name") {
		out=generateName();
	}
	get("output").innerHTML=out;
}