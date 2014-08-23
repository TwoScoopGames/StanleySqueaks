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

function addBlock(scene, imageName, x, y) {
	var blockSize = 32;
	var img = game.images.get(imageName);
	var gridX = Math.floor(x / blockSize) * blockSize;
	var gridY = Math.floor(y / blockSize) * blockSize;

	var block = new Splat.AnimatedEntity(gridX, gridY, blockSize, blockSize, img, 0, 0);
	scene.blocks.push(block);
	return block;
}

function containsPoint(entity, x, y) {
	return x >= entity.x && x <= entity.x + entity.width && y >= entity.y && y <= entity.y + entity.height;
}

function findBlockIndex(scene, x, y) {
	for (var i = 0; i < scene.blocks.length; i++) {
		var block = scene.blocks[i];
		if (containsPoint(block, x, y)) {
			return i;
		}
	}
	return -1;
}

function editLevel(scene) {
	if (!game.mouse.isPressed(0)) {
		return;
	}

	var x = game.mouse.x;
	var y = game.mouse.y;
	var index = findBlockIndex(scene, x, y);
	if (game.keyboard.isPressed("1")) {
		scene.spawn.x = x;
		scene.spawn.y = y;
	} else if (game.keyboard.isPressed("2")) {
		scene.goal.x = x;
		scene.goal.y = y;
	} else if (game.keyboard.isPressed("shift")) {
		if (index < 0) {
			return;
		}
		scene.blocks.splice(index, 1);
	} else {
		if (index >= 0) {
			return;
		}
		var block = addBlock(scene, "block-sand", x, y);
		if (scene.player.collides(block)) {
			scene.blocks.pop();
		}
	}
}

function exportBlockDesign(scene, name) {
	var blockArray = scene.blocks;
	var levelObject = {};

	levelObject.name = name;
	levelObject.objects = [];

	for (var i = 0; i < blockArray.length; i++) {
		var blockEntity = blockArray[i];

		levelObject.objects.push({
			x: blockEntity.x,
			y: blockEntity.y,
			type: "block"
		});
	}

	console.log(levelObject);
	return levelObject;
}

var currentLevel = 0;

game.scenes.add("title", new Splat.Scene(canvas, function() {
	this.player = new Splat.AnimatedEntity(100, 100, 96, 140, game.animations.get("player-run-left"), 0, 0);
	this.player.direction = "left";
	this.player.frictionX = 0.3;

	this.hitGoal = false;

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

	buildLevel(levels[currentLevel], this);
}, function(elapsedMillis) {
	// simulation
	var movement = 1.0;

	if (game.keyboard.consumePressed("x")) {
		exportBlockDesign(this, "Level Name");
	}
	
	if (game.keyboard.consumePressed("r")) {
		game.scenes.switchTo("title");
	}
	if (game.keyboard.consumePressed("space")) {
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
	for (var i = 0; i < this.blocks.length; i++) {
		if (this.player.collides(this.blocks[i])) {
			this.blocks[i].touched = true;
		}
	}
	this.player.solveCollisions(this.blocks);

	if (this.hitGoal) {
		if (this.player.collides(this.spawn)) {
			console.log("win");
			currentLevel++;
			if (currentLevel === levels.length) {
				game.scenes.switchTo("win");
				return;
			}
			game.scenes.switchTo("title");
			return;
		}
	} else {
		if (this.player.collides(this.goal)) {
			console.log("goal");
			this.hitGoal = true;
			for (i = 0; i < this.blocks.length; i++) {
				if (this.blocks[i].touched) {
					this.blocks.splice(i, 1);
					i--;
				}
			}
		}
	}

	if (!this.player.moved()) {
		this.player.sprite.reset();
	}

	editLevel(this);
}, function(context) {
	// draw
	context.drawImage(game.images.get("background"), 0, 0);

	for (var i = 0; i < this.blocks.length; i++) {
		this.blocks[i].draw(context);
	}

	this.spawn.draw(context);
	this.goal.draw(context);
	this.player.draw(context);
}));

game.scenes.add("win", new Splat.Scene(canvas, function() {
}, function() {
}, function(context) {
	context.fillStyle = "white";
	context.fillRect(0, 0, canvas.width, canvas.height);

	context.font = "50px sans-serif";
	context.fillStyle = "black";
	context.fillText("You win!", 200, 200);
}));

game.scenes.switchTo("loading"); //going to title scene
