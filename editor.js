//		USEFUL PROTOTYPES & FUNCTIONS
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
function getByClass(elem,cName){
	//Stupid IE
	if(!document.getElementsByClassName)return elem.querySelectorAll("."+cName.replaceAll(" ","."));
	else return elem.getElementsByClassName(cName);
}
function getById(id){
	return document.getElementById(id);
}
function ifValEqual(value,isArray,equalArray,ifNot){
	if (isArray.length!=equalArray.length) throw new Error("Arrays not equal!");
	ifNot = (ifNot!=null)? ifNot: value;
	for (var i=0;i<isArray.length;i++){
		endValue = ifNot;
		if (value == isArray[i])return equalArray[i];
	}
	return ifNot;
}


//		Class Objects
function Cursor(){
	this.x = 0; this.y = 0;
	this.holder = getById("cursor");
	this.set = function(){
		var arg1 = arguments[0];
		if (arg1==null)return;
		if (arg1+""=="[object CursorObject]"){
			this.x = arg1.x; this.y = arg1.y;
		} else {
			this.x = arguments[0]; this.y = arguments[1];
		}
	}
	this.add = function(){
		var arg1 = arguments[0];
		if (arg1==null)return;
		if (arg1+""=="[object CursorObject]"){
			this.x += arg1.x; this.y += arg1.y;
		} else {
			this.x += arguments[0]; this.y += arguments[1];
		}
	}

	this.get = function(name){
		return [this.x, this.y];
	}
	this.toString = function(){
		return "[object CursorObject]";
	}
}

/*Line*/{
	function Line(){
		this.holder = null;
		this.getText = function(){
			var text = "",
				nodes = getByClass(this.holder,"text")[0].childNodes;
			for (var i=0;i<nodes.length;i++){
				text += (nodes[i].toString().indexOf("[object HTML") == -1)? nodes[i].textContent: (
					(nodes[i].getAttribute("hide")!=null)? nodes[i].getAttribute("hide"):nodes[i].innerText
				);
			}
			return text;
		}
		this.setText = function(text){
			var value = "";
			for (var i=0;i<text.length;i++){
				var char = text.charAt(i);
				value += ifValEqual(char,["\t"," ","<",">"],["<span class='char' hide='\t'>TTTT</span>","<span class='char' hide=' '>_</span>","<span class='char'><</span>","<span class='char'>></span>"]);
			}
			getByClass(this.holder,"text")[0].innerHTML = value;
		}
	}
	Line.getLine = function(lineNum){
		lineNum = (lineNum!=null)? lineNum: cursor.y+1;
		if (lineNum < 1 | lineNum > lines.length) throw new Error("Line number out of range!");
		var line = new Line();
		line.holder = lines[lineNum-1];
		return line;
	}

}








//		VARS

var t=getById("t"),
	lines=getByClass(document,"line"),
	cursor;



//		EVENT LISTENERS

window.onload = function(){
	t.focus();
	cursor = new Cursor();
	addLine();
};
document.body.onclick = function(){
	t.focus();
}
t.onfocus = function(){
	t.onkeydown = key;
}
document.onblur = function(){
	t.onkeydown = null;
}

key = function(e){
	var k = e.keyCode,
		text = getByClass(currentLine,"text")[0];
	if (k == 8){
		e.preventDefault();
		if (Line.getLine().getText()!=""){
			t.value = "\b";
			setTimeout(write,10);
		} else {
			removeLine();
		}
	} else if (k == 9){
		//		TAB
		e.preventDefault();
		t.value = "<span class='char' hide='\t'>TTTT</span>";
		setTimeout(write,10);
	} else if (k == 13){
		//		ADD NEW LINE
		e.preventDefault();
		if (Line.getLine().getText().toLowerCase()!="> goto github"){
			addLine();
		} else {
			if (confirm("Redirect to GitHub")){
				window.location.href = "https://github.com/Convobomber34/Editor";
			} else {
				Line.getLine().setText("Fine! I won't redirect you, you meanie! >:(=");
			}
		}
		setTimeout(write,10);
	} else if (k == 32){
		e.preventDefault();
		t.value = "<span class='char' hide=' '>_</span>";
		setTimeout(write,10);
	} else if (k == 188 && e.shiftKey){
		e.preventDefault();
		t.value = "<span class='char'><</span>";
		setTimeout(write,10);
	} else if (k == 190 && e.shiftKey){
		e.preventDefault();
		t.value = "<span class='char'>></span>";
		setTimeout(write,10);
	} else if (k == 37 && cursor.x > 0){
		cursor.add(-1,0);
		write();
	} else if (k == 38 && cursor.y > 0){
		focusLine(cursor.y-1);
	} else if (k == 39 && cursor.x < text.length){
		cursor.add(1,0);
		write();
	} else if (k == 40 && cursor.y < lines.length-1){
		focusLine(cursor.y+1);
	} else if (k == 46){
		//		removeLine();
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
							cursor.add(-1,0);
						} else {
							text.removeChild(child);
							cursor.add(Number(child.getAttribute("len")),0);
						}
					}
					value = "";
				} else if (value.indexOf("<span ") == 0){
					cursor.add(Number(value.substr(value.indexOf("len='")+5,1)),0);
				} else {
					cursor.add(value.length,0);
				}
				text.innerHTML += value;

				t.value = "";
			}
			//			getById("cursor").innerText = cursorPos;

			getById("cursor").style.top = (cursor.y*3)+"px";
			getById("cursor").style.left = (cursor.x+5)*10+"px";
		},10);
	}
}
var _lines = getById("lines");
_lines.onclick = function(e){
	line = e.target;
	for (var i=0;i<lines.length;i++){
		if (line == lines[i]){
			focusLine(i);
		}
	}
}

function focusLine(lineNum,doCatch){
	lines = getByClass(document,"line");
	for (var i=0; i<lines.length; i++){
		lines[i].removeAttribute("focused");
	}
	try {
		lines[lineNum].setAttribute("focused","");
		cursor.set(cursor.x,lineNum);
		currentLine = lines[lineNum];
	} catch (e){
		focusLine((lineNum<0)?0:lines.length-1);
		if(doCatch==true)throw Error("Invalid line number");
	}
}
function addLine(){
	var line = document.createElement("div");
	line.setAttribute("class","line");

	//		SOON
	var lineNum = document.createElement("div");
	lineNum.setAttribute("class","lineNum");
	lineNum.innerText = lines.length+1;
	line.appendChild(lineNum);

	var text = document.createElement("span");
	text.setAttribute("class","text");
	line.appendChild(text);

	_lines.appendChild(line);
	focusLine(lines.length-1);
}

function removeLine(){
	if (lines.length > 1){
		_lines.removeChild(lines[cursor.y]);
		focusLine(cursor.y);
		drawGutter();
	}
}


function drawGutter(){
	//Wait for DOM to be edited
	setTimeout(function(){
		var lineNums = getByClass(document,"lineNum");
		for (var i=0;i<lineNums.length;i++){
			lineNums[i].innerText = i+1;
		}
	},0);
}
