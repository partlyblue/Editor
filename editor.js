//		USEFUL PROTOTYPES
String.prototype.replaceAll = function(rep,str){
	var nStr = "";
	for (var i=0;i<this.length;i++){
		if (this.substr(i,rep.length) == rep){
			nStr += str;
			i += rep.length-1;
		} else {
			nStr += this.substr(i,1);
		}
	}
	return nStr;
}




//		VARS

var t=document.getElementById("t"),
	lines=document.getElementsByClassName("line"),
	currentLineNum = null,
	currentLine = null,
	cursorPos = -1;



//		EVENT LISTENERS

window.onload = function(){
	t.focus();
	addLine()
};
document.body.onclick = function(){
	t.focus();
}
t.onfocus = function(){
	t.addEventListener("keydown",key);
}
document.onblur = function(){
	t.removeEventListener("keydown",key);
}

key = function(e){
	var k = e.keyCode,
		text = currentLine.querySelector("#text");
	if (k == 8){
		e.preventDefault();
		t.value = "\b";
		setTimeout(write,10);
	} else if (k == 9){
		//		TAB
		e.preventDefault();
		t.value = "<span class='tab' len='4'></span>";
		setTimeout(write,10);
	} else if (k == 13){
		//		ADD NEW LINE
		e.preventDefault();
		addLine();
		setTimeout(write,10);
	} else if (k == 32){
		e.preventDefault();
		t.value = "<span class='sp' len='1'></span>";
		setTimeout(write,10);
	} else if (k == 188 && e.shiftKey){
		e.preventDefault();
		t.value = "<span class='lt' len='1'></span>";
		setTimeout(write,10);
	} else if (k == 190 && e.shiftKey){
		e.preventDefault();
		t.value = "<span class='gt' len='1'></span>";
		setTimeout(write,10);
	} else if (k == 37 && cursorPos > 0){
		cursorPos--;
		write();
	} else if (k == 38 && currentLineNum > 0){
		setLine(currentLineNum-1);
	} else if (k == 39 && cursorPos < text.length){
		cursorPos++;
		write();
	} else if (k == 40 && currentLineNum < lines.length-1){
		setLine(currentLineNum+1);
	} else {
		write();
	}
	function write(){
		setTimeout(function(){
			var value = t.value;
			if (value != ""){
				if (value == "\b"){
					if (text.childNodes.length > 0){
						var child = text.childNodes[text.childNodes.length-1];
						if (child.toString() == "[object Text]"){
							text.innerHTML = text.innerHTML.substr(0,text.innerHTML.length-1);
							cursorPos--;
						} else {
							text.removeChild(child);
							cursorPos -= Number(child.getAttribute("len"));
						}
					}
					value = "";
				} else if (value.indexOf("<span ") == 0){
					cursorPos += Number(value.substr(value.indexOf("len='")+5,1));
				} else {
					cursorPos += value.length;
				}
				text.innerHTML += value;

				t.value = "";
			}
//			document.getElementById("cursor").innerText = cursorPos;
			document.getElementById("cursor").style.top = (currentLineNum*3)+"px";
			document.getElementById("cursor").style.left = (cursorPos+5)*10+"px";
		},10);
	}
}
var _lines = document.getElementById("lines");
_lines.onclick = function(e){
	line = e.target;
	for (var i=0;i<lines.length;i++){
		if (line == lines[i]){
			setLine(i);
		}
	}
}

function setLine(lineNum){
	lines = document.getElementsByClassName("line");
	for (var i=0; i<lines.length; i++){
		lines[i].removeAttribute("focused");
	}
	try {
		lines[lineNum].setAttribute("focused","");
	} catch (e){
		throw Error("Invalid line number");
	}
	currentLineNum = lineNum;
	currentLine = lines[lineNum];
}
function addLine(){
	var line = document.createElement("div");
	line.setAttribute("class","line");

	//		SOON
	var lineNum = document.createElement("div");
	lineNum.setAttribute("class","lineNum");
	lineNum.innerText = lines.length+1;
	line.appendChild(lineNum);

	var text = document.createElement("text");
	text.id = "text";
	line.appendChild(text);

	_lines.appendChild(line);
	setLine(lines.length-1);
}

function setCursorPos(xPos, yPos){

}
