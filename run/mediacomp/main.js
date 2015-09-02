function Main(){}
Main.DOUBLE_CLICK_TIME = 100;

Main.stepTime = 10;
Main.stepTimeoutId = null;

Main.init = function(){ 
    Main.setupBlockly();
	BlockIt.Init(["mediacomp_run"], "Main,Drawr,CanvasSelect,Synth");
	
    // Connect canvases
	//canvas_select.js
    //CanvasSelect.init(Drawr.image_paths);
	//canvas_popout.js
	//CanvasSelect.setupCanvasPopout();
	
	//////////////////////////////////////////////////////////
	//SET UP TUNELY
	//////////////////////////////////////////////////////////
	Synth.EXPLORER.Selector.init();
	
	//load the sound samples
	var default_sounds = ["piano"];
	Synth.loadFileIntoVoiceBuffer("mediacomp/tunely/samples/piano.wav", "piano", function(){
		Synth.RememberSoundsFromMemory();
	});
	
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
	$("#resetButton").click(Synth.EXPLORER.Selector.reset);
	$("#pauseButton").click(Main.Pause);

	$("#codeButton").click(function(){
		BlockIt.DisableFloatingBlocks();
		
		var generated_code = Blockly.JavaScript.workspaceToCode();
			generated_code += "tunely_runProgram();\n";
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
	
	//http://stackoverflow.com/questions/22560413/html5-web-audio-convert-audio-buffer-into-wav-file
	$("#captureButton").click(function(){
		//check for functions in utils
		
		var buffer = Synth.GetSelectedSound();
		var buf = buffer.getChannelData(0),      // buf = a Float32Array of data
		  sr = buffer.sampleRate    //sample rate of the data
		;

		var dataview = encodeWAV(buf, sr);
		var blob = new Blob([dataview], { type: 'audio/wav' });

		// do something with audioBlob, may be provide it as link to be downloaded
		var a = document.createElement("a");
		document.body.appendChild(a);
		a.style = "display: none";
		var url = window.URL.createObjectURL(blob);
		a.href = url;
		a.download = buffer.name + ".wav";
		a.click();
		window.URL.revokeObjectURL(url);
	});
	
	//LOAD UP EVERYTHING	
	Main.loadWorkspaceFromLocalStorage();

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
		blocklyDiv.style.left = rtl ? '10px' : '460px';
		blocklyDiv.style.width = (window.innerWidth - 440) + 'px';
	};
	window.addEventListener('scroll', function(){
		onresize();
        Synth.EXPLORER.Selector.onresize();
		Blockly.fireUiEvent(window, 'resize');
	});
	window.addEventListener('resize', function(){
        onresize();
        Synth.EXPLORER.Selector.onresize();
    });
	onresize();
    Synth.EXPLORER.Selector.onresize();
	
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
	
	localStorage.setItem("selected", Synth.EXPLORER.Selector.selected);
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
	Synth.EXPLORER.Selector.reset();
}
	
Main.runButton = true;
Main.update_display_interval_id;
Main.RunButton = function(){
	// Prevent double-clicks or double-taps.
	$("#runButton")[0].disabled = true;
	setTimeout(function() {$("#runButton")[0].disabled = false;}, Main.DOUBLE_CLICK_TIME);
	
	if (Main.runButton){
		Main.RunCode();
		
		Main.update_display_interval_id = setInterval(function(){
			Synth.EXPLORER.Selector.exploreSounds();
			clearInterval(Main.update_display_interval_id);
			Main.update_display_interval_id = setInterval(Synth.EXPLORER.Selector.exploreSounds, 10000);
		}, 1000);
	}else{
		Main.StopCode();
	}
	Main.runButton = !Main.runButton;
}
Main.RunCode = function(){		
	$("#runButtonText")[0].innerHTML = "Stop Program";
	$("#runButtonImg")[0].style.backgroundPosition = "-63px 0px";
	//document.getElementById('spinner').style.visibility = 'visible';

	//window.setInterval(function(){ Drawr.flushCache(); }, 10);
	window.setTimeout(function(){
		document.getElementById("spinner").style.visibility = "";
		if (!BlockIt.IterateThroughBlocks(function(){
			Main.RunButton();
		})){
			Main.RunButton();
		}
	}, 0);
}
Main.StopCode = function(){	
	$("#runButtonText")[0].innerHTML = "Run Program";
	$("#runButtonImg")[0].style.backgroundPosition = "-63px -21px";

	BlockIt.StopIteration();
	Synth.Stop();
	//Synth.EXPLORER.Selector.resetAll();
	Synth.EXPLORER.Selector.exploreSounds();
	clearInterval(Main.update_display_interval_id);
	Synth.EXPLORER.Selector.exploreSounds();

	document.getElementById('spinner').style.visibility = 'hidden';
}