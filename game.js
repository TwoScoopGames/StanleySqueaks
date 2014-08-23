"use strict";

var Splat = require("splatjs");
var canvas = document.getElementById("canvas");

var manifest = {
	"images": {
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


function centerText(context, text, offsetX, offsetY) {
	var w = context.measureText(text).width;
	var x = offsetX + (canvas.width / 2) - (w / 2) | 0;
	var y = offsetY | 0;
	context.fillText(text, x, y);
}

var drawBlock = function(context) {
	context.strokeStyle = "blue";
	context.strokeRect(this.x, this.y, this.width, this.height);
};

//this refers to current scene
game.scenes.add("title", new Splat.Scene(canvas, function() {
	// initialization
	var blockSize = 32;
	var blocksWide = Math.floor(canvas.width / blockSize) - 1;
	this.blocks = [];

	var bottomY = canvas.height - blockSize;
	var block;
	for (var x = 0; x < blocksWide; x++) {
		block = new Splat.Entity(x * blockSize, bottomY, blockSize, blockSize);
		block.draw = drawBlock;
		this.blocks.push(block);
	}
	for (var y = bottomY; y > 0; y -= blockSize) {
		block = new Splat.Entity(0, y, blockSize, blockSize);
		block.draw = drawBlock;
		this.blocks.push(block);

		block = new Splat.Entity(blockSize * blocksWide, y, blockSize, blockSize);
		block.draw = drawBlock;
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
	context.fillStyle = "#092227";
	context.fillRect(0, 0, canvas.width, canvas.height);

	context.fillStyle = "#fff";
	context.font = "25px helvetica";
	centerText(context, "Blank SplatJS Project", 0, canvas.height / 2 - 13);

	for(var i=0; i<this.blocks.length; i++) {
		this.blocks[i].draw(context);
	}
	
	this.player.draw(context);
}));

game.scenes.switchTo("loading"); //going to title scene
