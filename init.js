
var config = {
	fullscreen: true,
	colorground: "#d8c461",
	colorkeyboardslot: "#ad9b43",
	colorkeyboardtext: "#877933",
	colorjoiningbattle: "#5f9fb5",
	gladiatorspeed: 2,
	gladiatorattackspeed: 4,
	gladiatorrotationfriction: 0.99,
	gladiatorrotationvariance: 0.007,
	arenamargin: 100,
	ai: false,
	aibuttonpresschance: 0.028,
	hitboxes: false,
	waitshakeintensity: 4,
	transitionanimationrate: 1 / 100,
	auctiontime: 400,
	auctionovertime: 200,
	goldpergame: 30,
	disablef5: true,
	armorprotectionchance: 0.3,
	dummy: 0
};

var autoNameCounter = 1;

// Disable F5 page refresh
if(config.disablef5) {
	window.addEventListener("keydown", function(e) {
		if(e.keyCode === 116) {
			e.preventDefault();
		}
	}, false);
}

var engine = new Engine($("canvas")[0], Model, Selection);
