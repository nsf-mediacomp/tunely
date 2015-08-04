function CanvasSelect(){}
CanvasSelect.init = function(img_paths){
	var count = img_paths.length;
	
    Drawr.canvases = [];
	var loaded_images = 0;
	for (var i = 0; i < count; i++){
		var img = new Image();
		img.src = img_paths[i];
		img.onload = function(id){
			var ctx = $('#canvas_'+id)[0].getContext('2d');
			Drawr.addCanvas($('#canvas_'+id)[0].getContext('2d'), id, this);
			ctx.drawImage(this, 0, 0, this.width, this.height);
			
			loaded_images++;
			if (loaded_images === img_paths.length){
				CanvasSelect.resetAll();
			}
		}.bind(img, i);
		CanvasSelect.addSelectBox(i);
	}
	CanvasSelect.canvas_id = count;
    
    CanvasSelect.selected = 0;
    CanvasSelect.select(0);
  
    setInterval(CanvasSelect.updateSelectBoxCanvases, 1000);
}

CanvasSelect.resetAll = function(){
    for(var i=0; i < Drawr.canvases.length; ++i){
		Drawr.restartCanvas(i);
    }
}

CanvasSelect.reset = function(){
	Drawr.restartCanvas(CanvasSelect.selected);
}

CanvasSelect.onresize = function(){
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
}

CanvasSelect.addSelectBox = function(id){
    var boxes = document.getElementsByClassName("canvas_select_box");
	//var id = boxes.length;

	var new_box = '<div class="canvas_select_box" id="canvas_select_$id" onclick="CanvasSelect.select($id)">';
	if (id > 4){
		new_box += "<div id='canvas_select_delete_$id' style='margin-left:65px;text-align:right;margin-top:-8px;cursor:pointer;font-size:16px;color:red;' onclick=\"(function(){ " +
			"Dialog.Confirm('Really remove this uploaded image?', function(){  CanvasSelect.removeImage($id); }, 'Delete Image?', 'Yes');" + 
		"})()\">x</div>";
	}
	new_box	+=
		/*'    <!--img src="images/cat_attendant.jpg" width="75px" height="75px"/><br/-->' +*/
		'    <canvas width="75px" height="75px"></canvas><br/>' +
		'    canvas $id' +
		'</div>';
	new_box = new_box.interpolate({id: id});
	$("#canvas_select")[0].innerHTML += new_box;
	
    return id;
}

CanvasSelect.removeImage = function(id){
	var uploaded_images = CanvasSelect.uploaded_images.slice();
	uploaded_images.splice(id-5, 1);
	CanvasSelect.clearUploadedImages();
	Drawr.canvases.splice(id, 1);
	
	var img_num = id;
	while (localStorage.getItem("uploaded_image_"+img_num) !== null){
		localStorage.removeItem("uploaded_image_"+img_num);
		img_num++;
	}

	var selected = CanvasSelect.selected;
	CanvasSelect.uploaded_images = [];
	CanvasSelect.canvas_id = 5;
	
	for (var i = 0; i < uploaded_images.length; i++){
		CanvasSelect.restoreUploadedImage(uploaded_images[i]);
		localStorage.setItem("uploaded_image_"+(i+5), uploaded_images[i]);
	}
	CanvasSelect.updateSelectBoxCanvases();
	
	CanvasSelect.selected = selected;
	while (CanvasSelect.selected >= $(".canvas_select_box").length){
		CanvasSelect.selected--;
	}
	CanvasSelect.select(CanvasSelect.selected);
	BlockIt.RefreshWorkspace();
}

CanvasSelect.getSelectBox = function(id){
    return $("#canvas_select_" + id)[0];
}

CanvasSelect.getCanvas = function(id){
    return $("#canvas_" + id)[0];
}

CanvasSelect.updateSelectBoxCanvases = function(){
    var boxes = document.getElementsByClassName("canvas_select_box");
    for(var i=0; i<boxes.length; ++i){
		try{
			if (boxes[i].style.display === "none") continue;
			var ctx = boxes[i].getElementsByTagName("canvas")[0].getContext('2d');
			var w = ctx.canvas.width;
			var h = ctx.canvas.height;
			ctx.drawImage(Drawr.getCtx(i).canvas, 0, 0, w, h);
		}catch(e){}
    }
}

