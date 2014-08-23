"use strict";

var level = {
	"name": "Level 1",
	"objects": [
		//platform
		{
			"x": 500,
			"y": 500,
			"type": "block"
		},
		{
			"x": 532,
			"y": 500,
			"type": "block"
		},
		{
			"x": 564,
			"y": 500,
			"type": "block"
		},
		{
			"x": 596,
			"y": 500,
			"type": "block"
		},
		//platform 2
		{
			"x": 800,
			"y": 436,
			"type": "block"
		},
		{
			"x": 832,
			"y": 436,
			"type": "block"
		},
		{
			"x": 864,
			"y": 436,
			"type": "block"
		},
		{
			"x": 896,
			"y": 436,
			"type": "block"
		},
		//platform 3
		{
			"x": 1007,
			"y": 372,
			"type": "block"
		},
		{
			"x": 1039,
			"y": 372,
			"type": "block"
		},
		//floor
		{
			"x": 32,
			"y": 608,
			"type": "block"
		},
		{
			"x": 64,
			"y": 608,
			"type": "block"
		},
		{
			"x": 96,
			"y": 608,
			"type": "block"
		},
		{
			"x": 128,
			"y": 608,
			"type": "block"
		},
		{
			"x": 160,
			"y": 608,
			"type": "block"
		},
		{
			"x": 192,
			"y": 608,
			"type": "block"
		}
	]
};

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

function drawLevel(context) {

	var block;
	var levelArray = level.objects;
	var blockSize = 32;
	var img = game.images.get("block-sand");
	context.blocks = [];
	
	for (var i = 0; i < levelArray.length; i++) {
		block = new Splat.AnimatedEntity(levelArray[i].x, levelArray[i].y, blockSize, blockSize, img, 0, 0);
		context.blocks.push(block);
	}
}

//this refers to current scene
game.scenes.add("title", new Splat.Scene(canvas, function() {
	// initialization
	var blockSize = 32;
	var blocksWide = Math.floor(canvas.width / blockSize) - 1;
	this.blocks = [];

	var bottomY = canvas.height - blockSize;
	var block;
	var img = game.images.get("block-sand");

	drawLevel(this);

	for (var y = bottomY; y > 0; y -= blockSize) {
		block = new Splat.AnimatedEntity(0, y, blockSize, blockSize, img, 0, 0);
		this.blocks.push(block);

		block = new Splat.AnimatedEntity(blockSize * blocksWide, y, blockSize, blockSize, img, 0, 0);
		this.blocks.push(block);
	}

	this.player = new Splat.AnimatedEntity(100, 100, 96, 140, game.animations.get("player-left"), 0, 0); //hamster jones
	this.player.frictionX = 0.3;
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
