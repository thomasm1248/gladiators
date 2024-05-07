
function Model(canvas, context) {
	this.canvas = canvas;
	this.ctx = context;

	this.gladiators = [];

	Model.I = this;
}

Model.prototype.init = function() {
};

Model.prototype.drawBackground = function() {
	var ctx = this.ctx;
	var canvas = this.canvas;

	ctx.fillStyle = "#b7b7b7";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = config.colorground;
	var margin = config.arenamargin - 20;
	ctx.fillRect(margin, margin, canvas.width - margin*2, canvas.height - margin*2);
};

Model.prototype.drawGladiators = function() {
	for(var i = 0; i < this.gladiators.length; i++) {
		this.gladiators[i].draw(this.ctx);
	}
};

Model.prototype.draw = function(layer) {
	switch(layer) {
		case "background":
			this.drawBackground();
			break;
		case "gladiators":
			this.drawGladiators();
			break;
	}
};
