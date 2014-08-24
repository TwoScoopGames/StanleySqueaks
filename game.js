"use strict";

var levels = require("./levels");
var Splat = require("splatjs");
var canvas = document.getElementById("canvas");

var manifest = {
	"images": {
		"background": "img/background.png",
		"block-cookie": "img/block-cookie.png",
		"block": "img/block-sand.png",
		"block-sand2": "img/block-sand2.png",
		"block-sand3": "img/block-sand3.png",
		"block-stone": "img/block-stone.png",
		"block-stone2": "img/block-stone2.png",
		"gamedevlou": "img/gamedevlou.png",
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
		"spawn": {
			"strip": "img/door.png",
			"frames": 9,
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
	scene.blocks = [];
	for (var i = 0; i < level.objects.length; i++) {
		var obj = level.objects[i];
		if (obj.type === "spawn") {
			scene.spawn.x = obj.x;
			scene.spawn.y = obj.y;
			scene.player.x = obj.x;
			scene.player.y = obj.y;
		} else if (obj.type === "goal") {
			scene.goal.x = obj.x;
			scene.goal.y = obj.y;
		} else {
			var img = game.images.get(obj.type);
			var block = new Splat.AnimatedEntity(obj.x, obj.y, blockSize, blockSize, img, 0, -9);
			block.type = obj.type;
			scene.blocks.push(block);
		}
	}
}

function addBlock(scene, imageName, x, y) {
	var img = game.images.get(imageName);
	var gridX = Math.floor(x / blockSize) * blockSize;
	var gridY = Math.floor(y / blockSize) * blockSize;

	var block = new Splat.AnimatedEntity(gridX, gridY, blockSize, blockSize, img, 0, -9);
	block.type = imageName;
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

var currentLevel = 0;
var blockToDraw = "block";
var unbreakableBlocks = [
	"block-cookie",
	"block-stone",
	"block-stone2"
];

function editLevel(scene) {
	if (game.keyboard.consumePressed("x")) {
		levels[currentLevel] = exportLevel(scene, levels[currentLevel].name);
	}
	if (game.keyboard.consumePressed("1")) {
		blockToDraw = "spawn";
	}
	if (game.keyboard.consumePressed("2")) {
		blockToDraw = "goal";
	}
	if (game.keyboard.consumePressed("3")) {
		blockToDraw = "block";
	}
	if (game.keyboard.consumePressed("4")) {
		blockToDraw = "block-sand2";
	}
	if (game.keyboard.consumePressed("5")) {
		blockToDraw = "block-sand3";
	}
	if (game.keyboard.consumePressed("6")) {
		blockToDraw = "block-cookie";
	}
	if (game.keyboard.consumePressed("7")) {
		blockToDraw = "block-stone";
	}
	if (game.keyboard.consumePressed("8")) {
		blockToDraw = "block-stone2";
	}
	if (!game.mouse.isPressed(0)) {
		return;
	}

	var x = game.mouse.x;
	var y = game.mouse.y;
	var oldX, oldY;
	var index = findBlockIndex(scene, x, y);
	if (game.keyboard.isPressed("shift")) {
		if (index < 0) {
			return;
		}
		scene.blocks.splice(index, 1);
	} else if (blockToDraw === "spawn") {
		oldX = scene.spawn.x;
		oldY = scene.spawn.y;
		scene.spawn.x = x;
		scene.spawn.y = y;
		if (scene.spawn.getCollisions(scene.blocks).length > 0) {
			scene.spawn.x = oldX;
			scene.spawn.y = oldY;
		}
	} else if (blockToDraw === "goal") {
		oldX = scene.goal.x;
		oldY = scene.goal.y;
		scene.goal.x = x;
		scene.goal.y = y;
		if (scene.goal.getCollisions(scene.blocks).length > 0) {
			scene.goal.x = oldX;
			scene.goal.y = oldY;
		}
	} else {
		if (index >= 0) {
			if (blockToDraw === scene.blocks[index].type) {
				return;
			} else {
				scene.blocks.splice(index, 1);
			}
		}
		var block = addBlock(scene, blockToDraw, x, y);
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
			type: block.type,
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
var editable = false;
function draw(context, entity, color) {
	entity.draw(context);
	if (!debug) {
		return;
	}
	context.strokeStyle = color;
	context.strokeRect(entity.x, entity.y, entity.width, entity.height);
}


var currentLevel = 1;
var canJump = true;

game.scenes.add("title", new Splat.Scene(canvas, function() {
	this.timers.expire = new Splat.Timer(undefined, 2000, function() {
		game.scenes.switchTo("main");
	});
	this.timers.expire.start();
}, function() {
}, function(context) {
	context.fillStyle = "#049fc6";
	context.fillRect(0, 0, canvas.width, canvas.height);

	var gdl = game.images.get("gamedevlou");
	context.drawImage(gdl, (canvas.width / 2) - (gdl.width / 2), (canvas.height / 2) - (gdl.height / 2));
}));

game.scenes.add("main", new Splat.Scene(canvas, function() {
	this.player = new Splat.AnimatedEntity(100, 100, 96, 140, game.animations.get("player-run-left"), 0, 0);
	this.player.direction = "left";
	this.player.frictionX = 0.3;

	this.hitGoal = false;
	this.touched = 0;

	var doorway = game.animations.get("spawn");
	this.spawn = new Splat.AnimatedEntity(0, 0, doorway.width, doorway.height, doorway, 0, 0);

	var burrito = game.animations.get("burrito-podium-green");
	this.goal = new Splat.AnimatedEntity(0, 0, burrito.width, burrito.height, burrito, 0, 0);

	buildLevel(levels[currentLevel], this);

	var scene = this;
	this.timers.blockCrumble = new Splat.Timer(undefined, 100, function() {
		if (scene.touched < 0) {
			return;
		}
		scene.touched--;
		for (var i = 0; i < scene.blocks.length; i++) {
			if (scene.blocks[i].touched === scene.touched && unbreakableBlocks.indexOf(scene.blocks[i].type) === -1) {
				scene.blocks.splice(i, 1);
				i--;
			}
		}
		this.reset();
		this.start();
	});
}, function(elapsedMillis) {
	// simulation
	var movement = 1.0;

	if (game.keyboard.consumePressed("f1")) {
		debug = !debug;
	}
	if (game.keyboard.consumePressed("f2")) {
		editable = !editable;
	}

	if (game.keyboard.consumePressed("r")) {
		game.scenes.switchTo("main");
	}
	
	if (game.keyboard.consumePressed("space")) {
		if (this.player.direction === "left") {
			this.player.sprite = game.animations.get("player-jump-left");
			this.player.sprite.reset();
		} else {
			this.player.sprite = game.animations.get("player-jump-right");
			this.player.sprite.reset();
		}
		if(canJump === true) {
			this.player.vy = -1.0;
			canJump = false;
		}
	}
	if (game.keyboard.isPressed("right")) {
		this.player.vx = movement; //how fast he moves
		this.player.direction = "right";
	} else if (game.keyboard.isPressed("left")) {
		this.player.vx = -movement; //how fast he moves
		this.player.direction = "left";
	}

	this.spawn.move(elapsedMillis);
	this.goal.move(elapsedMillis);
	if (!this.timers.blockCrumble.running) {
		this.player.vy += 0.1;
		this.player.move(elapsedMillis);
	}
	if (this.player.y > 1500) {
		// death!
		game.scenes.switchTo("main");
	}
	if (!this.hitGoal) {
		var touchedSomething = false;
		for (var i = 0; i < this.blocks.length; i++) {
			var block = this.blocks[i];
			if (block.touched === undefined && this.player.collides(block)) {
				block.touched = this.touched;
				touchedSomething = true;
			}
		}
		if (touchedSomething) {
			this.touched++;
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
			game.scenes.switchTo("main");
			return;
		}
	} else {
		if (this.player.collides(this.goal)) {
			console.log("goal");
			this.hitGoal = true;
			this.goal.sprite = game.animations.get("burrito-podium-ghost");
			this.timers.blockCrumble.start();
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
		canJump = true;
	}

	if (editable) {
		editLevel(this);
	}
}, function(context) {
	// draw
	context.drawImage(game.images.get("background"), 0, 0);

	for (var i = 0; i < this.blocks.length; i++) {
		draw(context, this.blocks[i], "red");
	}

	draw(context, this.spawn, "green");
	draw(context, this.goal, "green");
	draw(context, this.player, "blue");

	if (editable) {
		if (blockToDraw === "spawn" || blockToDraw === "goal") {
			context.fillStyle = "rgba(100, 100, 100, 0.7)";
			context.font = "30px sans-serif";
			context.fillText(blockToDraw, 34, 50);
		} else {
			var img = game.images.get(blockToDraw);
			context.fillStyle = "rgba(100, 100, 100, 0.3)";
			context.fillRect(20, 20, img.width + 20, img.height + 20);
			context.drawImage(img, 30, 30);
		}
	}
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
