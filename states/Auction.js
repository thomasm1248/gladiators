
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

var items; // defined at the bottom
function selectRandomItem() {
	var randomNumber = Math.random();
	for(var i = 0; i < items.length; i++) {
		if(randomNumber < items[i].probabilityStop) return items[i];
	}
	return items[items.length - 1]; // just in case...
}



function Auction(gladiators, translation) {
	this.gladiators = gladiators;
	this.translation = translation;
	
	// Set each gladiator's bid to 0
	for(var letter in gladiators) {
		var gladiator = gladiators[letter];
		if(gladiator == undefined) continue;
		gladiator.bid = 0;
	}

	this.item = selectRandomItem();

	this.timer = config.auctiontime;
}

Auction.prototype.handleButtons = function() {
	for(var i = 0; i < Engine.I.keys.keyQueue.length; i++) {
		var key = Engine.I.keys.keyQueue[i];
		if(key >= 65 && key <= 90) {
			var letter = alphabet[key - 65];
			var gladiator = this.gladiators[letter];
			if(gladiator != undefined && gladiator.bid < gladiator.gold) {
				gladiator.bid++;
				if(this.currentWinner == undefined || gladiator.bid > this.currentWinner.bid) {
					this.currentWinner = gladiator;
					// Reset the timer back a bit so others have time to compete
					if(this.timer < config.auctionovertime) this.timer = config.auctionovertime;
				}
			}
		}
	}
};

Auction.prototype.drawKeyboard = function() {
	var ctx = Model.I.ctx;
	var canvas = Model.I.canvas;

	ctx.textAlign = "center";
	ctx.fillStyle = "black";
	// Draw item name
	ctx.font = "50px Serif";
	ctx.fillText(this.item.name, canvas.width / 2, 120);
	// Draw current best bid
	if(this.currentWinner != undefined) {
		ctx.font = "30px Serif";
		ctx.fillText("Highest Bid: $ " + this.currentWinner.bid, canvas.width / 2, 160);
	}
	// Draw timer
	var width = 400;
	ctx.fillStyle = "blue";
	ctx.fillRect(canvas.width/2 - width/2, 200, width*this.timer/config.auctiontime, 10);
	// Draw keyboard with gladiators on them
	ctx.save();
	translate(ctx, this.translation);
	ctx.lineWidth = 10;
	ctx.lineJoin = "round";
	for(var i = 0; i < alphabet.length; i++) {
		// Get some needed information
		var letter = alphabet[i];
		var coords = letterToCoordinates(letter);
		var gladiator = this.gladiators[letter];
		// Draw the key (color white if the current bid winner)
		if(gladiator != undefined && gladiator == this.currentWinner) {
			ctx.fillStyle = "white";
			ctx.strokeStyle = "white";
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
			ctx.fillText("$ " + gladiator.gold + " -" + gladiator.bid, coords.x + keySize/2, coords.y + keySize*0.95);
		} else {
			ctx.font = "60px Serif";
			ctx.fillStyle = config.colorkeyboardtext;
			ctx.fillText(letter, coords.x + keySize/2, coords.y + keySize*0.8);
		}
	}
	ctx.restore();
};

Auction.prototype.resolveAuction = function() {
	// Get the winner of the auction
	var winner = this.currentWinner;
	if(winner == undefined) return;
	// Make sure they actually bid something
	if(winner.bid == 0) return;
	// Take their bid
	winner.gold -= winner.bid;
	// Give them the item
	this.item.code(winner);
};

Auction.prototype.update = function() {
	// Handle input
	this.handleButtons();
	// Draw everything
	Model.I.draw("background");
	this.drawKeyboard();
	// Count down timer
	this.timer--;
	if(this.timer == 0) {
		this.resolveAuction();
		Engine.I.state = new Selection(this.gladiators);
	}
};



// List of items that could appear at the auction
items = [
	{
		name: "Increased Charge Speed",
		rarity: 2,
		code: function(gladiator) {
			gladiator.chargeSpeed += config.chargespeedupgrade;
		}
	},
	{
		name: "Bag of Gold",
		rarity: 10,
		code: function(gladiator) {
			gladiator.gold += Math.ceil(Math.random() * 50);
		}
	},
	{
		name: "Ten Pieces of Armor",
		rarity: 10,
		code: function(gladiator) {
			gladiator.armor += 10;
		}
	},
	{
		name: "Three Pieces of Armor",
		rarity: 3,
		code: function(gladiator) {
			gladiator.armor += 3;
		}
	},
	{
		name: "One Piece of Armor",
		rarity: 1,
		code: function(gladiator) {
			gladiator.armor++;
		}
	}
];
// Find probabalistic weight of each item (reciprocal of rarity)
// Sum the weights
var sumOfWeights = 0;
for(var i = 0; i < items.length; i++) {
	items[i].weight = 1 / items[i].rarity;
	sumOfWeights += items[i].weight;
}
// Distribute probability stops of items between 0 and 1
var runningTotal = 0;
var debugList = [];
for(var i = 0; i < items.length; i++) {
	var normalizedWeight = items[i].weight / sumOfWeights;
	runningTotal += normalizedWeight;
	debugList.push(runningTotal);
	items[i].probabilityStop = runningTotal;
}
console.log(debugList);
