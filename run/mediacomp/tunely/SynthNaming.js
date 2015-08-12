Synth.isDefaultSoundName = function(name){
	var default_sound_names = Object.keys(Synth.defaultSounds);
	for (var i = 0; i < default_sound_names.length; i++){
		if (default_sound_names[i] === name)
			return true;
	}
	return false;
}

/**
* Return a new variable name that is not yet being used. This will try to
* generate single letter variable names in the range 'i' to 'z' to start with.
* If no unique name is located it will try 'i' to 'z', 'a' to 'h',
* then 'i2' to 'z2' etc.  Skip 'l'.
* @return {string} New variable name.
*/
Synth.generateUniqueName = function(workspace) {
  var soundList = Object.keys(Synth.originalSounds);
  var newName = '';
  if (soundList.length) {
    var nameSuffix = 1;
    var letters = 'ijkmnopqrstuvwxyzabcdefgh';  // No 'l'.
    var letterIndex = 0;
    var potName = letters.charAt(letterIndex);
    while (!newName) {
      var inUse = false;
      for (var i = 0; i < soundList.length; i++) {
        if (soundList[i].toLowerCase() == potName) { //420
          // This potential name is already used.
          inUse = true;
          break;
        }
      }
      if (inUse) {
        // Try the next potential name.
        letterIndex++;
        if (letterIndex == letters.length) {
          // Reached the end of the character sequence so back to 'i'.
          // a new suffix.
          letterIndex = 0;
          nameSuffix++;
        }
        potName = letters.charAt(letterIndex);
        if (nameSuffix > 1) {
          potName += nameSuffix;
        }
      } else {
        // We can use the current potential name.
        newName = potName;
      }
    }
  } else {
    newName = 'i';
  }
  return newName;
};

/**
 * Find all instances of the specified variable and rename them.
 * @param {string} oldName Variable to rename.
 * @param {string} newName New variable name.
 * @param {!Blockly.Workspace} workspace Workspace rename variables in.
 */
Synth.renameSound = function(oldName, newName, workspace) {	
	//don't try to rename memory if we are loading from memory (and therefore passed undefined workspace)
	if (workspace !== undefined){
		if (Synth.isDefaultSoundName(oldName)){
			var default_sound_names = Object.keys(Synth.defaultSounds);
			for (var i = 0; i < default_sound_names.length; i++){
				if (default_sound_names[i] === oldName){
					var sound = Synth.defaultSounds[oldName];
					delete Synth.defaultSounds[oldName];
					Synth.defaultSounds[newName] = sound;
					Synth.RenameDefaultSoundMemory(oldName, newName);
				}
			}
		}else{
			Synth.RenameSoundMemory(oldName, newName);
		}
	}
	if (Synth.sounds[oldName] !== undefined){
		var sound = Synth.sounds[oldName];
		delete Synth.sounds[oldName];
		Synth.sounds[newName] = sound;
		
		sound = Synth.originalSounds[oldName];
		delete Synth.originalSounds[oldName];
		Synth.originalSounds[newName] = sound;
		
		//if we passed undefined workspace that means that we also need to change default name sounds!!
		if (workspace === undefined){
			sound = Synth.defaultSounds[oldName];
			delete Synth.defaultSounds[oldName];
			Synth.defaultSounds[newName] = sound;
		}
		
		//change it in explorer select
		var explorers = Synth.EXPLORER.Selector.explorers;
		for (var i = 0; i < explorers.length; i++){
		  if (explorers[i].name === oldName){
		    explorers[i].name = newName;
		    explorers[i].explorer.sound.name = newName;
		    explorers[i].explorer.UpdateName();
			
			$("#canvas_select_box_"+explorers[i].id+"_title")[0].innerHTML = newName;
		    break;
		  }
		}
	}
	
	if (workspace !== undefined){
		var blocks = workspace.getAllBlocks();
		// Iterate through every block.
		for (var x = 0; x < blocks.length; x++) {
			var func = blocks[x].renameSound;
			if (func) {
				func.call(blocks[x], oldName, newName);
			}
		}
	}
};

Synth.newSoundName = function(newName, duration, workspace){
	var sampleRate = 44100;
	var length = Math.round(sampleRate * duration);
	
	var buffer = Synth.context.createBuffer(1, length, sampleRate);
	Synth.originalSounds[newName] = buffer;
	Synth.sounds[newName] = Synth.CloneSound(buffer);
	Synth.sounds[newName].name = newName;
	
	//OPEN UP THE EXPLORER WINDOW (should add to canvas select as well)
	Synth.EXPLORER.CreateSoundExploration(Synth.sounds[newName]);
}