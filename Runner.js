/**
	* @description Simple infinite runner game.
	*	@author @hannyajin
	*/

var count = 0;
var width = 320;
var height = width * 9 / 16;
var GLOBAL = {
	width: width,
	height: height,
	FPS: 30,
	gravity: 0.1
}

var tiles = [];
var buffer = [];

/**
	*	Load assets
	*/
var stage, loader;
var sprLink, sprBg, sprTiles;

var init = function() {
	var manifest = [
		{src:"gfx/link_sheet.png", id:"link"},
		{src:"gfx/city_backgrounds/city_background_sunset_small.png", id:"city_bg3"},
		{src:"gfx/tiles.png", id:"tiles"}
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
		sprLink.yspd = 0;
		sprLink.tick = function() {
			this.yspd += GLOBAL.gravity;
			this.y += this.yspd;
			this.onGround = false;

			for (var i = 0; i < tiles.length; i++) {
				var t = tiles[i];
				if (this.x + 16 >= t.x && this.x + 16 <= t.x + t.w && this.y + 8 <= t.y) {
					if (this.y > height - 32 * 2) {
						this.y = height - 32 * 2;
						this.yspd = 0;
						this.onGround = true;
						break;
					}
				}
			}

			if (this.y > 220) {
				this.y = 0;
				this.yspd = 0;
			}
		}

		var img = loader.getResult("city_bg3");
		sprBg = new createjs.Shape();
		sprBg.graphics.beginBitmapFill(img).drawRect(0, 1, img.width, img.height);
		sprBg.graphics.beginBitmapFill(img).drawRect(img.width - 1, 1, img.width, img.height);
		sprBg.tileW = img.width * 2;
		sprBg.tileHW = img.width;

		spriteSheet = new createjs.SpriteSheet( {
			images: [loader.getResult("tiles")],
			frames: {width: 32, height: 32}
		});
		sprTiles = new createjs.Sprite(spriteSheet, 3);
		sprTiles.stop();

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

var newTile = function(x,y) {
	var spr = sprTiles.clone();
	spr.removed = false;
	spr.snapToPixel = true;
	spr.x = x;
	spr.y = y;
	spr.w = 32;
	spr.h = 32;

	spr.tick = function() {
		this.x--;
		this.x--;
		this.x--;
		this.x--;
		if (this.x < -32)
			this.removed = true;
	}

	return spr;
}


/**
	* Stats.js
	*/
var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms
// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '245px';
stats.domElement.style.top = '10px';
$("#container").append( stats.domElement );

/**
	* tick
	*/
var next = false;
var tick = function() {
	stats.begin();
	count++;

	sprBg.x--;
	sprBg.x--;
	sprBg.x--;

	sprLink.tick();

	while (-sprBg.x > sprBg.tileW - width) {
		sprBg.x += sprBg.tileHW;
	}

	for (var i = 0; i < tiles.length; i++) {
		var t = tiles[i];
		if (!t.removed) {
			t.tick();
			buffer.push(t);
		} else {
			stage.removeChild(t);
		}
	}
	// flip
	tiles = buffer;
	buffer = [];

	if (count % (32 * 2) === 0) {
		if (Math.random() < .75 || next) {
			next = false;
			for (var i = 0; i < 9; i++) {
				var t = newTile(320 + i * 32, height - 32);
				buffer.push(t);
				stage.addChild(t);
			}
		} else {
			next = true;
		}
	}

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

	// add initial tiles
	for (var i = 0; i < 30; i++) {
		var t = newTile(0 + 32 * i, height -32);
		buffer.push(t);
		stage.addChild(t);
	}

	stage.addEventListener("stagemousedown", function(evt) {
		if (sprLink.onGround) {
			sprLink.yspd = -3;
			sprLink.onGround = false;
		}
	});

	// ticker
	createjs.Ticker.timingMode = createjs.Ticker.RAF;
	createjs.Ticker.addEventListener("tick", tick);
	createjs.Ticker.setFPS(GLOBAL.FPS)
}
