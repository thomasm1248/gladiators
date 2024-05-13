
function Gladiator(letter, name, pos) {
	this.letter = letter;
	this.name = name;

	this.joiningBattle = true;
	
	this.pos = pos;
	this.rot = -Math.PI/2;
	this.rotVel = 0;

	this.chargeSpeed = config.gladiatorattackspeed;

	this.rad = 20;

	this.controlButtonIsPressed = false;
	this.state = "wander"; // wander wait charge

	this.gold = 10; // Each gladiator starts with 10 gold

	this.armor = 0;
	this.armorHit = false; // used to make gladiator flash red when armor hit

	this.kills = 0;
	this.dead = false;
}

Gladiator.prototype.wander = function() {
	// Stay in bounds
	if(this.pos.x < config.arenamargin ||
	   this.pos.x > Model.I.canvas.width - config.arenamargin
	   ) {
		this.rot -= Math.PI / 2;
		this.rot *= -1;
		this.rot += Math.PI / 2;
	}
	if(
	   this.pos.y < config.arenamargin ||
	   this.pos.y > Model.I.canvas.height - config.arenamargin
	   ) {
		this.rot *= -1;
	}
	if(this.pos.x < config.arenamargin) this.pos.x = config.arenamargin;
	if(this.pos.y < config.arenamargin) this.pos.y = config.arenamargin;
	if(this.pos.x > Model.I.canvas.width - config.arenamargin) this.pos.x = Model.I.canvas.width - config.arenamargin;
	if(this.pos.y > Model.I.canvas.height - config.arenamargin) this.pos.y = Model.I.canvas.height - config.arenamargin;
	// Retain some previous rotation force and rotate randomly
	this.rotVel *= config.gladiatorrotationfriction;
	this.rotVel += (Math.random() * 2 - 1) * config.gladiatorrotationvariance;
	this.rot += this.rotVel;

	// Move in facing direction
	var move = V.trig(this.rot, config.gladiatorspeed);
	this.pos.accum(move);
};

Gladiator.prototype.takeDamage = function() {
	for(var i = 0; i < this.armor; i++) {
		if(Math.random() < config.armorprotectionchance) {
			this.armor -= i + 1;
			this.armorHit = true;
			return;
		}
	}
	this.dead = true;
};

Gladiator.prototype.charge = function() {
	// Move in facing direction
	var move = V.trig(this.rot, this.chargeSpeed);
	this.pos.accum(move);
	// Attack other gladiators
	for(var i = 0; i < Model.I.gladiators.length; i++) {
		var gladiator = Model.I.gladiators[i];
		if(gladiator != this) {
			var dist = V.add(this.pos, this.chargeBoxPos).dist(gladiator.pos);
			if(dist < this.rad * 2) {
				gladiator.takeDamage();
				// Stop charging if they didn't die
				if(!gladiator.dead) {
					this.state = "wander";
				} else {
					this.kills++;
				}
			}
		}
	}
	// Check if near edges
	if(this.pos.x < config.arenamargin ||
	   this.pos.y < config.arenamargin ||
	   this.pos.x > Model.I.canvas.width - config.arenamargin ||
	   this.pos.y > Model.I.canvas.height - config.arenamargin
	   ) {
		this.state = "wander";
	}
};

Gladiator.prototype.update = function() {
	// AI likes to charge a lot
	if(config.ai && this.state == "charge" && this.letter != 'a') this.controlButtonIsPressed = false;
	// Check if the state needs to be changed
	if(this.controlButtonIsPressed) {
		this.controlButtonIsPressed = false;
		switch(this.state) {
			case "wander":
				this.state = "wait";
				break;
			case "wait":
				this.state = "charge";
				this.chargeBoxPos = V.trig(this.rot, 20);
				break;
			case "charge":
				this.state = "wander";
				break;
		}
	}
	// Check state
	switch(this.state) {
		case "wander":
			this.wander();
			break;
		case "wait":
			break;
		case "charge":
			this.charge();
			break;
	}
	// Let system know if this gladiator needs to be removed
	return this.dead;
};

Gladiator.prototype.draw = function(ctx) {
	ctx.save();
	translate(ctx, this.pos);
	// Draw name
	ctx.fillStyle = "black";
	ctx.globalAlpha = 0.5;
	ctx.font = "20px Sans Serif";
	ctx.textAlign = "center";
	ctx.fillText(this.name, 0, -30);
	ctx.globalAlpha = 1;
	// Shake if waiting
	if(this.state == "wait") {
		ctx.translate(
			(Math.random()*2 - 1) * config.waitshakeintensity,
			(Math.random()*2 - 1) * config.waitshakeintensity
		);
	}
	// Rotate
	ctx.save();
	ctx.rotate(this.rot);
	// Arrow
	if(this.armorHit) {
		ctx.fillStyle = "red";
		this.armorHit = false;
	} else {
		ctx.fillStyle = "black";
	}
	ctx.beginPath();
	ctx.moveTo(-15, -20);
	ctx.lineTo(25, 0);
	ctx.lineTo(-15, 20);
	ctx.lineTo(-15, -20);
	ctx.fill();
	if(config.hitboxes) {
		// Hitbox
		ctx.strokeStyle = "green";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.arc(0, 0, this.rad, 0, Math.PI*2);
		ctx.stroke();
		// Attack box
		if(this.state == "attack") {
			ctx.strokeStyle = "red";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.arc(20, 0, this.rad, 0, Math.PI*2);
			ctx.stroke();
		}
	}
	ctx.restore();
	// Armor count
	if(this.armor > 0) {
		ctx.fillStyle = "white";
		ctx.font = "12px Sans Serif";
		ctx.fillText(this.armor, 0, 3);
	}
	ctx.restore();
};
