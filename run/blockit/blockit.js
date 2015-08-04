var BlockIt = function(){};

BlockIt.workspace;
BlockIt.stop_iteration = false;
BlockIt.wait_time = 0;
BlockIt.valid_block_types = [];

BlockIt.Init = function(valid_block_types, opt_reserved_words, opt_workspace){
	BlockIt.valid_block_types = valid_block_types;
	
	BlockIt.InitWorkspace(opt_workspace);	
	if (opt_reserved_words === undefined)
		opt_reserved_words = "";
	//todo need to fully populate this
	Blockly.JavaScript.addReservedWords("block,BlockIt,sandbox,var_name,temp_sandbox,funcs,funcName,temp_block,return_args,args,ret_value,ret_values,arguments_stack,parent_stack,control_flow,"+opt_reserved_words);
}
BlockIt.InitWorkspace = function(opt_workspace){	
	var workspace = opt_workspace || Blockly.mainWorkspace;
	BlockIt.workspace = workspace;
	Blockly.JavaScript.init(workspace);
	BlockIt.workspace.traceOn(true);
}
BlockIt.RefreshWorkspace = function(){
	var xml = Blockly.Xml.workspaceToDom(BlockIt.workspace);
	xml = Blockly.Xml.domToPrettyText(xml);
	
	BlockIt.workspace.clear();
	BlockIt.LoadBlocks(xml, BlockIt.workspace);
}

BlockIt.IterateThroughBlocks = function(callback, opt_workspace){
	if (callback === undefined) callback = function(){};
	BlockIt.final_callback = callback;
	
	BlockIt.InitWorkspace(opt_workspace);
	
	//BlockIt.DisableFloatingBlocks(valid_block_types);
	//BlockIt.FreezeWorkspace();
	BlockIt.ResetIteration();
	BlockIt.stop_iteration = false;
	
	var mains = BlockIt.ReturnValidBlocksAndCacheFunctions();
	
	if (mains.length <= 0){
		alert("No main program!");
		//Main.ResetProgram();
		return false;
	}
	
	for (var i = 0; i < mains.length; i++){
		window.setTimeout(function(main){
				BlockIt.Step({block: main.getChildren()[0]});
			}.bind(this, mains[i]), 0);
	}
	return true;
}

BlockIt.ResetLoopIterators = function(){
	var blocks = BlockIt.workspace.getAllBlocks();
	for (var i = 0; i < blocks.length; i++){
		blocks[i].iterator = undefined;
		blocks[i].if_iterator = undefined;
		blocks[i].procedure_executed = undefined;
	}
}

BlockIt.ResetIteration = function(){
	window.clearTimeout(BlockIt.lastIterationTimeoutId);
	BlockIt.lastIterationTimeoutId = null;
	BlockIt.sandbox = {};
	BlockIt.sandbox.funcs = {};
	
	BlockIt.ResetLoopIterators();
}
BlockIt.StopIteration = function(){
	BlockIt.final_callback = {};
	BlockIt.EnableFloatingBlocks();
	BlockIt.ResetIteration();
	BlockIt.RefreshWorkspace();
	//BlockIt.HardUnfreezeWorkspace();
	BlockIt.stop_iteration = true;
}

