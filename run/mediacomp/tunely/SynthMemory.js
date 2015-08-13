Synth.getMemory = function(name){
	if (typeof(Storage) !== "undefined"){
		return localStorage.getItem(name);
	}else{
		return getCookie(name);
	}
}
Synth.setMemory = function(name, value){
	if (typeof(Storage) !== "undefined") {
		localStorage.setItem(name, value);
	}else{
		setCookie(name, value);
	}
}

Synth.UploadSound = function(e){
	var files = e.target.files;
	for (var i = 0; i < files.length; i++){
		var file = files[i];
		var name = file.name;
		var reader = new FileReader();
		reader.onload = (function(ev){
			console.log(name);
			console.log(ev.target.result);
			Synth.addToOriginalSounds(ev.target.result, name,
				function(sound){
					Synth.StoreSoundMemory(name, sound);
					BlockIt.RefreshWorkspace();
					Dialog.Alert("Sound uploaded! (Should appear in instrument drop down)");
					Synth.EXPLORER.Selector.exploreSounds();
				}
			);
		});
		reader.readAsArrayBuffer(file);
	}
};


Synth.RemoveUploadedSoundByName = function(name){
	localStorage.removeItem(name);
	var memory = JSON.parse(Synth.getMemory("soundMemory"));
	
	var index = 0;
	for (var i = 0; i < Synth.uploaded_sounds.length; i++){
		if (Synth.uploaded_sounds[i].name === name){
			index = i;
			break;
		}
	}
	Synth.uploaded_sounds.splice(index, 1);
	
	index = memory.indexOf(name);
	memory.splice(index, 1);
	Synth.setMemory("soundMemory", JSON.stringify(memory));
	BlockIt.RefreshWorkspace();
}

Synth.RemoveUploadedSound = function(index){
	var name = Synth.uploaded_sounds[index].name;
	localStorage.removeItem(name);
	var memory = JSON.parse(Synth.getMemory("soundMemory"));
	
	Synth.uploaded_sounds.splice(index, 1);
	
	index = memory.indexOf(name);
	memory.splice(index, 1);
	Synth.setMemory("soundMemory", JSON.stringify(memory));
	BlockIt.RefreshWorkspace();
}

Synth.RenameSoundMemory = function(oldName, newName){
	var memory = Synth.getMemory("soundMemory");
	//I could totally just add the next three lines into Synth.getMemory //TODO
	if (memory === undefined || memory === null)
		memory = [];
	else memory = JSON.parse(memory);
	
	for (var i = 0; i < memory.length; i++){
		if (memory[i] === oldName){
			memory[i] = newName;
			
			var old_mem = JSON.parse(localStorage.getItem(oldName));
			localStorage.removeItem(oldName);
			old_mem.name = newName;
			localStorage.setItem(newName, JSON.stringify(old_mem));
			break;
		}
	}
	Synth.setMemory("soundMemory", JSON.stringify(memory));
}

Synth.StoreSoundMemory = function(name, sound){
	var obj = {};
	obj.name = name;
	obj.numberOfChannels = sound.numberOfChannels;
	obj.length = sound.length;
	obj.sampleRate = sound.sampleRate;
	for (var i = 0; i < sound.numberOfChannels; i++){
		var channel = sound.getChannelData(0);
		channel = Array.prototype.slice.call(channel);
		obj["channel" + i] = channel;
	}
	
	Synth.uploaded_sounds.push(obj);
	
	//store the names in cookies so know what to remember
	var memory = Synth.getMemory("soundMemory");
	if (memory === undefined || memory === null)
		memory = [];
	else memory = JSON.parse(memory);
	if (memory.indexOf(name) < 0)
		memory.push(name);
	Synth.setMemory("soundMemory", JSON.stringify(memory));
	
	localStorage.setItem(name, JSON.stringify(obj));
}

Synth.RememberSoundsFromMemory = function(){
	var memory = Synth.getMemory("soundMemory");
	if (memory === undefined || memory === null)
		memory = [];
	else memory = JSON.parse(memory);
	for (var i = 0; i < memory.length; i++){
		Synth.RememberSound(memory[i]);
	}
}

Synth.RememberSound = function(name){
	var json = localStorage.getItem(name);
	var obj = JSON.parse(json);
	Synth.LoadSound(obj);
}