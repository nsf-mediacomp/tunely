BlockIt.IsLoop = function(type){
	return (type === "controls_repeat" || type === "controls_repeat_ext" || type === "controls_whileUntil" || type === "controls_for" || type === "controls_forEach" || type === "controls_forfor");
}

BlockIt.HandleLoopStep = function(args){
	var block = args.block || null;
	var ret_value = args.ret_value || [];
	var arguments_stack = args.arguments_stack || [];
	var parent_stack = args.parent_stack || [];
	var async = args.async;
	var control_flow = args.control_flow || "NORMAL";
	if (async === undefined) async = true;
	var next_block = args.next_block;
	var value = args.value;
	
	
	inputConns = args.inputConns;
	connectedInputConns = args.connectedInputConns;
	getConnectedInputBlock = args.getConnectedInputBlock;
	connectedTrueInputConns = args.connectedTrueInputConns;
	getConnectedTrueInputBlock = args.getConnectedTrueInputBlock;
	getInputBlock = args.getInputBlock;
	isInputConnected = args.isInputConnected;
	numTrueInputBlocksConnected = args.numTrueInputBlocksConnected;
	numConnectedInputsCalculated = args.numConnectedInputsCalculated;
	
	var run_fast = (block.getFieldValue("RUN_FAST") === "TRUE");
	var type = block.type;
	
	//console.log(type);
	
	//return args
	var return_args = {};
	
	if (run_fast){		
		//WE NEED TO USE THE APPROPRIATE VARIABLE SANDBOX
		//either use the default global blockit scope if not in a function or the variable is not one of the function's arguments
		//or if it is, then use the function call's sandbox,..
		var len = arguments_stack.length;
		var sandbox = BlockIt.sandbox;
		if (len !== 0){
			sandbox = arguments_stack[len-1];
		}
		//MOVE ALL SANDBOX VARIABLES INTO THE LOCAL SCOPE!!!
		var temp_sandbox = sandbox;
		for (var var_name in temp_sandbox) {
			if (temp_sandbox.hasOwnProperty(var_name) && var_name !== "funcs"){
				eval(var_name + " = temp_sandbox['" + var_name + "'];");
			}
		}
		if (temp_sandbox !== BlockIt.sandbox){
			temp_sandbox = BlockIt.sandbox;
			for (var var_name in temp_sandbox) {
				if (temp_sandbox.hasOwnProperty(var_name) && var_name !== "funcs"){
					eval(var_name + " = temp_sandbox['" + var_name + "'];");
				}
			}
		}
		
		//also scope the functions to allow successful calls!
		for (var funcName in BlockIt.sandbox.funcs){
			if (BlockIt.sandbox.funcs.hasOwnProperty(funcName)){
				if (Blockly.JavaScript.definitions_[funcName] === undefined){
					var temp_block = BlockIt.sandbox.funcs[funcName];
					//add it to the JavaScript function definitions
					Blockly.JavaScript[temp_block.type](temp_block);
				}
				var code = "eval(Blockly.JavaScript.definitions_['" + funcName + "']);";
				eval(code);
			}
		}
		
		//END MOVE ALL SANDBOX VARIABLES INTO THE LOCAL SCOPE
		
		code = Blockly.JavaScript[block.type](block);
		
		//scope blockly javascript definition functions
		for (var funcName in Blockly.JavaScript.definitions_){
			if (funcName === "variables") continue;
			eval(Blockly.JavaScript.definitions_[funcName]);
		}
		value = eval(code);
		

		//MOVE ALL LOCAL SCOPE VARIABLES (taken from sandbox) TO SANDBOX
		for (var var_name in sandbox){
			var temp_sandbox = sandbox;
			if (var_name !== "funcs" && (temp_sandbox.hasOwnProperty(var_name) ||
			((temp_sandbox = BlockIt.sandbox) && temp_sandbox.hasOwnProperty(var_name)))){
				eval("temp_sandbox['" + var_name + "'] = " + var_name + ";");
			}
		}
	}
	else{
		switch (type){
			case "controls_repeat":
				if (block.iterator === undefined){
					block.iterator = 0;
				}
				
				var num_times = Number(block.getFieldValue('TIMES'));

				//iterate the loop again!!! (same as control_flow === "CONTINUE")
				if (block.iterator < num_times && control_flow !== "BREAK"){
					block.iterator++;
					//set the next block equal to the first block of the loop body
					//only if there is one connected
					if (isInputConnected(0)){
						parent_stack.push({block: block, pushValue: false});
						next_block = getInputBlock(0);
					}
				}
				//the loop is complete!!!
				else{
					//next_block = block.getNextBlock(); //should already be set to this
					//IMPORTANT: must reset the iterator
					//or else nested loops will not execute properly
					block.iterator = undefined;
				}
				control_flow = "NORMAL";
				break;
			case "controls_repeat_ext":
				if (block.iterator === undefined){
					block.iterator = 0;
				}
				var num_times = 0; //default to 0 if user set no loop number
				if (isInputConnected(0))
					num_times = ret_value.pop().value;
				
				if (block.iterator < num_times && control_flow !== "BREAK"){
					block.iterator++;
					if (isInputConnected(1)){
						parent_stack.push({block: block, pushValue: false});
						next_block = getInputBlock(1);
					}
				}else{
					//IMPORTANT: must reset the iterator
					//or else nested loops will not execute properly
					block.iterator = undefined;
				}
				control_flow = "NORMAL";
				break;
			case "controls_whileUntil":
				var cond_value = false;
				if (isInputConnected(0))
					cond_value = ret_value.pop().value;
				var until = block.getFieldValue('MODE') == 'UNTIL';
				if (until) cond_value = !cond_value;
				if (cond_value && control_flow !== "BREAK" && isInputConnected(1)){
					parent_stack.push({block: block, pushValue: false});
					next_block = getInputBlock(1);
				}
				control_flow = "NORMAL";
				break;
			case "controls_for":
				var var_name = block.getFieldValue('VAR');
				var inc = 1;
				if (isInputConnected(2)) inc = ret_value.pop().value;
				var end = 0;
				if (isInputConnected(1)) end = ret_value.pop().value;
				var start = 0;
				if (isInputConnected(0)) start = ret_value.pop().value;
				
				if (block.iterator === undefined){
					//cheating and using "block.iterator" to know when to set the 
					//sandbox variable ;) 
					BlockIt.sandbox[var_name] = start;
				}else{
					//increment the sandbox variable by the requested amount
					//only at the beginning of an iteration
					//and only on not the first iteration
					BlockIt.sandbox[var_name] += inc;
				}
				//need to set the iterator to the sandbox variable
				//as the loop body may have altered the sandbox variable
				//which is acting as our iterator!!!
				block.iterator = BlockIt.sandbox[var_name];
				
				if ((((inc >= 0 && block.iterator <= end) || (inc < 0 && block.iterator >= end)) && control_flow !== "BREAK") && isInputConnected(3)){
					parent_stack.push({block: block, pushValue: false});
					next_block = getInputBlock(3);
				}else{
					//IMPORTANT: must reset the iterator
					//or else nested loops will not execute properly
					block.iterator = undefined;
				}
				
				control_flow = "NORMAL";
				break;
			case "controls_forfor":
				var var_name = block.getFieldValue('VAR');
				var var_name2 = block.getFieldValue('VAR2');
				var inc = 1;
				if (isInputConnected(2)) inc = ret_value.pop().value;
				var end = 0;
				if (isInputConnected(1)) end = ret_value.pop().value;
				var start = 0;
				if (isInputConnected(0)) start = ret_value.pop().value;
				
				if (block.iterator === undefined){
					//cheating and using "block.iterator" to know when to set the 
					//sandbox variable ;)
					BlockIt.sandbox[var_name] = start;
					BlockIt.sandbox[var_name2] = start;
				}else{
					//increment the sandbox variable by the requested amount
					//only at the beginning of an iteration
					//and only on not the first iteration
					BlockIt.sandbox[var_name2] += inc;
					if (BlockIt.sandbox[var_name2] > end || (inc < 0 && BlockIt.sandbox[var_name2] < end)){
						BlockIt.sandbox[var_name2] = start;
						BlockIt.sandbox[var_name] += inc;
					}
				}
				//need to set the iterator to the sandbox variable
				//as the loop body may have altered the sandbox variable
				//which is acting as our iterator!!!
				block.iterator = BlockIt.sandbox[var_name];
				block.iterator2 = BlockIt.sandbox[var_name2];
				
				if ((((inc >= 0 && block.iterator <= end && block.iterator2 <= end) || (inc < 0 && block.iterator >= end && block.iterator2 >= end)) && control_flow !== "BREAK") && isInputConnected(3)){
					parent_stack.push({block: block, pushValue: false});
					next_block = getInputBlock(3);
				}else{
					//IMPORTANT: must reset the iterator
					//or else nested loops will not execute properly
					block.iterator = undefined;
				}
				
				control_flow = "NORMAL";
				break;
			case "controls_forEach":
				var var_name = block.getFieldValue('VAR');
				var list = [];
				if (isInputConnected(1))
					list = ret_value.pop().value;
				
				if (block.iterator === undefined){
					block.iterator = 0;
				}
				
				//we are not finished iterating through the list!
				if (block.iterator < list.length && control_flow !== "BREAK"){
					//need to set the variable appropriately in the for each loop
					BlockIt.sandbox[var_name] = list[block.iterator];
					block.iterator++;
					parent_stack.push({block: block, pushValue: false});
					next_block = block.getChildren()[1];
				}
				//now we are!
				else{
					//IMPORTANT: must reset the iterator
					//or else nested loops will not execute properly
					block.iterator = undefined;
				}
				control_flow = "NORMAL";
				break;
		}
	}
	
	return_args.parent_stack = parent_stack;
	return_args.next_block = next_block;
	return_args.control_flow = control_flow;
	return_args.value = value;
	return return_args;
}