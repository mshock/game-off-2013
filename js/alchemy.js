/*	Alchemy: Science of Change
 *	
 *	a simple rogue-like game about the art of brewing and quoffing prismatic potions
 *
 *	by Matt Shockley
 * 
 */

function grid(xdim, ydim, bgcolor, fontsize) {
	this.xdim = xdim;
	this.ydim = ydim;
	this.bgcolor = bgcolor;
	this.gridcolor = '#D6D6D6';
	this.fontsize = fontsize;
	this.xsize = (xdim / fontsize / 2);
	this.ysize = (ydim / fontsize / 2);
	this.squares = new Array(xdim / fontsize, ydim / fontsize);
	this.lineWidth = 1;

	this.render = function(layer) {
		// background
		layer.clear(this.bgcolor);

		// draw the game grid
		for ( var x = 0; x < (this.xdim / this.fontsize); x++) {
			for ( var y = 0; y < (this.ydim / this.fontsize); y++) {
				layer.beginPath().moveTo(x * this.xsize, 0).lineTo(
						x * this.xsize, 600).strokeStyle(this.gridcolor).stroke();
				layer.beginPath().moveTo(0, y * this.ysize).lineTo(800,
						y * this.ysize).stroke();
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
	this.moved = 0;
	this.up = 0;
	this.down = 0;
	this.right = 0;
	this.left = 0;

	this.step = function (grid) {
		// update player position flags
		if (this.moved) {
			if (this.right) {
				this.x += grid.xsize;
				this.right = 0;
			}
			if (this.left) {
				this.x -= grid.xsize;
				this.left = 0;
			}
			if (this.up) {
				this.y -= grid.ysize;
				this.up = 0;
			}
			if (this.down) {
				this.y += grid.ysize;
				this.down = 0;
			}
		}
	}

	this.render = function(layer, grid) {
		// erase previous square
		layer.fillStyle(grid.bgcolor).fillRect(this.prevx + grid.lineWidth,
				this.prevy + grid.lineWidth, grid.xsize - grid.lineWidth * 2,
				grid.ysize - grid.lineWidth * 2);

		// draw the this.player
		layer.fillStyle(this.color).font(
				"bold " + grid.fontsize + "px sans-serif").fillText('@',
				this.x + 6, this.y + 13);
		this.prevx = this.x;
		this.prevy = this.y;
	}
}

function hud(xdim, ydim) {
	this.xdim = xdim;
	this.ydim = ydim;
	this.hudbgcolor = '#4F4F4F';
	
	this.render = function(layer, grid) {
		layer.fillStyle(this.hudbgcolor).fillRect(0, grid.ydim, this.xdim, this.ydim);
	}
}


var alchemy = {
	setup : function() {
		// intialize game objects
		this.grid = new grid(600, 504, '#E3DEE0', 12);
		this.hud = new hud(600, 96);
		this.player = new player(0, 0, '#000000');

		// create canvas
		this.layer = cq(this.grid.xdim, this.grid.ydim + this.hud.ydim).framework(this, this);

		this.grid.render(this.layer);
		this.hud.render(this.layer, this.grid);
		this.player.render(this.layer, this.grid);

		this.layer.appendTo("#gamediv");
	},

	/* game logic loop */
	onstep : function(delta, time) {
		this.player.step(this.grid);

	},

	/* rendering loop */
	onrender : function(delta, time) {
		if (this.player.moved) {
			this.player.render(this.layer, this.grid);
			this.player.moved = 0;
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
		case 'down':
			if (this.player.y + this.grid.ysize < this.grid.ydim) {
				this.player.down = 1;
				this.player.moved = 1;
			}
			break;
		case 'right':
			if (this.player.x + this.grid.xsize < this.grid.xdim) {
				this.player.right = 1;
				this.player.moved = 2;
			}
			break;
		case 'up':
			if (this.player.y - this.grid.ysize >= 0) {
				this.player.up = 1;
				this.player.moved = 3;
			}
			break;
		case 'left':
			if (this.player.x - this.grid.xsize >= 0) {
				this.player.left = 1;
				this.player.moved = 4;
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
