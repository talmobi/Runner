/**
	* @description Simple infinite runner game.
	*	@author @hannyajin
	*/

var width = 320;
var height = width * 9 / 16;
var GLOBAL = {
	width: width,
	height: height,
	FPS: 30,
}

/**
	*	Load assets
	*/
var stage, loader;
var sprLink, sprBg;

var init = function() {
	var manifest = [
		{src:"gfx/link_sheet.png", id:"link"}
	];

	loader = new createjs.LoadQueue(false);
	loader.loadManifest(manifest);
	loader.addEventListener("complete", function() {
		var data = {
			images: [loader.getResult("link")],
			frames: {width: 32, height: 32},
			animations: {
				run: [3,12],
				stand: [0,3]
			}
		}
		var spriteSheet = new createjs.SpriteSheet(data);
		sprLink = new createjs.Sprite(spriteSheet, "run");
		sprLink.framerate = 30;

		main();
	});
};





/**
	* Functions
	*/
var newRect = function(x,y,w,h,color) {
	var shape = new createjs.Shape();
	shape.snapToPixel = true;
	shape.graphics.setStrokeStyle(1).beginStroke(color || "white").rect(0, 0 , w, h);
	shape.w = w;
	shape.h = h;
	shape.x = x;
	shape.y = y;
	return shape;
}


/**
	* Stats.js
	*/
var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms
// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
$("#container").append( stats.domElement );

/**
	* tick
	*/
var tick = function() {
	stats.begin();

	stage.update();

	stats.end();
}



/**
	* Main
	*/
var main = function() {
	var canvas = $("#canvasId")[0];

	var width = 320;
	var height = width * 9 / 16;

	canvas.width = width;
	canvas.height = height;

	stage = new createjs.Stage(canvas);

	// pixel precise fix
	stage.regX = .5;
	stage.regY = .5;

	// create border around canvas
	var border = newRect(1, 1, width - 1, height - 1);
	stage.addChild(border);

	// set background
	stage.addChild(sprBg);

	// add link
	sprLink.setTransform(40,40,1,1);
	stage.addChild(sprLink);
	sprLink.play();

	// ticker
	createjs.Ticker.timingMode = createjs.Ticker.RAF;
	createjs.Ticker.addEventListener("tick", tick);
	createjs.Ticker.setFPS(GLOBAL.FPS)
}
