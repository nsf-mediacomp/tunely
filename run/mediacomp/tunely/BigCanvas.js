//made this helper script to extend canvas to use multiple canvases if you try to draw too far off the edge!!
//definitely not complete, just works for my purposes
function BigCanvas(canvas_container, width, height){
	this.setContainer(canvas_container);
	
	//setting this to be the minimum max widths of canvases
	//i.e. mobile sets the cap at 4096, so why not :)!
	this.max_width = 4096;
	this.max_height = 4096;
	
	this.canvases = [[]];
	this.add_canvas(0, 0);
	this.refresh_container();
	this.setWidth(width);
	this.setHeight(height);
	
	//using this so user can set the fillstyle and stuff and i'll just grab it from this main ctx and set it to all the individual canvases ctx's when doing fillrect on the bigcanvas and such
	this.ctx = document.createElement("canvas").getContext("2d");
}
BigCanvas.prototype.setContainer = function(canvas_container){
	this.container = canvas_container;
	//this.container.innerHTML = "";
	this.canvas = document.createElement("div");
	this.container.appendChild(this.canvas);
}
BigCanvas.prototype.add_canvas = function(i, j, width, height){
	if (i === -1) i = this.canvases.length;
	if (j === -1) j = this.canvases[i].length;
	if (width === undefined || width >= this.max_width) 
		width = this.max_width;
	if (height === undefined || height >= this.max_height) 
		height = this.max_height;
	
	var canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	canvas.style.position = "absolute";
	canvas.style.top = (i * this.max_height) + "px";
	canvas.style.left = (j * this.max_width) + "px";
	this.canvases[i][j] = canvas;
}
BigCanvas.prototype.refresh_container = function(){
	this.canvas.innerHTML = "";
	
	var scale = "scale("+this.scale_x+", " + this.scale_y+")";
	for (var i = 0; i < this.canvases.length; i++){
		for (var j = 0; j < this.canvases[i].length; j++){
			this.canvases[i][j].style.msTransform = scale;
			this.canvases[i][j].style.webkitTransform = scale;
			this.canvases[i][j].style.transform = scale;
			this.canvas.appendChild(this.canvases[i][j]);
		}
	}
	
	this.canvas.innerHTML.replace(/\n/g, "");
	this.canvas.innerHTML.replace(/[\t ]+\</g, "<");
	this.canvas.innerHTML.replace(/\>[\t ]+\</g, "><"); //xD
	this.canvas.innerHTML.replace(/\>[\t ]+$/g, ">");
}

//Implement primitive operation for FillRect!
BigCanvas.prototype.fillRect = function(x, y, width, height){
	var J = ~~(x / this.max_width);
	var I = ~~(y / this.max_height);
	var WIDTH = ~~(width / this.max_width) + 1; 
	var HEIGHT = ~~(height / this.max_height) + 1;
	
	//iterate through the canvases
	for (var i = I; i < I + HEIGHT; i++){
		for (var j = J; j < J + WIDTH; j++){
			this.fill_rect_individual(
				i, j,
				Math.max(0, x - j*this.max_width), 
				Math.max(0, y - i*this.max_height),
				width - (j-J)*this.max_width,
				height - (i-I)*this.max_height);
		}
	}
}
BigCanvas.prototype.fill_rect_individual = function(i, j, x, y, width, height){
	var canvas = this.canvases[i][j];
	var ctx = canvas.getContext("2d");
	if (width > this.max_width) width = this.max_width;
	if (height > this.max_height) height = this.max_height;
	
	ctx.fillStyle = this.ctx.fillStyle;
	ctx.fillRect(x, y, width, height);
}

//NECESSARY FUNCTIONS FOR HANDLING MULTIPLE CANVASES IN THE BIG CANVAS BELOW
BigCanvas.prototype.getWidth = function(){
	if (this.canvases[0] === undefined) return 0; //although this should never be the case
	
	var width = 0;
	for (var i = 0; i < this.canvases[0].length - 1; i++){
		width += this.max_width;
	}
	width += this.canvases[0][this.canvases[0].length-1].width;
	return width;
}
BigCanvas.prototype.getHeight = function(){
	if (this.canvases === undefined) return 0; //although this should never be the case
	
	var height = 0;
	for (var i = 0; i < this.canvases.length - 1; i++){
		height += this.max_height;
	}
	height += this.canvases[this.canvases.length-1][0].height;
	return height;
}

