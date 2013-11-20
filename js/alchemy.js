/*	Alchemy: Science of Change
 *	
 *	a simple rogue-like game about the art of brewing and quoffing prismatic potions
 *
 *	by Matt Shockley
 * 
 */

function potion(style) {
	this.name = 'potion';
	this.type = 'item';

	// random hex color
	this.color = randColor();

	this.renderInv = function(layer, grid, x, y, width) {
		layer.fillStyle(this.color).font(
				"bold " + (grid.fontsize + 50) + "px sans-serif").fillText('!',
				x + width * .33, y + width * .85);
	}

	this.render = function(layer, grid, x, y) {
		// layer.fillStyle(this.color).fillRect(x * grid.xsize + grid.lineWidth,
		// y * grid.ysize + grid.lineWidth, grid.xsize - grid.lineWidth * 2,
		// grid.ysize - grid.lineWidth * 2);
		layer.fillStyle(this.color).font(
				"bold " + (grid.fontsize + 15) + "px sans-serif").fillText('!',
				x * grid.xsize + 8, y * grid.ysize + 22);

	}
}

function ring(style) {
	this.name = 'ring';
	this.type = 'item';
	this.color = randColor();

	this.renderInv = function(layer, grid, x, y, width) {
		layer.fillStyle(this.color).font(
				"bold " + (grid.fontsize + 50) + "px sans-serif").fillText('=',
				x + width * .20, y + width * .85);
	}

	this.render = function(layer, grid, x, y) {
		// layer.fillStyle(this.color).fillRect(x * grid.xsize + grid.lineWidth,
		// y * grid.ysize + grid.lineWidth, grid.xsize - grid.lineWidth * 2,
		// grid.ysize - grid.lineWidth * 2);
		layer.fillStyle(this.color).font(
				"bold " + (grid.fontsize + 15) + "px sans-serif").fillText('=',
				x * grid.xsize + 5, y * grid.ysize + 22);

	}
}

function scroll(style) {
	this.name = 'scroll';
	this.type = 'item';
	this.color = '#000000';

	this.renderInv = function(layer, grid, x, y, width) {
		layer.fillStyle(this.color).font(
				"bold " + (grid.fontsize + 50) + "px sans-serif").fillText('?',
				x + width * .20, y + width * .85);
	}

	this.render = function(layer, grid, x, y) {
		layer.fillStyle(this.color)
				.font((grid.fontsize + 15) + "px sans-serif").fillText('?',
						x * grid.xsize + 5, y * grid.ysize + 22);
	}
}

function wall() {
	this.name = 'wall';
	this.type = 'fixture';
	this.color = '#8F8F8F';

	this.render = function(layer, grid, x, y) {
		layer.fillStyle(this.color).fillRect(x * grid.xsize + grid.lineWidth,
				y * grid.ysize + grid.lineWidth,
				grid.xsize - grid.lineWidth * 2,
				grid.ysize - grid.lineWidth * 2);
	}
}

function grid(xdim, ydim, bgcolor, fontsize, xsize, ysize) {
	this.xdim = xdim;
	this.ydim = ydim;
	this.bgcolor = bgcolor;
	this.gridcolor = '#D6D6D6';
	this.fontsize = fontsize;
	this.xsize = 24;
	this.ysize = 24;
	this.yrange = ysize * ydim;
	this.xrange = xsize * xdim;
	this.squares = new Array();
	this.lineWidth = 1;

	// initialize squares with objects on start
	this.initSquares = function(player) {
		for ( var x = 0; x < this.xdim; x++) {
			this.squares[x] = new Array();
			for ( var y = 0; y < this.ydim; y++) {
				// no generation on player square
				if (x == player.x && y == player.y) {
					this.squares[x][y] = 0;
					continue;
				}

				var r = Math.random();

				if (r < .05) {
					this.squares[x][y] = new potion();
				} else if (r < .2) {
					this.squares[x][y] = new wall();
				} else if (r < .21) {
					this.squares[x][y] = new ring();
				} else if (r < .22) {
					this.squares[x][y] = new scroll();
				} else {
					this.squares[x][y] = 0;
				}
			}
		}
	}

	this.initGrid = function(layer) {
		// background
		layer.clear(this.bgcolor);

		// draw the game grid
		for ( var x = 0; x < this.xdim; x++) {
			for ( var y = 0; y < this.ydim; y++) {
				layer.beginPath().moveTo(x * this.xsize, 0).lineTo(
						x * this.xsize, 600).strokeStyle(this.gridcolor)
						.lineWidth(this.lineWidth).stroke();
				layer.beginPath().moveTo(0, y * this.ysize).lineTo(800,
						y * this.ysize).stroke();
			}
		}
	}

	// check if coords are legal move
	this.checkMove = function(x, y) {
		// within game bounds
		if (y < this.ydim && y >= 0 && x < this.xdim && x >= 0) {
			// not a solid object
			if (this.squares[x][y].type == 0
					|| this.squares[x][y].type != 'fixture') {
				return true;
			}
		}

	}

	this.clearSquare = function(layer, prevx, prevy) {
		layer.fillStyle(this.bgcolor).fillRect(
				prevx * this.xsize + this.lineWidth,
				prevy * this.ysize + this.lineWidth,
				this.xsize - this.lineWidth * 2,
				this.ysize - this.lineWidth * 2);
	}

	this.drawSquare = function(layer, x, y) {
		// draw any object in square
		if (this.squares[x][y] != 0) {
			this.squares[x][y].render(layer, this, x, y);
		}

	}

	this.render = function(layer) {
		// draw objects on grid
		for ( var x = 0; x < this.xdim; x++) {
			for ( var y = 0; y < this.ydim; y++) {
				this.drawSquare(layer, x, y);
			}
		}

	}
}

