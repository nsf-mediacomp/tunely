CanvasSelect.setupCanvasPopout = function(){
	var canvas_container = $("#visualization");
	canvas_container.css("cursor", "pointer");
	
	canvas_container.on("click", function(e){
		var canvii = $(".display_canvas");
		
		Dialog.Alert("", "canvas popout window", function(e){
			for (var i = 0; i < canvii.length; i++){
				canvas_container[0].appendChild(canvii[i]);
			}
		}, false);
		
		for (var i = 0; i < canvii.length; i++){
			var canvas = canvii[i];
			canvas_container[0].removeChild(canvas);
			Dialog.AddElement(canvas);
		}
		$("#dialogBody").on("click", function(e){
			$("#closeDialogButton")[0].onclick();
		});
		$("#dialogBody").css("cursor", "pointer");
		$("#dialogBody")[0].title = "click to pop in";
		$("#dialog").css("left", "12px").css("top", "12px");
	});
}