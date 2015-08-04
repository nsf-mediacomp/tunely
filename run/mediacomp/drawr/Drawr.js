
// so we don't have multiple layers of object property accesses to access the cache
function Drawr(){}
Drawr.global_cache = [];
Drawr.pixel_cache = [];

Drawr.RememberImagesFromMemory = function(){
	var img_num = 5;
	
	window.setTimeout(function(){
		while (true){
			var name = "uploaded_image_" + img_num;
			var src = localStorage.getItem(name);
			if (src === null || src === undefined) break;
			
			window.setTimeout(function(src){
				CanvasSelect.restoreUploadedImage(src);
			}.bind(this, src), 0);
			img_num++;
		}
	}, 1);
	CanvasSelect.select(0);
}

Drawr.addCanvas = function(ctx, id, img, title){
    Drawr.canvases[id] = {ctx: ctx, title: title, width: ctx.canvas.width, height: ctx.canvas.height, image: img};
    Drawr.resetCache(id);
    return id;
}

Drawr.getCtx = function(id){
	try{
		if(typeof id === "undefined"){ // TODO: maybe revert this
			var random_id = Math.floor(Math.random()*Drawr.canvases.length);
			return Drawr.canvases[random_id].ctx;
		}else{
			return Drawr.canvases[id].ctx;
		}
	}catch(e){
	}
}

Drawr.getDimension = function(id, dimension){
	if (dimension === "width"){
		return Drawr.getWidth(id);
	}
	else if (dimension === "height"){
		return Drawr.getHeight(id);
	}
}

Drawr.getWidth = function(id){
	return Drawr.canvases[id].width;
}

Drawr.getHeight = function(id){
	return Drawr.canvases[id].height;
}

Drawr.clearAllCommands = function(){
	Drawr.command_queue = [];
	clearTimeout(Drawr.pid);
	Drawr.pid = null;
}

Drawr.beginFlush = function(){
	Drawr.flush_pid = setInterval(Drawr.flushCache, 1000);
}

Drawr.endFlush = function(){
	clearInterval(Drawr.flush_pid);
	Drawr.flush_pid = null;
}

Drawr.restartCanvas = function(id){
	var canvas = Drawr.canvases[id];

	Drawr.getCtx(id).drawImage(canvas.image, 0, 0, canvas.width, canvas.height);
    Drawr.resetCache(id);
}

Drawr.blankPixel = function(id, x, y){
	id = id || 0;
	x = x || 0;
	y = y || 0;
	
	var canvas = Drawr.canvases[id];
	
	var index = x % canvas.width + y * canvas.width;
	
	return {
        id: id,
        index: index,
        x: x,
        y: y,
        r: 0,
        g: 0,
        b: 0,
        a: 1,
    };
}

Drawr.resetCache = function(id){
    var canvas = Drawr.canvases[id];
    //canvas.cache = canvas.ctx.getImageData(0, 0, canvas.width, canvas.height).data; // DEPRECATED, this cache isn't changed anymore
    Drawr.global_cache[id] = canvas.ctx.getImageData(0, 0, canvas.width, canvas.height).data;
	
	var pixels = [];
	var x = 0;
	var y = 0;
	for (var i = 0; i < Drawr.global_cache[id].length; i+=4){
		Drawr.global_cache[id][i+3] = 255;
		var pixel = {
			id: id,
			index: i,
			x: x,
			y: y,
			//when going from global cache to pixel cache, convert from 0-255 to 0-100
			r: Drawr.global_cache[id][i] * (100.0 / 255.0),
			g: Drawr.global_cache[id][i+1] * (100.0 / 255.0),
			b: Drawr.global_cache[id][i+2] * (100.0 / 255.0),
			a: 100
		}
		pixels.push(pixel);
		//update the x and y variables for the pixel
		x++;
		if (x >= canvas.width){
			x = 0;
			y++;
		}
	}
	Drawr.pixel_cache[id] = pixels;
}

Drawr.flushCache = function(id){
    if(typeof id == "undefined"){
        for(var i = 0; i < Drawr.canvases.length; ++i){
            Drawr.flushCache(i);
        }
    }else{
        var canvas = Drawr.canvases[id];
        var cache = Drawr.global_cache[id];
        var imgData = canvas.ctx.getImageData(0, 0, canvas.width, canvas.height);
        for(var i = 0; i < imgData.data.length; i += 4){
            imgData.data[i] = cache[i];
            imgData.data[i+1] = cache[i+1];
            imgData.data[i+2] = cache[i+2];
            imgData.data[i+3] = cache[i+3];
        }
        canvas.ctx.putImageData(imgData, 0, 0);
    }
}

