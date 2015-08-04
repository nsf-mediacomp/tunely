/**
 * @fileoverview Block definitions, javascript code generation for mediacomp visual blocks
 * @author jatrower@crimson.ua.edu (Jake Trower)
 * @previousauthor https://plus.google.com/u/0/107906348722042196808/ (Kathy Hill)
 */

'use strict';

goog.provide('Blockly.JavaScript.variables');
goog.provide('Blockly.JavaScript.colour');
goog.require('Blockly.JavaScript');

Blockly.Blocks['mediacomp_canvas'] = {
  init: function() {	    
	var canvas = [['0', '0'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4']];
	try{
		for (var i = 5; i < Drawr.canvases.length; i++){
			canvas.push([''+i, ''+i]);
		}
	}catch(e){}
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("./mediacomp/images/redeye.png", 48, 48, "*"), "IMAGE");
	this.appendDummyInput()
		.appendField("canvas")
		.appendField(new Blockly.FieldDropdown(canvas, function(val){
			this.getField_("IMAGE").setValue(this.getCanvasImage(val));
		}.bind(this)), 'CANVAS');
    this.setOutput(true, "Number");
    this.setTooltip('Returns the id of the canvas specified (for use in mediacomp blocks prompting for canvas)');
    this.setHelpUrl('http://www.example.com/');
	
	setTimeout(function(){
		try{
			this.getField_("IMAGE").setValue(this.getCanvasImage());
		}catch(e){}
	}.bind(this), 100);
  },
  getCanvasImage: function(val){
	  try{
		if (val === undefined)
			val = Number(this.getFieldValue('CANVAS'));
		return Drawr.getCtx(val).canvas.toDataURL();
	  }catch(e){
		  return "./mediacomp/images/redeye.png";
	  }
  }
};
Blockly.JavaScript['mediacomp_canvas'] = function(block){
	var canvas_id = Number(block.getFieldValue('CANVAS'));
	return [canvas_id, Blockly.JavaScript.ORDER_ATOMIC];
}
BlockIt['mediacomp_canvas'] = function(block){
	var canvas_id = Number(block.getFieldValue('CANVAS'));
	return canvas_id;
}

Blockly.Blocks['mediacomp_selected_canvas'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("selected canvas");
    this.setOutput(true, "Number");
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
}
Blockly.JavaScript['mediacomp_selected_canvas'] = function(block){
	return [CanvasSelect.selected, Blockly.JavaScript.ORDER_ATOMIC];
}
BlockIt['mediacomp_selected_canvas'] = function(block){
	return CanvasSelect.selected;
}

Blockly.Blocks['mediacomp_run'] = {
  /**
   * Block to set the code that will run with the run button is pressed
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl("http://outreach.cs.ua.edu/pixly/content/PixlyUserManual.pdf");
    this.setColour(15);
	this.hex_colour = "#dd4b39";
    this.appendDummyInput()
		.appendField("when")
		.appendField(new Blockly.FieldImage("arrow_2.png", 15, 15, "*"))
        .appendField("Run Program clicked");
    this.appendStatementInput('DO')
        .appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
    this.setPreviousStatement(false);
    this.setNextStatement(false);
    this.setTooltip(Blockly.Msg.MEDIACOMP_RUN_TOOLTIP);
  },
  updateColour: function (){if(!this.disabled){var a=this.hex_colour,b=goog.color.hexToRgb(a),c=goog.color.lighten(b,.3),b=goog.color.darken(b,.4);this.svgPathLight_.setAttribute("stroke",goog.color.rgbArrayToHex(c));this.svgPathDark_.setAttribute("fill",goog.color.rgbArrayToHex(b));this.svgPath_.setAttribute("fill",a);c=this.getIcons();for(a=0;a<c.length;a++)c[a].updateColour();for(a=0;c=this.inputList[a];a++)for(var b=0,d;d=c.fieldRow[b];b++)d.setText(null)}}
};
Blockly.JavaScript['mediacomp_run'] = function(block) {
  // ONly run the code that is inside this block when run button is pressed (like a main)
  var do_branch = Blockly.JavaScript.statementToCode(block, 'DO');
  var funcName = Blockly.JavaScript.variableDB_.getDistinctName(
      'sphero_run', Blockly.Variables.NAME_TYPE);
  var code = 'function pixly_runProgram(){\n' + 
      do_branch +
	  '}\n';
  return code;
};


Blockly.Blocks["mediacomp_canvasDimension"] = {
	init: function(){
		var dimension = [[Blockly.Msg.MEDIACOMP_CANVASDIMENSION_WIDTH, 'width'], [Blockly.Msg.MEDIACOMP_CANVASDIMENSION_HEIGHT, 'height']];
		this.setColour(230);
		this.appendDummyInput()
			.appendField(new Blockly.FieldDropdown(dimension), 'DIMENSION');
		this.appendValueInput("CANVAS")
			.setCheck('Number')
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.MEDIACOMP_CANVASDIMENSION_TITLE);
		this.setOutput(true, "Number");
		this.setInputsInline(true);
		this.setTooltip(Blockly.Msg.MEDIACOMP_CANVASDIMENSION_TOOLTIP);
	}
}
Blockly.JavaScript['mediacomp_canvasDimension'] = function(block){
	var dimension = block.getFieldValue('DIMENSION').toLowerCase();
	var ctxid = Blockly.JavaScript.valueToCode(block, 'CANVAS', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	
	var code = "Drawr.getDimension(" + ctxid + ", '" + dimension + "')";
	
	return [code, Blockly.JavaScript.ORDER_ATOMIC];
}
BlockIt['mediacomp_canvasDimension'] = function(block, ctxid){
	ctxid = ctxid || 0;
	var dimension = block.getFieldValue("DIMENSION").toLowerCase();
	return Drawr.getDimension(ctxid, dimension);
}


Blockly.Blocks['mediacomp_updateCanvas'] = {
	init: function(){
		this.setHelpUrl('http://outreach.cs.ua.edu/pixly/content/PixlyUserManual.pdf');
		this.setColour(230);
        this.appendValueInput("CANVAS")
            .setCheck('Number')
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(Blockly.Msg.MEDIACOMP_UPDATECANVAS_TITLE);
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip(Blockly.Msg.MEDIACOMP_UPDATECANVAS_TOOLTIP);
	}
}
Blockly.JavaScript['mediacomp_updateCanvas'] = function(block) {  
  var ctxid = Blockly.JavaScript.valueToCode(block, 'CANVAS', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
 
  var code = "Drawr.flushCache($ctxid);\n"
	.interpolate({ctxid: ctxid}); 
  return code;
};
BlockIt['mediacomp_updateCanvas'] = function(block, ctxid){
	ctxid = ctxid || 0;
	Drawr.flushCache(ctxid);
}

Blockly.Blocks['mediacomp_restartCanvas'] = {
	init: function(){
		this.setHelpUrl('http://outreach.cs.ua.edu/pixly/content/PixlyUserManual.pdf');
		this.setColour(230);
        this.appendValueInput("CANVAS")
            .setCheck('Number')
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(Blockly.Msg.MEDIACOMP_RESTARTCANVAS_TITLE);
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setTooltip(Blockly.Msg.MEDIACOMP_RESTARTCANVAS_TOOLTIP);
	}
}
Blockly.JavaScript['mediacomp_restartCanvas'] = function(block) {  
  var ctxid = Blockly.JavaScript.valueToCode(block, 'CANVAS', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
 
  var code = "Drawr.restartCanvas($ctxid);\n"
	.interpolate({ctxid: ctxid}); 
  return code;
};
BlockIt['mediacomp_restartCanvas'] = function(block, ctxid){
	ctxid = ctxid || 0;
	Drawr.restartCanvas(ctxid);
}


Blockly.Blocks['mediacomp_getPixels'] = {
	init: function(){
		this.setHelpUrl('http://outreach.cs.ua.edu/pixly/content/PixlyUserManual.pdf');
		this.setColour(230);
		this.appendValueInput("CANVAS")
			.setCheck('Number')
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.MEDIACOMP_GETPIXELS_TITLE);
		this.setInputsInline(true);
		this.setOutput(true, "Array");
		this.setTooltip(Blockly.Msg.MEDIACOMP_GETPIXELS_TOOLTIP);
	}
}
Blockly.JavaScript['mediacomp_getPixels'] = function(block){
	var canvas = Blockly.JavaScript.valueToCode(block, 'CANVAS', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
	//TODO:: how can we check to see that the canvas index is valid?
	
	var code = "Drawr.getPixels($id)"
		.interpolate({id: canvas});
	return [code, Blockly.JavaScript.ORDER_ATOMIC];
}
BlockIt['mediacomp_getPixels'] = function(block, canvas){
	canvas = canvas || 0;
	return Drawr.getPixels(canvas);
}


Blockly.Blocks['controls_forfor'] = {
  /**
   * Block for a single nested 'for' loop.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.CONTROLS_FOR_HELPURL);
    this.setColour(120);
    this.appendDummyInput()
        .appendField(Blockly.Msg.CONTROLS_FOR_INPUT_WITH)
        .appendField(new Blockly.FieldVariable(null), 'VAR');
	this.appendDummyInput()
        .appendField('and')
        .appendField(new Blockly.FieldVariable(null), 'VAR2');
    this.interpolateMsg(Blockly.Msg.CONTROLS_FOR_INPUT_FROM_TO_BY,
                        ['FROM', 'Number', Blockly.ALIGN_RIGHT],
                        ['TO', 'Number', Blockly.ALIGN_RIGHT],
                        ['BY', 'Number', Blockly.ALIGN_RIGHT],
                        Blockly.ALIGN_RIGHT);
    this.appendStatementInput('DO')
        .appendField(Blockly.Msg.CONTROLS_FOR_INPUT_DO);
	this.appendDummyInput()
        .appendField(new Blockly.FieldCheckbox("FALSE"), "RUN_FAST")
        .appendField(run_fast_msg);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return Blockly.Msg.CONTROLS_FOR_TOOLTIP.replace('%1',
          thisBlock.getFieldValue('VAR'));
    });
  },
  /**
   * Return all variables referenced by this block.
   * @return {!Array.<string>} List of variable names.
   * @this Blockly.Block
   */
  getVars: function() {
    return [this.getFieldValue('VAR'), this.getFieldValue('VAR2')];
  },
  /**
   * Notification that a variable is renaming.
   * If the name matches one of this block's variables, rename it.
   * @param {string} oldName Previous name of variable.
   * @param {string} newName Renamed variable.
   * @this Blockly.Block
   */
  renameVar: function(oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
      this.setFieldValue(newName, 'VAR');
    }
	if (Blockly.Names.equals(oldName, this.getFieldValue('VAR2'))) {
      this.setFieldValue(newName, 'VAR2');
    }
  },
  /**
   * Add menu option to create getter block for loop variable.
   * @param {!Array} options List of menu options to add to.
   * @this Blockly.Block
   */
  customContextMenu: function(options) {
    var option = {enabled: true};
    var name = this.getFieldValue('VAR');
    option.text = Blockly.Msg.VARIABLES_SET_CREATE_GET.replace('%1', name);
    var xmlField = goog.dom.createDom('field', null, name);
    xmlField.setAttribute('name', 'VAR');
    var xmlBlock = goog.dom.createDom('block', null, xmlField);
    xmlBlock.setAttribute('type', 'variables_get');
    option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
    options.push(option);
	
	option = {enabled: true};
    name = this.getFieldValue('VA2');
    option.text = Blockly.Msg.VARIABLES_SET_CREATE_GET.replace('%1', name);
    xmlField = goog.dom.createDom('field', null, name);
    xmlField.setAttribute('name', 'VAR2');
    xmlBlock = goog.dom.createDom('block', null, xmlField);
    xmlBlock.setAttribute('type', 'variables_get');
    option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
    options.push(option);
  }
};
Blockly.JavaScript['controls_forfor'] = function(block) {
  // For loop.
  var variable0 = Blockly.JavaScript.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var variable2 = Blockly.JavaScript.variableDB_.getName(
      block.getFieldValue('VAR2'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.JavaScript.valueToCode(block, 'FROM',
      Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
  var argument1 = Blockly.JavaScript.valueToCode(block, 'TO',
      Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
  var increment = Blockly.JavaScript.valueToCode(block, 'BY',
      Blockly.JavaScript.ORDER_ASSIGNMENT) || '1';
  var branch = Blockly.JavaScript.statementToCode(block, 'DO');
  if (Blockly.JavaScript.INFINITE_LOOP_TRAP) {
    branch = Blockly.JavaScript.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + block.id + '\'') + branch;
  }
  var code;
  if (Blockly.isNumber(argument0) && Blockly.isNumber(argument1) &&
      Blockly.isNumber(increment)) {
    // All arguments are simple numbers.
    var up = parseFloat(argument0) <= parseFloat(argument1);
    code = 'for (' + variable0 + ' = ' + argument0 + '; ' +
        variable0 + (up ? ' <= ' : ' >= ') + argument1 + '; ' +
        variable0;
    var step = Math.abs(parseFloat(increment));
    if (step == 1) {
      code += up ? '++' : '--';
    } else {
      code += (up ? ' += ' : ' -= ') + step;
    }
    code += ') {\n';
	code += "for (" + variable2 + " = " + argument0 + "; " +
		variable2 + (up ? ' <= ' : ' >= ') + argument1 + '; ' +
		variable2;
	var step = Math.abs(parseFloat(increment));
    if (step == 1) {
      code += up ? '++' : '--';
    } else {
      code += (up ? ' += ' : ' -= ') + step;
    }
    code += ') {\n' + branch;
	code += '}\n}\n';
  } else {
    code = '';
    // Cache non-trivial values to variables to prevent repeated look-ups.
    var startVar = argument0;
    if (!argument0.match(/^\w+$/) && !Blockly.isNumber(argument0)) {
      var startVar = Blockly.JavaScript.variableDB_.getDistinctName(
          variable0 + '_start', Blockly.Variables.NAME_TYPE);
      code += 'var ' + startVar + ' = ' + argument0 + ';\n';
    }
    var endVar = argument1;
    if (!argument1.match(/^\w+$/) && !Blockly.isNumber(argument1)) {
      var endVar = Blockly.JavaScript.variableDB_.getDistinctName(
          variable0 + '_end', Blockly.Variables.NAME_TYPE);
      code += 'var ' + endVar + ' = ' + argument1 + ';\n';
    }
    // Determine loop direction at start, in case one of the bounds
    // changes during loop execution.
    var incVar = Blockly.JavaScript.variableDB_.getDistinctName(
        variable0 + '_inc', Blockly.Variables.NAME_TYPE);
    code += 'var ' + incVar + ' = ';
    if (Blockly.isNumber(increment)) {
      code += Math.abs(increment) + ';\n';
    } else {
      code += 'Math.abs(' + increment + ');\n';
    }
    code += 'if (' + startVar + ' > ' + endVar + ') {\n';
    code += Blockly.JavaScript.INDENT + incVar + ' = -' + incVar +';\n';
    code += '}\n';
    code += 'for (' + variable0 + ' = ' + startVar + ';\n' +
        '     '  + incVar + ' >= 0 ? ' +
        variable0 + ' <= ' + endVar + ' : ' +
        variable0 + ' >= ' + endVar + ';\n' +
        '     ' + variable0 + ' += ' + incVar + ') {\n';
	code += 'for (' + variable2 + ' = ' + startVar + ';\n' +
        '     '  + incVar + ' >= 0 ? ' +
        variable2 + ' <= ' + endVar + ' : ' +
        variable2 + ' >= ' + endVar + ';\n' +
        '     ' + variable2 + ' += ' + incVar + ') {\n' +
        branch + '}\n';
	code += +'}\n';
  }
  return code;
};