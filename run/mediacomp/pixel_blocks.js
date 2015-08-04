Blockly.Blocks['mediacomp_getPixelAt'] = {
	init: function(){
		this.setHelpUrl('http://outreach.cs.ua.edu/pixly/content/PixlyUserManual.pdf');
		this.setColour(230);
        this.appendValueInput('X')
            .setCheck('Number')
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(Blockly.Msg.MEDIACOMP_GETPIXELAT_X);
        this.appendValueInput('Y')
            .setCheck('Number')
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(Blockly.Msg.MEDIACOMP_GETPIXELAT_Y);
        this.appendValueInput("CANVAS")
            .setCheck('Number')
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(Blockly.Msg.MEDIACOMP_GETPIXELAT_CANVAS);
		this.setInputsInline(true);
		this.setOutput(true, "Pixel");
		this.setTooltip(Blockly.Msg.MEDIACOMP_GETPIXELAT_TOOLTIP);
	}
}
Blockly.JavaScript['mediacomp_getPixelAt'] = function(block){
	var x = Blockly.JavaScript.valueToCode(block, 'X',
		Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var y = Blockly.JavaScript.valueToCode(block, 'Y',
		Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	var canvas = Blockly.JavaScript.valueToCode(block, 'CANVAS',
		Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
    // TODO: make sure they're within the range 0 < x,y < image size
		
	var code = "Drawr.getPixel($id, $x, $y)"
		.interpolate({id: canvas, x: x, y: y});
	return [code, Blockly.JavaScript.ORDER_ATOMIC];
};
BlockIt['mediacomp_getPixelAt'] = function(block, x, y, canvas){
	x = x || 0;
	y = y || 0;
	canvas = canvas || 0;
	
	return Drawr.getPixel(canvas, x, y);
}


Blockly.Blocks['mediacomp_setPixelAt'] = {
	init: function() {
    this.setHelpUrl('http://outreach.cs.ua.edu/pixly/content/PixlyUserManual.pdf');
    this.setColour(0);
    
	this.appendDummyInput()
		.appendField("change pixel at");
    this.appendValueInput('X')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("x");
    this.appendValueInput('Y')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("y");
	this.appendValueInput('CANVAS')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("on canvas");
    this.appendValueInput('PIXEL')
        .setCheck('Pixel')
		.setCheck('Colour')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("to");
		
	this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Set the pixel at the specified location to another pixel or color');
  }
};
Blockly.JavaScript['mediacomp_setPixelAt'] = function(block) {  
  var ctxid = Blockly.JavaScript.valueToCode(block, 'CANVAS', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
  var x = Blockly.JavaScript.valueToCode(block, 'X', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
  var y = Blockly.JavaScript.valueToCode(block, 'Y', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
  var pixel = Blockly.JavaScript.valueToCode(block, 'PIXEL', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
 
  var code = "Drawr.setPixelAt($ctxid, $x, $y, $pixel);\n"
	.interpolate({ctxid: ctxid, x: x, y: y, pixel: pixel}); 
  return code;
};
BlockIt["mediacomp_setPixelAt"] = function(block, x, y, canvas, pixel){
	x = x || 0;
	y = y || 0;
	canvas = canvas || 0;
	pixel = pixel || Drawr.blankPixel(canvas, x, y);
	Drawr.setPixelAt(canvas, x, y, pixel);
}


Blockly.Blocks['mediacomp_setPixel'] = {
	init: function() {
    this.setHelpUrl('http://outreach.cs.ua.edu/pixly/content/PixlyUserManual.pdf');
    this.setColour(0);
    
	this.appendDummyInput()
		.appendField("change pixel");
    this.appendValueInput('PIXEL')
        .setCheck('Pixel')
        .setAlign(Blockly.ALIGN_RIGHT);
    this.appendValueInput('PIXEL2')
		.setCheck(['Colour', 'Pixel'])
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("to");
		
	this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Set the pixel to another pixel or color');
  }
};
Blockly.JavaScript['mediacomp_setPixel'] = function(block) {  
  var pixel = Blockly.JavaScript.valueToCode(block, 'PIXEL', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
  var pixel2 = Blockly.JavaScript.valueToCode(block, 'PIXEL2', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
 
  var code = "Drawr.setPixel2($pixel, $pixel2);\n"
	.interpolate({pixel: pixel, pixel2: pixel2}); 
  return code;
};
BlockIt["mediacomp_setPixel"] = function(block, pixel1, pixel2){
	pixel1 = pixel1 || Drawr.blankPixel(0, 0, 0);
	pixel2 = pixel2 || Drawr.blankPixel(0, 0, 0);
	Drawr.setPixel2(pixel1, pixel2);
}


Blockly.Blocks['mediacomp_getPixelColour'] = {
	init: function(){
		this.setHelpUrl('http://outreach.cs.ua.edu/pixly/content/PixlyUserManual.pdf');
		this.setColour(230);
		this.appendDummyInput()
			.appendField("color of pixel");
		this.appendValueInput("PIXEL")
			.setCheck("Pixel")
			.setAlign(Blockly.ALIGN_CENTRE);
		this.setInputsInline(true);
		this.setOutput(true, "Colour");
		this.setTooltip('Get the color of a pixel');
	}
}
Blockly.JavaScript['mediacomp_getPixelColour'] = function(block){
	var pixel = Blockly.JavaScript.valueToCode(block, 'PIXEL',
		Blockly.JavaScript.ORDER_ASSIGNMENT) || '{index: 0, r: 0, g: 0, b: 0, a: 0}';
		
	var code = "Drawr.getPixelColour($pixel);\n"
		.interpolate({pixel: pixel});
	return [code, Blockly.JavaScript.ORDER_ATOMIC];
};
BlockIt["mediacomp_getPixelColour"] = function(block, pixel){
	pixel = pixel || Drawr.blankPixel();
	return Drawr.getPixelColour(pixel);
}


Blockly.Blocks['mediacomp_getPixelRGB'] = {
	init: function(){
		var RGB = [["red", 'r'], ["green", 'g'], ["blue", 'b']];
		this.setHelpUrl('http://outreach.cs.ua.edu/pixly/content/PixlyUserManual.pdf');
		this.setColour(230);
		this.appendDummyInput()
			.appendField(new Blockly.FieldDropdown(RGB), 'RGB')
			.appendField("value of pixel");
		this.appendValueInput("PIXEL")
			.setCheck("Pixel")
			.setAlign(Blockly.ALIGN_CENTRE);
		this.setInputsInline(true);
		this.setOutput(true, "Number");
		this.setTooltip('Get the red, green, or blue color value of a pixel (values will be from 0 to 100)');
	}
}
Blockly.JavaScript['mediacomp_getPixelRGB'] = function(block){
	var rgb = block.getFieldValue('RGB').toLowerCase();
	var pixel = Blockly.JavaScript.valueToCode(block, 'PIXEL',
		Blockly.JavaScript.ORDER_ASSIGNMENT) || '{index: 0, r: 0, g: 0, b: 0, a: 0}';
		
	var code = "Drawr.getPixelRGB($pixel, '$rgb')"
		.interpolate({pixel: pixel, rgb: rgb});
	return [code, Blockly.JavaScript.ORDER_ATOMIC];
};
BlockIt["mediacomp_getPixelRGB"] = function(block, pixel){
	var rgb = block.getFieldValue("RGB").toLowerCase();
	pixel = pixel || Drawr.blankPixel();
	
	return Drawr.getPixelRGB(pixel, rgb);
}	


Blockly.Blocks['mediacomp_setPixelRGB'] = {
	init: function(){
		var RGB = [["red", 'r'], ["green", 'g'], ["blue", 'b']];
		this.setHelpUrl('http://outreach.cs.ua.edu/pixly/content/PixlyUserManual.pdf');
		this.setColour(0);
		this.appendDummyInput()
			.appendField("change")
			.appendField(new Blockly.FieldDropdown(RGB), 'RGB')
			.appendField("value of pixel");
		this.appendValueInput("PIXEL")
			.setCheck("Pixel")
			.setAlign(Blockly.ALIGN_CENTRE);
		this.appendValueInput("VALUE")
			.setCheck("Number")
			.appendField("to")
			.setAlign(Blockly.ALIGN_CENTRE);
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip('Set the red, green, or blue color value of a pixel (value must be between 0 and 100)');
	}
}
Blockly.JavaScript['mediacomp_setPixelRGB'] = function(block){
	var rgb = block.getFieldValue('RGB').toLowerCase();
	var pixel = Blockly.JavaScript.valueToCode(block, 'PIXEL',
		Blockly.JavaScript.ORDER_ASSIGNMENT) || '{index: 0, r: 0, g: 0, b: 0, a: 0}';
	var value = Blockly.JavaScript.valueToCode(block, 'VALUE',
		Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
		
	var code = "Drawr.setPixelRGB($pixel, '$rgb', $value);\n"
		.interpolate({pixel: pixel, rgb: rgb, value: value});
	return code;
};
BlockIt["mediacomp_setPixelRGB"] = function(block, pixel, value){
	var rgb = block.getFieldValue("RGB").toLowerCase();
	pixel = pixel || Drawr.blankPixel();
	value = value || 0;
	
	Drawr.setPixelRGB(pixel, rgb, value);
}


Blockly.Blocks['mediacomp_getPixelRGBIntensity'] = {
	init: function(){
		var RGB = [["red", 'r'], ["green", 'g'], ["blue", 'b']];
		this.setHelpUrl('http://outreach.cs.ua.edu/pixly/content/PixlyUserManual.pdf');
		this.setColour(230);
		this.appendDummyInput()
			.appendField(new Blockly.FieldDropdown(RGB), 'RGB')
			.appendField("intensity of pixel");
		this.appendValueInput("PIXEL")
			.setCheck("Pixel")
			.setAlign(Blockly.ALIGN_CENTRE);
		this.setInputsInline(true);
		this.setOutput(true, "Number");
		this.setTooltip('Get the red, green, or blue color intensity of a pixel (represents how much more red/green/blue the pixel is in relation to its other two components) (will be values from 0 to 100)');
	}
}
Blockly.JavaScript['mediacomp_getPixelRGBIntensity'] = function(block){
	var rgb = block.getFieldValue('RGB').toLowerCase();
	var pixel = Blockly.JavaScript.valueToCode(block, 'PIXEL',
		Blockly.JavaScript.ORDER_ASSIGNMENT) || '{index: 0, r: 0, g: 0, b: 0, a: 0}';
		
	var code = "Drawr.getPixelRGBIntensity($pixel, '$rgb')"
		.interpolate({pixel: pixel, rgb: rgb});
	return [code, Blockly.JavaScript.ORDER_ATOMIC];
};
BlockIt["mediacomp_getPixelRGBIntensity"] = function(block, pixel){
	var rgb = block.getFieldValue("RGB").toLowerCase();
	pixel = pixel || Drawr.blankPixel();
	
	return Drawr.getPixelRGBIntensity(pixel, rgb);
}

//CUSTOM HUE SATURATION VALUE BLOCK!!!
Blockly.Blocks['colour_hsv'] = {
  /**
   * Block for composing a colour from HSV components.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.COLOUR_HSV_HELPURL);
    this.setColour(20);
    this.appendValueInput('HUE')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.COLOUR_HSV_TITLE)
        .appendField(Blockly.Msg.COLOUR_HSV_HUE);
    this.appendValueInput('SATURATION')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.COLOUR_HSV_SATURATION);
    this.appendValueInput('VALUE')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.COLOUR_HSV_VALUE);
    this.setOutput(true, 'Colour');
    this.setTooltip(Blockly.Msg.COLOUR_HSV_TOOLTIP);
  }
};
Blockly.JavaScript['colour_hsv'] = function(block) {
  // Compose a colour from hsv components expressed as percentages.
  var hue = Blockly.JavaScript.valueToCode(block, 'HUE',
      Blockly.JavaScript.ORDER_COMMA) || 0;
  var saturation = Blockly.JavaScript.valueToCode(block, 'SATURATION',
      Blockly.JavaScript.ORDER_COMMA) || 0;
  var value = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_COMMA) || 0;
  var functionName = Blockly.JavaScript.provideFunction_(
      'colour_hsv',
      [ 'function ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ +
          '(h, s, v) {',
        '  h = Math.max(Math.min(Number(h), 100), 0) / 100.0;',
        '  s = Math.max(Math.min(Number(s), 100), 0) / 100.0;',
        '  v = Math.max(Math.min(Number(v), 100), 0) / 100.0;',
		'  var c = HSVtoRGB(h, s, v);',
        '  c.r = (\'0\' + (Math.round(c.r) || 0).toString(16)).slice(-2);',
        '  c.g = (\'0\' + (Math.round(c.g) || 0).toString(16)).slice(-2);',
        '  c.b = (\'0\' + (Math.round(c.b) || 0).toString(16)).slice(-2);',
        '  return \'#\' + c.r + c.g + c.b;',
        '}']);
  var code = functionName + '(' + hue + ', ' + saturation + ', ' + value + ')';
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};
BlockIt["colour_hsv"] = function(block, hue, saturation, value){
	hue = hue || 0;
	saturation = saturation || 0;
	value = value || 0;
	
	var colour_hsv = function(h, s, v){
		h = Math.max(Math.min(Number(h), 255), 0) / 255.0;
        s = Math.max(Math.min(Number(s), 255), 0) / 255.0;
        v = Math.max(Math.min(Number(v), 255), 0) / 255.0;
		var c = HSVtoRGB(h, s, v);
        c.r = ('0' + (Math.round(c.r) || 0).toString(16)).slice(-2);
        c.g = ('0' + (Math.round(c.g) || 0).toString(16)).slice(-2);
        c.b = ('0' + (Math.round(c.b) || 0).toString(16)).slice(-2);
        return '#' + c.r + c.g + c.b;
	}
	return colour_hsv(hue, saturation, value);
}