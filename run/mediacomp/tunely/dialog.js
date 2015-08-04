function Dialog(){
}

Dialog.Close = function(){
	try{
		var dialog = document.getElementById("dialog");
		document.body.removeChild(dialog);
	}catch(error){}
}

Dialog.OnWindowResize = function(){
	var dialog = document.getElementById("dialog");
	try{
		dialog.style.left = ((window.innerWidth - dialog.offsetWidth) / 2) + "px";
		dialog.style.top = ((window.innerHeight - dialog.offsetHeight) / 2) + "px";
	}catch(error){}
}

Dialog.Alert = function(content, title){
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
	try{
		if (content instanceof Node)
			dialogBody.appendChild(content);
		else
			dialogBody.innerHTML = content;
	}catch(e){
		if (typeof content === "object" && content.nodeType === 1 && typeof content.style === "object" && typeof content.ownerDocument === "object")
			dialogBody.appendChild(content);
		else
			dialogBody.innerHTML = content;
	}
	dialog.appendChild(dialogBody);
	
	var dialogButton = document.createElement("div");
	dialogButton.id = "dialogConfirm";
	dialogButton.innerHTML = "OK";
	dialog.appendChild(dialogButton);
	
	//set up event handlers
	dialogTitle.onmousedown = function(e){
		document.getElementsByTagName("html")[0].style.cursor = "default";
		document.getElementsByTagName("body")[0].style.cursor = "default";
	
		dialog.offY= e.clientY-parseInt(dialog.offsetTop);
		dialog.offX= e.clientX-parseInt(dialog.offsetLeft);
		window.addEventListener('mousemove', Dialog.move, true);
	};
	dialogTitle.onmouseup = function(e){
		document.getElementsByTagName("html")[0].style.cursor = "";
		document.getElementsByTagName("body")[0].style.cursor = "";
		window.removeEventListener('mousemove', Dialog.move, true);
	};
	closeDialogButton.onclick = function(e){
		Dialog.Close();
	}
	dialogButton.onclick = function(e){
		Dialog.Close();
	}
	
	document.body.appendChild(dialog);
	
	Dialog.OnWindowResize();
}

Dialog.Confirm = function(content, confirm_callback, title, confirm_text){
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
	try{
		if (content instanceof Node)
			dialogBody.appendChild(content);
		else
			dialogBody.innerHTML = content;
	}catch(e){
		if (typeof content === "object" && content.nodeType === 1 && typeof content.style === "object" && typeof content.ownerDocument === "object")
			dialogBody.appendChild(content);
		else
			dialogBody.innerHTML = content;
	}
	dialog.appendChild(dialogBody);
	
	var dialogButton = document.createElement("div");
	dialogButton.id = "dialogButton";
	dialogButton.innerHTML = "Cancel";
	dialog.appendChild(dialogButton);
	
	var dialogConfirm = document.createElement("div");
	dialogConfirm.id = "dialogConfirm";
	dialogConfirm.innerHTML = confirm_text;
	dialog.appendChild(dialogConfirm);
	
	//set up event handlers
	dialogTitle.onmousedown = function(e){
		document.getElementsByTagName("html")[0].style.cursor = "default";
		document.getElementsByTagName("body")[0].style.cursor = "default";
	
		dialog.offY= e.clientY-parseInt(dialog.offsetTop);
		dialog.offX= e.clientX-parseInt(dialog.offsetLeft);
		window.addEventListener('mousemove', Dialog.move, true);
		
	};
	dialogTitle.onmouseup = function(e){
		document.getElementsByTagName("html")[0].style.cursor = "";
		document.getElementsByTagName("body")[0].style.cursor = "";
		window.removeEventListener('mousemove', Dialog.move, true);
	};
	closeDialogButton.onclick = function(e){
		Dialog.Close();
	}
	dialogButton.onclick = function(e){
		Dialog.Close();
	}
	dialogConfirm.onclick = function(e){
		Dialog.Close();
		confirm_callback();
	}
	
	document.body.appendChild(dialog);
	
	Dialog.OnWindowResize(); 
}


Dialog.move = function(e){
	var dialog = document.getElementById("dialog");
	dialog.style.position = "absolute";
	dialog.style.top = (e.clientY - dialog.offY) + "px";
	dialog.style.left = (e.clientX - dialog.offX) + 'px';
}