CanvasSelect.select = function(id){
	try{
		var boxes = document.getElementsByClassName("canvas_select_box");
		for(var i=0; i<boxes.length; ++i){
			boxes[i].style.backgroundColor = "rgb(255,255,255)";
		}
		CanvasSelect.getSelectBox(id).style.backgroundColor = "rgb(241,241,255)";
		var canvi = document.getElementsByClassName("display_canvas");
		for(var i=0; i<canvi.length; ++i){
			canvi[i].style.display = "none";
		}
		CanvasSelect.getCanvas(id).style.display = "block";
		CanvasSelect.selected = id;
	}catch(e){}
}

CanvasSelect.hide = function(){
	if ($("#minuscanvas")[0].style.cursor === "not-allowed"){
		return;
	}
	$("#pluscanvas")[0].style.cursor = "pointer";

    CanvasSelect.removeSelectBox(CanvasSelect.selected);
	
    //change selected to one of the other visible ones
    var boxes = document.getElementsByClassName("canvas_select_box");
	var count = 0;
	var p_selected = CanvasSelect.selected;
	for (var i = 0; i < boxes.length; i++){
		if (boxes[i].style.display !== "none"){
			count++;
		}
	}
	
	if (count === 1){
		$("#minuscanvas")[0].style.cursor = "not-allowed";
	}
	
	CanvasSelect.updateSelectBoxCanvases();
}

//http://stackoverflow.com/questions/10906734/how-to-upload-image-into-html5-canvas
CanvasSelect.uploaded_images = [];

CanvasSelect.clearUploadedImages = function(){
	var display_canvii = $(".display_canvas");
	for (var i = 5; i < 5 + CanvasSelect.uploaded_images.length; i++){
		Drawr.canvases.splice(i, 1);
		var display_canvas = $("#canvas_" + i)[0];
		display_canvas.parentNode.removeChild(display_canvas);
		var select_box = $("#canvas_select_" + i)[0];
		select_box.parentNode.removeChild(select_box);
	}
	CanvasSelect.canvas_id = 5;
	
	CanvasSelect.select(0);
	CanvasSelect.uploaded_images = [];
}

CanvasSelect.restoreUploadedImage = function(src){
	var img = new Image();
	img.onload = function(){
		Dialog.Close();
		CanvasSelect.uploaded_images.push(img.src);
		CanvasSelect.addCanvas(img);
		BlockIt.InitWorkspace();
		BlockIt.RefreshWorkspace();
	}
	img.src = src;
}

CanvasSelect.upload = function(e){	
	var reader = new FileReader();
	reader.onload = function(event){
		var img = new Image();
		img.onload = function(){
			if (this.width < 100 || this.height < 100){
				alert("minimum image size: 100 x 100 px");
			}
			else if (this.width > 1024 || this.height > 1024){
				alert("maximum image size: 1024 x 1024 px");
			}
			else{
				Dialog.Close();
				CanvasSelect.uploaded_images.push(img.src);
				CanvasSelect.addCanvas(img);
				BlockIt.InitWorkspace();
				BlockIt.RefreshWorkspace();

				//now store uploaded image in local storage!
				var name = "uploaded_image_" + (4+CanvasSelect.uploaded_images.length);
				localStorage.setItem(name, img.src);
			}
		}
		img.src = event.target.result;
	}
	reader.readAsDataURL(e.target.files[0]);
}

CanvasSelect.addCanvas = function(img){
	var visualizer = $("#visualization")[0];
	
	var canvas = document.createElement("canvas");
	var id = CanvasSelect.canvas_id;
	canvas.id = "canvas_" + id;
	canvas.className = "display_canvas";
	canvas.style.display = "none";
	CanvasSelect.canvas_id++;
	
	canvas.width = img.width;
	canvas.height = img.height;
	visualizer.appendChild(canvas);
	
	Drawr.addCanvas($('#'+canvas.id)[0].getContext('2d'), id);
	Drawr.getCtx(id).drawImage(img, 0, 0, img.width, img.height);
	Drawr.resetCache(id);
	Drawr.canvases[id].image = img;
	
	CanvasSelect.addSelectBox(id);
	
	CanvasSelect.select(id);
}