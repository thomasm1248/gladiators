
var alphabet = "abcdefghijklmnopqrstuvwxyz";
var keyboard = [
	"qwertyuiop",
	"asdfghjkl",
	"zxcvbnm"
];
var lettersOnKeyboard = {};
for(var i = 0; i < keyboard.length; i++) {
	var row = keyboard[i];
	for(var j = 0; j < row.length; j++) {
		lettersOnKeyboard[row[j]] = new V(j, i);
	}
}
var keySize = 80;
var keySpacing = 30;
var keyboardRowShift = [0, 0.3*keySize, 0.9*keySize];
function letterToCoordinates(letter) {
	var pos = lettersOnKeyboard[letter];
	var coords = new V();
	coords.x += keyboardRowShift[pos.y];
	coords.x += pos.x * (keySize + keySpacing);
	coords.y += pos.y * (keySize + keySpacing);
	return coords;
}



function Selection(gladiatorDict) {
	if(gladiatorDict == undefined) {
		this.gladiators = {};
	} else {
		this.gladiators = gladiatorDict;
		// Reset position and rotation
		for(var letter in this.gladiators) {
			var gladiator = this.gladiators[letter];
			if(gladiator == undefined) continue;
			gladiator.state = "wander";
			gladiator.kills = 0;
			gladiator.dead = false;
			gladiator.rot = -Math.PI/2;
			gladiator.pos = letterToCoordinates(gladiator.letter);
			gladiator.pos.accum(new V(keySize/2, keySize/2));
		}
	}

	// Translation for top-left corner of keyboard
	this.translation = new V(
		-(keySize + (keySize+keySpacing) * (keyboard[0].length - 1)) / 2,
		-(3*keySize + 2*keySpacing) / 2
	);
	var center = new V(Model.I.canvas.width/2, Model.I.canvas.height/2);
	this.translation.accum(center);

	Model.I.init();
}

Selection.prototype.drawKeyboard = function() {
	var ctx = Model.I.ctx;
	var canvas = Model.I.canvas;

	ctx.save();
	translate(ctx, this.translation);
	ctx.lineWidth = 10;
	ctx.lineJoin = "round";
	ctx.textAlign = "center";
	for(var i = 0; i < alphabet.length; i++) {
		// Get some needed information
		var letter = alphabet[i];
		var coords = letterToCoordinates(letter);
		var gladiator = this.gladiators[letter];
		// Draw the key
		if(gladiator != undefined && gladiator.joiningBattle) {
			ctx.fillStyle = config.colorjoiningbattle;
			ctx.strokeStyle = config.colorjoiningbattle;
		} else {
			ctx.fillStyle = config.colorkeyboardslot;
			ctx.strokeStyle = config.colorkeyboardslot;
		}
		ctx.fillRect(coords.x, coords.y, keySize, keySize);
		ctx.strokeRect(coords.x, coords.y, keySize, keySize);
		// Draw gladiator or letter if there is none
		if(gladiator != undefined) {
			gladiator.draw(ctx);
			// Draw the gold they have
			ctx.fillStyle = "Black";
			ctx.font = "15px Sans Serif";
			ctx.fillText("$ " + gladiator.gold, coords.x + keySize/2, coords.y + keySize*0.95);
		} else {
			ctx.font = "60px Serif";
			ctx.fillStyle = config.colorkeyboardtext;
			ctx.fillText(letter, coords.x + keySize/2, coords.y + keySize*0.8);
		}
	}
	ctx.restore();
};

Selection.prototype.update = function() {
	// Handle input
	var nextState = "";
	for(var i = 0; i < Engine.I.keys.keyQueue.length; i++) {
		var key = Engine.I.keys.keyQueue[i];
		// Create and toggle gladiators if a letter is pressed
		if(key >= 65 && key <= 90) {
			var letter = alphabet[key - 65];
			var currentGladiator = this.gladiators[letter];
			// If gladiator already exists, toggle its participation in the next battle
			if(currentGladiator != undefined) {
				currentGladiator.joiningBattle = !currentGladiator.joiningBattle;
				continue;
			}
			// Otherwise, ask for the name of the new gladiator
			var name = prompt("Name");
			if(name == null) continue;
			if(name == "") {
				name = "#" + autoNameCounter;
				autoNameCounter += 1;
			}
			// Place the gladiator on its key slot
			var pos = letterToCoordinates(letter);
			pos.accum(new V(keySize/2, keySize/2));
			// Create a new gladiator
			this.gladiators[letter] = new Gladiator(letter, name, pos);
		}
		// Start battle if enter is pressed
		if(key == 13) {
			var start = confirm("Start?");
			if(start) {
				nextState = "start-game";
			}
		}
		// Start auction if spacebar is pressed
		if(key == 32) {
			var auction = confirm("Start an auction?");
			if(auction) {
				nextState = "auction";
			}
		}
	}

	// Draw the world
	Model.I.draw("background");
	this.drawKeyboard();

	// Now that everything else is done, switch to a new state if requested by the players
	if(nextState == "start-game") {
		Engine.I.state = new Transition(this.gladiators, this.translation);
	}
	if(nextState == "auction") {
		Engine.I.state = new Auction(this.gladiators, this.translation);
	}
};
