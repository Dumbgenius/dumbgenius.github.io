function choose(list) {
	return list[Math.floor(Math.random()*list.length)];
}

function chooseWeighted(list) {
	var total=0;
	for (var i=0; i<list.length; i++) {
		list[i][2]=total;
		total+=list[i][1];
	}
	r=Math.random()*total;
	for (var i=0; i<list.length; i++) {
		
	}
}

function parseGenerator() {}

function Word(text, plural, infinitive, ing) {
    this.text=text
    this.plural=plural
    this.infinitive=infinitive
    this.ing=ing
}