function player(x, y, color, timer) {
	this.x = x;
	this.y = y;
	this.prevx = x;
	this.prevy = y;
	this.color = color;
	this.updated = 0;
	this.up = 0;
	this.down = 0;
	this.right = 0;
	this.left = 0;
	this.parts = 1;
	this.points = 0;
	this.timer = timer;

	this.inventory = new Array(0, 0, 0, 0);

	// current working potion color
	this.potioncolor = '#FFFFFF';
	// target color
	this.targetcolor = randColor();

	// pick up the object under player and handle
	this.nab = function(layer, grid, hud) {
		var object = grid.squares[this.x][this.y];
		// no object or not an item, return
		if (object == 0 || object.type != 'item') {
			return;
		}
		;

		for ( var i = 0; i < this.inventory.length; i++) {
			if (this.inventory[i] == 0) {
				this.inventory[i] = object;
				grid.squares[this.x][this.y] = 0;
				grid.updated = 1;
				hud.updated = 1;
				this.updated = 1
				break;
			}
		}

	}

	this.quoff = function() {
		if (this.potioncolor = '#FFFFFF') {
			return;
		}
		this.color = this.potioncolor;
		this.potioncolor = '#FFFFFF';
		
		if (this.checkMatch()) {
			this.points++;
			this.targetcolor = randColor();
			this.parts = 0;
		}
	}
	
	// use inventory slot
	this.use = function(slot) {
		var object = this.inventory[slot];
		if (object != 0) {
			switch (object.name) {
			// mix potions
			case 'potion':
				this.parts++;
				this.potioncolor = mixColors(this.potioncolor, object.color);
				this.inventory[slot] = 0;
				break;
			// apply ring color
			case 'ring':
				this.potioncolor = object.color;
				break;
			// random color scrolls
			case 'scroll':
				this.potioncolor = randColor();
				this.inventory[slot] = 0;
				this.parts = 1;
				break;
			}

		}
	}

	this.checkMatch = function() {
		if (cmpColors(this.targetcolor, this.potioncolor) < 100) {
			return true;
		}
	}

	this.step = function(grid) {
		// update player position flags
		if (this.updated) {
			if (this.right) {
				this.x++;
				this.right = 0;
			}
			if (this.left) {
				this.x--;
				this.left = 0;
			}
			if (this.up) {
				this.y--;
				this.up = 0;
			}
			if (this.down) {
				this.y++;
				this.down = 0;
			}
		}

	}

	this.render = function(layer, grid) {

		// refresh previous square
		grid.clearSquare(layer, this.prevx, this.prevy);
		grid.drawSquare(layer, this.prevx, this.prevy);

		// draw player
		layer.fillStyle(this.color).font(
				"bold " + grid.fontsize + "px sans-serif").fillText('@',
				this.x * grid.xsize + 6, this.y * grid.ysize + 15);
		this.prevx = this.x;
		this.prevy = this.y;
	}
}

