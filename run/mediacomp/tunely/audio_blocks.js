'use strict';

Blockly.synth_block_colour = 60;
// Extensions to Blockly's language and JavaScript generator.

Blockly.Blocks['synth_exploreSound'] = {
	init: function(){
		this.setColour(Blockly.synth_block_colour);
		this.appendValueInput("SOUND")
			.setCheck("Sound")
			.appendField("explore");
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip('Explores a sound (by opening up a pop up window visualizing the sound and its all its samples).');
	}
};
Blockly.JavaScript['synth_exploreSound'] = function(block){
	//Generate JavaScript for playing a sounde
	var sound = Blockly.JavaScript.valueToCode(block, "SOUND", Blockly.JavaScript.ORDER_NONE) || null;
	return "Synth.EXPLORER.OpenExploreWindow(" + sound + ");\n";
};
BlockIt['synth_exploreSound'] = function(block, sound){
	Synth.EXPLORER.OpenExploreWindow(sound);
}

//DEFAULT INSTRUMENTS
Blockly.Blocks['synth_defaultInstruments'] = {
	init: function(){
		this.setColour(90);
		var SOUND_NAMES =[
			["piano", 'piano']
		];
		for (var sound in Synth.sounds) {
			if (Synth.sounds.hasOwnProperty(sound) && sound !== "piano") {
				SOUND_NAMES.push([sound, sound]);
			}
		}
		
		this.appendDummyInput()
			.appendField(new Blockly.FieldDropdown(SOUND_NAMES), 'NAME');
		this.setOutput(true, "Sound");
		this.setTooltip('Creates a new sound object by cloning a default instrument sounds.');
	}
};
Blockly.JavaScript['synth_defaultInstruments'] = function(block){
	var name = block.getFieldValue('NAME');
	return ["Synth.GetSound('"+name+"')", Blockly.JavaScript.ORDER_NONE];
};
BlockIt['synth_defaultInstruments'] = function(block){
	//with field drop down objects, still must do the default blockly fetching
	var name = block.getFieldValue('NAME');
	return Synth.GetSound(name);
}

//Clone an audio buffer and return the clone!!
Blockly.Blocks['synth_cloneAudio'] = {
	init: function(){
		this.setColour(Blockly.synth_block_colour);
		this.appendValueInput("SOUND")
			.setCheck("Sound")
			.appendField('create a copy of sound');
		this.setOutput(true, "Sound");
		this.setTooltip("Creates a copy of the sound provided (useful for manipulating the samples of the same sound in different ways.)");
	}
}
Blockly.JavaScript['synth_cloneAudio'] = function(block){
	var sound = Blockly.JavaScript.valueToCode(block, "SOUND", Blockly.JavaScript.ORDER_NONE) || null;
	return "Synth.CloneSound(" + sound + ");\n";
}

//SET THE INSTRUMENT
Blockly.Blocks['synth_setInstrument'] = {
	init: function(){
		this.setColour(Blockly.synth_block_colour);
		this.appendValueInput("SOUND")
			.setCheck("Sound")
			.appendField('set instrument');
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip('Sets the current instrument (sound) of the synth.');
	}
};
Blockly.JavaScript['synth_setInstrument'] = function(block) {
	var sound = Blockly.JavaScript.valueToCode(block, 'SOUND', Blockly.JavaScript.ORDER_NONE) || null;
	return "Synth.SetInstrument(" + sound + ");\n";
};
BlockIt['synth_setInstrument'] = function(block, sound){
	if (sound === null || sound === undefined) return null;
	Synth.SetInstrument(sound);
}

//GET THE SAMPLES OF A SOUND AS A FLOAT32ARRAY
Blockly.Blocks['synth_getSamples'] = {
	init: function(){
		this.setColour(Blockly.Blocks.lists.HUE);
		this.appendValueInput("SOUND")
			.setCheck("Sound")
			.appendField("get samples from sound");
		this.setOutput(true, "Array");
		this.setTooltip('Get the samples of a sound as a list.');
	}
};
Blockly.JavaScript['synth_getSamples'] = function(block){
	var sound = Blockly.JavaScript.valueToCode(block, "SOUND", Blockly.JavaScript.ORDER_NONE) || null;
	var samples = "Synth.GetSamples(" + sound + ")";
	return [samples, Blockly.JavaScript.ORDER_NONE];
};
BlockIt['synth_getSamples'] = function(block, sound){
	if (sound === undefined) sound = Blockly.default_sample;
	var samples = Synth.GetSamples(sound);
	return samples;
}

//GET THE VALUE OF A SAMPLE???
Blockly.Blocks['synth_getSampleValue'] = {
	init: function(){
		this.setColour(0);
		this.appendValueInput("SAMPLE")
			.setCheck("Sample")
			.appendField("get value from sample");
		this.setOutput(true, "Number");
		this.setTooltip("Get the value of a sample.");
	}
}
Blockly.JavaScript['synth_getSampleValue'] = function(block){
	var sample = Blockly.JavaScript.valueToCode(block, "SAMPLE", Blockly.JavaScript.ORDER_NONE) || null;
	var value = sample + ".getValue()";
	return [value, Blockly.JavaScript.ORDER_NONE];
}
BlockIt['synth_getSampleValue'] = function(block, sample){
	if (sample === undefined) 
		sample = { value: 0 };
	return sample.value;
}

