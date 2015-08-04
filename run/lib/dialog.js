function Dialog(){
}

Dialog.removeEventHandler = function(elem,eventType,handler) {
 if (elem.removeEventListener) 
    elem.removeEventListener (eventType,handler,false);
 if (elem.detachEvent)
    elem.detachEvent ('on'+eventType,handler); 
}
Dialog.addEventHandler = function(elem,eventType,handler) {
 if (elem.addEventListener)
     elem.addEventListener (eventType,handler,false);
 else if (elem.attachEvent)
     elem.attachEvent ('on'+eventType,handler);
}

Dialog.Close = function(){
	try{
		var button = document.getElementById("closeDialogButton");
		button.onclick();
	}catch(error){}
}
Dialog._close = function(){
	try{
		var dialog = document.getElementById("dialog");
		document.body.removeChild(dialog);
	}catch(error){}
}

Dialog.AddElement = function(element){
	var dialogBody = document.getElementById("dialogBody");
	dialogBody.appendChild(element);
}

Dialog.AddButton = function(callback, text){
	var buttonContainer = document.getElementById("dialogButtonContainer");
	
	var button = document.createElement("div");
	button.className = "dialogButton dialogConfirm";
	button.innerHTML = text;
	
	button.onclick = function(e){
		document.getElementById("closeDialogButton").onclick();
		if (typeof(callback) === "function")
			callback();
	}
	
	buttonContainer.appendChild(button);
}


Dialog.Alert = function(content, title, close_callback, include_button){
	if (include_button === undefined)
		include_button = true;
	Dialog.Close();
	
	if (title === undefined) title = "";
	
	var dialog = document.createElement("div");
	dialog.id = "dialog";
	
	var dialogTitle = document.createElement("div");
	dialogTitle.id = "dialogTitle";
	var titleText = document.createElement("span");
	titleText.id = "titleText";
	titleText.innerHTML = title;
	var closeDialogButton = document.createElement("div");
	closeDialogButton.id = "closeDialogButton";
	closeDialogButton.title = "Close the dialog";
	closeDialogButton.innerHTML = " X ";
	dialogTitle.appendChild(titleText);
	dialogTitle.appendChild(closeDialogButton);
	dialog.appendChild(dialogTitle);
	
	var dialogBody = document.createElement("div");
	dialogBody.id = "dialogBody";
	dialogBody.innerHTML = content;
	dialog.appendChild(dialogBody);

	var buttonContainer;
	var dialogButton;
	if (include_button){	
		buttonContainer = document.createElement("div");
		buttonContainer.id = "dialogButtonContainer";
	
		dialogButton = document.createElement("div");
		dialogButton.className = "dialogButton dialogConfirm";
		dialogButton.innerHTML = "OK";
		buttonContainer.appendChild(dialogButton);
			
		dialog.appendChild(buttonContainer);
	}
	
	//set up event handlers
	dialogTitle.onmousedown = function(e){
		document.getElementsByTagName("html")[0].style.cursor = "default";
		document.getElementsByTagName("body")[0].style.cursor = "default";
	
		dialog.offY= e.clientY-parseInt(dialog.offsetTop);
		dialog.offX= e.clientX-parseInt(dialog.offsetLeft);
		Dialog.addEventHandler(window, "mousemove", Dialog.move);
	};
	dialogTitle.onmouseup = function(e){
		document.getElementsByTagName("html")[0].style.cursor = "";
		document.getElementsByTagName("body")[0].style.cursor = "";
		Dialog.removeEventHandler(window, "mousemove", Dialog.move);
	};
	var keyupHandler = function(e){
		if (e.keyCode === 13 || e.keyCode === 27){
			closeDialogButton.onclick();
		}
	}
	closeDialogButton.onclick = function(e){
		Dialog._close();
		Dialog.removeEventHandler(window, 'keyup', keyupHandler);
		if (typeof(close_callback) === "function")
			close_callback();
	}
	if (include_button){
		dialogButton.onclick = function(e){
			closeDialogButton.onclick(e);
		}
		
		Dialog.addEventHandler(window, 'keyup', keyupHandler);
	}else{
		dialogBody.style.marginBottom = "16px";
	}
	
	document.body.appendChild(dialog);
}

Dialog.Confirm = function(content, confirm_callback, title, confirm_text, close_callback){
	Dialog.Close();
	
	if (title === undefined) title = "";
	if (confirm_text === undefined) confirm_text = "OK";
	
	var dialog = document.createElement("div");
	dialog.id = "dialog";
	
	var dialogTitle = document.createElement("div");
	dialogTitle.id = "dialogTitle";
	var titleText = document.createElement("span");
	titleText.id = "titleText";
	titleText.innerHTML = title;
	var closeDialogButton = document.createElement("div");
	closeDialogButton.id = "closeDialogButton";
	closeDialogButton.title = "Close the dialog";
	closeDialogButton.innerHTML = " X ";
	dialogTitle.appendChild(titleText);
	dialogTitle.appendChild(closeDialogButton);
	dialog.appendChild(dialogTitle);
	
	var dialogBody = document.createElement("div");
	dialogBody.id = "dialogBody";
	dialogBody.innerHTML = content;
	dialog.appendChild(dialogBody);

	var buttonContainer = document.createElement("div");
	buttonContainer.id = "dialogButtonContainer";
	
	var dialogButton = document.createElement("div");
	dialogButton.className = "dialogButton";
	dialogButton.innerHTML = "Cancel";
	buttonContainer.appendChild(dialogButton);
	
	var dialogConfirm = document.createElement("div");
	dialogConfirm.className = "dialogButton dialogConfirm";
	dialogConfirm.innerHTML = confirm_text;
	buttonContainer.appendChild(dialogConfirm);
	
	dialog.appendChild(buttonContainer);
	
	//set up event handlers
	dialogTitle.onmousedown = function(e){
		document.getElementsByTagName("html")[0].style.cursor = "default";
		document.getElementsByTagName("body")[0].style.cursor = "default";
	
		dialog.offY= e.clientY-parseInt(dialog.offsetTop);
		dialog.offX= e.clientX-parseInt(dialog.offsetLeft);
		Dialog.addEventHandler(window, "mousemove", Dialog.move);
		
	};
	dialogTitle.onmouseup = function(e){
		document.getElementsByTagName("html")[0].style.cursor = "";
		document.getElementsByTagName("body")[0].style.cursor = "";
		Dialog.removeEventHandler(window, "mousemove", Dialog.move);
	};
	var keyupHandler = function(e){
		if (e.keyCode === 13){
			dialogConfirm.onclick();
		}
		if (e.keyCode === 27){
			closeDialogButton.onclick();
		}
	}
	closeDialogButton.onclick = function(e){
		Dialog._close();
		Dialog.removeEventHandler(window, 'keyup', keyupHandler);
		if (typeof(close_callback) === "function")
			close_callback();
	}
	dialogButton.onclick = function(e){
		closeDialogButton.onclick();
	}
	dialogConfirm.onclick = function(e){
		closeDialogButton.onclick();
		if (typeof(confirm_callback) === "function")
			confirm_callback();
	}
	Dialog.addEventHandler(window, 'keyup', keyupHandler);
	
	document.body.appendChild(dialog);
}


Dialog.move = function(e){
	var dialog = document.getElementById("dialog");
	dialog.style.position = "absolute";
	dialog.style.top = (e.clientY - dialog.offY) + "px";
	dialog.style.left = (e.clientX - dialog.offX) + 'px';
}