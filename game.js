"use strict";

var levels = require("./levels");

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
		"player-run-left": {
			"strip": "img/hamster-run-left.png",
			"frames": 22,
			"msPerFrame": 20
		},
		"player-run-right": {
			"strip": "img/hamster-run-right.png",
			"frames": 22,
			"msPerFrame": 20
		},
		"player-jump-left": {
			"strip": "img/hamster-jump-left.png",
			"frames": 19,
			"msPerFrame": 20
		},
		"player-jump-right": {
			"strip": "img/hamster-jump-right.png",
			"frames": 19,
			"msPerFrame": 20
		},
	}
};

//asset loading test
var game = new Splat.Game(canvas, manifest);

function buildLevel(level, scene) {
	var img = game.images.get("block-sand");

	scene.blocks = [];
	for (var i = 0; i < level.objects.length; i++) {
		var obj = level.objects[i];
		if (obj.type === "block") {
			var block = new Splat.AnimatedEntity(obj.x, obj.y, img.width, img.height, img, 0, 0);
			scene.blocks.push(block);
		} else if (obj.type === "spawn") {
			scene.spawn.x = obj.x;
			scene.spawn.y = obj.y;
			scene.player.x = obj.x;
			scene.player.y = obj.y;
		} else if (obj.type === "goal") {
			scene.goal.x = obj.x;
			scene.goal.y = obj.y;
		}
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

	this.player = new Splat.AnimatedEntity(100, 100, 96, 140, game.animations.get("player-run-left"), 0, 0); //hamster jones
	this.player.direction = "left";
	this.player.frictionX = 0.3;

	this.spawn = new Splat.Entity(0, 0, 100, 100);
	this.spawn.draw = function(context) {
		context.fillStyle = "blue";
		context.fillRect(this.x, this.y, this.width, this.height);
	};

	this.goal = new Splat.Entity(0, 0, 100, 100);
	this.goal.draw = function(context) {
		context.fillStyle = "green";
		context.fillRect(this.x, this.y, this.width, this.height);
	};

	buildLevel(levels[0], this);

	for (var y = bottomY; y > 0; y -= blockSize) {
		block = new Splat.AnimatedEntity(0, y, blockSize, blockSize, img, 0, 0);
		this.blocks.push(block);

		block = new Splat.AnimatedEntity(blockSize * blocksWide, y, blockSize, blockSize, img, 0, 0);
		this.blocks.push(block);
	}

}, function(elapsedMillis) {
	// simulation
	var movement = 1.0;

	if (game.keyboard.consumePressed("r")) {
		game.scenes.switchTo("title");
	}
	if (game.keyboard.isPressed("space")) {
		this.player.vy = -1.0;
	}
	if (game.keyboard.isPressed("right")) {
		this.player.vx = movement; //how fast he moves
		this.player.direction = "right";
	} else if (game.keyboard.isPressed("left")) {
		this.player.vx = -movement; //how fast he moves
		this.player.direction = "left";
	}
	if (this.player.direction === "left") {
		this.player.sprite = game.animations.get("player-run-left");
	} else {
		this.player.sprite = game.animations.get("player-run-right");
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

	this.spawn.draw(context);
	this.goal.draw(context);
	this.player.draw(context);
}));

game.scenes.switchTo("loading"); //going to title scene
