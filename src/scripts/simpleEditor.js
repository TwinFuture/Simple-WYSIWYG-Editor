	/**
		* @module simpleEditor
		* @description This is the main module that loads user defined plugins, SWE, buttons and options.
	*/
	/*
		* @return {function} <code>initEditor()</code> This module returns the <code>initEditor(options)</code> function for use.
		* @todo Investigate insert before for multilne HTML content .insertBefore(input, parent);
		* @todo When doing multiline inserts, check if it needs to be wrapped in a div for each line or if its something like a <table> that is not wrapped in divs on each line. We also need to check how each browser handles inserting new lines for different kinds of elements like tables, lists etc.
	*/
	/** 
		* @type {object}
		* @description 	Object containing the main window.document
		*				Use window.document as its supported by all browsers 
		*				document is a property of window and IE needs it.
	*/
	var win = window.document,
	/** 
		* @type {object}
		* @description Object containing the iframe its self.
	*/
		sweFrame,
	/** 
		* @type {object}
		* @description Object containing the iframes document.
	*/
		swe,
	/** 
		* @type {object}
		* @description Object containing the iframes body.
	*/
		sweBody,
	/**
		* @type {object}
		* @description The object containing the original textarea.
	*/
		sweEditor,
	/** 
		* @type {object}
		* @description The object containing the current drop down for the toolbar buttons if any.
	*/
		sweDropDown;
	/**
		* Adds an event listener to do an element that is handled by a function.
		* addEventListenr does not work on IE < 9.
		* Attach event is no longer supported in IE 11. So we check for both.
		* No need for Jquery framework here!
		*
		* @class
		* @param {element} element The element to attach the event listener to.
		* @param {string} event Event to listen on such as 'click', 'keydown'
		* @param {function} function The function to handle the event.
		* @return {event} <code>attachEvent</code> or <code>addEventListener</code> based on browser capabilities.
		* @example <caption>Example usage of addEvent() handled by defined function.</caption>
		* // Attach an event to element handled by function.
		* addEvent(
		*	window.document.getElementById('myButtonID'),
		*	'click',
		*	handleButtons
		* );
		*
		* function handleButtons() {
		* 	var e = event || window.event;
		*	e.preventDefault();
		*	console.log(event.target);
		* }
		* @example <caption>Example usage of addEvent() handled by defined function with params.</caption>
		* // Attach an event to element handled by function.
		* addEvent(
		*	window.document.getElementById('myButtonID'),
		*	'click',
		*	function () { handleButtons(event, param1, param2); }
		* );
		*
		* function handleButtons(event, param1, param2) {
		* 	var e = event || window.event;
		*	e.preventDefault();
		*	console.log(param1+param2);
		* }
		* @example <caption>Example usage of addEvent().</caption>
		* // Attach an event to element with do stuff.
		* addEvent(
		*	window.document.getElementById('myButtonID'),
		*	'click',
		*	function () {
		*		// Do stuff
		*		console.log('clicked'); 
		*	}
		* );
	*/
	function addEvent(elmement, event, func) {
		/**
			* @type {event}
			* @description Returns the attached event.
		*/
		var event = !elmement.attachEvent ?
					elmement.addEventListener(event, func, false) :
					elmement.attachEvent('on'+event, func);
		return event;
	}
	/**
		* Removes the drop down from the SWE toolbar if sweDropDown var is not empty and is not parent node .
		* @class
		* @see module:simpleEditor~handleDropDown
	*/
	function handleDropDown() {
		/** 
			* @type {event}
			* @description The event that has just occurred.
		*/
		var event = event || window.event,
		/** 
			* @type {object}
			* @description The events target element that has been clicked or nothing if its inside the iframe.
		*/
		element = event ? event.target || event.srcElement : '';
		
		// Loops through the parents to check if the click was inside the drop down.
		/*while (element && sweDropDown) {
			if (element.nodeName === 'A' || !element.parentNode) {
				break;
			}
			if (element.className === 'swedrop-menu') {
				return;
			}
			element = element.parentNode;
		}*/
		// If there is a dropdown, and the click was not on the toolbar button its self.
		// Close the dropdown.
		if (sweDropDown && element.parentNode !== sweDropDown) {
			sweDropDown.setAttribute('class', 'swedrop');
			sweDropDown = '';
			sweBody.focus();
		}
	}
	/**
		* Handles the click event from the toolbar buttons.
		* As the whole toolbar is assigned to only one event listener, we do all the checking here.
		* @class
		* @see module:simpleEditor~addEvent
		* @todo Plan on adding justifyfull to the editor. Investigate other buttons such as videos, print, undo redo.
	*/
	// Handles the click event from the toolbar buttons.
	function handleButtons() {
		/** 
			* @type {event}
			* @description The event that has just occurred.
		*/
		var event = event || window.event,
		/** 
			* @type {object}
			* @description The events target element that has been clicked.
		*/
		element = event.target || event.srcElement;

		//prevent default click.
		event.preventDefault();
		// Have we clicked on a button and not just the toolbar div.
		if (element.nodeName === 'A') {
			/**
				* @type {string}
				* @description The command from the className of the element with the removed prefix swe-.
			*/
			var command = element.id.slice(4);
			// Is it one of the default execCommands?
			if (('|bold|italic|underline|strikethrough|justifyleft|' +
				 'justifycenter|justifyright|superscript|subscript|' +
				 'insertunorderedlist|insertorderedlist|' +
				 // Encased in | so we don't by chance split a command.
				 'inserthorizontalrule|removeformat|').indexOf('|' + command + '|') > -1) {
				 // We have a match!, just execute the command easy peasy!
				 swe.execCommand(command);
				 sweBody.focus();
				 return;
			}
			// If command is source, switch to original textarea or to iframe.
			if (command === 'source') {
				if (sweEditor.style.display === 'none') {
					sweFrame.style.display = 'none';
					sweEditor.style.display = 'block';
					return;
				} else {
					sweFrame.style.display = 'block';
					sweEditor.style.display = 'none';
					return;
				}
			}
			
			// Toggle dropdown.
			// Checks for existing sweDropDown and removes the open class name and executes commands/functions pressed.
			if (sweDropDown) {
				var fontColor = element.style.color,
					fontStyle = element.style.fontFamily,
					fontSize = element.style.fontSize;

				if (fontColor) {
					swe.execCommand('forecolor', false, fontColor);
					sweBody.focus();
					return;
				}
				if (fontStyle) {
					swe.execCommand('fontname', false, fontStyle);
					sweBody.focus();
					return;
				}
				if (fontSize) {
					var size;
					fontSize = fontSize.slice(0, -2);
					if (fontSize < 11) {
						size = 1;
					}
					if (fontSize > 12) {
						size = 3;
					}
					if (fontSize > 15) {
						size = 4;
					}
					if (fontSize > 17) {
						size = 5;
					}
					if (fontSize > 23) {
						size = 6;
					}
					if (fontSize > 31) {
						size = 7;
					}
					swe.execCommand('fontsize', false, size);
					sweBody.focus();
					return;
				}

				// remove open from the dropdowns class.
				sweDropDown.setAttribute('class', 'swedrop');
				// If clicked again will hide the current dropdown menu.
				// Added for human cognitive expectations.
				if (element.parentNode === sweDropDown) {
					sweDropDown = '';
					return;
				}
			}
			// Sets the sweDropDown to the clicked parent node.
			sweDropDown = element.parentNode;
			// If the button is a dropdown.
			if (sweDropDown.className === 'swedrop') {
				// Opens the dropdown.
				sweDropDown.setAttribute('class', 'swedrop open');
				return;
			} else {
				sweDropDown = '';
			}
			//if (element.className === 'swe-bold') {
				//insertHTML('<b>', '</b>');
			//}
		} else {
			// This detects a click inside the drop down and stops it from closing.
			if (typeof event.stopPropagation == "function") {
				event.stopPropagation();
			} else {
				event.cancelBubble = true;
			}
		}
	}
	function createDropDown(button, html) {
		var sweButton = win.getElementById('swe-'+button);
		var parent = sweButton.parentNode;
		// Set class of buttons parent LI to swedrop.
		parent.setAttribute('class', 'swedrop');

		var dropDown = win.createElement('ul');
		dropDown.setAttribute('class', 'swedrop-menu');
		parent.appendChild(dropDown);

		dropDown.innerHTML += html;
	}
	/**
		* I have put this in to a function to prevent floating variables.
		* This might not be used if user has defined their own default fonts, which they may have.
		* @class
		* @return {string[]} This returns a default array of default and popup smiley's for the toolbar.
		* @see module:simpleEditor~initEditor
		* @todo Populate and CACHE RESULTS. Add something to stop the popup smiley images being automatically loaded.
		* @example <caption>Example format for smiley's.</caption>
		* // Format to list smiley's.
		* [[]]
	*/
	function defaultSmileys() {
		return [[]];
	}
	// Get the selected range, or set one if there isn't one set.
	function selectedRange(sel) {
		var	range, firstChild;

		if (!sel) {
			return;
		}
		// If currently not in editor there is no range set, so set one.
		// Fail-safe.
		if (sel.getRangeAt && sel.rangeCount <= 0) {
			firstChild = sweBody;
			while (firstChild.firstChild) {
				firstChild = firstChild.firstChild;
			}

			range = swe.createRange();
			range.setStartBefore(firstChild);

			sel.addRange(range);
		} else {
			range = sel.getRangeAt(0);
		}
		return range;
	}
	// Get the selected HTML and return it.
	function selectedHtml(range) {
		if (range) {
			var div = swe.createElement('div');
			div.appendChild(range.cloneContents());
			return div.innerHTML;
		}
		return '';
	}
	function hasChild(node) {
		// 1  = Element
		// 9  = Document
		// 11 = Document Fragment
		if (!/11?|9/.test(node.nodeType)) {
			return false;
		}
		return ('|br|hr|img|link|').indexOf('|' + node.nodeName.toLowerCase() + '|') < 0;
	}
	function inline(elm, includeCodeAsBlock) {
		var nodeType = (elm || {}).nodeType || 3;

		if (nodeType !== 1) {
			return nodeType === 3;
		}

		// The order of elements.
		return ('|body|hr|p|div|table|tbody|thead|tfoot|th|tr|' + 
			'td|li|ol|ul|blockquote|code|center|').indexOf('|' + elm.tagName.toLowerCase() + '|') < 0;
	}
	function insertHTML(start, end) {
		var sel = swe.getSelection(),
			range  = selectedRange(sel),
			parent = range.commonAncestorContainer,
			lastChild,
			active,
			// Create an element.
			div = swe.createElement('div');

		// Put the selected HTML into the created element.
		div.innerHTML = selectedHtml(range);

		// Nothing is selected, return!
		/*if (!div.lastChild) {
			return;
		}*/

		// Get all child <div>'s of created element
		// which contains each line of text/html.
		// TODO::
		// We need to consider if this is a table or something where each line is not a div
		// Things like code and blockquote need to be excluded from this!
		var child = div.getElementsByTagName('div');
		// Is there any children if there is, its a multiline highlight.
		if (child.length > 0) {
			for (var i = 0; i < child.length; i++) {
				//Insert style inside every div.
				child[i].innerHTML = start + child[i].innerHTML + end;
			}
		} else {
			// Single line highlight.
			div.innerHTML = start + selectedHtml(range) + end;
		}

		lastChild = div.lastChild;

		while(!inline(lastChild.lastChild, true)) {
			lastChild = lastChild.lastChild
			div.lastChild = div.lastChild.lastChild;
		}

		if (hasChild(div.lastChild)) {
			div.lastChild = div.lastChild.lastChild;
			// IE <= 8 and Webkit won't allow the cursor to be placed
			// inside an empty tag, so add a zero width space to it.
			if (!div.lastChild.lastChild) {
				div.lastChild.innerHTML += '\u200B';
			}
		}
		// If we are inserting something like a style, we could change the elements attributes

		// Create fragment
		frag = swe.createDocumentFragment();

		// This saves caret position lastNode.
		var lastNode;
		// Insert contents of div into fragment.
		while (div.firstChild) {
			lastNode = frag.appendChild(div.firstChild);
		}
		// Save the first node incase we want highlight selected.
		var firstNode = frag.firstChild;
		
		// Nothing in fragment.
		if (!frag) {
			return false;
		}

		range.deleteContents();

		// FF allows <br /> to be selected but inserting a node
		// into <br /> will cause it not to be displayed so must
		// insert before the <br /> in FF.
		// 3 = TextNode
		if (parent && parent.nodeType !== 3 && !hasChild(parent)) {
			parent.parentNode.insertBefore(frag, parent);
		} else {
			//previousSibling.insertBefore(newNode, referenceNode.nextSibling);
			//parent.parentNode.insertBefore(input, parent);
			range.insertNode(frag);
		}
		// Preserve the selection
		if (lastNode) {
			// Clone contents is key here as we created a document fragment.
			// Returns error no parent if we do not clone the fragment.
			range = range.cloneRange();
			// Puts cursor at end of inserted.
			range.setStartAfter(lastNode);
			// Highlght selection.
			//range.setStartBefore(lastNode);
			sel.removeAllRanges();
			sel.addRange(range);
			// Focus back on the editor!
			sweBody.focus();
		}
		//sweBody.focus();
		//base.restoreRange();
	}
	// Insert HTML
	// Used by buttons to insert links, images etc...
	// Start and end need to be defined here.
	function insertQuickHTML() {
		var div,
			node,
			start = '<b>',
			end = '</b>';
		
		// Focus on the editor.
		sweBody.focus();

		range = selectedRange();

		if (!range) {
			return false;
		}

		start += selectedHtml() + end;

		div = swe.createElement('div');
		node = swe.createDocumentFragment();
		div.innerHTML = start;

		while (div.firstChild) {
			node.appendChild(div.firstChild);
		}
		range.insertNode(node);
		range.deleteContents();
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Unused for now.....
	// Used to check if currently focused so we can focus on the editor if not.
	function hasFocus() {
	}
	// Sets the cursor Position. Need to code to select end for highlight and inside divs.
	function setCaretPos() {
		// start character at which to place caret
		var start = 0, sel;
		// Focus on the editor.
		sweBody.focus();
		// If browser cannot getSelection. Mainly for IE.
		if (!swe.getSelection) {
			//var range = sweBody.createTextRange();
			sel = sweBody.createTextRange();
			sel.moveStart('character', start);
			sel.select(); // We don't select cause of blank space for chrome/ff
		} else {
			sel = swe.getSelection();
			sel.collapse(sweBody.firstChild, start);
		}
	}

	/**
		* initEdiotr() is a rather large function but why split up into smaller functions
		* when its only needed on settings up the SWE on load and would be more
		* code and less minification.
		* 
		* This sets up the iframe and buttons for the SWE based on user defined options,
		* such as the textareas ID, tabindex, buttons, fonts, smileys and colours. 
		*
		* @class
		* @param {object} options - options
		* @param {string} options.id - The id of the textarea to attach the SWE to.
		* @param {string} options.tabindex - The tabindex of the editor, so tabbing goes to the correct item in order.
		* @param {string} options.plugins=bbc - A list of plugins to load, see example for format.
		* @param {string[]} options.buttons - An array list of buttons see example for format.
		* @param {string[]} options.fonts - An array list of fonts see example for format.
		* @param {string[]} options.smileys - An array list of smiley's see example for format.
		* @todo Remove the bodyContent variable and put directly in iframe.
		* @see module:simpleEditor~addEvent
		* @example <caption>Example usage of swe.initEditor</caption>
		* // Setup the swe editor
		* initEditor({
		*	id: 'message',
		*	tabindex: '1',
		*	buttons: [[['bold', 'Bold'],['italic', 'Italic'],['underline', 'Underline'],['strike', 'Strike Through']],
		*		[['left', 'Align Left'],['center', 'Align Center'],['right', 'Align Right']]],
		*	fonts: ['Arial','Arial Black','Comic Sans MS','Courier New','Georgia','Impact'],
		*	smileys: []
		* });
	 */
	//////////// PUBLIC ////////////
	initEditor = function(options) {
		// This gets the textarea with the id given.
		sweEditor = win.getElementById(options.id);
		// Hide the initial textarea if not already hidden.
		sweEditor.style.display = 'none';

		// Insert zero width space otherwise caret will be invisible on focus if empty.
		// TODO REMOVE THIS VAR AND JUST PUT IN IFRAME.
		// When they first enter something, remove this and add it back if the editor gets emptied again.
		var bodyContent = '&#8203;',
			sweEditorParent = sweEditor.parentNode,
			buttons = options.buttons,

		// Get all the options.
		// If there are no user defined buttons use default.
			sweButtons = buttons && buttons.length > 2 ? buttons :
				[[['bold', 'Bold'],['italic', 'Italic'],['underline', 'Underline'],['strikethrough', 'Strike Through']],
				[['justifyleft', 'Align Left'],['justifycenter', 'Align Center'],['justifyright', 'Align Right']],
				[['fontname', 'Font Style'],['fontsize', 'Font Size'],['forecolor', 'Font Color']],
				[['image', 'Insert Image'],['createlink', 'Insert Link'],['unlink', 'Remove Link'],['email', 'Insert Email']],
				[['superscript', 'Superscript'],['subscript', 'Subscript']],
				[['table', 'Insert Table'],['code', 'Insert Code'],['quote', 'InsertQuote']],
				[['insertunorderedlist', 'Insert Bullet List'],['insertorderedlist', 'Insert Numbered List']],
				[['inserthorizontalrule', 'Insert Horizontal Rule'],['smileys', 'Smileys']],
				[['maximize', 'Maximmize'],['removeformat', 'Remove Format'],['source', 'View Source']]],
			plugins = options.plugins;
			// get plugins from options.
			swePlugins = plugins && plugins.length > 0 ? plugins : ['bbc'],
			// First we create the swe toolbar
			// Create the toolbar div!
			sweBar = win.createElement('div'),
			// Create a dropDowns array for default drop downs with default buttons.
			dropDowns = [];

		// Add swe-bar class to div.
		sweBar.setAttribute('class', 'swe-bar');
		// Loop through plugins.
		for (var i in swePlugins) {
			console.log('plugins/'+swePlugins[i]+'.js');
			//PluginManager.register(swePlugins[i]);
		}

		// Split the buttons up into groups.
		for (var i in sweButtons) {
			// Create the group UL.
			var sweGroup = win.createElement('ul');
			sweGroup.setAttribute('class', 'swe-group');
			sweBar.appendChild(sweGroup);
			// Split the group into individual buttons.
			for (var x in sweButtons[i]) {
				// Title is at 1 get title here
				// Create the buttons li
				var sweButton = win.createElement('li');
				// Create the li's link
				var sweButtonLink = win.createElement('a');
				// Set the links attribute to swe buttons list defined by user.
				sweButtonLink.setAttribute('id', 'swe-' + sweButtons[i][x][0]);
				// Append the button to the li.
				sweButton.appendChild(sweButtonLink);
				// Append the li to the ul group
				sweGroup.appendChild(sweButton);
				// Check for default drop down buttons.
				if (sweButtons[i][x][0] === 'fontname') {
					// add fontname to default drop downs.
					dropDowns.push(sweButtons[i][x][0]);
				}
				if (sweButtons[i][x][0] === 'fontsize') {
					// add fontsize to default drop downs.
					dropDowns.push(sweButtons[i][x][0]);
				}
				if (sweButtons[i][x][0] === 'forecolor') {
					// add forecolor to default drop downs.
					dropDowns.push(sweButtons[i][x][0]);
				}
				if (sweButtons[i][x][0] === 'image') {
					// add forecolor to default drop downs.
					dropDowns.push(sweButtons[i][x][0]);
				}
			}
		}
		// Place the whole generated toolbar before the original texarea.
		sweEditorParent.insertBefore(sweBar, sweEditor);

		// Create the dropdown content for default buttons.
		// This is done after so the function createDropDown function can be reused for custom buttons.
		// Loop through each dropDowns and call createDropDown
		for (var i in dropDowns) {
			// If fontname enabled.
			if (dropDowns[i] === 'fontname') {
				var fonts = options.fonts,
				// If there are no user defined fonts use default.
					fontName = fonts && fonts.length > 0 ? fonts :
						['Arial','Arial Black','Comic Sans MS','Courier New','Georgia','Impact',
						'Sans-serif','Serif','Times New Roman','Trebuchet MS','Verdana'],
					// Create a wrapper to insert each font list item in.
					sweFonts  = win.createElement('ul');
				// Split the fonts by ,
				for (var x in fontName) {
					var fontButton = win.createElement('li'),
						fontButtonLink = win.createElement('a');
	
					fontButtonLink.setAttribute('href', '#');
					fontButtonLink.setAttribute('style', 'font-family:' + fontName[x]);
					fontButtonLink.innerHTML = fontName[x];
					fontButton.appendChild(fontButtonLink);
					sweFonts.appendChild(fontButton);
				}
				createDropDown('fontname', sweFonts.innerHTML);
			}
			if (dropDowns[i] === 'fontsize') {
				// Create a wrapper to insert each font size list item in.
				var fontSize = [['10px', 'x-small'], ['13px', 'small'], ['16px', 'medium'],
								['18px', 'large'], ['24px', 'x-large'], ['32px', 'xx-large']],
					sweSizes  = win.createElement('ul');
				// Loop through each font size.
				for (var x in fontSize) {
					var fontButton = win.createElement('li'),
						fontButtonLink = win.createElement('a');

					fontButtonLink.setAttribute('href', '#');
					fontButtonLink.setAttribute('style', 'font-size:' + fontSize[x][0]);
					fontButtonLink.innerHTML = fontSize[x][1];
					fontButton.appendChild(fontButtonLink);
					sweSizes.appendChild(fontButton);
				}
				createDropDown('fontsize', sweSizes.innerHTML);
			}
			if (dropDowns[i] === 'forecolor') {
				var colors = options.colors,
					fontColor = colors && colors.length > 0 ? colors : 
					['white', 'black', 'red', 'yellow', 'pink', 'green', 'orange', 'purple', 'blue',
					'beige', 'brown', 'teal', 'navy', 'maroon', 'limegreen'],
					sweColors  = win.createElement('ul');
				
				for (var x in fontColor) {
					var fontButton = win.createElement('li'),
						fontButtonLink = win.createElement('a');
	
					fontButtonLink.setAttribute('href', '#');
					fontButtonLink.setAttribute('style', 'color:' + fontColor[x]);
					fontButtonLink.innerHTML = fontColor[x];
					fontButton.appendChild(fontButtonLink);
					sweColors.appendChild(fontButton);
				}
				createDropDown('forecolor', sweColors.innerHTML);
			}
			if (dropDowns[i] === 'image') {
				html = '<div><form>Testing: <input type="text" name="test" /></form><a href=""></a></div>';
				createDropDown('image', html);
			}
		}

		// Create a new iframe.
		/** @type element
		*	@description Creates a new iframe.
		*/
		sweFrame = win.createElement('iframe');
		// Set default iframe attributes.
		sweFrame.setAttribute('frameborder', '0');
		sweFrame.setAttribute('allowfullscreen', 'true');
		sweFrame.setAttribute('tabindex', options.tabindex);
		sweFrame.setAttribute('class', 'swe-frame');

		// Append the iframe after the textarea.
		// Hopefully this works for all :S
		sweEditorParent.insertBefore(sweFrame, sweEditor.nextSibling);

		// Sets default vars depending on browser capabilities. IE
		// contentWindow Chrome - contentDocument IE, document maybe others.
		swe = sweFrame.contentDocument || sweFrame.contentWindow.document || sweFrame.document;

		// Write the iframe contents to the iframe.
		swe.open();
		swe.write('<html><head><meta http-equiv="Content-Type" content="text/html;charset=utf-8"><link rel="stylesheet" type="text/css" href="css/swe-iframe.css"></head><body contenteditable="true" style="" dir="ltr"><div>'+bodyContent+'</div></body></html>');
		swe.close();

		// Sets the default body variable.
		sweBody = swe.body;

		// Add event handlers for the clicking on the SWE.
		// Focus on the editor when clicked and remove dropdown if any.
		addEvent(
			swe,
			'click',
			handleDropDown
		);
		// Adds an event to the window to close any drop downs.
		addEvent(
			window,
			'click',
			handleDropDown
		);
		
		// Adds a single event handler to the Simple SWE toolbar.
		addEvent(
			sweBar,
			'click',
			handleButtons
		);
		// Focus on the editor once loaded.
		// TODO:: Maybe add as a user defined option?
		sweBody.focus();
		
	};
	// If not hooked for plugins/modules remove this.
	/*
	// OLD METHOD
	var oldwrapper = (function() {
		function test9() {
			console.log('accessed');
		}
		return {test9}
	})();
	//including a module
	var testModuleInc = (function (simpleEditor) {

		simpleEditor.test1 = function() {
			console.log('this is function 1');
		}
		// Function 2
		simpleEditor.test2 = function() {
			console.log('this is function 1');
		}

		return {simpleEditor};
	})(simpleEditor || {});
	//using a wrapper with a prefix
	var myTestModule = (function() {

		myPlugin = {};

		// Its got a var must be private.
		function privateFunction1() {
			console.log('can\'t access me from outside.');
		}
		// Function 1 Public
		myPlugin.function1 = function() {
			console.log('this is function 1');
		}
		// Function 2
		myPlugin.function2 = function() {
			console.log('this is function 1');
		}
		return myPlugin;
	})();*/
