Synth.EXPLORER.Selector = function(){};
Synth.EXPLORER.Selector.init = function(){
	Synth.EXPLORER.Selector.explorers = [];
	Synth.EXPLORER.Selector.canvas_id = 0;
	Synth.EXPLORER.Selector.selected = 0;
};

Synth.GetSelectedSound = function(){
	return Synth.GetSound(Synth.EXPLORER.Selector.explorers[Synth.EXPLORER.Selector.selected].name);
}

Synth.EXPLORER.CreateSelector = function(explorer){
	var id = Synth.EXPLORER.Selector.canvas_id;
	Synth.EXPLORER.Selector.canvas_id++;
	
	var select_box = Synth.EXPLORER.Selector.addSelectBox(id, explorer.sound.name);
	
	Synth.EXPLORER.Selector.explorers.push({name: explorer.sound.name, explorer: explorer, id: id, select_box: select_box});
	Synth.EXPLORER.Selector.select(id);
	
	Synth.EXPLORER.Selector.updateSelectBoxCanvas(id);
	
	BlockIt.InitWorkspace();
	BlockIt.RefreshWorkspace();
};

Synth.EXPLORER.Selector.resetAll = function(){
    for(var i=0; i < Synth.EXPLORER.Selector.explorers.length; ++i){
		  Synth.ResetSound(Synth.EXPLORER.Selector.explorers[i].name);
    }
};

Synth.EXPLORER.Selector.reset = function(){
	Synth.ResetSound(Synth.EXPLORER.Selector.explorers[Synth.EXPLORER.Selector.selected].name);
	Synth.EXPLORER.Selector
		.explorers[Synth.EXPLORER.Selector.selected].explorer.ExploreMySound();
};

Synth.EXPLORER.Selector.onresize = function(){
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    
    /* canvas select sizing */
    var canvas_select = $("#canvas_select")[0];
    canvas_select.style.height = (h - canvas_select.offsetTop - 10) + "px"; // -10 to align with bottom of blockly window
    
    /* box padding setting - to keep 4 per row, and keep them evenly spaced */
    /* canvas_selector width: 400px. 4 boxes per line. (400px - 4 boxes * (75+5+5+2)px) / (5 margins surrounding 4 boxes) = 10px */
    var w = $("#canvas_select_width_div")[0].offsetWidth;
    var box_width = 75 + 5 + 5 + 2; // padding, border
    var total_space_for_margins = w - 4 * box_width;
    // divide by 5 margins, 5 margins surround 4 boxes
    var margin_size = Math.max(0, Math.floor(total_space_for_margins / 5) - 1);
    
    var boxes = document.getElementsByClassName("canvas_select_box");
    for(var i=0; i<boxes.length; ++i){
        boxes[i].style.marginLeft = margin_size + "px";
    }
};

Synth.EXPLORER.Selector.addSelectBox = function(id, name){
	var new_box = document.createElement("div");
	new_box.className = "canvas_select_box";
	new_box.id = "canvas_select_" + id;
	new_box.onclick = (function(id){ Synth.EXPLORER.Selector.select(id); }.bind(this, id));
	
	if (id > 0){
		var delete_button = document.createElement("div");
		delete_button.id = "canvas_select_delete_" + id;
		delete_button.className = "canvas_select_delete";
		delete_button.onclick = (function(id){
			Dialog.Confirm('Really remove this uploaded sound?', function(){
				Synth.EXPLORER.Selector.removeSound(id);
			}, 'Delete Sound?', 'Yes');
		}.bind(this,id));
		delete_button.innerHTML = "x";
		
		new_box.appendChild(delete_button);
	}
	var canvas = document.createElement("canvas");
	canvas.style.width = "75px";
	canvas.style.height = "75px";
	var span = document.createElement("span");
	span.id = "canvas_select_box_" + id + "_title";
	span.innerHTML = name;
	
	new_box.appendChild(canvas);
	new_box.appendChild(document.createElement("br"));
	new_box.appendChild(span);
	
	$("#canvas_select")[0].appendChild(new_box);
	
	return new_box;
};

Synth.EXPLORER.Selector.getSelectBox = function(id){
    return $("#canvas_select_" + id)[0];
};

