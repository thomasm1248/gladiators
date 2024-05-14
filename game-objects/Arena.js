
function Arena() {
	this.margin = config.arenamargin;

	Arena.I = this;
}

Arena.prototype.update = function() {
	this.margin += config.arenashrinkrate;
};
