Synth.EXPLORER = function(){
	this.sound = null;
	this.samples = [];
	
	this.title = null;
	
	this.playSoundButton = null;
	this.playBeforeButton = null;
	this.playAfterButton = null;
	this.stopButton = null;
	this.playSelectionButton = null;
	this.clearSelectionButton = null;
	this.startIndexField = null;
	this.stopIndexField = null;
	
	this.bigCanvas = null;
	this.mouse_down = false;
	this.arrowIndexImg = null;
	this.firstIndexButton = null;
	this.prevIndexButton = null;
	this.selection_flipped = false;
	this.curr_selection_start = 0;
	this.curr_selection_end = 0;
	this.currIndexField = null;	this.curr_index_value = 0;
	this.sampleValueField = null;
	this.nextIndexButton = null;
	this.lastIndexButton = null;
	this.samplesPerPixelField = null;
	this.zoomInButton = null;
	this.zoomOutButton = null;

	this.scale_x = 0.0625;
	this.scale_y = 2.0;
};
Synth.EXPLORER.counter = 0;

Synth.EXPLORER.prototype.init = function(sound, title, playSoundButton, playBeforeButton, playAfterButton, stopButton, playSelectionButton, clearSelectionButton, startIndexField, stopIndexField, canvas, arrowIndexImg, selectionHighlighter, firstIndexButton, prevIndexButton, currIndexField, sampleValueField, nextIndexButton, lastIndexButton, samplesPerPixelField, zoomOutButton, zoomInButton){
	this.sound = sound;
	this.samples = Synth.GetSamples(this.sound);
	
	this.title = title;
	
	this.playSoundButton = playSoundButton;
	this.playSoundButton.onclick = this.PlaySound.bind(this);
	this.playBeforeButton = playBeforeButton;
	this.playBeforeButton.onclick = this.PlayBefore.bind(this);
	this.playAfterButton = playAfterButton;
	this.playAfterButton.onclick = this.PlayAfter.bind(this);
	this.stopButton = stopButton;
	this.stopButton.onclick = this.StopSound.bind(this);
	this.stopButton.disabled = true;
	this.playSelectionButton = playSelectionButton;
	this.playSelectionButton.onclick = this.PlaySelection.bind(this);
	this.clearSelectionButton = clearSelectionButton;
	this.clearSelectionButton.onclick = this.ClearSelection.bind(this);
	this.startIndexField = startIndexField;
	this.stopIndexField = stopIndexField;

	this.bigCanvas = new BigCanvas(canvas, 100, 100);
	this.bigCanvas.ctx.fillStyle = "#ff0000";
	this.bigCanvas.fillRect(0, 0, 100, 100);
	this.bigCanvas.canvas.onmousedown = this.CanvasMouseDown.bind(this);
	this.bigCanvas.canvas.onmousemove = this.CanvasMouseMove.bind(this);
	this.bigCanvas.canvas.onmouseup = this.CanvasMouseUp.bind(this);
	//this.bigCanvas.container.onmouseout = this.CanvasMouseUp.bind(this);
	this.bigCanvas.canvas.onselectstart = function(){ return false; }
	
	this.arrowIndexImg = arrowIndexImg;
	this.arrowIndexImg.onmousedown = this.CanvasMouseDown.bind(this);
	this.arrowIndexImg.onmousemove = this.CanvasMouseMove.bind(this);
	this.arrowIndexImg.onmouseup = this.CanvasMouseUp.bind(this);
	this.arrowIndexImg.onselectstart = function(){ return false; }

	this.selectionHighlighter = selectionHighlighter;
	this.selectionHighlighter.onmousedown = this.CanvasMouseDown.bind(this);
	this.selectionHighlighter.onmousemove = this.CanvasMouseMove.bind(this);
	this.selectionHighlighter.onmouseup = this.CanvasMouseUp.bind(this);
	this.selectionHighlighter.onselectstart = function(){ return false; }
	
	this.firstIndexButton = firstIndexButton;
	this.firstIndexButton.onclick = this.FirstIndex.bind(this);
	this.prevIndexButton = prevIndexButton;
	this.prevIndexButton.onclick = this.PrevIndex.bind(this);
	this.currIndexField = currIndexField;
	this.currIndexField.value = this.curr_index_value;
	this.currIndexField.onchange = this.CurrIndexChange.bind(this);
	this.sampleValueField = sampleValueField;
	this.sampleValueField.value = this.samples[this.curr_index_value].getValue();
	this.nextIndexButton = nextIndexButton;
	this.nextIndexButton.onclick = this.NextIndex.bind(this);
	this.lastIndexButton = lastIndexButton;
	this.lastIndexButton.onclick = this.LastIndex.bind(this);
	this.samplesPerPixelField = samplesPerPixelField;
	
	this.zoomOutButton = zoomOutButton;
	this.zoomOutButton.onclick = this.ZoomOut.bind(this);
	this.zoomInButton = zoomInButton;
	this.zoomInButton.onclick = this.ZoomIn.bind(this);
	this.UpdateSampleIndexSection();
}

