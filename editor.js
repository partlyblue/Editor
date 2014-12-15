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
					i+=rep[rI].length-1;
					break;
				}
			}
			if (!found) nStr += this.substr(i,1);
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
function ifValDo(text,values,functions,ifNot){
	if(values.length!=functions.length)throw new Error("Value and function arrays not equal!");
	for (var i=0;i<values.length;i++){
		var V = values[i];
		if (typeof(V) == "object"){
			for (var vI=0;vI<V.length;vI++){
				if (text == V[vI]){
					functions[i]();
					return;
				}
			}
		} else {
			if (text == V){
				functions[i]();
				return;
			}
		}
	}
	if(ifNot)ifNot();
}
function formatChars(text,reverse){
	var normalized = ["\t"," ","&","<",">"],
		formated = ['<span class="char" whitespace="\t">TTTT</span>','<span class="char" whitespace=" ">_</span>','<span class="char">&</span>','<span class="char"><</span>','<span class="char">></span>'];
	if (!reverse){
		return text.replaceAll(normalized,formated);
	} else {
		return text.replaceAll(formated,normalized);
	}
}
function objectType(obj){
	return Object.prototype.toString.call(obj);
}
//		Class Objects
function Cursor(){
	this.x = 1; this.y = 1;

	this.holder = document.createElement("span");
	this.holder.setAttribute("class","cursor");

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

	this.getCursor = function(direction){
		var nodes = this.holder.parentNode.childNodes,
			cursorPos;
		for (var i=0;i<nodes.length;i++){
			var child = nodes[i];
			if (child==this.holder){
				cursorPos = i;
				if(direction == 0) return cursorPos;
			}
		}
		var Nodes = [];
		if (direction == -1){
			for (var i=0;i<cursorPos;i++){
				Nodes[Nodes.length] = nodes[i];
			}
		} else if (direction == 1){
			for (var i=cursorPos+1;i<nodes.length;i++){
				Nodes[Nodes.length] = nodes[i];
			}
		}
		return Nodes;
	}
	this.splitText = function(){
		var nodes = this.holder.parentNode.childNodes;
		for (var i=0;i<nodes.length;i++){
			var child = nodes[i];
			if (child.nodeName == "#text" && child.nodeValue.length > 1){
				for (var ch=0;ch<child.nodeValue.length;ch++){
					var txt = document.createTextNode(child.nodeValue.charAt(ch));
					child.parentNode.insertBefore(txt,child);
				}
				child.parentNode.removeChild(child);
			}
		}
	}
	this.fixText = function(){
		var nodes = this.holder.parentNode.childNodes,
			prevNode = "";
		for (var i=0;i<nodes.length;i++){
			var child = nodes[i];
			if (objectType(child) == "[object Text]"){
				if (objectType(prevNode) == "[object Text]"){
					child.nodeValue = prevNode.nodeValue+child.nodeValue;
					prevNode.parentNode.removeChild(prevNode);
					i--;
				}
				prevNode = child;
			}
		}
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
			getByClass(this.holder,"text")[0].innerHTML = formatChars(text);
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
		this.remove = function(direction){
			if (lines.length > 1){
				Line.Lines.removeChild(this.holder);
				Line.focusLine(cursor.y+((direction!=null)? direction: 0));
				drawGutter();
			}
		}

	}
	Line.Lines = getById("lines");
	Line.getLine = function(lineNum){
		lineNum = (lineNum!=null)? lineNum: cursor.y;
		if (lineNum < 1 | lineNum > lines.length) throw new Error("Line number out of range!");
		var line = new Line();
		line.holder = lines[lineNum-1];
		return line;
	}
	Line.focusLine = function(lineNum,scroll,x){
		lineNum = (lineNum > 0)? ((lineNum <= lines.length)? lineNum: lines.length): 1;
		Line.getLine(lineNum).focus(scroll);
		var text = getByClass(Line.getLine(lineNum).holder,"text")[0],
			len = (Line.cursor.holder.parentNode!=text)? text.childNodes.length: text.childNodes.length-1,
			pos; //= Line.cursor.getCursor();
		if (x == null || x >= len){
			text.appendChild(Line.cursor.holder);
		} else {
			x = (Line.cursor.holder == text.lastChild)? ((x <= 0)? 0: x): ((x <= 0)? 0: x);
			text.insertBefore(Line.cursor.holder,text.childNodes[x]);
		}
	}

	//	Set the entire document's text
	Line.setText = function(text){
		var lines = text.split("\n");
		Line.Lines.innerHTML = "<div id='cursor'></div>\n<div id='gutter-filler'></div>\n";
		for (var i=0;i<lines.length;i++){
			Line.insertNew(null,formatChars(lines[i])+"</span></div>\n");
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

		if (before)Line.Lines.insertBefore(line,before)
		else Line.Lines.appendChild(line);
		Line.focusLine(index+1);
		drawGutter();
		return line;
	}
	Line.removeLine = function(lineNum,direction){
		Line.getLine(lineNum).remove(direction);
	}

	Line.handleInput = function(key,value){
		Line.cursor.splitText();
		var text = getByClass(Line.getLine().holder,"text")[0];
		Line.cursor.holder = getByClass(Line.getLine().holder,"cursor")[0];
		ifValDo(key,
		//backspace, enter, left,up,right,down, del

		[8,13,37,38,39,40,46],
		[
			function(){
				var before = Line.cursor.getCursor(-1);
				if (before.length == 0){
					if (lines.length > 1){
						Line.cursor.splitText();
						var after = Line.cursor.getCursor(1);
						var text = getByClass(Line.getLine(cursor.y-1).holder,"text")[0];
						text.appendChild(Line.cursor.holder);
						for (var i=0;i<after.length;i++){
							text.appendChild(after[i]);
						}
						setTimeout(function(){
							Line.removeLine(null,-1);
						},5);
					}
				} else {
					var text = getByClass(Line.getLine().holder,"text")[0];
					var before = Line.cursor.getCursor(-1);
					text.removeChild(before[before.length-1]);
				}
			},
			function(){Line.insertNew();},
			function(){
				setTimeout(function(){
					var before = Line.cursor.getBefore();
					if (before!=null){
						before.parentNode.insertBefore(Line.cursor.holder,before);
					}
				},20);
			},
			function(){if(cursor.y>1)Line.focusLine(cursor.y-1,true)},
			function(){
				var after = Line.cursor.getAfter();
				if (after!=null){
					after.parentNode.insertBefore(after,Line.cursor.holder);
				}
			},
			function(){if(cursor.y<lines.length)Line.focusLine(cursor.y+1,true)},
			function(){
				if(Line.cursor.getAfter()==null){
					if (lines.length > 1){
						Line.removeLine(null,1);
						Line.getLine().holder.appendChild(Line.cursor.holder);
					}
				} else {
					if (text.childNodes.length > 1){
						text.removeChild(Line.cursor.getAfter());
					}
				}}
		],
		//Write
		function(){
			if (value != ""){
				if (value.indexOf("<span ") == 0){
					var D = document.createElement("div");
					D.innerHTML = value;
					setTimeout(function(){
						text.insertBefore(D.children[0],Line.cursor.holder);
					},10);
				} else {
					text.insertBefore(document.createTextNode(value),Line.cursor.holder);
				}
			}
		});
	}
	Line.cursor = new Cursor();
}
/*Console*/{
	function Console(){

	}
	Console.holder = getById("console");
	Console.lines = getById("console-text");
	Console.input = getById("console-input");
	Console.history = {commands: [], currentText: "", historyPos: 0};

	Console.move = function(e){
		Console.holder.style.left = (((document.all)? e.clientX: e.pageX)-Console.x)+"px";
		Console.holder.style.top = (((document.all)? e.clientY: e.pageY)-Console.y)+"px";
	}

	getById("console-handle").onmousedown = function(e){
		Console.x = e.clientX-(Console.holder.offsetLeft);
		Console.y = e.clientY-(Console.holder.offsetTop);
		document.onmousemove = Console.move;
		Console.holder.onmouseup = function(){
			document.onmouseup = null;
			document.onmousemove = null;
			Console.x = null, Console.y = null;
		}
	}

	Console.holder.onclick = function(e){
		t.focus();
		textTarget = Console;
	};
	Console.handleInput = function(key,value){
		var _text = Console.input,
			text = formatChars(_text.innerHTML,true);
		ifValDo(key,
		[8,13,38,40],
		[
			function(){
				if (text!=""){
					var child = _text.childNodes[_text.childNodes.length-1];
					if (child.toString() == "[object Text]"){
						_text.innerHTML = _text.innerHTML.substr(0,_text.innerHTML.length-1);
						cursor.add(-1,0);
					} else {
						_text.removeChild(child);
						cursor.add(Number(child.getAttribute("len")),0);
					}
				}
			},
			function(){
				if (Console.history.commands.length > 20) Console.history.commands.splice(0,1);
				Console.history.commands.splice(Console.history.commands.length,0,_text.innerHTML);
				var args = text.split(" ").splice(0,1);
				Console.write(Console.input.innerHTML);
				runCommand(text,args);
				Console.input.innerHTML = "";
				Console.history.historyPos = Console.history.commands.length;
			},
			function(){
				if (Console.history.historyPos > 0)Console.history.historyPos--;
				_text.innerHTML = Console.history.commands[Console.history.historyPos];
			},
			function(){
				if (Console.history.historyPos < Console.history.commands.length)Console.history.historyPos++;
				_text.innerHTML = ((Console.history.historyPos < Console.history.commands.length)? Console.history.commands[Console.history.historyPos]: "");
			}
		],
		function(){
			if (value != ""){
				if (value.indexOf("<span ") == 0){
					cursor.add(Number(value.substr(value.indexOf("len='")+5,1)),0);
				} else {
					cursor.add(value.length,0);
				}
				_text.innerHTML += value;
			}
		});
	}

	Console.write = function(text){
		var line = document.createElement("div");
		line.setAttribute("class","line");
		line.innerHTML = formatChars(text);
		Console.lines.insertBefore(line,Console.input);
	}
	Console.clear = function(){
		Console.lines.innerHTML = "";
		Console.lines.appendChild(Console.input);
	}

}


//		VARS

var t=getById("t"),
	lines=getByClass(document,"line"),
	cursor,
	textTarget = null;


//		EVENT LISTENERS

window.onload = function(){
	cursor = new Cursor();
	var line = Line.insertNew();
	getByClass(line,"text")[0].appendChild(Line.cursor.holder);
};
document.onselectstart = function(e){e.preventDefault(); return false};
getById("upload").onchange = function(e){
	var r = new FileReader();
	r.readAsText(e.target.files[0]);
	r.onload = function(){
		Line.setText(r.result);
		textTarget = Line;
	}
	e.target.value = "";
};

t.onkeydown = function(e){
	var k = e.keyCode;
	if (k == 8){
		e.preventDefault();
	} else if (k == 9){
		e.preventDefault();
		t.value = "<span class='char' whitespace='\t'>TTTT</span>";
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
	} else if (k == 37){
//		cursor.add(-1,0);
	} else if (k == 38){
		e.preventDefault();
	} else if (k == 39){
//		cursor.add(1,0);
	} else if (k == 40 && cursor.y < lines.length){
		e.preventDefault();
	} else if (k == 46){
	}
	setTimeout(function(){textTarget.handleInput(k,t.value)},0);
	setTimeout(function(){t.value=""},10);
}

Line.Lines.onclick = function(e){
	t.focus();
	textTarget = Line;
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


function runCommand(cmd,args){
	var lower = cmd.toLowerCase();

	var commands = [
		"help",["clear","cls"],"goto","run","open"
	],
		actions = [
			function(){
				Console.write("Help:");
				var message = "";
				commands.sort();
				for (var i=0;i<commands.length-1;i++){
					var cmd = commands[i];
					if (typeof(cmd) == "object"){
						message += "["
						for (var cI=0;cI<cmd.length-1;cI++){
							message += cmd[cI]+",";
						}
						message += cmd[cI]+"], ";
					} else {
						message += commands[i]+", ";
					}
				}
				message += commands[i]+".";
				Console.write(message);
			},
			function(){
				Console.clear();
				Console.history = {commands: [cmd], currentText: "", historyPos: 0};
			},
			function(){
				if (args[0]=="github"){
					if (confirm("Redirect to GitHub")){
						window.open("https://github.com/Convobomber34/Editor");
					} else {
						Console.write("Fine! I won't redirect you, you meanie! >:(=");
					}
				}
			},
			function(){
				if (args[0] == "html"){
					var href="data:text/html, ";
					for (var i=1;i<lines.length;i++){
						href += Line.getLine(i).getText()+"\n";
					}
					href += Line.getLine(i).getText()+"\n";
					window.open(href);
				}
			},
			function(){getById("upload").click()}
		];
	alert
	ifValDo(lower,commands,actions,function(){Console.write("Unknow command. Try help")});
}
