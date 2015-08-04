function Main(){}
Main.display_canvas;
Main.display_ctx;
Main.appstart_time = new Date().getTime();
Main.run_program = true;
  
window.onload = function(){
	Blockly.inject(document.getElementById('blocklyDiv'),
		{toolbox: document.getElementById('toolbox')});
	
	//Level.InitLevels();
	Synth.EXPLORER.initContainer(document.getElementById("explore_mainContainer"));
	
	var resizeBlocklyDiv = function(e){
		var div = document.getElementById("blocklyDiv");
		var width = (window.innerWidth - 228);
		if (width < 436) width = 436;
		div.style.width = width + "px";
		
		var height = (window.innerHeight - 96);
		if (height < 436) height = 436;
		div.style.height = height + "px";
	}
	window.onmousemove = resizeBlocklyDiv;
	window.onresize = function(){
		resizeBlocklyDiv();
		Dialog.OnWindowResize();
	}
	window.onresize();
	
	document.getElementById("runProgram").onclick = function(e){
		if (Main.run_program){
			document.getElementById("run_program_text").innerHTML = "Reset Program";
			document.getElementById("run_program_image").className = "stop  icon21";
			Main.run_program = false;
			Main.RunProgram();
		}
		else{
			document.getElementById("run_program_text").innerHTML = "Run Program";
			document.getElementById("run_program_image").className = "run icon21";
			Main.run_program = true;
			Main.ResetProgram();
		}
	};
	
	var uploadSound = document.getElementById("uploadSound");
	document.getElementById("uploadSoundButton").onclick = function(e){
		uploadSound.click(e);
	}
	uploadSound.onchange = function(e) {
		var files = e.target.files;
		for (var i = 0; i < files.length; i++){
			var file = files[i];
			var name = file.name;
			var reader = new FileReader();
			reader.onload = (function(ev){
				Synth.addToOriginalSounds(ev.target.result, name,
					function(sound){
						Synth.StoreSoundMemory(name, sound);
						var xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(Blockly.mainWorkspace));
						Main.LoadBlocksFromXml(xml);
						alert("Sound uploaded! (Should appear in instrument drop down)");
					}
				);
			});
			reader.readAsArrayBuffer(file);
		}
	};
	
	document.getElementById("openProject").onclick = Main.OpenProject;
	document.getElementById("saveProject").onclick = Main.SaveProject;
	
	//load the sound samples
	var default_sounds = ["piano"];
	Synth.default_sound_names = default_sounds;
	Synth.loadFileIntoVoiceBuffer("samples/piano.wav", "piano", function(){
		/*Level.LoadLevelFromUrl(function(){
			BlockIt.Init(Blockly.mainWorkspace);
			Blockly.JavaScript.addReservedWords("Synth,Main,Dialog,Level,Level1,Level2,Level3,Level4,Level5,Level6,Level7,Level8,Level9,Level10");
			
			Synth.RememberSoundsFromMemory();
		});*/
		Synth.RememberSoundsFromMemory();
	});
	Synth.Reset();
}

Main.RunProgram = function(e){
	Blockly.mainWorkspace.traceOn(true);
	Synth.Reset();
	
	var jscode = Blockly.JavaScript.workspaceToCode();
	jscode += "\nmain();";
	console.log(jscode);
	
	if (!BlockIt.IterateThroughBlocks("mediacomp_run", Level.CheckSolution))
		document.getElementById("runProgram").click();
};

Main.ResetProgram = function(e){
	BlockIt.StopIteration();
	Synth.Reset();
}

Main.Alert = function(content, title){
	Dialog.Close();
	Dialog.Alert(content, title);
}
Main.Confirm = function(content, confirm_callback, title){
	Dialog.Close();
	Dialog.Confirm(content, confirm_callback, title);
}

Main.LoadBlocksFromXml = function(xml){
	Blockly.mainWorkspace.clear();
	BlockIt.LoadBlocks(xml);
}

Main.RefreshBlocks = function(){
	var xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(Blockly.mainWorkspace));
	Main.LoadBlocksFromXml(xml);
}

Main.example_projects = {};