Synth.EXPLORER.CreateSoundExploration = function(sound){
	if (sound === undefined || sound === null) return;
	
	var id = Synth.EXPLORER.Selector.canvas_id;
	/*var exploreWindow = window.open("", ++Synth.EXPLORER.counter, "width=850, height=600");
	exploreWindow.document.write(Synth.EXPLORER.container.innerHTML);
	exploreWindow.document.title = "Explore: " + sound.name;*/
	//<div id="canvas_0" class="explore_canvas"></div>
	var exploreCanvas = document.createElement("div");
	exploreCanvas.id = "canvas_" + id;
	exploreCanvas.className = "explore_canvas";
	exploreCanvas.className = "explorer_canvas_container";
	exploreCanvas.innerHTML = "";
	
	//CREATE THE TITLE
	var title_title = document.createElement("span");
	title_title.textContent = "Explore: ";
	title_title.style.position = "relative";
	title_title.style.left = "-60px";
	var title = document.createElement("b");
	title.textContent = sound.name;
	title.style.position = "relative";
	title.style.left = "-64px";
	title.style.fontSize = "24px";
	var center = document.createElement("center");
	center.style.fontFamily = "\"Lucida Console\", Monaco, monospace";
	center.style.marginBottom = "-10px";
	center.style.marginTop = "-15px";
	center.style.paddingLeft = "45px";
	center.style.paddingTop = "10px";
	center.style.position = "relative";
	center.style.left = "-30px";
	center.style.width = "100%"
	center.style.backgroundColor = "#99B382";
	center.style.height = "32px";
	center.appendChild(title_title);
	center.appendChild(title);
	exploreCanvas.appendChild(center);
	
	//CREATE THE FIRST SET OF INPUTS: SOUND PLAYING
	var explore_inputs = document.createElement("center");
	explore_inputs.className = "explore_inputs";
	
	var p = document.createElement("p");
	var explore_playSound = document.createElement("input");
	explore_playSound.type="submit";
	explore_playSound.value="Play Entire Sound";
	var explore_playBefore = document.createElement("input");
	explore_playBefore.type="submit";
	explore_playBefore.value = "Play Before";
	var explore_playAfter = document.createElement("input");
	explore_playAfter.type="submit";
	explore_playAfter.value="Play After";
	var explore_stop = document.createElement("input");
	explore_stop.type = "submit";
	explore_stop.value = "Stop";
	p.appendChild(explore_playSound);
	p.appendChild(document.createTextNode(" "));
	p.appendChild(explore_stop);
	p.appendChild(document.createTextNode(" "));
	p.appendChild(explore_playBefore);
	p.appendChild(document.createTextNode(" "));
	p.appendChild(explore_playAfter);
	p.appendChild(document.createElement("br"));
	
	//CREATE THE SECOND SET OF INPUTS: SELECTION PLAYING
	var explore_playSelection = document.createElement("input");
	explore_playSelection.type = "submit";
	explore_playSelection.value = "Play Selection";
	var explore_clearSelection = document.createElement("input");
	explore_clearSelection.type = "submit";
	explore_clearSelection.value = "Clear Selection";
	p.appendChild(explore_playSelection);
	p.appendChild(document.createTextNode(" "));
	p.appendChild(explore_clearSelection);
	p.appendChild(document.createElement("br"));
	var b = document.createElement("b");
	b.textContent = "Start Index: ";
	var explore_startIndex = document.createElement("input");
	explore_startIndex.type = "text";
	explore_startIndex.value = "N/A";
	explore_startIndex.disabled = true;
	explore_startIndex.style.width = "100px";
	p.appendChild(b);
	p.appendChild(explore_startIndex);
	p.appendChild(document.createTextNode("  "));
	var b = document.createElement("b");
	b.textContent = "Stop Index: ";
	var explore_stopIndex = document.createElement("input");
	explore_stopIndex.type = "text";
	explore_stopIndex.value = "N/A";
	explore_stopIndex.disabled = true;
	explore_stopIndex.style.width = "100px";
	p.appendChild(b);
	p.appendChild(explore_stopIndex);
	explore_inputs.appendChild(p);
	
	exploreCanvas.appendChild(explore_inputs);
	
	//CREATE THE BIG CANVAS TO DISPLAY THE SOUND SAMPLES!!!
	var div = document.createElement("div");
	div.style.position = "relative";
	var explore_canvasContainer = document.createElement("div");
	explore_canvasContainer.className = "explore_canvasContainer";
	var explore_selectionHighlighter = document.createElement("div");
	explore_selectionHighlighter.className = "explore_selectionHighlighter";
	var explore_indexArrow = document.createElement("img");
	explore_indexArrow.className = "explore_indexArrow";
	explore_indexArrow.src = "mediacomp/tunely/arrow.png";
	explore_canvasContainer.appendChild(explore_selectionHighlighter);
	explore_canvasContainer.appendChild(explore_indexArrow);
	div.appendChild(explore_canvasContainer);
	exploreCanvas.appendChild(div);
	exploreCanvas.appendChild(document.createElement("br"));
	
	//CREATE THE THIRD SET OF INPUTS!!: SAMPLE SELECTION
	var explore_inputs = document.createElement("center");
	explore_inputs.style.marginTop = "-15px";
	explore_inputs.className = "explore_inputs";
	var p = document.createElement("span");
	var explore_firstIndex = document.createElement("input");
	explore_firstIndex.type = "submit";
	explore_firstIndex.value = "<<";
	var explore_prevIndex = document.createElement("input");
	explore_prevIndex.type = "submit";
	explore_prevIndex.value = " <";
	p.appendChild(explore_firstIndex);
	p.appendChild(document.createTextNode(" "));
	p.appendChild(explore_prevIndex);
	p.appendChild(document.createTextNode("  "));
	
	var b = document.createElement("b");
	b.textContent = "Index: ";
	var explore_currIndex = document.createElement("input");
	explore_currIndex.type = "text";
	explore_currIndex.value = "1";
	explore_currIndex.style.width = "80px";
	p.appendChild(b);
	p.appendChild(explore_currIndex);
	p.appendChild(document.createTextNode("   "));
	var b = document.createElement("b");
	b.textContent = "Sample Value: ";
	var explore_sampleValue = document.createElement("input");
	explore_sampleValue.type = "text";
	explore_sampleValue.value = "0";
	explore_sampleValue.disabled = true;
	
	var explore_nextIndex = document.createElement("input");
	explore_nextIndex.type = "submit";
	explore_nextIndex.value = " >";
	var explore_lastIndex = document.createElement("input");
	explore_lastIndex.type = "submit";
	explore_lastIndex.value = ">>";
	p.appendChild(explore_nextIndex);
	p.appendChild(document.createTextNode(" "));
	p.appendChild(explore_lastIndex);
	p.appendChild(document.createElement("br"));
	p.appendChild(b);
	p.appendChild(explore_sampleValue);
	explore_inputs.appendChild(p);
	
	var p = document.createElement("p");
	p.style.marginTop = "5px";
	var b = document.createElement("b");
	b.textContent = "# Samples between pixels: ";
	var explore_numSamplesPerPixel = document.createElement("input");
	explore_numSamplesPerPixel.type = "text";
	explore_numSamplesPerPixel.value = "1";
	explore_numSamplesPerPixel.disabled = true;
	explore_numSamplesPerPixel.style.width = "80px";
	p.appendChild(b);
	p.appendChild(explore_numSamplesPerPixel);
	p.appendChild(document.createElement("br"));
	
	var explore_zoomOut = document.createElement("input");
	explore_zoomOut.type = "submit";
	explore_zoomOut.value = "Zoom Out";
	var explore_zoomIn = document.createElement("input");
	explore_zoomIn.type = "submit";
	explore_zoomIn.value = "Zoom In";
	p.appendChild(explore_zoomOut);
	p.appendChild(document.createTextNode(" "));
	p.appendChild(explore_zoomIn);
	explore_inputs.appendChild(p);
	exploreCanvas.appendChild(explore_inputs);
	
	exploreCanvas.style.backgroundColor = "#C4E1B7";
	exploreCanvas.style.padding = "15px";
	
	document.getElementById("visualization").appendChild(exploreCanvas);
	
	
	//NOW SET UP EVENT HANDLERS FOR THE NEW SYNTH EXPLORER
	var explorer = new Synth.EXPLORER();
	explorer.id = id;
	explorer.init(
		sound,
		title,
		explore_playSound,
		explore_playBefore,
		explore_playAfter,
		explore_stop,
		explore_playSelection,
		explore_clearSelection,
		explore_startIndex,
		explore_stopIndex,
		explore_canvasContainer,
		explore_indexArrow,
		explore_selectionHighlighter,
		explore_firstIndex,
		explore_prevIndex,
		explore_currIndex,
		explore_sampleValue,
		explore_nextIndex,
		explore_lastIndex,
		explore_numSamplesPerPixel,
		explore_zoomOut,
		explore_zoomIn
	);
	explorer.ExploreMySound();
	Synth.EXPLORER.CreateSelector(explorer);
}
Synth.EXPLORER.prototype.UpdateName = function(){
  this.title.innerHTML = this.sound.name;
}
Synth.EXPLORER.prototype.ExploreMySound = function(){
	this.sound = Synth.GetSound(this.sound.name);
	this.samples = Synth.GetSamples(this.sound);
	//this.title.innerHTML = this.sound.name;
	var samples = this.samples;
	
	var canvas = this.bigCanvas;
	var width = samples.length*this.scale_x;
	canvas.setWidth(width);
	var height = 200;
	canvas.setHeight(height);
	var y_size = this.scale_y;//32768;
	var base_y = height/2;
	
	//REPAINT THE CANVS
	canvas.ctx.fillStyle = "#000000";
	canvas.fillRect(0, 0, width, height, true);
	//now start drawing the samples of the sound
	canvas.ctx.fillStyle = "#00ff00";
	//canvas.ctx.strokeStyle = "#00ffff";
	//canvas.ctx.beginPath();
	//canvas.ctx.moveTo(0, base_y);
	for (var i = 0; i < samples.length; i++){
		//needs minus since y axis is inverted for canvas
		var y = base_y - ((samples[i].getValue() / y_size)*base_y);
		var draw_y = y;
		//draw a dot in the calculated location
		//canvas.ctx.lineTo(i, y);
		canvas.fillRect(i*this.scale_x, y, 1, 1, false);
	}
	//canvas.ctx.stroke();
	
	this.zoomOutButton.disabled = false;
	this.zoomInButton.disabled = false;
	if ((1 / this.scale_x) >= 128){
		this.zoomOutButton.disabled = true;
	}
	if ((1 / this.scale_x) <= 1){
		this.zoomInButton.disabled = true;
	}
	
	this.UpdateSampleIndexSection();
	Synth.EXPLORER.Selector.updateSelectBoxCanvas(this.id);
}
Synth.EXPLORER.prototype.ExploreSample = function(index){
	this.sound = Synth.GetSound(this.sound.name);
	this.samples = Synth.GetSamples(this.sound);
	var samples = this.samples;
	
	var canvas = this.bigCanvas;
	var width = samples.length*this.scale_x;
	canvas.setWidth(width);
	var height = 200;
	canvas.setHeight(height);
	var y_size = this.scale_y;//32768;
	var base_y = height/2;
	
	//REPAINT THE CANVS
	canvas.ctx.fillStyle = "#000000";
	if (~~(index * this.scale_x) % 1 === 0)
		canvas.fillRect(index*this.scale_x, 0, 1, height, true);
	//now start drawing the samples of the sound
	canvas.ctx.fillStyle = "#00ff00";
	//needs minus since y axis is inverted for canvas
	var y = base_y - ((samples[index].getValue() / y_size)*base_y);
	var draw_y = y;
	//draw a dot in the calculated location
	canvas.fillRect(index/*this.scale_x*/, y, 1, 1, false);
	
	this.zoomOutButton.disabled = false;
	this.zoomInButton.disabled = false;
	if ((1 / this.scale_x) >= 128){
		this.zoomOutButton.disabled = true;
	}
	if ((1 / this.scale_x) <= 1){
		this.zoomInButton.disabled = true;
	}
	
	this.UpdateSampleIndexSection();
}

