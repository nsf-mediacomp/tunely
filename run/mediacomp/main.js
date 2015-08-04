Drawr.imagePath = "mediacomp/images/"
Drawr.image_paths = [Drawr.imagePath+"redeye.png", Drawr.imagePath+"greenscreen.png", Drawr.imagePath+"tokyo.png", Drawr.imagePath+"beach.png", Drawr.imagePath+"blank.png"];

function Main(){}
Main.DOUBLE_CLICK_TIME = 100;

Main.stepTime = 10;
Main.stepTimeoutId = null;

Main.init = function(){ 
    Main.setupBlockly();
	BlockIt.Init(["mediacomp_run"], "Main,Drawr,CanvasSelect,Synth");
	
    // Connect canvases
	//canvas_select.js
    CanvasSelect.init(Drawr.image_paths);
	//canvas_popout.js
	CanvasSelect.setupCanvasPopout();
	
	//////////////////////////////////////////////////////////
	//SET UP TUNELY
	Synth.EXPLORER.initContainer(document.getElementById("explore_mainContainer"));
	
	//load the sound samples
	var default_sounds = ["piano"];
	Synth.default_sound_names = default_sounds;
	Synth.loadFileIntoVoiceBuffer("mediacomp/tunely/samples/piano.wav", "piano");
	Synth.Reset();
	
	var uploadSound = document.getElementById("uploadSound");
	document.getElementById("uploadSoundButton").onclick = function(e){
		uploadSound.click(e);
	}
	uploadSound.onchange = Synth.UploadSound;
	
	$("#deleteSoundButton")[0].addEventListener("click", function(){
		if (Synth.uploaded_sounds.length > 0){
			Dialog.Alert("", "Remove Uploaded Sound");
			
			var dropdown = document.createElement("select");
			dropdown.id = "uploaded_sound_option";
			for (var i = 0; i < Synth.uploaded_sounds.length; i++){
				var name = Synth.uploaded_sounds[i].name;
				var option = document.createElement("option");
				option.innerHTML = name;
				option.value = i;
				dropdown.appendChild(option);
			}
			
			var playButton = document.createElement("button");
			playButton.innerHTML = "play";
			playButton.onclick = function(){
				var index = $(dropdown)[0].options[$(dropdown)[0].selectedIndex].value;
				var name = Synth.uploaded_sounds[index].name;
				Synth.PlaySound(Synth.GetSound(name));
			}
			
			var removeButton = document.createElement("button");
			removeButton.innerHTML = "remove";
			removeButton.onclick = function(){
				var index = $(dropdown)[0].options[$(dropdown)[0].selectedIndex].value;
				Synth.RemoveUploadedSound(index);
				$("#deleteSoundButton")[0].click();
			}
			
			Dialog.AddElement(dropdown);
			Dialog.AddElement(playButton);
			Dialog.AddElement(removeButton);
		}else{
			Dialog.Alert("No uploaded sounds found.<br><br>Click <b>Upload Sound</b> button to choose one from your computer.", "Remove Uploaded Sound");
		}
	});
	

    
	//////////////////////////////////////////////////////////
    // Setup dom buttons
	$("#runButton").click(Main.RunButton);
	$("#resetButton").click(Main.Reset);

	$("#codeButton").click(function(){
		BlockIt.DisableFloatingBlocks();
		
		var generated_code = Blockly.JavaScript.workspaceToCode();
			generated_code += "pixly_runProgram();\n";
		var content = "<pre>" + generated_code + "</pre>";
		
		BlockIt.EnableFloatingBlocks();
			
		Dialog.Alert(content, "Generated JavaScript Code");
	});
	$("#importButton").click(function(){
		Main.openProject();
	});
	$("#exportButton").click(function(){
		Main.saveProject();
	});
	
	$("#captureButton").click(function(){
		var canvas = Drawr.getCtx(CanvasSelect.selected).canvas;
		$("#downloadImageLink")[0].href = canvas.toDataURL();
		$("#downloadImageLink")[0].download = "pixly_canvas_"+CanvasSelect.selected+".png"
		$("#downloadImageLink")[0].click();
	});
	
	$("#uploadcanvas")[0].addEventListener("change", CanvasSelect.upload, false);
	$("#uploadImageButton")[0].addEventListener("click", 
		function(){$("#uploadcanvas")[0].click(); }, 
		false
	);
	
	//LOAD UP EVERYTHING	
	Main.loadWorkspaceFromLocalStorage();
	Drawr.RememberImagesFromMemory();
	Synth.RememberSoundsFromMemory();
	
	setInterval(Main.saveWorkspaceToLocalStorage, 10000);
	window.addEventListener('beforeunload', function(e){
		Main.saveWorkspaceToLocalStorage();
	});
}
window.addEventListener('load', Main.init);

Main.setupBlockly = function(){
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
}

Main.saveWorkspaceToLocalStorage = function(){
	console.log("workspace saved.");
	
	var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
	xml = Blockly.Xml.domToPrettyText(xml);
	localStorage.setItem("xml", xml);
	
	localStorage.setItem("selected", CanvasSelect.selected);
}

Main.loadWorkspaceFromLocalStorage = function(){
	var xml = localStorage.getItem("xml");
	if (xml === undefined || xml === null){		
		var defaultXml = 
			'<xml>' +
			'	<block type="mediacomp_run" x="70" y="70"></block>' +
			'</xml>';
		Main.loadBlocks(defaultXml);
		return;
	}
	Blockly.mainWorkspace.clear();
	Main.loadBlocks(xml);
}

Main.importXml = function(textarea){
	Blockly.mainWorkspace.clear();
	Main.loadBlocks($(textarea)[0].value);
}

Main.loadBlocks = function(defaultXml){
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


Main.Reset = function(){
	CanvasSelect.reset();
}
	
Main.runButton = true;
Main.RunButton = function(){
	// Prevent double-clicks or double-taps.
	$("#runButton")[0].disabled = true;
	setTimeout(function() {$("#runButton")[0].disabled = false;}, Main.DOUBLE_CLICK_TIME);
	
	if (Main.runButton){
		$("#runButtonText")[0].innerHTML = "Stop Program";
		$("#runButtonImg")[0].style.backgroundPosition = "-63px 0px";
		Main.RunCode();
	}else{
		$("#runButtonText")[0].innerHTML = "Run Program";
		$("#runButtonImg")[0].style.backgroundPosition = "-63px -21px";
		Main.StopCode();
	}
	Main.runButton = !Main.runButton;
}
Main.RunCode = function(){		
	//document.getElementById('spinner').style.visibility = 'visible';

	//window.setInterval(function(){ Drawr.flushCache(); }, 10);
	window.setTimeout(function(){
		document.getElementById("spinner").style.visibility = "";
		if (!BlockIt.IterateThroughBlocks(function(){
			Drawr.flushCache();
			Synth.Reset();
			Main.RunButton();
		})){
			document.getElementById("runButton").click();
		}
	}, 0);
}
Main.StopCode = function(){	
	BlockIt.StopIteration();
	Drawr.flushCache();
	Synth.Reset();

	document.getElementById('spinner').style.visibility = 'hidden';
}