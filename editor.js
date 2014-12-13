//		USEFUL PROTOTYPES & FUNCTIONS
String.prototype.replaceAll = function(rep,str){
	var nStr = "";
	if (typeof(rep) == "object"){
		for (var i=0;i<this.length;i++){
			var found = false;
			for (var rI=0;rI<rep.length;rI++){
				if (this.substr(i,rep[rI].length) == rep[rI]){
					nStr += ((typeof(str)!="object")? str: str[rI]);
					found = true;
					break;
				}
			}
			if (!found)nStr += this.substr(i,1);
		}
		return nStr;
	}
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

//		Class Objects
function Cursor(){
	this.x = 1; this.y = 1;
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
					(nodes[i].getAttribute("whitespace")!=null)? nodes[i].getAttribute("whitespace"):nodes[i].innerText
				);
			}
			return text;
		}
		this.setText = function(text){
			var value = "";
			text = text.replaceAll(["\t","\n"," ","&","<",">"],["<span class='char' whitespace='\t'>TTTT</span>","","<span class='char' whitespace=' '>_</span>","<span class='char'>&</span>","<span class='char'><</span>","<span class='char'>></span>"]);
			getByClass(this.holder,"text")[0].innerHTML = text;
		}

		this.focus = function(scroll){
			lines = getByClass(document,"line");
			for (var i=0; i<lines.length; i++){
				if (lines[i]!=this.holder)lines[i].removeAttribute("focused");
				else {
					this.holder.setAttribute("focused","");
					cursor.set(cursor.x,i+1);
					currentLine = lines[i];
					if(scroll==true && i > 11)lines[i-12].scrollIntoView();
				}
			}
		}

		this.remove = function(){
			if (lines.length > 1){
				_lines.removeChild(this.holder);
				Line.focusLine(cursor.y-1);
				drawGutter();
			}
		}

	}
	Line.getLine = function(lineNum){
		lineNum = (lineNum!=null)? lineNum: cursor.y;
		if (lineNum < 1 | lineNum > lines.length) throw new Error("Line number out of range!");
		var line = new Line();
		line.holder = lines[lineNum-1];
		return line;
	}
	Line.focusLine = function(lineNum,scroll){
		lineNum = (lineNum > 0)? ((lineNum <= lines.length)? lineNum: lines.length): 1;
		Line.getLine(lineNum).focus(scroll);
	}

	//	Set the entire document's text
	Line.setText = function(text){
		var lines = text.split("\n");
		_lines.innerHTML = "<div id='cursor'></div>\n<div id='gutter-filler'></div>\n";
		for (var i=0;i<lines.length;i++){
			Line.insertNew(null,Line.formatChars(lines[i])+"</span></div>\n");
		}
		Line.focusLine(1);
	}
	Line.insertNew = function(index,content){
		index = (index!=null)? index: cursor.y;
		content = (content!=null)? content.replaceAll("\n",""): "";
		var before = lines[index];

		var line = document.createElement("div");
		line.setAttribute("class","line");

		var lineNum = document.createElement("div");
		lineNum.setAttribute("class","lineNum");
		lineNum.innerText = lines.length+1;
		line.appendChild(lineNum);

		var text = document.createElement("span");
		text.setAttribute("class","text");
		text.innerHTML = content;
		line.appendChild(text);

		if (before)_lines.insertBefore(line,before)
		else _lines.appendChild(line);
		Line.focusLine(index+1);
		drawGutter();
	}
	Line.removeLine = function(lineNum){
		Line.getLine(lineNum).remove();
	}

	Line.formatChars = function(text,reverse){
		var normalized = ["\t"," ","&","<",">"],
			formated = ["<span class='char' whitespace='\t'>TTTT</span>","<span class='char' whitespace=' '>_</span>","<span class='char'>&</span>","<span class='char'><</span>","<span class='char'>></span>"];
		return (!reverse)? text.replaceAll(normalized,formated): text.replaceAll(formated,normalized);
	}

}


//		VARS

var t=getById("t"),
	lines=getByClass(document,"line"),
	cursor;

getById("upload").onchange = function(e){
	var r = new FileReader();
	r.readAsText(e.target.files[0]);
	r.onload = function(){
		Line.setText(r.result);
	}
	e.target.value = "";
}

//		EVENT LISTENERS

window.onload = function(){
	t.focus();
	cursor = new Cursor();
	Line.insertNew();
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
			write();
		} else {
			Line.removeLine();
		}
	} else if (k == 9){
		//		TAB
		e.preventDefault();
		t.value = "<span class='char' whitespace='\t'>TTTT</span>";
	} else if (k == 13){
		//		ADD NEW LINE
		e.preventDefault();
		var txt = Line.getLine().getText();
		if (txt.indexOf("> ") == 0 & txt.indexOf("~*") != txt.length-2)runCommand(Line.getLine().getText().substr(2));
		else Line.insertNew();

	} else if (k == 32){
		e.preventDefault();
		t.value = "<span class='char' whitespace=' '>_</span>";
	} else if (k == 55 && e.shiftKey){
		e.preventDefault();
		t.value = "<span class='char'>&</span>";
	} else if (k == 188 && e.shiftKey){
		e.preventDefault();
		t.value = "<span class='char'><</span>";
	} else if (k == 190 && e.shiftKey){
		e.preventDefault();
		t.value = "<span class='char'>></span>";
	} else if (k == 37 && cursor.x > 0){
		cursor.add(-1,0);
	} else if (k == 38 && cursor.y > 1){
		e.preventDefault();
		Line.focusLine(cursor.y-1,true);
		return;
	} else if (k == 39 && cursor.x < text.length){
		cursor.add(1,0);
	} else if (k == 40 && cursor.y < lines.length){
		e.preventDefault();
		Line.focusLine(cursor.y+1,true);
		return;
	} else if (k == 46){
		Line.getLine().setText("");
		return;
	}
	write();

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

			getById("cursor").style.top = (cursor.y*3)+"px";
			getById("cursor").style.left = (cursor.x+5)*10+"px";
		},10);
	}
}
var _lines = getById("lines");
_lines.onclick = function(e){
	clicked = e.target;
	for (var i=0;i<lines.length;i++){
		if (clicked == lines[i]){
			Line.focusLine(i+1,false);
		} else if (clicked.parentNode == lines[i] | clicked.parentNode.parentNode == lines[i]){
			//		[INSERT CURSOR SUPPORT]
			Line.focusLine(i+1,false);
		}
	}
}


function drawGutter(){
	var lineNums = getByClass(document,"lineNum");
	for (var i=0;i<lineNums.length;i++){
		lineNums[i].innerText = i+1;
	}
}


function runCommand(cmd){
	var lower = cmd.toLowerCase();
	if (lower == "goto github"){
		if (confirm("Redirect to GitHub")){
			window.open("https://github.com/Convobomber34/Editor");
		} else {
			Line.getLine().setText("Fine! I won't redirect you, you meanie! >:(=");
		}
	} else if (lower.indexOf("color") == 0){
		Line.getLine().holder.style.color = cmd.substr(6);
	} else if (lower.indexOf("run") == 0){
		if (lower.indexOf("html") == 4 && cursor.y == lines.length){
			var href="data:text/html, ";
			for (var i=1;i<lines.length;i++){
				href += Line.getLine(i).getText()+"\n";
			}
			window.open(href);
		}
	} else if (lower.indexOf("open") == 0){
		getById("upload").click();
	}
}
