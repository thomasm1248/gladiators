
var alphabet = "abcdefghijklmnopqrstuvwxyz";



function Game(gladiators) {
	// Save dictionary
	this.gladiatorDict = gladiators;

	// Keep track of rank gladiator would get if the died right now
	this.deadGladiators = [];

	this.gameEnded = false;
	this.gameOverTimer = config.gameovertime;
}

Game.prototype.handleGladiatorControls = function() {
	for(var i = 0; i < Engine.I.keys.keyQueue.length; i++) {
		var key = Engine.I.keys.keyQueue[i];
		if(key >= 65 && key <= 90) {
			var letter = alphabet[key - 65];
			var gladiator = this.gladiatorDict[letter];
			if(gladiator != undefined) gladiator.controlButtonIsPressed = true;
		}
	}
	// If AI is on, press buttons randomly
	if(config.ai) {
		for(var i = 1; i < alphabet.length; i++) {
			var gladiator = this.gladiatorDict[alphabet[i]];
			if(gladiator == undefined) continue;
			if(Math.random() < config.aibuttonpresschance) {
				gladiator.controlButtonIsPressed = true;
			}
		}
	}
};

Game.prototype.updateGladiators = function() {
	for(var i = 0; i < Model.I.gladiators.length; i++) {
		if(Model.I.gladiators[i].update()) {
			// Remove gladiator
			this.deadGladiators.unshift(Model.I.gladiators[i]);
			Model.I.gladiators.splice(i, 1);
			i--;
		}
	}
};

Game.prototype.endGame = function() {
	this.gameEnded = true;
	// Give remaining gladiator a rank of 1 by adding to the beginning of the dead list
	if(Model.I.gladiators.length == 1) {
		this.deadGladiators.unshift(Model.I.gladiators[0]);
	}
	// Award gold based on how well each gladiator did
	// One for each kill, and one for each gladiator that didn't die first
	var shares = (this.deadGladiators.length - 1) * 2;
	// More shares for the gold, silver, and bronze awards
	if(shares >= 3) shares += 7;
	else if(shares >= 2) shares += 6;
	else shares += 4;
	// Split gold evenly between shares
	var shareOfGold = Math.round(config.goldpergame / shares);
	// Award shares
	for(var i = 0; i < this.deadGladiators.length; i++) {
		var gladiator = this.deadGladiators[i];
		// Give them one share of gold
		gladiator.gold += shareOfGold;
		// Give them more gold if they survived longer
		if(i == 0) gladiator.gold += shareOfGold * 4;
		if(i == 1) gladiator.gold += shareOfGold * 2;
		if(i == 2) gladiator.gold += shareOfGold * 1;
		// Give them more gold for each kill they got
		gladiator.gold += shareOfGold * gladiator.kills;
	}
	// Remove last place from game
	this.gladiatorDict[this.deadGladiators[this.deadGladiators.length-1].letter] = undefined;
};

Game.prototype.update = function() {
	this.handleGladiatorControls();
	this.updateGladiators();
	Model.I.draw("background");
	Model.I.draw("gladiators");
	// Check for win condition
	if(Model.I.gladiators.length <= 1 && !this.gameEnded) this.endGame();
	// Check for condition to switch back to main menu
	if(this.gameEnded) {
		this.gameOverTimer--;
		if(this.gameOverTimer < 0) Engine.I.state = new Selection(this.gladiatorDict);
	}
};
