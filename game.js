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

//asset loading
var game = new Splat.Game(canvas, manifest);


function centerText(context, text, offsetX, offsetY) {
	var w = context.measureText(text).width;
	var x = offsetX + (canvas.width / 2) - (w / 2) | 0;
	var y = offsetY | 0;
	context.fillText(text, x, y);
}


//this refers to current scene
game.scenes.add("title", new Splat.Scene(canvas, function() {
	// initialization
	this.player = new Splat.Entity(100, 100, 100, 100);
	this.player.draw = function(context) {
		context.fillStyle = "red";
		context.fillRect(this.x, this.y, this.width, this.height);
	};
}, function(elapsedMillis) {
	// simulation
	this.player.move(elapsedMillis);
}, function(context) {
	// draw
	context.fillStyle = "#092227";
	context.fillRect(0, 0, canvas.width, canvas.height);

	context.fillStyle = "#fff";
	context.font = "25px helvetica";
	centerText(context, "Blank SplatJS Project", 0, canvas.height / 2 - 13);

	this.player.draw(context);
}));

game.scenes.switchTo("loading"); //going to title scene


