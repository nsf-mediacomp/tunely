Drawr.imagePath = "mediacomp/images/"
Drawr.image_paths = [Drawr.imagePath+"redeye.png", Drawr.imagePath+"greenscreen.png", Drawr.imagePath+"tokyo.png", Drawr.imagePath+"beach.png", Drawr.imagePath+"blank.png"];

Drawr.DOUBLE_CLICK_TIME = 100;

Drawr.stepTime = 10;
Drawr.stepTimeoutId = null;

Drawr.init = function(){ 
    Drawr.setupBlockly();
	
    // Connect canvases
	//canvas_select.js
    CanvasSelect.init(Drawr.image_paths);
	
	//canvas_popout.js
	CanvasSelect.setupCanvasPopout();
    
    // Setup buttons

	$("#runButton")[0].addEventListener("click", Drawr.RunButton);
	$("#resetButton")[0].addEventListener("click", Drawr.Reset);

	$("#codeButton")[0].addEventListener("click", function(){
		var generated_code = Blockly.JavaScript.workspaceToCode();
			generated_code = getRidOfNakedCode(generated_code);
			generated_code += "pixly_run();\n";
		var content = "<pre>" + generated_code + "</pre>";
			
		Dialog.Alert(content, "Generated JavaScript Code");
	});
	$("#importButton")[0].addEventListener('click', function(){
		Drawr.openProject();
	});
	$("#exportButton")[0].addEventListener('click', function(){
		Drawr.saveProject();
	});
	
	$("#captureButton")[0].addEventListener("click", function(){
		var canvas = Drawr.getCtx(CanvasSelect.selected).canvas;
		download(canvas, 'pixlyCanvas.png');
	});
	
	window.setTimeout(function(){
		$("#runButton")[0].className = "";
		$("#runButton")[0].className = "primary";
	}, 10000);
}

Drawr.setupBlockly = function(){
	// Set the page title with the content of the H1 title.
	document.title = document.getElementById('title').textContent;

	// Set the HTML's language and direction.
	// document.dir fails in Mozilla, use document.body.parentNode.dir instead.
	// https://bugzilla.mozilla.org/show_bug.cgi?id=151407
	var rtl = false;
	document.head.parentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
	document.head.parentElement.setAttribute('lang', "en");

	// Fixes viewport for small screens.
	var viewport = document.querySelector('meta[name="viewport"]');
	if (viewport && screen.availWidth < 725) {
	viewport.setAttribute('content',
		'width=725, initial-scale=.35, user-scalable=no');
	}

	//Setting up Blockly for resizing
	var blocklyDiv = $("#blockly")[0];
	var visualization = $("#visualization")[0];
	var onresize = function(e){
		var top = visualization.offsetTop;
		blocklyDiv.style.top = Math.max(10, top - window.pageYOffset) + 'px';
		blocklyDiv.style.left = rtl ? '10px' : '420px';
		blocklyDiv.style.width = (window.innerWidth - 440) + 'px';
	};
	window.addEventListener('scroll', function(){
		onresize();
        CanvasSelect.onresize();
		Blockly.fireUiEvent(window, 'resize');
	});
	window.addEventListener('resize', function(){
        onresize();
        CanvasSelect.onresize();
    });
	onresize();
    CanvasSelect.onresize();
	
	//Inject Blockly into the webpage
	var toolbox = document.getElementById('toolbox');
	Blockly.inject($('#blockly')[0],
		{path: 'blockly/', toolbox: $('#toolbox')[0], trashcan: true});
		
	//Add to reserver word list
	Blockly.JavaScript.addReservedWords('Drawr');
	
	Drawr.loadWorkspaceFromCookie();
	setInterval(Drawr.saveWorkspaceToCookie, 10000);
	window.addEventListener('beforeunload', function(e){
		/*if (Blockly.mainWorkspace.getAllBlocks().length > 2){
			var msg = "Leaving this page will result in the loss of your work.";
			e.returnValue =  msg; //Gecko
			return msg; //Webkit
		}
		return null;*/
		Drawr.saveWorkspaceToCookie();
	});
}

