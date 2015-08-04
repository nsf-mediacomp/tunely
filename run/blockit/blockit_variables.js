//Block Iterator extensions to Blockly's default blocks for execution w/o string evaluation
BlockIt['variables_get'] = function(block, sandbox){
	var var_name = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
	
	//if passed function scope doesn't have the variable, just use global scope
	if (sandbox === undefined || sandbox[var_name] === undefined)
		sandbox = BlockIt.sandbox;
	
	return sandbox[var_name];
}

BlockIt['variables_set'] = function(block, x, sandbox){
	var var_name = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
	
	//if passed function scope doesn't have the variable, just use global scope
	if (sandbox === undefined || sandbox[var_name] === undefined)
		sandbox = BlockIt.sandbox;
	
	if (x === undefined) x = 0;
	
	sandbox[var_name] = x;
}