//SET THE VALUE OF A SAMPLE???
Blockly.Blocks['synth_setSampleValue'] = {
	init: function(){
		this.setColour(0);
		this.appendValueInput("SAMPLE")
			.setCheck("Sample")
			.appendField("set value of sample");
		this.appendValueInput("VALUE")
			.setCheck("Number")
			.appendField("to");
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip("Set the value of a sample.");
	}
}
Blockly.JavaScript['synth_setSampleValue'] = function(block){
	var sample = Blockly.JavaScript.valueToCode(block, "SAMPLE", Blockly.JavaScript.ORDER_NONE) || null;
	var value = Blockly.JavaScript.valueToCode(block, "VALUE", Blockly.JavaScript.ORDER_NONE) || 0;
	return sample + ".setValue(" + value + ");\n";
}
BlockIt['synth_setSampleValue'] = function(block, sample, value){
	if (sample === undefined) return;
	if (value === undefined) value = 0;
	sample.setValue(value);
}

//PLAY A SOUND
Blockly.Blocks['synth_playSound'] = {
	init: function(){
		this.setColour(Blockly.synth_block_colour);
		this.appendValueInput("SOUND")
			.setCheck("Sound")
			.appendField("play");
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip('Plays a sound.');
	}
};
Blockly.JavaScript['synth_playSound'] = function(block){
	//Generate JavaScript for playing a sounde
	var sound = Blockly.JavaScript.valueToCode(block, "SOUND", Blockly.JavaScript.ORDER_NONE) || null;
	return "Synth.PlaySound(" + sound + ");\n";
};
BlockIt['synth_playSound'] = function(block, sound){
	if (sound === null || sound === undefined) return null;
	Synth.PlaySound(sound);
}

//BLOCKING PLAY A SOUND
Blockly.Blocks['synth_blockPlaySound'] = {
	init: function(){
		this.setColour(Blockly.synth_block_colour);
		this.appendValueInput("SOUND")
			.setCheck("Sound")
			.appendField("play");
		this.appendDummyInput().appendField('and wait until finished');
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip('Plays a sound and waits until it finishes.');
	}
};
Blockly.JavaScript['synth_blockPlaySound'] = function(block){
	//Generate JavaScript for playing a Sound
	var sound = Blockly.JavaScript.valueToCode(block, "SOUND", Blockly.JavaScript.ORDER_NONE) || null;
	return "Synth.BlockPlaySound(" + sound + ");\n";
};
BlockIt['synth_blockPlaySound'] = function(block, sound){
	if (sound === null || sound === undefined) return null;
	
	//returning here because Block play returns an object with the 'sleep' property
	//which we use in the Block Iterator to pause before executing the next block
	return Synth.BlockPlaySound(sound);
}

//PLAY A NOTE
Blockly.Blocks['synth_playNote'] = {
  // playing a note.
  init: function() {
	this.setColour(Blockly.synth_block_colour);
	this.appendValueInput('NOTE')
		.setCheck('String')
		.appendField("play");
	this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Plays a note on the current instrument.');
  }
};
Blockly.JavaScript['synth_playNote'] = function(block) {
  // Generate JavaScript for playing a note
  var note = Blockly.JavaScript.valueToCode(block, 'NOTE', Blockly.JavaScript.ORDER_NONE) || null;
  return "Synth.PlayNote(" + note + ");\n";
};
BlockIt['synth_playNote'] = function(block, note){
	if (note === undefined) note = "C4";
	Synth.PlayNote(note);
}

//PLAY A NOTE (BLOCKING)
Blockly.Blocks['synth_blockPlayNote'] = {
  // Block playing a note.
  init: function() {
	this.setColour(Blockly.synth_block_colour);
	this.appendValueInput('NOTE')
		.setCheck('String')
		.appendField("play");
	this.appendDummyInput().appendField('and wait until finished');
	this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Plays a note on the current instrument. Other commands in this sequence wait for the note to finish.');
  }
};
Blockly.JavaScript['synth_blockPlayNote'] = function(block) {
  // Generate JavaScript for playing a note
  var note = Blockly.JavaScript.valueToCode(block, 'NOTE', Blockly.JavaScript.ORDER_NONE) || null;
  return "Synth.BlockPlayNote(" + note + ");\n";
};
BlockIt['synth_blockPlayNote'] = function(block, note){
	if (note === undefined) note = "C4";
	//same as last returning BlockIt
	return Synth.BlockPlayNote(note);
}

Blockly.Blocks['javascript_consoleLog'] = {
	//Logging output to console
	init: function(){
		this.appendValueInput('X')
			.setCheck(null)
			.appendField("print");
		this.setInputsInline(true);
		this.appendDummyInput().appendField("to the console");
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip("Prints the given object or string to the developer console.");
	}
}
Blockly.JavaScript['javascript_consoleLog'] = function(block){
	//Logging output to console
	var x = Blockly.JavaScript.valueToCode(block, 'X', Blockly.JavaScript.ORDER_NONE) || '';
	return "console.log(" + x + ")"; 
}
BlockIt['javascript_consoleLog'] = function(block, x){
	console.log(x);
}