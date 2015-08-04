//http://stackoverflow.com/questions/4825683/how-do-i-create-and-read-a-value-from-cookie
function setCookie(c_name,value,exdays){
  var exdate=new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var c_value=escape(value) + ((exdays==null) ? "" : ("; expires="+exdate.toUTCString()));
  document.cookie=c_name + "=" + c_value;
}

function getCookie(c_name){
	var i,x,y,ARRcookies=document.cookie.split(";");
	for (i=0;i<ARRcookies.length;i++){
		x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
		y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
		x=x.replace(/^\s+|\s+$/g,"");
		if (x==c_name){
			return unescape(y);
		}
	}
}


//http://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server
var createDownloadLink = function(anchorSelector, str, fileName){
	if(window.navigator.msSaveOrOpenBlob) {
		var fileData = [str];
		blobObject = new Blob(fileData);
		$(anchorSelector).click(function(){
			window.navigator.msSaveOrOpenBlob(blobObject, fileName);
		});
	} else {
		var url = "data:text/plain;charset=utf-8," + encodeURIComponent(str);
		$(anchorSelector).attr("download", fileName);               
		$(anchorSelector).attr("href", url);
	}
}

var highlightBlock = function(block){
	if (block === undefined) return;
	if (block.id !== undefined) 
		block = block.id;
	Blockly.mainWorkspace.traceOn(true);
	Blockly.mainWorkspace.highlightBlock(block);
}

//http://stackoverflow.com/questions/4152931/javascript-inheritance-call-super-constructor-or-use-prototype-chain
function extend(base, sub){
	// Avoid instantiating the base class just to setup inheritance
	// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
	// for a polyfill
	// Also, do a recursive merge of two prototypes, so we don't overwrite 
	// the existing prototype, but still maintain the inheritance chain
	// Thanks to @ccnokes
	var origProto = sub.prototype;
	sub.prototype = Object.create(base.prototype);
	for (var key in origProto)  {
		sub.prototype[key] = origProto[key];
	}
	// Remember the constructor property was set wrong, let's fix it
	sub.prototype.constructor = sub;
	// In ECMAScript5+ (all modern browsers), you can make the constructor property
	// non-enumerable if you define it like this instead
	Object.defineProperty(sub.prototype, 'constructor', { 
		enumerable: false, 
		value: sub 
	});
}

//http://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-url-parameter
function getURLParameter(name) {
  var value = decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
  if (value !== null && value.indexOf("/") === value.length-1)
	  value = value.substring(0, value.length-1);
  return value;
}

function setURLParameter(name, value){
	if (getURLParameter(name) !== null){
		replaceURLParameter(name, value);
	}else{
		addURLParameter(name, value);
	}
}

//http://stackoverflow.com/questions/7171099/how-to-replace-url-parameter-with-javascript-jquery
//http://stackoverflow.com/questions/3338642/updating-address-bar-with-new-url-without-hash-or-reloading-the-page
function replaceURLParameter(paramName, paramValue){
	var url = location.search;
    var pattern = new RegExp('('+paramName+'=).*?(&|$)')
    var newUrl=url
    if(url.search(pattern)>=0){
        newUrl = url.replace(pattern,'$1' + paramValue + '$2');
    }
    else{
        newUrl = newUrl + (newUrl.indexOf('?')>0 ? '&' : '?') + paramName + '=' + paramValue 
    }
    window.history.pushState(":)", "Tunely", newUrl);
}

function addURLParameter(paramName, paramValue){
	var url = location.search;
	url += (url.split('?')[1] ? '&':'?') + paramName + "=" + paramValue;
	
	window.history.pushState(":(", "Tunely", url);
}