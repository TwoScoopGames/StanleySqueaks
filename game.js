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

	this.player = new Splat.Entity(100, 100, 40, 50); //hamster jones
	this.player.draw = function(context) {
		context.fillStyle = "red";
		context.fillRect(this.x, this.y, this.width, this.height);
	};
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
	} else {
		this.player.vx = 0;
	}

	this.player.vy += 0.1;

	this.player.move(elapsedMillis);
	this.player.solveCollisions(this.blocks);

}, function(context) {
	// draw
	context.drawImage(game.images.get("background"), 0, 0);

	for(var i=0; i<this.blocks.length; i++) {
		this.blocks[i].draw(context);
	}
	
	this.player.draw(context);
}));

game.scenes.switchTo("loading"); //going to title scene