Synth.EXPLORER.prototype.UpdateSampleIndexSection = function(){
	if (this.curr_selection_start !== this.curr_selection_end){
		this.startIndexField.value = this.curr_selection_start;
		this.stopIndexField.value = this.curr_selection_end;
		
		this.playSelectionButton.disabled = false;
		this.clearSelectionButton.disabled = false;
		
		this.arrowIndexImg.style.visibility = "hidden";
	}else{
		this.startIndexField.value = "N/A";
		this.stopIndexField.value = "N/A";
		
		this.playSelectionButton.disabled = true;
		this.clearSelectionButton.disabled = true;
		
		this.arrowIndexImg.style.visibility = "";
	}
	
	var sample_value = this.samples[this.curr_index_value].getValue();
	
	this.currIndexField.value = this.curr_index_value;
	this.sampleValueField.value = sample_value;
	this.samplesPerPixelField.value = '' + (1 / this.scale_x);
	
	var y_size = this.scale_y;
	//move the arrow graphic to point at the sample index as well
	//-8 to make the center of the arrow be pointing at the correct pixel (not the edge)
	var arrow_x = ~~(this.curr_index_value * this.scale_x - 8);
	//middle of canvas + (calculated samplevalue with scale) - height of arrow - y offset
	var arrow_y = ~~(100 - ((sample_value / y_size)*100)) - 32;
	//~~ cuts off decimal values from int and is faster than floor or ceil
	this.arrowIndexImg.style.top = (arrow_y) + "px";
	this.arrowIndexImg.style.left = (arrow_x) + "px";
	arrow_x += 8;
	
	
	//move the 'selection highlighter' div by absolute positioning and also set its width
	var selection_x1 = ~~(this.curr_selection_start * this.scale_x);
	var selection_x2 = ~~(this.curr_selection_end * this.scale_x);
	this.selectionHighlighter.style.left = selection_x1 + "px";
	this.selectionHighlighter.style.width = selection_x2 - selection_x1 + "px";
	
	
	//relocate the scroll position of the canvas container to the appropriate index value
	var container = this.bigCanvas.container;
	//that's just what i set the width of the canvas container to :)
	var width = 460;
	var offset = 220;
	
	if (container.scrollLeft + width < arrow_x){
		container.scrollLeft += (arrow_x - (container.scrollLeft + width));
		container.scrollLeft += offset;
	}
	if (container.scrollLeft > arrow_x){
		container.scrollLeft -= (container.scrollLeft - arrow_x);
		container.scrollLeft -= offset;
	}
	
	
	//now enable/disable the index control buttons appropriately
	if (this.curr_index_value == 0){
		this.playBeforeButton.disabled = true;
		
		this.firstIndexButton.disabled = true;
		this.prevIndexButton.disabled = true;
	}else{
		this.playBeforeButton.disabled = false;
		
		this.firstIndexButton.disabled = false;
		this.prevIndexButton.disabled = false;
	}
	
	if (this.curr_index_value == this.samples.length-1){
		this.playAfterButton.disabled = true;
		
		this.nextIndexButton.disabled = true;
		this.lastIndexButton.disabled = true;
	}else{
		this.playAfterButton.disabled = false;
		
		this.nextIndexButton.disabled = false;
		this.lastIndexButton.disabled = false;
	}
}