Main.OpenProject = function(){
	var message = $(document.createElement("div"));
	message.append(document.createTextNode(Blockly.Msg.SELECT_XML_FILE));
	message.css("margin-top", "-8px");
	var fileinput = $(document.createElement("input"));

	fileinput.attr('type', "file");
	fileinput.attr('accept', "text/plain, text/xml");
	fileinput.on('change', function(e){
		console.log(fileinput);
		var file = fileinput[0].files[0];
		var reader = new FileReader();
		reader.onload = function(e){
			textarea.html(reader.result);
			$("#block_xml").html(reader.result);
		}
		reader.readAsText(file);
	});
	fileinput.css("margin-bottom", "10px");
	message.append(fileinput);
		message.append(document.createElement("br"));
	message.append(document.createTextNode(Blockly.Msg.CHOOSE_EXAMPLE));
	var example_select = $(document.createElement("select"));
	var options_array = [
		["", ""],
		[Blockly.Msg.EXAMPLE_INCREASE_VOLUME, "increase_volume_forLoop"],
		[Blockly.Msg.EXAMPLE_DECREASE_VOLUME, "decrease_volume_whileLoop"],
		[Blockly.Msg.EXAMPLE_NORMALIZE_SOUND, "normalize_sound"],
		[Blockly.Msg.EXAMPLE_DOUBLE_PITCH, "double_pitch"],
	];
	for (var i = 0; i < options_array.length; i++){
		var option = $(document.createElement("option"));
		option.attr("value", options_array[i][1]);
		option.html(options_array[i][0]);
		example_select.append(option);
	}
	example_select.on('change', function(e){
		var value = $(example_select).val();
		if (value in Main.example_projects){
			$(textarea).html(Main.example_projects[value]);
			$("#block_xml").html(Main.example_projects[value]);
		}else{
			$.get("../examples/"+value+".xml", function(data){
				data = Blockly.Xml.domToText(data);
				Main.example_projects[value] = data;
				$(textarea).html(data);
				$("#block_xml").html(data);
			});
		}
	});
	message.append(example_select);
	message.append(document.createElement('br'));
	
	var textarea = $(document.createElement('textarea'));
	textarea.attr('id', 'dialog_block_xml');
	textarea.css("width", "98%").css("height", "140px").css("margin-top", "5px");
	
	message.append(textarea);
	
	Main.Confirm(message[0], function(){
		var xml = $("#block_xml").val();
		Blockly.mainWorkspace.clear();
		Main.LoadBlocksFromXml(xml);
	}, Blockly.Msg.OPEN_PROJECT);
	$("#dialog").height(320);
}

Main.file_name = "download.xml";
Main.SaveProject = function(){
	var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
	xml = Blockly.Xml.domToPrettyText(xml);
	
	var message = $(document.createElement("div"));
	message.append(document.createTextNode(Blockly.Msg.FILENAME));
	var filename = $(document.createElement("input"));
	filename.attr("type", "text");
	filename.attr("id", "filename_filename");
	Main.file_name = Blockly.Msg.PROJECT_XML;
	filename.val(Blockly.Msg.PROJECT_XML);
	filename[0].oninput = function(e){
		Main.file_name = filename.val();
	}
	message.append(filename);
		message.append(document.createElement("br"));
	var textarea = $(document.createElement('textarea'));
	textarea.attr('id', 'dialog_block_xml');
	textarea.css("width", "98%").css("height", "140px").css("margin-top", "5px");
	textarea.html(xml);
	$("#block_xml").html(xml);
	message.append(textarea);
	
	Main.Confirm(message[0], function(){
		createDownloadLink("#export", $("#block_xml").val(), Main.file_name);
		$("#export")[0].click();
	}, Blockly.Msg.SAVE_PROJECT_DOWNLOAD_BLOCKS);
}

Main.ShareProject = function(){
	const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    var contentType = "text/html";
    var metadata = {'mimeType': contentType,};

    var multipartRequestBody =
        delimiter +  'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter + 'Content-Type: ' + contentType + '\r\n' + '\r\n' +
        text +
        close_delim;

    if (!callback) { callback = function(file) { console.log("Update Complete ",file) }; }

    gapi.client.request({
        'path': '/upload/drive/v2/files/'+folderId+"?fileId="+fileId+"&uploadType=multipart",
        'method': 'PUT',
        'params': {'fileId': fileId, 'uploadType': 'multipart'},
        'headers': {'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'},
        'body': multipartRequestBody,
        callback:callback,
    });
}