function hud(xdim, ydim, xsize, ysize) {
	this.xdim = xdim;
	this.ydim = ydim;
	this.xrange = xdim * xsize;
	this.yrange = ydim * ysize;
	this.invslots = 4;
	this.hudbgcolor = '#4F4F4F';
	this.updated = 0;

	// draw player inventory slots
	this.drawInv = function(layer, grid, player) {
		for ( var i = 0; i < this.invslots; i++) {
			var xoffset = i * (this.xrange / 10 + this.yrange / 5);
			layer.beginPath().beginPath().rect(this.xrange / 2.75 + xoffset,
					grid.yrange + this.yrange / 4, this.xrange / 10,
					this.xrange / 10).lineWidth(2).strokeStyle('#DEDEDE')
					.stroke();
			if (player.inventory[i] != 0) {
				player.inventory[i].renderInv(layer, grid, this.xrange / 2.75
						+ xoffset, grid.yrange + this.yrange / 4,
						this.xrange / 10);
			}
		}
	}

	this.drawPotions = function(layer, grid, player) {

		// draw target potion color indicator
		layer.beginPath().arc(this.xrange / 10, grid.yrange + this.yrange / 2,
				this.yrange / 4, 0, 2 * Math.PI).fillStyle(player.targetcolor)
				.fill().lineWidth(5).strokeStyle(
						cq.color(player.targetcolor).shiftHsl(null, -.2, -.4)
								.toHex()).stroke();
		// draw current potion color indicator
		layer.beginPath().arc(this.xrange / 10 * 2.5,
				grid.yrange + this.yrange / 2, this.yrange / 4, 0, 2 * Math.PI)
				.fillStyle(player.potioncolor).fill().lineWidth(5).strokeStyle(
						cq.color(player.potioncolor).shiftHsl(null, -.2, -.4)
								.toHex()).stroke();
		// color distance from target
		layer.fillStyle('#000000').font(
				"bold " + (grid.fontsize + 7) + "px sans-serif").fillText(
				Math.floor(cmpColors(player.targetcolor, player.potioncolor)),
				this.xrange / 10 * 2.25, grid.yrange + this.yrange / 1.75);
		// number of parts to the current mixture
		layer.fillStyle('#000000').font(
				"bold " + (grid.fontsize + 7) + "px sans-serif").fillText(
				player.parts, this.xrange / 10 * 1.6,
				grid.yrange + this.yrange / 1.1);
	}

	this.drawScore = function(layer, grid, player) {
		layer.fillStyle('#000000').font(
				"bold " + (grid.fontsize + 7) + "px sans-serif").fillText(
				player.points, this.xrange / 10 * 1.6,
				grid.yrange + this.yrange * .25);
	}

	this.drawTimer = function(layer, grid, player) {
		layer.fillStyle('#000000').font(
				"bold " + (grid.fontsize + 7) + "px sans-serif").fillText(
				Math.floor(player.timer), this.xrange * .95,
				grid.yrange + this.yrange * .6);
	}

	this.render = function(layer, grid, player) {

		// draw hud background
		layer.fillStyle(this.hudbgcolor).fillRect(0, grid.yrange,
				this.xrange + grid.xsize, this.yrange);

		this.drawPotions(layer, grid, player);

		this.drawInv(layer, grid, player);

		this.drawScore(layer, grid, player);

		this.drawTimer(layer, grid, player);

	}

}

function randColor() {
	var r = ('#' + ('000000' + Math.floor(Math.random() * 16777215)
			.toString(16)).slice(-6));
	return r;
}

function mixColors(color1, color2) {
	// if white (empty) return other color
	if (color1 == '#FFFFFF') {
		return color2;
	}
	var a1 = cq.color(color1).toArray();
	var a2 = cq.color(color2).toArray();
	var res = new Array();
	for ( var i = 0; i < a1.length; i++) {
		res[i] = (a1[i] + a2[i]) / 2;
	}
	return cq.color(res).toHex();
}

// mix weighted based on number of component colors
// function mixColors(color1, color2, parts) {
//	
// var a1 = cq.color(color1).toArray();
// var a2 = cq.color(color2).toArray();
// var res = new Array();
// for ( var i = 0; i < a1.length; i++) {
// res[i] = ( (a1[i] * (parts - 1) / parts) + (a2[i] / parts)) / 2;
// }
// return cq.color(res).toHex();
// }

// function cmpColors(color1, color2, tolerance) {
// var a1 = cq.color(color1).toHsl();
// var a2 = cq.color(color2).toHsl();
// var log = '';
// var test = 1;
// for ( var i = 0; i < a1.length; i++) {
// if (a2[i] - tolerance < a1[i] || a2[i] + tolerance > a2[i]) {
// test = 0;
// }
// log += Math.abs(a1[i] - a2[i]) + ' ';
// }
// console.log(log);
// return test;
// }

function cmpColors(color1, color2) {
	var a1 = cq.color(color1).toArray();
	var a2 = cq.color(color2).toArray();
	var dist = 0;

	for ( var i = 0; i < a1.length; i++) {
		dist += Math.pow((a1[i] - a2[i]), 2);
	}

	return Math.sqrt(dist);
}

function rnd_snd() {
	return (Math.random() * 2 - 1) + (Math.random() * 2 - 1)
			+ (Math.random() * 2 - 1);
}

function rnd(mean, stdev) {
	return Math.round(rnd_snd() * stdev + mean);
}

