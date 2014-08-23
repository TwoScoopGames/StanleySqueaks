"use strict";

var Splat = require("splatjs");
var canvas = document.getElementById("canvas");

var manifest = {
	"images": {
		"background": "img/background.png",
		"block-sand": "img/block-sand.png"
	},
	"sounds": {
	},
	"fonts": {
	},
	"animations": {
		"player-left": {
			"strip": "img/hamster-run-left.png",
			"frames": 22,
			"msPerFrame": 20
		}
	}
};

//asset loading test
var game = new Splat.Game(canvas, manifest);

//this refers to current scene
game.scenes.add("title", new Splat.Scene(canvas, function() {
	// initialization
	var blockSize = 32;
	var blocksWide = Math.floor(canvas.width / blockSize) - 1;
	this.blocks = [];

	var bottomY = canvas.height - blockSize;
	var block;
	var img = game.images.get("block-sand");
	for (var x = 0; x < blocksWide; x++) {
		block = new Splat.AnimatedEntity(x * blockSize, bottomY, blockSize, blockSize, img, 0, 0);
		this.blocks.push(block);
	}
	for (var y = bottomY; y > 0; y -= blockSize) {
		block = new Splat.AnimatedEntity(0, y, blockSize, blockSize, img, 0, 0);
		this.blocks.push(block);

		block = new Splat.AnimatedEntity(blockSize * blocksWide, y, blockSize, blockSize, img, 0, 0);
		this.blocks.push(block);
	}

	this.player = new Splat.AnimatedEntity(100, 100, 96, 140, game.animations.get("player-left"), 0, 0); //hamster jones
	this.player.frictionX = 0.9;
}, function(elapsedMillis) {
	// simulation
	var movement = 1.0;

	if (game.keyboard.consumePressed("r")) {
		this.player.x = 100;
		this.player.y = 100;
		this.player.vx = 0;
		this.player.vy = 0;
	}
	if (game.keyboard.isPressed("space")) {
		this.player.vy = -1.0;
	}
	if (game.keyboard.isPressed("right")) {
		this.player.vx = movement; //how fast he moves
	} else if (game.keyboard.isPressed("left")) {
		this.player.vx = -movement; //how fast he moves
	}

	this.player.vy += 0.1;

	this.player.move(elapsedMillis);
	this.player.solveCollisions(this.blocks);
	if (!this.player.moved()) {
		this.player.sprite.reset();
	}

}, function(context) {
	// draw
	context.drawImage(game.images.get("background"), 0, 0);

	for(var i=0; i<this.blocks.length; i++) {
		this.blocks[i].draw(context);
	}
	
	this.player.draw(context);
}));

game.scenes.switchTo("loading"); //going to title scene
