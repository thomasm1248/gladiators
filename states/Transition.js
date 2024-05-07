
var alphabet = "abcdefghijklmnopqrstuvwxyz";

function easeInOutCubic(x) {
	return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}



function Transition(gladiators, translation) {
	// Save dictionary
	this.gladiatorDict = gladiators;
	// Add participating gladiators to the Model
	Model.I.gladiators = [];
	for(var letter in gladiators) {
		var gladiator = gladiators[letter];
		if(gladiator == undefined) continue;
		if(!gladiator.joiningBattle) continue;
		Model.I.gladiators.push(gladiator);
	}
	// Initialize animations to random positions and rotations
	for(var i = 0; i < Model.I.gladiators.length; i++) {
		var gladiator = Model.I.gladiators[i];
		// Add translation that the keyboard in previous state had
		gladiator.pos.accum(translation);
		// Save current position and rotation
		gladiator.startRot = gladiator.rot;
		gladiator.startPos = new V(gladiator.pos);
		// Randomly decide on new position and rotation
		gladiator.endRot = Math.PI * 2 * Math.random();
		gladiator.endPos = new V(
			Math.random() * (Model.I.canvas.width - config.arenamargin*2) + config.arenamargin,
			Math.random() * (Model.I.canvas.height - config.arenamargin*2) + config.arenamargin
		);
	}
	// Animation stuff
	this.t = 0;
}

Transition.prototype.transitionGladiators = function() {
	var t = easeInOutCubic(this.t);
	for(var i = 0; i < Model.I.gladiators.length; i++) {
		var gladiator = Model.I.gladiators[i];
		// Move this gladiator
		gladiator.pos = V.interp(gladiator.startPos, gladiator.endPos, t);
		// Rotate this gladiator
		gladiator.rot = interp(gladiator.startRot, gladiator.endRot, t);
	}
};

Transition.prototype.update = function() {
	// Move animation along
	this.t += config.transitionanimationrate;
	// Move the gladiators
	this.transitionGladiators();
	// Draw the world
	Model.I.draw("background");
	Model.I.draw("gladiators");
	// Start regular gameplay if the animation is over
	if(this.t >= 1) Engine.I.state = new Game(this.gladiatorDict);
};