Drawr.saveWorkspaceToCookie = function(){
	var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
	xml = Blockly.Xml.domToPrettyText(xml);
	setCookie("xml", xml, 356);
	
	localStorage.setItem("selected", CanvasSelect.selected);
	for (var i = 0; i < CanvasSelect.uploaded_images.length; i++){
		var name = "uploaded_image_" + i;
		var src = CanvasSelect.uploaded_images[i];
		localStorage.setItem(name, src);
	}
}

Drawr.loadWorkspaceFromCookie = function(){
	var xml = getCookie("xml");
	if (xml === undefined){		
		var defaultXml = 
			'<xml>' +
			'	<block type="mediacomp_run" x="70" y="70"></block>' +
			'</xml>';
		Drawr.loadBlocks(defaultXml);
		return;
	}
	Blockly.mainWorkspace.clear();
	Drawr.loadBlocks(xml);
	
	var img_num = 0;
	while (true){
		var name = "uploaded_image_" + img_num;
		var src = localStorage.getItem(name);
		if (src === null || src === undefined) break;
		
		CanvasSelect.restoreUploadedImage(src);
		img_num++;
	}
	window.setTimeout(function(){
		var selected = localStorage.getItem("selected");
		if (selected !== null && selected !== undefined){
			CanvasSelect.select(selected);
		}
	}, 100);
}

Drawr.importXml = function(textarea){
	Blockly.mainWorkspace.clear();
	Drawr.loadBlocks($(textarea)[0].value);
}

Drawr.loadBlocks = function(defaultXml){
  try {
    var loadOnce = window.sessionStorage.loadOnceBlocks;
  } catch(e) {
    // Firefox sometimes throws a SecurityError when accessing sessionStorage.
    // Restarting Firefox fixes this, so it looks like a bug.
    var loadOnce = null;
  }
  if ('BlocklyStorage' in window && window.location.hash.length > 1) {
    // An href with #key trigers an AJAX call to retrieve saved blocks.
    BlocklyStorage.retrieveXml(window.location.hash.substring(1));
  } else if (loadOnce) {
    // Language switching stores the blocks during the reload.
    delete window.sessionStorage.loadOnceBlocks;
    var xml = Blockly.Xml.textToDom(loadOnce);
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
  } else if (defaultXml) {
    // Load the editor with default starting blocks.
    var xml = Blockly.Xml.textToDom(defaultXml);
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
  } else if ('BlocklyStorage' in window) {
    // Restore saved blocks in a separate thread so that subsequent
    // initialization is not affected from a failed load.
    window.setTimeout(BlocklyStorage.restoreBlocks, 0);
  }
};

window.addEventListener('load', Drawr.init);

Drawr.Reset = function(){
	CanvasSelect.reset();
}
	
Drawr.runButton = true;
Drawr.RunButton = function(){
	// Prevent double-clicks or double-taps.
	$("#runButton")[0].disabled = true;
	setTimeout(function() {$("#runButton")[0].disabled = false;}, Drawr.DOUBLE_CLICK_TIME);
	
	if (Drawr.runButton){
		$("#runButtonText")[0].innerHTML = "Stop Program";
		$("#runButtonImg")[0].style.backgroundPosition = "-63px 0px";
		Drawr.RunCode();
	}else{
		$("#runButtonText")[0].innerHTML = "Run Program";
		$("#runButtonImg")[0].style.backgroundPosition = "-63px -21px";
		Drawr.StopCode();
	}
	Drawr.runButton = !Drawr.runButton;
}
Drawr.RunCode = function(){		
	//document.getElementById('spinner').style.visibility = 'visible';

	//window.setInterval(function(){ Drawr.flushCache(); }, 10);
	window.setTimeout(function(){
		document.getElementById("spinner").style.visibility = "";
		if (!BlockIt.IterateThroughBlocks("mediacomp_run", function(){
			Drawr.flushCache();
			Drawr.RunButton();
		})){
			document.getElementById("runButton").click();
		}
	}, 0);
}
Drawr.StopCode = function(){	
	BlockIt.StopIteration();

	document.getElementById('spinner').style.visibility = 'hidden';
}