var alchemy = {
	setup : function() {
		this.gamemode = 1;
		this.gamestate = 1;
		switch (this.gamemode) {
		// adventure
		case 0:
			this.timer = 0;
			break;
		// timed
		case 1:
			this.timer = 60;
			break;
		}

		// intialize game objects
		this.grid = new grid(25, 25, '#E3DEE0', 12, 24, 24);
		this.hud = new hud(this.grid.xsize, 5, this.grid.xsize, this.grid.ysize);
		this.player = new player(0, 0, '#000000', this.timer);

		// create canvas
		this.layer = cq(this.grid.xdim * this.grid.xsize,
				(this.grid.ydim + this.hud.ydim) * this.grid.ysize).framework(
				this, this);

		this.grid.initSquares(this.player);
		this.grid.initGrid(this.layer);
		// render game objects
		this.grid.render(this.layer);
		this.hud.render(this.layer, this.grid, this.player);
		this.player.render(this.layer, this.grid);

		this.layer.appendTo("#gamediv");
	},

	/* game logic loop */
	onstep : function(delta, time) {
		this.player.step(this.grid);

		// manage timer clock
		switch (this.gamemode) {
		case 0:
			this.timer += delta / 1000;
			if (Math.floor(this.timer) > this.player.timer) {
				this.player.timer = Math.floor(this.timer);
				this.hud.updated = 1;
			}
			break;
		case 1:
			this.timer -= delta / 1000;
			if (Math.floor(this.timer) < this.player.timer) {
				this.player.timer = Math.floor(this.timer);
				this.hud.updated = 1;
			}
			if (this.player.timer == -1) {
				console.log('time up');
				this.gamestate = 0;
			}
			break;

		}

	},

	/* rendering loop */
	onrender : function(delta, time) {
		switch (this.gamestate) {
		// game menu
		case 0:

			break;
		// game playing
		case 1:
			// render updated objects
			if (this.player.updated) {
				this.player.render(this.layer, this.grid);
				this.player.updated = 0;
			}
			if (this.hud.updated) {
				this.hud.render(this.layer, this.grid, this.player);
				this.hud.updated = 0;
			}
			break;
		}

	},

	/* window resize */
	onresize : function(width, height) {
	},

	/* mouse events */
	onousedown : function(x, y) {
	},
	onmouseup : function(x, y) {
	},
	onmousemove : function(x, y) {
	},
	onmousewheel : function(delta) {
	},

	/* touch events */
	ontouchstart : function(x, y, touches) {
	},
	ontouchend : function(x, y, touches) {
	},
	ontouchmove : function(x, y, touches) {
	},

	/* keyboard events */
	onkeydown : function(key) {
		switch (this.gamestate) {
		// start/pause/gameover menu
		case 0:
			switch(key) {
			// unpause/(re)start
			case 'space':
				this.gamestate = 1;
				break;
			}
			break;
		// playing
		case 1:
			switch (key) {
			// pause
			case 'space':
				this.gamestate = 0;
				break;
			// nab item in current player square
			case 'comma':
				this.player.nab(this.layer, this.grid, this.hud);
				break;
			// quoff current working potion!
			case 'q':
				this.player.quoff();
				this.player.updated = 1;
				this.hud.updated = 1;
				break;
			// use inventory item
			case '1':
				this.player.use(0);
				this.hud.updated = 1;
				break;
			case '2':
				this.player.use(1);
				this.hud.updated = 1;
				break;
			case '3':
				this.player.use(2);
				this.hud.updated = 1;
				break;
			case '4':
				this.player.use(3);
				this.hud.updated = 1;
				break;

			// directional controls
			case 'down':
				if (this.grid.checkMove(this.player.x, this.player.y + 1)) {
					this.player.down = 1;
					this.player.updated = 1;
				}
				break;
			case 'right':
				if (this.grid.checkMove(this.player.x + 1, this.player.y)) {
					this.player.right = 1;
					this.player.updated = 2;
				}
				break;
			case 'up':
				if (this.grid.checkMove(this.player.x, this.player.y - 1)) {
					this.player.up = 1;
					this.player.updated = 3;
				}
				break;
			case 'left':
				if (this.grid.checkMove(this.player.x - 1, this.player.y)) {
					this.player.left = 1;
					this.player.updated = 4;
				}
				break;
			}
		}

	},
	onkeyup : function(key) {

	},

	/* gamepad events (chrome only) */
	ongamepaddown : function(button, gamepad) {
	},
	ongamepadup : function(button, gamepad) {
	},
	ongamepadmove : function(xAxis, yAxis, gamepad) {
	},

	/* user drops image from disk */
	ondropimage : function(image) {
	}
}

alchemy.setup();
