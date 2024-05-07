/* Game Engine

This script requires the 2D Vectors script to work.

Todo:

* Add support for local storage and cookies
* Add support for overlays

*/

function Engine(canvas, modelConstructor, stateConstructor) {
	Engine.I = this;

	// Setup canvas
	this.canvas = canvas;
	if(config.fullscreen != undefined && config.fullscreen) {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		window.document.body.style.margin = "0";
		window.document.body.style.overflow = "hidden";
	}
	this.ctx = this.canvas.getContext("2d");
	this.ctx.imageSmoothingEnabled = false;

	// Setup environment objects
	this.config = config;
	this.model = new modelConstructor(this.canvas, this.ctx);
	this.state = new stateConstructor();
	this.keys = {
		keyQueue: [],
		charQueue: [],
		isDown: function(keyCode) {
			if(this["" + keyCode] === undefined) {
				return false;
			} else {
				return this["" + keyCode];
			}
		}
	};
	this.mouse = {
		pos: new V(),
		clicked: false,
		down: false
	};

	var engine = this;
	window.addEventListener("keydown", function(e) {
		engine.keydown(e);
	}, false);
	window.addEventListener("keyup", function(e) {
		engine.keyup(e);
	}, false);
	window.addEventListener("mousedown", function(e) {
		engine.mousedown(e);
	}, false);
	window.addEventListener("mouseup", function(e) {
		engine.mouseup(e);
	}, false);
	window.addEventListener("mousemove", function(e) {
		engine.mousemove(e);
	}, false);
	window.addEventListener("click", function(e) {
		engine.click(e);
	}, false);

	var engine = this;
	function loop() {
		window.requestAnimationFrame(loop);
		engine.state.update();
		engine.keys.keyQueue = [];
		engine.keys.charQueue = [];
	};
	loop();
}

Engine.prototype.newRandomPosition = function() {
	return new V(Math.random() * this.canvas.width, Math.random() * this.canvas.height);
};

Engine.prototype.doHexKeyControls = function(pos, speed, keyCodes) {
	/*
		 0
		1 2
	*/
	if(this.keys.isDown(keyCodes[0]))
		pos.y -= speed;
	if(this.keys.isDown(keyCodes[1])) {
		pos.x -= speed * Math.cos(Math.PI/6);
		pos.y += speed * Math.sin(Math.PI/6);
	}
	if(this.keys.isDown(keyCodes[2])) {
		pos.x += speed * Math.cos(Math.PI/6);
		pos.y += speed * Math.sin(Math.PI/6);
	}
};

Engine.prototype.doArrowKeyControls = function(pos, speed, keyCodes) {
	/*
		 0
		123
	*/
	var newV = new V();
	if(this.keys.isDown(keyCodes[0])) newV.y -= speed;
	if(this.keys.isDown(keyCodes[2])) newV.y += speed;
	if(this.keys.isDown(keyCodes[1])) newV.x -= speed;
	if(this.keys.isDown(keyCodes[3])) newV.x += speed;

	if(newV.norm() > 0) pos.accum(newV.normalize().scale(speed));
};

Engine.prototype.doSteeringControls = function(speed, rotationSpeed, keyCodes) {
	/*
		 0
		123
	*/
	var distanceToMove = 0;
	var amountToRotate = 0;
	if(this.keys.isDown(keyCodes[0])) distanceToMove += speed;
	if(this.keys.isDown(keyCodes[2])) distanceToMove -= speed;
	if(this.keys.isDown(keyCodes[1])) amountToRotate -= rotationSpeed;
	if(this.keys.isDown(keyCodes[3])) amountToRotate += rotationSpeed;
	return {
		move: distanceToMove,
		rotate: amountToRotate
	};
};

// Event handlers

Engine.prototype.keydown = function(e) {
	this.keys["" + e.keyCode] = true;
	this.keys.keyQueue.push(e.keyCode);
	this.keys.charQueue.push(String.fromCharCode(e.keyCode));
};

Engine.prototype.keyup = function(e) {
	this.keys["" + e.keyCode] = false;
};

Engine.prototype.mousedown = function(e) {

};

Engine.prototype.mouseup = function(e) {

};

Engine.prototype.mousemove = function(e) {
	this.mouse.pos = new V(e.pageX, e.pageY);
};

Engine.prototype.click = function(e) {

};