Synth.EXPLORER.prototype.UpdatePlayButtons = function(value){
	value = !value;
	this.playSoundButton.disabled = value;
	this.playBeforeButton.disabled = value;
	this.playAfterButton.disabled = value;
	this.playSelectionButton.disabled = value;
	this.clearSelectionButton.disabled = value;
	
	this.stopButton.disabled = !value;
}
Synth.EXPLORER.prototype.PlaySound = function(){
	this.play_sound_source = Synth.PlaySound(this.sound);
	var duration = this.play_sound_source.buffer.duration;
	this.play_sound_timeout = window.setTimeout(
		this.StopSound.bind(this),
		duration * 1000
	);
	
	this.UpdatePlayButtons(false);
}
Synth.EXPLORER.prototype.PlayBefore = function(){
	var sound = Synth.CloneSound(this.sound);
	var samples = Synth.GetSamples(sound, true);
	var sample_length = Array.prototype.slice.call(samples).length;
	var before_index = this.curr_index_value;
	if (this.curr_selection_start < this.curr_selection_end)
		before_index = this.curr_selection_start;
	//erase the values of the samples we dont wanna play
	for (var i = before_index+1; i < sample_length; i++){
		samples[i].setValue(0.0);
	}
	
	this.play_sound_source = Synth.PlaySound(sound);
	var duration = (this.play_sound_source.buffer.duration / sample_length) * before_index;
	this.play_sound_timeout = window.setTimeout(
		this.StopSound.bind(this),
		duration * 1000
	);
	
	this.UpdatePlayButtons(false);
}
Synth.EXPLORER.prototype.PlayAfter = function(){
	var sound = Synth.CloneSound(this.sound);
	var samples = Synth.GetSamples(sound, true);
	var sample_length = Array.prototype.slice.call(samples).length;
	var after_index = this.curr_index_value + 1;
	if (this.curr_selection_start < this.curr_selection_end)
		after_index = this.curr_selection_end + 1;
		
	//offset the samples over to the correct position
	for (var i = after_index; i < sample_length; i++){
		samples[i-after_index].setValue(samples[i].getValue());
	}
	//erase the values of the samples we dont wanna play
	for (var i = sample_length - after_index; i < sample_length; i++){
		samples[i].setValue(0.0);
	}

	this.play_sound_source = Synth.PlaySound(sound);
	var duration = (this.play_sound_source.buffer.duration / sample_length) * (sample_length - after_index);
	this.play_sound_timeout = window.setTimeout(
		this.StopSound.bind(this),
		duration * 1000
	);
	
	this.UpdatePlayButtons(false);
}
Synth.EXPLORER.prototype.StopSound = function(){
	var source = this.play_sound_source;
	if (source !== null && source !== undefined){
		if(!source.start) {
			source.noteOff(0);
		} else {
			source.stop(0);
		}
	}
	this.play_sound_source = null;
	window.clearTimeout(this.play_sound_timeout);
	this.play_sound_timeout = null;
	
	this.UpdatePlayButtons(true);
	this.UpdateSampleIndexSection();
}
Synth.EXPLORER.prototype.PlaySelection = function(){
	var sound = Synth.CloneSound(this.sound);
	var samples = Synth.GetSamples(sound, true);
	var sample_length = Array.prototype.slice.call(samples).length;
	//offset the samples over to the correct position
	for (var i = this.curr_selection_start; i < this.curr_selection_end; i++){
		samples[i-this.curr_selection_start].setValue(samples[i].getValue());
	}
	//erase the values of the samples we dont wanna play
	for (var i = this.curr_selection_end - this.curr_selection_start; i < sample_length; i++){
		samples[i].setValue(0.0);
	}
	
	this.play_sound_source = Synth.PlaySound(sound);
	var duration = (this.play_sound_source.buffer.duration / sample_length) * (this.curr_selection_end - this.curr_selection_start);
	this.play_sound_timeout = window.setTimeout(
		this.StopSound.bind(this),
		duration * 1000
	);
	
	this.UpdatePlayButtons(false);
}
Synth.EXPLORER.prototype.ClearSelection = function(){
	this.curr_selection_end = this.curr_selection_start;
	this.UpdateSampleIndexSection();
}

