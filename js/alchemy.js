/*	Alchemy: Science of Change
 *	
 *	a simple rogue-like game about the art of brewing and quoffing prismatic potions
 *
 *	by Matt Shockley
 * 
 */

function potion() {
	this.name = 'potion';
	this.type = 'item';
	// random hex color
	this.color = '#'
			+ ('000000' + Math.floor(Math.random() * 16777215).toString(16))
					.slice(-6);

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

function ring() {
	this.name = 'ring';
	this.type = 'item';
	this.color = '#'
			+ ('000000' + Math.floor(Math.random() * 16777215).toString(16))
					.slice(-6);

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

function grid(xdim, ydim, bgcolor, fontsize) {
	this.xdim = xdim;
	this.ydim = ydim;
	this.bgcolor = bgcolor;
	this.gridcolor = '#D6D6D6';
	this.fontsize = fontsize;
	// todo: correct for sprite dimensions
	this.xsize = 24;
	this.ysize = 24;
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
				// 10% chance of potion
				if (r < .1) {
					this.squares[x][y] = new potion();
				} else if (r < .3) {
					this.squares[x][y] = new wall();
				} else if (r < .4) {
					this.squares[x][y] = new ring();
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
			if (this.squares[x][y].type != 'fixture') {
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

	this.drawSquare = function(layer, prevx, prevy) {
		// draw any object in square
		if (this.squares[prevx][prevy] != 0) {
			this.squares[prevx][prevy].render(layer, this, prevx, prevy);
		}

	}

	this.render = function(layer) {
		// draw objects on grid
		for ( var x = 0; x < this.xdim; x++) {
			for ( var y = 0; y < this.ydim; y++) {
				if (this.squares[x][y] != 0) {
					this.squares[x][y].render(layer, this, x, y);
				}
			}
		}

	}
}

function player(x, y, color) {
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

	this.inventory = new Array(0, 0, 0, 0);

	// current working potion color
	this.potioncolor = '#FFFFFF';

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

	// use inventory slot
	this.use = function(slot) {
		var object = this.inventory[slot];
		if (object != 0) {
			switch (object.name) {
			case 'potion':
				this.potioncolor = mixColors(this.potioncolor, object.color);
				this.inventory[slot] = 0;
				break;
			case 'ring':
				console.log("ring used!");
				break;
			}

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

		// erase previous square if empty
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

function hud(xdim, ydim) {
	this.xdim = xdim;
	this.ydim = ydim;
	this.invslots = 4;
	this.hudbgcolor = '#4F4F4F';
	this.updated = 0;

	// draw player inventory slots
	this.drawInv = function(layer, grid, player) {
		var gridyrange = grid.ydim * grid.ysize;
		var hudyrange = this.ydim * grid.ysize;
		var hudxrange = this.xdim * grid.xsize;

		for ( var i = 0; i < this.invslots; i++) {
			var xoffset = i * (hudxrange / 10 + hudyrange / 25);
			layer.beginPath().beginPath().rect(hudxrange / 4 + xoffset,
					gridyrange + hudyrange / 5, hudxrange / 10, hudxrange / 10)
					.lineWidth(2).strokeStyle('#DEDEDE').stroke();
			if (player.inventory[i] != 0) {
				player.inventory[i].renderInv(layer, grid, hudxrange / 4
						+ xoffset, gridyrange + hudyrange / 5, hudxrange / 10);
			}
		}
	}

	this.render = function(layer, grid, player) {
		var gridyrange = grid.ydim * grid.ysize;
		var hudyrange = this.ydim * grid.ysize;
		var hudxrange = this.xdim * grid.xsize;

		// draw hud background
		layer.fillStyle(this.hudbgcolor).fillRect(0, gridyrange, hudxrange,
				hudyrange);
		// draw current potion color indicator
		layer.beginPath().arc(hudxrange / 8, gridyrange + hudyrange / 2,
				hudyrange / 4, 0, 2 * Math.PI).fillStyle(player.potioncolor)
				.fill().lineWidth(5).strokeStyle(
						cq.color(player.potioncolor).shiftHsl(null, -.2, -.4)
								.toHex()).stroke();

		this.drawInv(layer, grid, player);

	}

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

function rnd_snd() {
	return (Math.random() * 2 - 1) + (Math.random() * 2 - 1)
			+ (Math.random() * 2 - 1);
}

function rnd(mean, stdev) {
	return Math.round(rnd_snd() * stdev + mean);
}

var alchemy = {
	setup : function() {
		// intialize game objects
		this.grid = new grid(25, 25, '#E3DEE0', 12);
		this.hud = new hud(25, 5);
		this.player = new player(0, 0, '#000000');

		// create canvas
		this.layer = cq(
				this.grid.xdim * this.grid.xsize,
				this.grid.ydim * this.grid.ysize + this.hud.ydim
						* this.grid.ysize).framework(this, this);

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

	},

	/* rendering loop */
	onrender : function(delta, time) {
		// render updated objects
		if (this.player.updated) {
			this.player.render(this.layer, this.grid);
			this.player.updated = 0;
		}
		if (this.hud.updated) {
			this.hud.render(this.layer, this.grid, this.player);
			this.hud.updated = 0;
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
		switch (key) {
		// nab item in current player square
		case 'comma':
			this.player.nab(this.layer, this.grid, this.hud);
			break;
		// quoff current working potion!
		case 'q':
			this.player.color = this.player.potioncolor;
			this.player.potioncolor = '#FFFFFF';
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
