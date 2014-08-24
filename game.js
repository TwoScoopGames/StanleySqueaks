"use strict";

var levels = require("./levels");
var Splat = require("splatjs");
var canvas = document.getElementById("canvas");
var Particles = require("./particles");

var manifest = {
	"images": {
		"background": "img/background.png",
		"block-cookie": "img/block-cookie.png",
		"block": "img/block-sand.png",
		"block-sand2": "img/block-sand2.png",
		"block-sand3": "img/block-sand3.png",
		"block-stone": "img/block-stone.png",
		"block-stone2": "img/block-stone2.png",
		"doorway": "img/doorway.png",
		"gamedevlou": "img/gamedevlou.png",
		"rock1": "img/rock-particle1.png",
		"rock2": "img/rock-particle2.png",
		"rock3": "img/rock-particle3.png",
		"rock4": "img/rock-particle4.png",
	},
	"sounds": {
		"bump": "audio/bump.mp3",
		"crumble1": "audio/crumble1.mp3",
		"crumble2": "audio/crumble2.mp3",
		"crumble3": "audio/crumble3.mp3",
		"crumble4": "audio/crumble4.mp3",
		"hamster-fall": "audio/hamster-fall.mp3",
		"jump": "audio/jump.mp3",
		"podium": "audio/podium.mp3",
		"squeak1": "audio/squeak1.mp3",
		"squeak2": "audio/squeak2.mp3",
		"step1": "audio/step1.mp3",
		"step2": "audio/step2.mp3",
		"step3": "audio/step3.mp3",
		"step4": "audio/step4.mp3",
		"step5": "audio/step5.mp3"
		
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
		"player-enter-door": {
			"strip": "img/enter-door.png",
			"frames": 9,
			"msPerFrame": 50,
			"repeatAt": 8
		},
		"player-idle-left": {
			"strip": "img/hamster-idle-left-f19.png",
			"frames": 19,
			"msPerFrame": 70
		},
		"player-idle-right": {
			"strip": "img/hamster-idle-right-f19.png",
			"frames": 19,
			"msPerFrame": 70
		},
		"player-jump-left": {
			"strip": "img/hamster-jump-left-f19.png",
			"frames": 19,
			"msPerFrame": 30
		},
		"player-jump-right": {
			"strip": "img/hamster-jump-right-f19.png",
			"frames": 19,
			"msPerFrame": 30
		},
		"player-run-left": {
			"strip": "img/hamster-run-left-f22.png",
			"frames": 22,
			"msPerFrame": 30
		},
		"player-run-right": {
			"strip": "img/hamster-run-right-f22.png",
			"frames": 22,
			"msPerFrame": 30
		},
		"podium-sink": {
			"strip": "img/podium-sink.png",
			"frames": 20,
			"msPerFrame": 160,
			"repeatAt": 19
		},
		"skull": {
			"strip": "img/skullboss-f20.png",
			"frames": 20,
			"msPerFrame": 100,
			"repeatAt": 19
		},
	}
};

var bounding = {
	"player-idle-left": {
		"spriteOffsetX": -22,
		"spriteOffsetY": -25,
	},
	"player-idle-right": {
		"spriteOffsetX": -15,
		"spriteOffsetY": -25,
	},
	"player-jump-left": {
		"spriteOffsetX": -20,
		"spriteOffsetY": -23,
	},
	"player-jump-right": {
		"spriteOffsetX": -23,
		"spriteOffsetY": -23,
	},
	"player-run-left": {
		"spriteOffsetX": -30,
		"spriteOffsetY": -28,
	},
	"player-run-right": {
		"spriteOffsetX": -30,
		"spriteOffsetY": -28,
	},
};

var game = new Splat.Game(canvas, manifest);
var blockSize = 32;

var crumbleSounds = [ "crumble1", "crumble2", "crumble3", "crumble4" ];
var squeaks = [ "squeak1", "squeak2" ];
function playRandomSound(sounds) {
	var snd = Math.floor(Math.random() * sounds.length);
	game.sounds.play(sounds[snd]);
}

var rocks = [ "rock1", "rock2", "rock3", "rock4" ];
var particles = new Particles(100, function(particle) {
	var img = Math.floor(Math.random() * rocks.length);
	particle.image = rocks[img];
}, function(context, particle) {
	var img = game.images.get(particle.image);
	context.drawImage(img, particle.x - Math.floor(img.width / 2), particle.y - Math.floor(img.height / 2));
});