Drawr.getPixels = function(id){
	return Drawr.pixel_cache[id];
}

Drawr.getPixel = function(id, x, y){
	var canvas = Drawr.canvases[id];
	x = Math.min(canvas.width, Math.max(0, x));
	y = Math.min(canvas.height, Math.max(0, y));
	
    var index = (y * Drawr.canvases[id].width + x)*4;
    var pixel = Drawr.pixel_cache[id][index/4] || Drawr.blankPixel();;
	return pixel;
}


Drawr.updatePixel = function(pixel, id, index, x, y){
	if (pixel === undefined) return;
	
	if (id === undefined) id = pixel.id;
	if (index === undefined) index = pixel.index;
	if (x === undefined) x = pixel.x;
	if (y === undefined) y = pixel.y;
	
	//console.log(x + ", " + y + ", " + id + ", " + index);
	//console.log(pixel);
	
	//update global cache! (make sure to convert from 0 - 100 back to 0 - 255)
	var cache = Drawr.global_cache[id];
	cache[index+0] = pixel.r * (255.0 / 100.0);
	cache[index+1] = pixel.g * (255.0 / 100.0);
	cache[index+2] = pixel.b * (255.0 / 100.0);
	cache[index+3] = 255;

	Drawr.pixel_cache[id][index/4].r = pixel.r;
	Drawr.pixel_cache[id][index/4].g = pixel.g;
	Drawr.pixel_cache[id][index/4].b = pixel.b;
	Drawr.pixel_cache[id][index/4].a = 100;
	
    // draw a 1x1 rectangle so the image reflects the cache
    // INSTEAD: flushCache() at the end of execution, significantly faster.
    var canvas = Drawr.canvases[id];
	canvas.ctx.fillStyle = "rgb(" + cache[index] + ", " +  cache[index+1] + ", " +  cache[index+2] + ")";
    canvas.ctx.fillRect(x, y, 1, 1);
}

Drawr.setPixelAt = function(id, x, y, pixel){
	if (pixel === undefined) return;
	
	var canvas = Drawr.canvases[id];
	x = Math.min(canvas.width, Math.max(0, x));
	y = Math.min(canvas.height, Math.max(0, y));
	
	var index = (y * Drawr.canvases[id].width + x)*4;
	if (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(pixel)){
		pixel = hexToRgb(pixel);
		pixel['a'] = 255;
	}
	
	Drawr.updatePixel(pixel, id, index, x, y);
}
Drawr.setPixel = function(pixel){
	if (pixel === undefined) return;
	
    var id = pixel['id'];
	var index = pixel.index;

	Drawr.updatePixel(pixel);
}
Drawr.setPixel2 = function(pixel, pixel2){
	if (pixel === undefined) return;
	
    var id = pixel.id;
	var index = pixel.index;
	if (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(pixel2)){
		pixel2 = hexToRgb(pixel2);
		pixel2['a'] = 255;
		
		//now convert rgb values from 255 (hex) to 100 (blockly standard)
		pixel2.r *= (100 / 255);
		pixel2.g *= (100 / 255);
		pixel2.b *= (100 / 255);
	}
	
	pixel2.id = id;
	pixel2.index = index;
	pixel2.x = pixel.x;
	pixel2.y = pixel.y;

	Drawr.updatePixel(pixel2);
}

Drawr.getPixelColour = function(pixel){
	pixel = pixel || Drawr.blankPixel();
	
	return rgbToHex(pixel['r'], pixel['g'], pixel['b']);
}

Drawr.getPixelRGB = function(pixel, rgb){
	pixel = pixel || Drawr.blankPixel();
	
	return pixel[rgb];
}

Drawr.setPixelRGB = function(pixel, rgb, value){
	if (pixel === undefined) return;
	
	pixel[rgb] = value;
    Drawr.setPixel(pixel);
}

Drawr.getPixelRGBIntensity = function(pixel, rgb){
	pixel = pixel || Drawr.blankPixel();
	
	var intensity = 0;
	
	switch (rgb){
		case 'r':
			if (pixel['g'] + pixel['b'] === 0)
				intensity = pixel['r'];
			else 
				intensity = pixel['r'] / ((pixel['g']+pixel['b'])/2);
			break;
		case 'g':
			if (pixel['r'] + pixel['b'] === 0)
				intensity = pixel['g'];
			else
				intensity = pixel['g'] / ((pixel['r']+pixel['b'])/2);
			break;
		case 'b':
			if (pixel['r'] + pixel['g'] === 0)
				intensity = pixel['b'];
			else 
				intensity = pixel['b'] / ((pixel['r']+pixel['g'])/2);
			break;
	}
	
	intensity = Math.min(intensity, 100);
	return intensity;
}