Synth.EXPLORER.Selector.getCanvas = function(id){
    return $("#canvas_" + id)[0];
};

Synth.EXPLORER.Selector.updateSelectBoxCanvas = function(id){
	try{
	    var boxes = document.getElementsByClassName("canvas_select_box");
		var ctx = boxes[id].getElementsByTagName("canvas")[0].getContext('2d');
		var w = ctx.canvas.width;
		var h = ctx.canvas.height;
		
		Synth.EXPLORER.Selector.explorers[id].explorer.bigCanvas.drawToCanvas(ctx, 0, 0, w, h);
	}catch(e){
		//console.log(e);
		window.setTimeout(function(){
			Synth.EXPLORER.Selector.updateSelectBoxCanvas(id);
		}, 100);
	}
};
Synth.EXPLORER.Selector.exploreSounds = function(){
	for (var i = 0; i < Synth.EXPLORER.Selector.explorers.length; i++){
		window.setTimeout(function(i){Synth.EXPLORER.Selector.explorers[i].explorer.ExploreMySound()}.bind(this, i), i*100);
	}
}
Synth.EXPLORER.Selector.updateSelectBoxCanvases = function(){
    var boxes = document.getElementsByClassName("canvas_select_box");
    for(var i=0; i<boxes.length; ++i){
		var ctx = boxes[i].getElementsByTagName("canvas")[0].getContext('2d');
		var w = ctx.canvas.width;
		var h = ctx.canvas.height;
    }
};

Synth.EXPLORER.Selector.select = function(id){
	try{
		var boxes = document.getElementsByClassName("canvas_select_box");
		for(var i=0; i<boxes.length; ++i){
			boxes[i].style.backgroundColor = "rgb(255,255,255)";
		}
		Synth.EXPLORER.Selector.getSelectBox(id).style.backgroundColor = "rgb(241,241,255)";
		var canvi = document.getElementsByClassName("explorer_canvas_container");
		for(var i=0; i<canvi.length; ++i){
			canvi[i].style.display = "none";
		}
		Synth.EXPLORER.Selector.getCanvas(id).style.display = "block";

		Synth.EXPLORER.Selector.selected = id;
	}catch(e){
		console.log(e);
	}
};


Synth.EXPLORER.Selector.removeSound = function(id){ //TODO
	var sound_name = $("#canvas_select_box_" + id + "_title")[0].innerHTML;
	var sounds = [];
	var all_sounds = Object.keys(Synth.originalSounds);
	var default_sound_count = 0;
	for (var i = 0; i < all_sounds.length; i++){
		if (!Synth.isDefaultSoundName(all_sounds[i]) && all_sounds[i] !== sound_name){
			var name = all_sounds[i];
			var sound = Synth.originalSounds[name];
			sound.name = name;
			sounds.push(Synth.originalSounds[all_sounds[i]]);
		}else if (Synth.isDefaultSoundName(all_sounds[i]))
			default_sound_count++;
	}
	
	//erase the explorer object
	var index = 0;
	for (var i = 0; i < Synth.EXPLORER.Selector.explorers.length; i++){
		if (Synth.EXPLORER.Selector.explorers[i].id === id){
			index = i;
			break;
		}
	}
	Synth.EXPLORER.Selector.explorers.splice(index, 1);
	
	//clear memory
	Synth.RemoveUploadedSoundByName(sound_name);
	
	//remove all block references to deleted sound
	var blocks = Blockly.mainWorkspace.getAllBlocks();
	// Iterate through every block.
	for (var x = 0; x < blocks.length; x++) {
		var func = blocks[x].removeSound;
		if (func) {
			func.call(blocks[x], sound_name);
		}
	}
	
	//remove from dom
	$("#canvas_" + id).remove();
	$("#canvas_select_" + id).remove();
	
	//actually delete sound from the dictionaries
	delete Synth.originalSounds[sound_name];
	delete Synth.sounds[sound_name];
	
	//finalize
	Synth.EXPLORER.Selector.selected = 0;
	Synth.EXPLORER.Selector.select(Synth.EXPLORER.Selector.selected);
	BlockIt.RefreshWorkspace();
};