function setSprite(animatedEntity, name) {
	animatedEntity.sprite = game.animations.get(name);
	var bounds = bounding[name];
	animatedEntity.spriteOffsetX = bounds.spriteOffsetX;
	animatedEntity.spriteOffsetY = bounds.spriteOffsetY;
}

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
		} else if (obj.type === "skull") {
			scene.skull.x = obj.x;
			scene.skull.y = obj.y;
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
	if (game.keyboard.consumePressed("pageup")) {
		console.log("next");
		currentLevel++;
		if (!levels[currentLevel]) {
			levels[currentLevel] = JSON.parse(JSON.stringify(levels[currentLevel-1])); // clone previous level
		}
		game.scenes.switchTo("main");
		return;
	}
	if (game.keyboard.consumePressed("pagedown")) {
		console.log("prev");
		currentLevel--;
		if (currentLevel < 0) {
			currentLevel = 0;
		}
		game.scenes.switchTo("main");
		return;
	}
	if (game.keyboard.consumePressed("x") && !scene.hitGoal) {
		levels[currentLevel] = exportLevel(scene, levels[currentLevel].name);
		console.log("module.exports = " + JSON.stringify(levels, null, 4) + ";");
	}
	if (game.keyboard.consumePressed("1")) {
		blockToDraw = "spawn";
	}
	if (game.keyboard.consumePressed("2")) {
		blockToDraw = "goal";
	}
	if (game.keyboard.consumePressed("3")) {
		blockToDraw = "skull";
	}
	if (game.keyboard.consumePressed("4")) {
		blockToDraw = "block";
	}
	if (game.keyboard.consumePressed("5")) {
		blockToDraw = "block-sand2";
	}
	if (game.keyboard.consumePressed("6")) {
		blockToDraw = "block-sand3";
	}
	if (game.keyboard.consumePressed("7")) {
		blockToDraw = "block-cookie";
	}
	if (game.keyboard.consumePressed("8")) {
		blockToDraw = "block-stone";
	}
	if (game.keyboard.consumePressed("9")) {
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
	} else if (blockToDraw === "spawn" || blockToDraw === "goal" || blockToDraw === "skull") {
		var entity = scene[blockToDraw];
		oldX = entity.x;
		oldY = entity.y;
		entity.x = Math.floor(x);
		entity.y = Math.floor(y);
		if (entity.getCollisions(scene.blocks).length > 0) {
			entity.x = oldX;
			entity.y = oldY;
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
	level.objects.push({
		type: "skull",
		x: scene.skull.x,
		y: scene.skull.y,
	});

	return level;
}

var debug = false;
var editable = false;
function draw(context, entity, color) {
	entity.draw(context);
	if (!debug) {
		return;
	}
	if (entity.touched >= 0) {
		context.fillStyle = color;
		context.fillRect(entity.x, entity.y, entity.width, entity.height);
	} else {
		context.strokeStyle = color;
		context.strokeRect(entity.x, entity.y, entity.width, entity.height);
	}
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

function willBlockCrumble(scene, block) {
	return block.touched === scene.touched - 1 && unbreakableBlocks.indexOf(block.type) === -1;
}

game.scenes.add("main", new Splat.Scene(canvas, function() {
	this.player = new Splat.AnimatedEntity(100, 100, 46, 110, game.animations.get("player-idle-left"), 0, 0);
	setSprite(this.player, "player-idle-left");
	this.player.direction = "left";
	this.player.frictionX = 0.3;

	this.hitGoal = false;
	this.touched = 0;
	particles.reset();

	var doorway = game.animations.get("spawn");
	this.spawn = new Splat.AnimatedEntity(0, 0, doorway.width, doorway.height, doorway, 0, 0);

	var burrito = game.animations.get("burrito-podium-green");
	this.goal = new Splat.AnimatedEntity(0, 0, burrito.width, burrito.height, burrito, 0, 0);

	var skull = game.animations.get("skull").copy();
	this.skull = new Splat.AnimatedEntity(0, 0, skull.width, skull.height, skull, 0, 0);

	buildLevel(levels[currentLevel], this);

	game.animations.get("player-enter-door").reset();
	this.timers.enter = new Splat.Timer(undefined, 500, undefined);
	this.timers.enter.start();

	var scene = this;
	this.timers.trap = new Splat.Timer(undefined, 2000, function() {
		scene.timers.blockCrumble.start();
	});
	this.timers.blockCrumble = new Splat.Timer(undefined, 200, function() {
		if (scene.touched < 0) {
			return;
		}
		for (var i = 0; i < scene.blocks.length; i++) {
			var block = scene.blocks[i];
			if (willBlockCrumble(scene, block)) {
				var x = block.x + (block.width / 2);
				var y = block.y + (block.height / 2);
				particles.spray(10, x, y, 1);
				scene.blocks.splice(i, 1);
				playRandomSound(crumbleSounds);
				i--;
			}
		}
		scene.touched--;
		this.reset();
		this.start();
	});
	this.timers.death = new Splat.Timer(undefined, 2200, function(){
		game.scenes.switchTo("main");
	});
}, function(elapsedMillis) {
	// simulation

	this.spawn.move(elapsedMillis);
	game.animations.get("player-enter-door").move(elapsedMillis);
	this.goal.move(elapsedMillis);
	particles.move(elapsedMillis);
	if (this.hitGoal) {
		this.skull.move(elapsedMillis);
	}

	if (game.keyboard.consumePressed("f1")) {
		debug = !debug;
	}
	if (game.keyboard.consumePressed("f2")) {
		editable = !editable;
	}

	if (game.keyboard.consumePressed("r")) {
		game.scenes.switchTo("main");
	}
	
	var playerFrozen = this.timers.trap.running || this.timers.blockCrumble.running || this.timers.enter.running;

	if (!playerFrozen) {
		if (game.keyboard.consumePressed("space")) {
			if (this.player.direction === "left") {
				setSprite(this.player, "player-jump-left");
				this.player.sprite.reset();
			} else {
				setSprite(this.player, "player-jump-right");
				this.player.sprite.reset();
			}
			if (canJump) {
				game.sounds.play("jump");
				this.player.vy = -1.2;
				canJump = false;
			}
		}
		var movement = 0.6;
		if (game.keyboard.isPressed("right")) {
		 	this.player.vx = movement; //how fast he moves
			this.player.direction = "right";
		} else if (game.keyboard.isPressed("left")) {
			this.player.vx = -movement; //how fast he moves
			this.player.direction = "left";
		}

		this.player.move(elapsedMillis);
		this.player.vy += 0.1;
	}
	if (this.player.y > 1000) {
		// death!
		if(!this.timers.death.running) {
			game.sounds.play("hamster-fall");
			this.timers.death.start();
		}	
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
			this.goal.sprite = game.animations.get("podium-sink");
			this.goal.sprite.reset();
			this.goal.spriteOffsetY = 43;
			this.timers.trap.start();
			game.sounds.play("podium");
		}
	}

	if (involved.length > 0) {
		if (this.player.moved()) {
			if (this.player.direction === "left") {
				setSprite(this.player, "player-run-left");
			} else {
				setSprite(this.player, "player-run-right");
			}
		} else {
			if (this.player.direction === "left") {
				setSprite(this.player, "player-idle-left");
			} else {
				setSprite(this.player, "player-idle-right");
			}
		}
		if (!canJump) {
			playRandomSound(squeaks);
		}
		canJump = true;
	}

	if (editable) {
		editLevel(this);
	}
}, function(context) {
	// draw
	context.drawImage(game.images.get("background"), 0, 0);
	context.drawImage(game.images.get("doorway"), this.spawn.x - 34, this.spawn.y - 32);

	for (var i = 0; i < this.blocks.length; i++) {
		draw(context, this.blocks[i], "red");
	}

	draw(context, this.spawn, "green");
	draw(context, this.goal, "green");
	draw(context, this.skull, "green");

	if (this.timers.enter.running) {
		game.animations.get("player-enter-door").draw(context, this.spawn.x, this.spawn.y);
	} else {
		draw(context, this.player, "blue");
	}

	particles.draw(context);

	if (this.timers.blockCrumble.running) {
		var laserProgress = this.timers.blockCrumble.time / this.timers.blockCrumble.expireMillis;
		for (i = 0; i < this.blocks.length; i++) {
			var block = this.blocks[i];
			if (willBlockCrumble(this, block)) {
				var x = block.x + (block.width / 2);
				var y = block.y + (block.height / 2);
				line(context, this.skull.x + 48, this.skull.y + 43, x, y, "rgba(91, 216, 91, " + (laserProgress * 0.65) + ")", 20 * laserProgress);
				line(context, this.skull.x + 73, this.skull.y + 48, x, y, "rgba(91, 216, 91, " + (laserProgress * 0.65) + ")", 20 * laserProgress);
			}
		}
	}

	if (editable) {
		if (blockToDraw === "spawn" || blockToDraw === "goal" || blockToDraw === "skull") {
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

function line(context, x1, y1, x2, y2, color, width) {
	context.beginPath();
	context.moveTo(x1, y1);
	context.lineTo(x2, y2);
	context.lineWidth = width;
	context.strokeStyle = color;
	context.stroke();
}

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