BigCanvas.prototype.setWidth = function(width){
	//first check to see what the current width is
	var curr_width = this.getWidth();
	//if we're setting it less than what it currently is, we need to remove canvases
	if (width < curr_width){
		var rightmost_width = this.canvases[0][this.canvases[0].length-1].width;
		//remove columns from our canvas until we've removed enough
		while ((curr_width - width) >= rightmost_width){
			//remove 1 column
			for (var i = 0; i < this.canvases.length; i++){
				this.canvases[i].pop();
			}
			//need to readjust the curr_width!
			curr_width = this.getWidth()
			rightmost_width = this.canvases[0][this.canvases[0].length-1].width;
		}
	}
	//if we're setting it the same as what it is, do nothin
	//if we're setting it larger, we need to add canvases
	else if (width > curr_width){
		var rightmost_width = this.canvases[0][this.canvases[0].length-1].width;
		var maximize_first = true;
		
		//extend columns until we have enough
		while ((width - curr_width) >= (this.max_width - rightmost_width)){
			//FIRST LET'S MAKE SURE THE RIGHTMOST IS BIG ENOUGH!
			if (maximize_first){
				for (var i = 0; i < this.canvases.length; i++){
					this.canvases[i][this.canvases[i].length-1].width = this.max_width;
				}
				maximize_first = false;
				continue;
			}
			
			//add 1 column
			for (var i = 0; i < this.canvases.length; i++){
				this.add_canvas(i, this.canvases[i].length, undefined, this.canvases[i][this.canvases[i].length-1].height);
			}
			
			//NEED TO READJUST THE CURR_WIDTH
			curr_width = this.getWidth()
			rightmost_width = this.canvases[0][this.canvases[0].length-1].width;   
		}
	}
	
	//we now only need to adjust the width of our rightmost column
	//(if we removed columns, then that ensures that the last column will have full width,
	//if we added columns, we added them such that they are at full width
	//so in both cases we just need to remove width from the rightmost column)
	//(unless of course the width set is a multiple of this.max_width)
	if ((curr_width - width) < rightmost_width){
		for (var i = 0; i < this.canvases.length; i++){
			this.canvases[i][this.canvases[i].length-1].width -= (curr_width - width);
		}
	}
	
	this.refresh_container();
}
BigCanvas.prototype.setHeight = function(height){
	//first check to see what the current height is
	var curr_height = this.getHeight();
	//if we're setting it less than what it currently is, we need to remove canvases
	if (height < curr_height){
		var botmost_height = this.canvases[this.canvases.length-1][0].height;
		//remove ROWS from our canvas until we've removed enough
		while ((curr_height - height) >= botmost_height){
			//remove 1 row
			this.canvases.pop();
			//need to readjust the curr_height!
			curr_height = this.getHeight();
			botmost_height = this.canvases[this.canvases.length-1][0].height;
		}
	}
	//if we're setting it the same as what it is, do nothin
	//if we're setting it larger, we need to add canvases
	else if (height > curr_height){
		var botmost_height = this.canvases[this.canvases.length-1][0].height;
		var maximize_first = true;
		//extend ROWS until we have enough
		while ((height - curr_height) >= (this.max_height - botmost_height)){
			//FIRST LET'S MAKE SURE THE BOTMOST IS TALL ENOUGH!
			if (maximize_first){
				for (var j = 0; j < this.canvases[0].length; j++){
					this.canvases[this.canvases.length-1][j].height = this.max_height;
				}
				maximize_first = false;
				continue;
			}
			
			//add 1 ROW
			var new_row = [];
			for (var j = 0; j < this.canvases[0].length; j++){
				this.add_canvas(this.canvases.length, j, this.canvases[0][j].width, undefined);
			}
			
			//NEED TO READJUST THE CURR_HEIGHT
			curr_height = this.getHeight()
			botmost_height = this.canvases[this.canvases.length-1][0].height;   
		}
	}
	
	//we now only need to adjust the height of our botmost ROW
	//(if we removed ROWS, then that ensures that the last ROW will have full HEIGHT,
	//if we added ROWS, we added them such that they are at full HEIGHT
	//so in both cases we just need to remove HEIGHT from the BOTMOST ROW)
	//(unless of course the HEIGHT set is a multiple of this.max_height)
	if ((curr_height - height) < botmost_height){
		for (var j = 0; j < this.canvases[0].length; j++){
			this.canvases[this.canvases.length-1][j].height -= (curr_height - height);
		}
	}
	
	this.refresh_container();
}