Synth.EXPLORER.prototype.CanvasMouseDown = function(e){
	this.mouse_down = true;
	
	var boundingRect = this.bigCanvas.container.getBoundingClientRect();
	var X = e.pageX - boundingRect.left + this.bigCanvas.container.scrollLeft;
	this.curr_index_value = ~~(X * (1 / this.scale_x));
	this.curr_selection_start = this.curr_index_value;
	this.curr_selection_end = this.curr_selection_start;
	this.selection_flipped = false;
	
	this.UpdateSampleIndexSection();
	return false;
}
Synth.EXPLORER.prototype.CanvasMouseMove = function(e){
	if (this.mouse_down){
		var boundingRect = this.bigCanvas.container.getBoundingClientRect();
		var X = e.pageX - boundingRect.left + this.bigCanvas.container.scrollLeft;
		X = ~~(X * (1 / this.scale_x));
		
		if (X < this.curr_selection_start){
			if (!this.selection_flipped){
				this.curr_selection_end = this.curr_selection_start;
			}
			this.curr_selection_start = X;
			this.selection_flipped = true;
		}else{
			if (this.selection_flipped && X < this.curr_selection_end){
				this.curr_selection_start = X;
			}else{
				if (this.selection_flipped){
					this.curr_selection_start = this.curr_selection_end;
				}
				this.curr_selection_end = X;
				this.selection_flipped = false;
			}
		}
		
		this.UpdateSampleIndexSection();
	}
}
Synth.EXPLORER.prototype.CanvasMouseUp = function(e){
	this.mouse_down = false;
}