BlockIt.natural_wait_time = 0;
BlockIt.Step = function(args){
try{
	var block = args.block || null;
	var ret_value = args.ret_value || [];
	var arguments_stack = args.arguments_stack || [];
	var parent_stack = args.parent_stack || [];
	var async = args.async;
	var control_flow = args.control_flow || "NORMAL";
	if (async === undefined) async = true;
	
	if (BlockIt.stop_iteration || block === null){
		BlockIt.final_callback();
		BlockIt.StopIteration();
		return;
	}
	
	//console.log(block);
	
	//only will be true for loops with the "run max speed" checkbox checked
	var run_fast = (block.getFieldValue("RUN_FAST") === "TRUE");
	
	//block is the currently executing block
	//ret value is an array of values that have been calculated
	//	(for use in blocks with inputs that need be calculated from other blocks)
	
	//this function will loop through the ret_value array and see 
	//if the number of inputs a block needs has been calculated yet
	//for use in multi-input blocks to see whether to execute or to queue the next input block
	//to be calculated
	function howManyCalculated(num_inputs){
		var how_many = 0;
		for (var i = 0; i < num_inputs; i++){
			if (ret_value.length - 1 - i < 0) break;
			if (ret_value[ret_value.length - 1 - i].id === block.id){
				how_many++;
			}
		}
		return how_many;
	}

	
	//if we want to introduce a built in delay between block execution
	var natural_wait_time = BlockIt.natural_wait_time;
	var type = block.type;
	//DEBUG
	//console.log(type + " " + block.id + " ");
	
	//highlight the block in Blockly
	BlockIt.workspace.traceOn(true);
	BlockIt.workspace.highlightBlock(block.id);
	
	//queue up the  next block using Blockly's getNextBlock function
	//the next block may be manually changed by control flow or queueing for block input
	var next_block = block.getNextBlock();
	//see the "controls_flow_statements" switch case for explanation
	var reset_control_flow = false;
	var value = undefined;
	var illegal = false;	//used for dealing with illegal blocks

	//get the input connections of the block! (ignore fields but include nonconnected inputs)
	var inputConns = block.inputList
		.filter(function(x){ return x.connection !== null })
		.map(function(x){ 
			var y = x.connection;
			y.name = x.name;
			return y; 
		});
	var connectedInputConns = inputConns.filter(function(x){ 
		return x.targetConnection !== null 
	});
	function getConnectedInputBlock(index){
		var x = connectedInputConns[index].targetConnection.sourceBlock_;
		x.name = connectedInputConns[index].name;
		return x;
	}
	var connectedTrueInputConns = connectedInputConns.filter(function(x){
		return x.type === Blockly.INPUT_VALUE;
	});
	function getConnectedTrueInputBlock(index){
		var x = connectedTrueInputConns[index].targetConnection.sourceBlock_;
		x.name = connectedTrueInputConns[index].name;
		return x;
	}
	//indiscriminate between connected and non connected inputs
	//although will result in an error if the latter
	function getInputBlock(index){
		var x = inputConns[index].targetConnection.sourceBlock_;
		x.name = inputConns[index].name;
		return x;
	}
	function isInputConnected(index){
		return inputConns[index].targetConnection !== null;
	}
	var numTrueInputBlocksConnected = connectedTrueInputConns.length;
	var numConnectedInputsCalculated = howManyCalculated(numTrueInputBlocksConnected);
	
	args.inputConns = inputConns;
	args.connectedInputConns = connectedInputConns;
	args.getConnectedInputBlock = getConnectedInputBlock;
	args.connectedTrueInputConns = connectedTrueInputConns;
	args.getConnectedTrueInputBlock = getConnectedTrueInputBlock;
	args.getInputBlock = getInputBlock;
	args.isInputConnected = isInputConnected;
	args.numTrueInputBlocksConnected = numTrueInputBlocksConnected;
	args.numConnectedInputsCalculated = numConnectedInputsCalculated;
	
	//continue immediately on to the next block if this block is disabled
	if (!block.disabled && (control_flow === "NORMAL" || control_flow === "RETURN")){			
		//don't need to calculate inputs if it's a procedure;
		//unless the procedure has already executed and we're at the calculating
		//return value step
		var is_procedure_def = control_flow === "RETURN" || ((block.type === "procedures_defnoreturn" || block.type === "procedures_defreturn") && inputConns.length >= 2 && (block.procedure_executed === undefined));
	
		//has user connected input block and has BlockIt already retrieved value?
		if (!run_fast && !is_procedure_def && numConnectedInputsCalculated < numTrueInputBlocksConnected){
			//if the conditional input for the if statement hasn't already been calculated
			//we queue it up by first pushing this if block onto the parent stack
			//and then setting the input as the next block to be executed
			var input_block = getConnectedTrueInputBlock(numConnectedInputsCalculated);
			parent_stack.push({block: block, pushValue: true});
			next_block = input_block;
			
		}
		//Handle loops in their own function (because they can be
		//executed with eval if "RUN FAST" is true on them)
		else if (BlockIt.IsLoop(type)){
			args.next_block = next_block;
			args.value = value;
			
			var return_args = BlockIt.HandleLoopStep(args);
			
			value = return_args.value;
			next_block = return_args.next_block;
			parent_stack = return_args.parent_stack;
			control_flow = return_args.control_flow;
		}
		//ok we've calculated all the inputs or there are none!
		else{ switch (type){
			//need to manually control branches through the iteration
			case "controls_if":
				//use this to keep track of where we are in the if/elseif/.../else 
				if (block.if_iterator === undefined){
					block.if_iterator = {
						index: 0,
						conditionals: []
					};
					
					//add the first if statement
					var cond_value = false;
					if (isInputConnected(0)){
						cond_value = ret_value.pop().value;
					}
					var body_block = null;
					if (isInputConnected(1)){
						body_block = getInputBlock(1);
					}
					
					var ix = 0;
					var conditional = {};
					conditional.is_else = false;
					conditional.value = cond_value;
					conditional.body = body_block;
					block.if_iterator.conditionals[0] = conditional;
					//add the else ifs
					ix += 2;
					for (var i = 0; i < block.elseifCount_; i++){
						cond_value = false;
						if (isInputConnected(ix)){
							cond_value = ret_value.pop().value;
						}
						body_block = null;
						if (isInputConnected(ix+1)){
							body_block = getInputBlock(ix+1);
						}
						
						conditional = {};
						conditional.is_else = false;
						conditional.value = cond_value;
						conditional.body = body_block;
						block.if_iterator.conditionals[ix/2] = conditional;
						ix+= 2;
					}
					
					//now add the 'else' if it exists
					if (block.elseCount_ === 1){
						body_block = null;
						if (isInputConnected(ix)){
							body_block = getInputBlock(ix);
						}
						
						conditional = {};
						conditional.is_else = true;
						conditional.value = true; //set to true because else has no cond
						conditional.body = body_block;
						block.if_iterator.conditionals[ix/2] = conditional;
					}
				}
				
				//now we've calculated all the attached inputs
				//only if the conditional statement is true do we execute the if body
				var length = block.if_iterator.conditionals.length;
				while (true){
					var index = block.if_iterator.index;
					block.if_iterator.index++;
					
					if (index >= block.if_iterator.conditionals.length){
						//we're done with this if branching!!
						break;
					}
					
					//need to get these values seperately because the 
					//cond values were fetched from the return value stack which
					//is in reverse order while the body blocks
					//will be in correct order (need to ignore else which will always be 
					//at the end and will always be true
					cond_value = true;
					//this is the not case of the else!?
					var offset = 1;
					if (block.elseCount_ === 1)
						offset = 2;
					if (!block.if_iterator.conditionals[index].is_else)
						cond_value = block.if_iterator.conditionals[length - index - offset].value;
					body_block = block.if_iterator.conditionals[index].body;
					
					if (cond_value){
						if (body_block !== null){
							//by pushing the next block into the parent stack,
							//it ensures that when the if body reaches the end,
							//we will continue executing below the if statement
							if (next_block !== null){
								parent_stack.push({block: next_block, pushValue: false});
							}
							//assign next block to the if body so that it will execute
							next_block = body_block;
						}
						//we're done with this if branching!
						break;
					}
				}
				//IMPORTANT: must reset the iterator
				//or else if statements within loops or functions will not execute properly
				block.if_iterator = undefined;
				break;
			case "procedures_callnoreturn":
			case "procedures_callreturn":
				var pushValue = true;
				if (block.type === "procedures_callnoreturn")
					pushValue = false;
				var funcName = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
				
				//now fetch the top block of the procedure def
				//functions were cached before block iterator began
				//(in ReturnValidBlocksAndCacheFunctions function)
				var funcBlock = BlockIt.sandbox.funcs[funcName];
				
				var args = {};
				//get the argument values from the ret_value stack				
				var arg_values = [];
				for (var i = 0; i < numTrueInputBlocksConnected; i++){
					arg_values.push(ret_value.pop().value);
				}
				arg_values.reverse();
				//now push these argument values into the appropriate argument names of the func
				var index = 0;
				for (var i = 0; i < block.arguments_.length; i++){
					//we need to skip arguments that were left blank by the user!
					//i + 1 because 0th inputList of procedure block is always name 
					//of the procedure...
					if (!isInputConnected(i))
						continue;
					var argName = block.arguments_[i];
					//use index because our input_children and ret_values only look at blocks that were actually put in by user, so they may be less than the number of expected arguments for the block, so the index will be different at some point from the argument name index.
					args[argName] = arg_values[index];
					index++;
				}
				
				//we need this args to deal with argument scope issues
				arguments_stack.push(args);
				//push the next block following the procedure call as the parent
				if (next_block !== null){
					parent_stack.push({block: next_block, pushValue: pushValue});
				}
				next_block = funcBlock;
				control_flow = "NORMAL";
				break;
			case "procedures_defnoreturn":
			case "procedures_defreturn":
				//this is a variable on the block (initially undefined)
				//that we will use to see if the block has already executed
				//i.e., can we calculate return value for a procedure yet?
				var procedure_executed = false;
				//snatch the args from the calling block
				var args = {};
				if (block.procedure_executed === undefined){
					block.procedure_executed = true;
				}else{
					procedure_executed = true;
				}
				
				//if this is a procedure_defreturn and there are no statements...
				//or the def return procedure has already executed
				if (type === "procedures_defreturn" && (inputConns.length < 2 || procedure_executed === true)){
					//no need to push the procedure as a parent anymore, simply calculate and return the return value!!
					var return_index = 1;
					if (inputConns.length < 2) return_index = 0;
					
					value = null;
					if (isInputConnected(return_index) || control_flow === "RETURN"){
						value = ret_value.pop().value;
					}
					//reset so future calls to the procedure won't automatically return
					arguments_stack.pop();
					block.procedure_executed = undefined;
				}else if (procedure_executed){
					arguments_stack.pop();
					block.procedure_executed = undefined;
				}else{
					//now set up the first block in the procedure body to run!
					next_block = null;
					if (isInputConnected(0)){
						parent_stack.push({block: block, pushValue: false});
						next_block = getConnectedInputBlock(0);
					}
				}
				control_flow = "NORMAL";
				break;
			case "procedures_ifreturn": //TODO
				//if this is a return block inside of a procedure that returns a value, then it has 2 inputs (condition and return value)
				//if not, it has 1 input (condition)
				var should_return_value = (inputConns.length == 2);
				
				//determine if the control flow statement is illegal
				illegal = true;
				var parent_index = 0;
				for (var i = 0; i < parent_stack.length; i++){
					if (parent_stack[i].block.procedure_executed !== undefined){
						//we're in a function somehow so it's okay :)!
						illegal = false;
						parent_index = i;
					}
				}
				
				var return_value = null;
				if (should_return_value && isInputConnected(1))
						return_value = ret_value.pop().value;
			
				var cond_value = false;
				if (isInputConnected(0))
					cond_value = ret_value.pop().value;
				//only if the conditional statement is true do we execute the if body
				if (cond_value && !illegal){
					//assign next block to null so we stop execution of the current branch
					next_block = null;
					
					value = return_value;
					//assign this to true so the value returned here will be used
					parent_stack[parent_index].pushValue = true;
					control_flow = "RETURN";
				}
				break;
			
			case "controls_flow_statements":
				//set the control flow of BlockIt!!!
				control_flow = block.getFieldValue('FLOW');
				//also force the "next_block" to be null
				//so that we will return to the head of the loop that we are in
				//to either continue or break out of it
				next_block = null;
				
				//determine if the control flow statement is illegal
				illegal = true;
				for (var i = 0; i < parent_stack.length; i++){
					if (parent_stack[i].block.iterator !== undefined){
						//we're in a loop somehow so it's okay :)!
						illegal = false;
					}
				}
				break;
			default:
				var temp_args = {
					arguments_stack: arguments_stack,
					inputConns: inputConns,
					ret_value: ret_value,
					block: block,
					type: type,
					isInputConnected: isInputConnected,
				}
				value = BlockIt.StepDefaultBlock(temp_args);
				break;
		}}
	}
	
	if (control_flow !== "NORMAL"){
		next_block = null;
		//can reset control flow after nullifying next block
		//if continue because it doesn't want to exit any parent prematurely
		if (control_flow === "CONTINUE")
			reset_control_flow = true;
	}
	if (reset_control_flow){
		control_flow = "NORMAL";
	}
	
	if (illegal)
		BlockIt.HandleIllegalControlFlow(control_flow);
	
	//end of execution! (at least for this part)
	while (next_block === null){
		if (parent_stack.length > 0 && parent_stack[parent_stack.length-1].searchParents === undefined){
			parent_stack[parent_stack.length-1].searchParents = true;
		}
		
		//if we're actually at the end of execution, simply return the value! we're done altogether!
		if (parent_stack.length === 0 || !parent_stack[parent_stack.length-1].searchParents)
			break;
		//otherwise, we're just done with one part of the execution
		//so return back to the parent block that we were executing before we needed to step in
		var parent = parent_stack.pop();
		next_block = parent.block;
		
		//push the return value to the value stack (and properly associate it with the parent)
		if (next_block !== null && parent.pushValue){
			ret_value.push({value: value, id: next_block.id});
		}
	}
	
	//Onto the Next Step!
	//the "sleep" property is something I'm letting blocks return to pause execution of the blocks
	var step_args = {
		block: next_block,
		control_flow: control_flow,
		ret_value: ret_value,
		parent_stack: parent_stack,
		arguments_stack: arguments_stack,
		async: async
	};
	if (async){
		if (value !== undefined && value !== null && value.sleep){
			BlockIt.lastIterationTimeoutId = window.setTimeout(
				BlockIt.Step.bind(this, step_args),
				value.sleep + natural_wait_time
			);
		}else{
			BlockIt.lastIterationTimeoutId = window.setTimeout(
				BlockIt.Step.bind(this, step_args),
				natural_wait_time
			);
		}
	}else{
		BlockIt.Step(step_args);
	}
}catch(e){
	alert(e);
	BlockIt.final_callback();
	BlockIt.StopIteration();
}
}

