

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

//GET A SINGLE SAMPLE
Blockly.Blocks['synth_getSampleAtIndex'] = {
  init: function() {
    this.appendValueInput("INDEX")
        .setCheck("Sound")
        .appendField("get sample of sound");
    this.appendValueInput("SOUND")
        .setCheck("Number")
        .appendField("at index");
    this.setInputsInline(true);
    this.setOutput(true, "Sample");
    this.setColour(Blockly.Blocks.lists.HUE);
    this.setTooltip('get a single sample at the specific index from a sound');
    this.setHelpUrl('http://www.example.com/');
  }
};
Blockly.JavaScript['synth_getSampleAtIndex'] = function(block){
	var sound = Blockly.JavaScript.valueToCode(block, "SOUND", Blockly.JavaScript.ORDER_NONE) || null;
	var index = Blockly.JavaScript.valueToCode(block, "INDEX", Blockly.JavaScript.ORDER_NONE) || null;
	var sample = "Synth.GetSamples(" + sound + ")[" + index + "]";
	return [samples, Blockly.JavaScript.ORDER_NONE];
}
BlockIt['synth_getSampleAtIndex'] = function(block, sound, index){
	if (sound === undefined) sound = Blockly.default_sample;
	var samples = Synth.GetSamples(sound);
	var sample = samples[index];
	return sample;
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