Synth.EXPLORER.prototype.FirstIndex = function(){
	this.curr_index_value = 0;
	
	this.UpdateSampleIndexSection();
}
Synth.EXPLORER.prototype.PrevIndex = function(){
	this.curr_index_value--;
	if (this.curr_index_value < 0)
		this.curr_index = 0;
	
	this.UpdateSampleIndexSection();
}
Synth.EXPLORER.prototype.CurrIndexChange = function(e){
	
	this.curr_index_value = this.currIndexField.value;
	this.UpdateSampleIndexSection();
}
Synth.EXPLORER.prototype.NextIndex = function(){
	this.curr_index_value++;
	if (this.curr_index_value >= this.samples.length)
		this.curr_index_value = this.samples.length-1;

	this.UpdateSampleIndexSection();
}
Synth.EXPLORER.prototype.LastIndex = function(){
	this.curr_index_value = this.samples.length-1;
	
	this.UpdateSampleIndexSection();
}

Synth.EXPLORER.prototype.ZoomOut = function(){
	this.scale_x /= 2;
	//this.scale_y /= 2; //this divides too much and can lead to hiding the sample values
	this.ExploreMySound();
}
Synth.EXPLORER.prototype.ZoomIn = function(){
	this.scale_x *= 2;
	//this.scale_y *= //this multiplies too much!
	this.ExploreMySound();
}