BlockIt.StepDefaultBlock = function(args){
	var arguments_stack = args.arguments_stack;
	var ret_value = args.ret_value;
	var block = args.block;
	var type = args.type || block.type;
	var isInputConnected = args.isInputConnected;
	var inputConns = args.inputConns;
	
	//WE NEED TO USE THE APPROPRIATE VARIABLE SANDBOX
	//either use the default global blockit scope if not in a function or the variable is not one of the function's arguments
	//or if it is, then use the function call's sandbox,..
	var len = arguments_stack.length;
	var sandbox = BlockIt.sandbox;
	if (len !== 0){
		sandbox = arguments_stack[len-1];
	}
	//all inputs (if any exist) have been calculated!! let's make an array to apply as arguments
	//to this block's function
	var args = [];
	for (var i = 0; i < inputConns.length; i++){
		if (inputConns[i].type !== Blockly.INPUT_VALUE)
			continue;
		//if the user did connect the input
		if (isInputConnected(i))
			args.push(ret_value.pop().value);
		//if they left it empty
		//using undefined here is fine since each block function defined in both blockly and blockit handles the case where any of its inputs are undefined
		else
			args.push(undefined);
	}
	args.push(block);
	args.reverse();
	args.push(sandbox);
	value = BlockIt[type].apply(this, args);
	return value;
}

BlockIt.HandleIllegalControlFlow = function(control_flow){
	if (control_flow === "BREAK")
		//break; //throw an illegal break, to punish bad programmers!!
		//IT TURNS OUT I'M A BAD PROGRAMMER!!! javascript doesn't even let you define things with illegal break statements :(
		//let's just throw an alert anyway
		alert("Uncaught SyntaxError: Illegal break statement");
	if (control_flow === "CONTINUE")
		//continue; //throw an illegal continue, to punish bad programmers!!!
		//same as above
		alert("Uncaught SyntaxError: Illegal continue statement");
	if (control_flow === "RETURN")
		alert("Uncaught SyntaxError: Illegal return statement");
}