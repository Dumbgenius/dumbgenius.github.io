chemicalNames = {
	"H":[1, "Hydrogen"],
	"He":[4, "Helium"],
	"Li":[7, "Lithium"],
	"Be":[9, "Beryllium"],
	"B":[11, "Boron"],
	"C":[12, "Carbon"],
	"N":[14, "Nitrogen"],
	"O":[16, "Oxygen"],
	"F":[19, "Fluorine"],
	"Ne":[20, "Neon"],
	"Na":[23, "Sodium"],
	"Mg":[24, "Magnesium"],
	"Al":[27, "Aluminium"],
	"Si":[28, "Silicon"],
	"P":[31, "Phosphorus"],
	"S":[32, "Sulphur"],
	"Cl":[35.5, "Chlorine"],
	"Ar":[40, "Argon"],
	"K":[39, "Potassium"],
	"Ca":[40, "Calcium"],
	"Sc":[45, "Scandium"],
	"Ti":[48, "Titanium"],
	"V":[51, "Vanadium"],
	"Cr":[52, "Chromium"],
	"Mn":[55, "Manganese"],
	"Fe":[56, "Iron"],
	"Co":[59, "Cobalt"],
	"Ni":[59, "Nickel"],
	"Cu":[63.5, "Copper"],
	"Zn":[65, "Zinc"],
	"Ga":[70, "Gallium"],
	"Ge":[73, "Germanium"],
	"As":[75, "Astatine"],
	"Se":[79, "Selenium"],
	"Br":[80, "Bromine"],
	"Kr":[84, "Krypton"],
	"Rb":[85, "Rubidium"],
	"Sr":[88, "Strontium"],
	"Y":[89, "Yttrium"],
	"Zr":[91, "Zirconium"],
	"Nb":[93, "Niobium"],
	"Mo":[96, "Molybdenum"],
	"Ru":[101, "Ruthesium"],
	"Rh":[103, "Rhodium"],
	"Pd":[106, "Palladium"],
	"Ag":[108, "Silver"],
	"Cd":[112, "Cadmium"],
	"In":[115, "Indium"],
	"Sn":[119, "Tin"],
	"Sb":[122, "Antimony"],
	"Te":[128, "Tellurium"],
	"I":[127, "Iodine"],
	"Xe":[131, "Xenon"],
	"Cs":[133, "Caesium"],
	"Ba":[137, "Barium"],
	"La":[139, "Lanthanum"], //skip the lanthanides
	"Hf":[178, "Hafnium"],
	"Ta":[181, "Tantalum"],
	"W":[184, "Tungsten"],
	"Re":[186, "Rhenium"],
	"Os":[190, "Osmium"],
	"Ir":[192, "Iridium"],
	"Pt":[195, "Platnium"],
	"Au":[197, "Gold"],
	"Hg":[201, "Mercury"],
	"Tl":[204, "Thallium"],
	"Pb":[207, "Lead"],
	"Bi":[209, "Bismuth"],
};



function get(x) {return document.getElementById(x)}

function checkEnter(e) {
	if (e.keyCode==13) {
		get("solve").click();
	}
}

function checkChemName(id) {
	var inString = get(id).value;
	var chems = inString.split(/(?=[A-Z])/);
	var compound = {};
	var noElements = 0;
	var elementIndex = [];
	//TODO: Add bracket parsing, so formulae like "Ca(OH)2" work properly
	for (var i=0; i<chems.length; i++) {
		if (chems[i].split(/(?=[0-9])/)[0] == chems[i]) {//if there are no numbers on the end
			if (compound[chemicalNames[chems[i]][1]] == undefined) {
				compound[chemicalNames[chems[i]][1]] = [chems[i],1];
				noElements += 1;
				elementIndex.push(chemicalNames[chems[i].split(/(?=[0-9])/)[0]][1]);
			} else {
				compound[chemicalNames[chems[i]][1]][1] += 1;
			}
			chems[i] = [chems[i], 1];
		} else {
			if (compound[chemicalNames[chems[i].split(/(?=[0-9])/)[0]][1]] == undefined) {
				compound[chemicalNames[chems[i].split(/(?=[0-9])/)[0]][1]] = [chems[i].split(/(?=[0-9])/)[0], parseInt(chems[i].split(/(?=[0-9])/)[1])];
				noElements += 1;
				elementIndex.push(chemicalNames[chems[i].split(/(?=[0-9])/)[0]][1]);
			} else {
				compound[chemicalNames[chems[i].split(/(?=[0-9])/)[0]][1]][1] += parseInt(chems[i].split(/(?=[0-9])/)[1]);
			}
			chems[i] = chems[i].split(/(?=[0-9])/);
		}
	} //this is clearly not the most efficient or clean method of doing this, but it's the method i'm doing it by.
	
	compound.noElements = noElements;
	compound.elementIndex = elementIndex;
	
	return compound;
}

function getMr(compound) {
	var Mr = 0;
	for (var i=0; i<compound.noElements; i++) {
		el = compound[compound.elementIndex[i]];
		Mr += chemicalNames[el[0]][0] * el[1];
	}
	return Mr;
}



function solve() {
	var compound1 = checkChemName("chemName1");
	var compound2 = checkChemName("chemName2");
	
	if (get("chemConcentrationType1").value == "mol/dm3") {
		var molsCompound1 = (get("chemVolume1").value * get("chemVolumeType1").value) * get("chemConcentration1").value;
	} else {
		var molsCompound1 = (get("chemVolume1").value * get("chemVolumeType1").value) * (get("chemConcentration1").value / getMr(compound1));
	}
	var gramsCompound1 = molsCompound1 / getMr(compound1);
	var concentrationCompound1 = molsCompound1 / (get("chemVolume1").value * get("chemVolumeType1").value)
	
	var molsCompound2 = molsCompound1 * (get("chemRatio2").value / get("chemRatio1").value);
	var gramsCompound2 = molsCompound2 / getMr(compound2);
	var concentrationCompound2 = molsCompound2 / (get("chemVolume2").value * get("chemVolumeType2").value);
	
	outString1 = get("chemName1").value + " solution: " + concentrationCompound1.toPrecision(3) + " mol/dm3; there are " + molsCompound1 .toPrecision(3)
		+ " moles (" + gramsCompound1.toPrecision(3) + "g) of " +get("chemName1").value + " in the sample."
	outString2 = get("chemName2").value + " solution: " + concentrationCompound2.toPrecision(3) + " mol/dm3; there are " + molsCompound2 .toPrecision(3)
		+ " moles (" + gramsCompound2.toPrecision(3) + "g) of " +get("chemName2").value + " in the sample."
	
	get("output").innerHTML = outString1 + "<br>" + outString2;
}



