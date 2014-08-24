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
		"burrito-podium-green": {
			"strip": "img/burrito-podium-green.png",
			"frames": 20,
			"msPerFrame": 80
		},
		"burrito-podium-ghost": {
			"strip": "img/burrito-podium-ghost.png",
			"frames": 20,
			"msPerFrame": 80
		},
		"player-idle-left": {
			"strip": "img/hamster-idle-left.png",
			"frames": 19,
			"msPerFrame": 40
		},
		"player-idle-right": {
			"strip": "img/hamster-idle-right.png",
			"frames": 19,
			"msPerFrame": 40
		},
		"player-jump-left": {
			"strip": "img/hamster-jump-left.png",
			"frames": 19,
			"msPerFrame": 40
		},
		"player-jump-right": {
			"strip": "img/hamster-jump-right.png",
			"frames": 19,
			"msPerFrame": 40
		},
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
	}
};

var game = new Splat.Game(canvas, manifest);
var blockSize = 32;

function buildLevel(level, scene) {
	var img = game.images.get("block-sand");

	scene.blocks = [];
	for (var i = 0; i < level.objects.length; i++) {
		var obj = level.objects[i];
		if (obj.type === "block") {
			var block = new Splat.AnimatedEntity(obj.x, obj.y, blockSize, blockSize, img, 0, -9);
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
	var img = game.images.get(imageName);
	var gridX = Math.floor(x / blockSize) * blockSize;
	var gridY = Math.floor(y / blockSize) * blockSize;

	var block = new Splat.AnimatedEntity(gridX, gridY, blockSize, blockSize, img, 0, -9);
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
	var oldX, oldY;
	var index = findBlockIndex(scene, x, y);
	if (game.keyboard.isPressed("1")) {
		oldX = scene.spawn.x;
		oldY = scene.spawn.y;
		scene.spawn.x = x;
		scene.spawn.y = y;
		if (scene.spawn.getCollisions(scene.blocks).length > 0) {
			scene.spawn.x = oldX;
			scene.spawn.y = oldY;
		}
		game.mouse.consumePressed(0);
	} else if (game.keyboard.isPressed("2")) {
		oldX = scene.goal.x;
		oldY = scene.goal.y;
		scene.goal.x = x;
		scene.goal.y = y;
		if (scene.goal.getCollisions(scene.blocks).length > 0) {
			scene.goal.x = oldX;
			scene.goal.y = oldY;
		}
		game.mouse.consumePressed(0);
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
		if (scene.player.collides(block) || block.collides(scene.spawn) || block.collides(scene.goal)) {
			scene.blocks.pop();
		}
	}
}

function exportLevel(scene, name) {
	var blockArray = scene.blocks;

	var level = {
		name: name,
		objects: []
	};

	level.objects = blockArray.map(function(block) {
		return {
			type: "block",
			x: block.x,
			y: block.y,
		};
	});
	level.objects.push({
		type: "spawn",
		x: scene.spawn.x,
		y: scene.spawn.y,
	});
	level.objects.push({
		type: "goal",
		x: scene.goal.x,
		y: scene.goal.y,
	});

	console.log(JSON.stringify(level, null, 4));
	return level;
}

var debug = false;
function draw(context, entity, color) {
	entity.draw(context);
	if (!debug) {
		return;
	}
	context.strokeStyle = color;
	context.strokeRect(entity.x, entity.y, entity.width, entity.height);
}

var currentLevel = 0;

game.scenes.add("title", new Splat.Scene(canvas, function() {
	this.player = new Splat.AnimatedEntity(100, 100, 96, 140, game.animations.get("player-run-left"), 0, 0);
	this.player.direction = "left";
	this.player.frictionX = 0.3;

	this.hitGoal = false;

	this.spawn = new Splat.Entity(0, 0, this.player.width, this.player.height);
	this.spawn.draw = function(context) {
		context.fillStyle = "blue";
		context.fillRect(this.x, this.y, this.width, this.height);
	};

	var burrito = game.animations.get("burrito-podium-green");
	this.goal = new Splat.AnimatedEntity(0, 0, burrito.width, burrito.height, burrito, 0, 0);

	buildLevel(levels[currentLevel], this);
}, function(elapsedMillis) {
	// simulation
	var movement = 1.0;

	if (game.keyboard.consumePressed("x")) {
		levels[currentLevel] = exportLevel(this, levels[currentLevel].name);
	}
	if (game.keyboard.consumePressed("f1")) {
		debug = !debug;
	}

	if (game.keyboard.consumePressed("r")) {
		game.scenes.switchTo("title");
	}
	if (game.keyboard.consumePressed("space")) {
		if (this.player.direction === "left") {
			this.player.sprite = game.animations.get("player-jump-left");
			this.player.sprite.reset();
		} else {
			this.player.sprite = game.animations.get("player-jump-right");
			this.player.sprite.reset();
		}
		this.player.vy = -1.0;
	}
	if (game.keyboard.isPressed("right")) {
		this.player.vx = movement; //how fast he moves
		this.player.direction = "right";
	} else if (game.keyboard.isPressed("left")) {
		this.player.vx = -movement; //how fast he moves
		this.player.direction = "left";
	}

	this.player.vy += 0.1;

	this.spawn.move(elapsedMillis);
	this.goal.move(elapsedMillis);
	this.player.move(elapsedMillis);
	for (var i = 0; i < this.blocks.length; i++) {
		if (this.player.collides(this.blocks[i])) {
			this.blocks[i].touched = true;
		}
	}
	var involved = this.player.solveCollisions(this.blocks);

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
			this.goal.sprite = game.animations.get("burrito-podium-ghost");
			for (i = 0; i < this.blocks.length; i++) {
				if (this.blocks[i].touched) {
					this.blocks.splice(i, 1);
					i--;
				}
			}
		}
	}


	if (involved.length > 0) {
		if (this.player.moved()) {
			if (this.player.direction === "left") {
				this.player.sprite = game.animations.get("player-run-left");
			} else {
				this.player.sprite = game.animations.get("player-run-right");
			}
		} else {
			if (this.player.direction === "left") {
				this.player.sprite = game.animations.get("player-idle-left");
			} else {
				this.player.sprite = game.animations.get("player-idle-right");
			}
		}
	}

	editLevel(this);
}, function(context) {
	// draw
	context.drawImage(game.images.get("background"), 0, 0);

	for (var i = 0; i < this.blocks.length; i++) {
		draw(context, this.blocks[i], "red");
	}

	draw(context, this.spawn, "green");
	draw(context, this.goal, "green");
	draw(context, this.player, "blue");
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
