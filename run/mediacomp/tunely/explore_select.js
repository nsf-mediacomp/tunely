Synth.EXPLORER.Selector = function(){};
Synth.EXPLORER.Selector.init = function(){
	Synth.EXPLORER.Selector.explorers = [];
	Synth.EXPLORER.Selector.canvas_id = 0;
	Synth.EXPLORER.Selector.selected = 0;
	
	setInterval(Synth.EXPLORER.Selector.updateSelectBoxCanvases, 1000);
};
Synth.EXPLORER.CreateSelector = function(explorer){
	var id = Synth.EXPLORER.Selector.canvas_id;
	Synth.EXPLORER.Selector.canvas_id++;
	
	Synth.EXPLORER.Selector.explorers.push({name: explorer.sound.name, explorer: explorer, id: id});
	
	Synth.EXPLORER.Selector.addSelectBox(id, explorer.sound.name);
	Synth.EXPLORER.Selector.select(id);
	
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
    var boxes = document.getElementsByClassName("canvas_select_box");
	//var id = boxes.length;

	var new_box = '<div class="canvas_select_box" id="canvas_select_$id" onclick="Synth.EXPLORER.Selector.select($id)">';
	if (id > 4){
		new_box += "<div id='canvas_select_delete_$id' style='margin-left:65px;text-align:right;margin-top:-8px;cursor:pointer;font-size:16px;color:red;' onclick=\"(function(){ " +
			"Dialog.Confirm('Really remove this uploaded sound?', function(){  Synth.EXPLORER.Selector.removeSound($id); }, 'Delete Sound?', 'Yes');" + 
		"})()\">x</div>";
	}
	new_box	+=
		/*'    <!--img src="images/cat_attendant.jpg" width="75px" height="75px"/><br/-->' +*/
		'    <canvas width="75px" height="75px"></canvas><br/>' +
		'    $name' +
		'</div>';
	new_box = new_box.interpolate({id: id, name: name});
	$("#canvas_select")[0].innerHTML += new_box;
	
    return id;
};

Synth.EXPLORER.Selector.removeSound = function(id){
	var uploaded_sounds = Synth.EXPLORER.Selector.uploaded_sounds.slice();
	uploaded_sounds.splice(id-Synth.default_sounds_count, 1);
	Synth.EXPLORER.Selector.clearUploadedSounds();
	Synth.EXPLORER.Selector.explorers.splice(id, 1);
	
	var snd_num = id;
	while (localStorage.getItem("uploaded_sound_"+snd_num) !== null){
		localStorage.removeItem("uploaded_sound_"+snd_num);
		snd_num++;
	}

	var selected = Synth.EXPLORER.Selector.selected;
	Synth.EXPLORER.Selector.uploaded_sounds = [];
	Synth.EXPLORER.Selector.canvas_id = Synth.default_sounds_count;
	
	for (var i = 0; i < uploaded_sounds.length; i++){
		Synth.EXPLORER.Selector.restoreUploadedSound(uploaded_sounds[i]);
		localStorage.setItem("uploaded_sound_"+(i+Synth.default_sounds_count), uploaded_sounds[i]);
	}
	Synth.EXPLORER.Selector.updateSelectBoxCanvases();
	
	Synth.EXPLORER.Selector.selected = selected;
	while (Synth.EXPLORER.Selector.selected >= $(".canvas_select_box").length){
		Synth.EXPLORER.Selector.selected--;
	}
	Synth.EXPLORER.Selector.select(Synth.EXPLORER.Selector.selected);
	BlockIt.RefreshWorkspace();
};

Synth.EXPLORER.Selector.getSelectBox = function(id){
    return $("#canvas_select_" + id)[0];
};

Synth.EXPLORER.Selector.getCanvas = function(id){
    return $("#canvas_" + id)[0];
};

Synth.EXPLORER.Selector.updateSelectBoxCanvases = function(){
	//TODO
    var boxes = document.getElementsByClassName("canvas_select_box");
    for(var i=0; i<boxes.length; ++i){
		try{
			if (boxes[i].style.display === "none") continue;
			var ctx = boxes[i].getElementsByTagName("canvas")[0].getContext('2d');
			var w = ctx.canvas.width;
			var h = ctx.canvas.height;
			ctx.drawImage(Drawr.getCtx(i).canvas, 0, 0, w, h);
		}catch(e){}
		
		try{
			Synth.EXPLORER.Selector.explorers[i].explorer.ExploreMySound();
		}catch(e){}
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