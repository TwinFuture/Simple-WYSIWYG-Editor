	/**
		* @module simpleEditor
		* @description This is the main module that loads user defined plugins, Simple WYSIWYG Editor, buttons and options.
	*/
	/*
		* @return {function} <code>initEditor()</code> This module returns the <code>initEditor(options)</code> function for use.
		* @todo Investigate insert before for multilne HTML content .insertBefore(input, parent);
		* @todo When doing multiline inserts, check if it needs to be wrapped in a div for each line or if its something like a <table> that is not wrapped in divs on each line. We also need to check how each browser handles inserting new lines for different kinds of elements like tables, lists etc.
	*/
	/** 
		* @type {object}
		* @description Object containing the iframe.
	*/
	var wysiwyg, 
	/** 
		* @type {boolean}
		* @description This is the boolean for we use to determine if in source mode or WYSIWYG mode.
	*/
		source;
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
		* I have put this in to a function to prevent floating variables.
		* This might not be used if user has defined their own default buttons, which they should have!
		* @class
		* @return {string[]} This returns an array of default buttons for the toolbar.
		* @see module:simpleEditor~initEditor
		* @example <caption>Example format for toolbar buttons.</caption>
		* // Format to list buttons.
		* [[['bold', 'Bold'],['italic', 'Italic'],['underline', 'Underline'],['strike', 'Strike Through']],
		* [['left', 'Align Left'],['center', 'Align Center'],['right', 'Align Right']]]
	*/
	function defaultButtons() {
		//  handleButtons -> title.
		return [[['bold', 'Bold'],['italic', 'Italic'],['underline', 'Underline'],['strikethrough', 'Strike Through']],
				[['justifyleft', 'Align Left'],['justifycenter', 'Align Center'],['justifyright', 'Align Right']],
				[['fontname', 'Font Style'],['fontsize', 'Font Size'],['forecolor', 'Font Color']],
				[['image', 'Insert Image'],['createlink', 'Insert Link'],['unlink', 'Remove Link'],['email', 'Insert Email']],
				[['superscript', 'Superscript'],['subscript', 'Subscript']],
				[['table', 'Insert Table'],['code', 'Insert Code'],['quote', 'InsertQuote']],
				[['insertunorderedlist', 'Insert Bullet List'],['insertorderedlist', 'Insert Numbered List']],
				[['inserthorizontalrule', 'Insert Horizontal Rule'],['smileys', 'Smileys']],
				[['maximize', 'Maximmize'],['removeformat', 'Remove Format'],['source', 'View Source']]];
	}
	/**
		* I have put this in to a function to prevent floating variables.
		* This might not be used if user has defined their own default fonts, which they may have.
		* @class
		* @return {string[]} This returns an array of default fonts for the toolbar.
		* @see module:simpleEditor~initEditor
		* @todo Cache the results, as this is only called once maybe don't cache.
		* @example <caption>Example format for fonts.</caption>
		* // Format to list fonts.
		* ['Arial','Arial Black','Comic Sans MS','Courier New','Georgia','Impact',
		* 'Sans-serif','Serif','Times New Roman','Trebuchet MS','Verdana']
	*/
	function defaultFonts() {
		return ['Arial','Arial Black','Comic Sans MS','Courier New','Georgia','Impact',
				'Sans-serif','Serif','Times New Roman','Trebuchet MS','Verdana']
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
				* @description Gets the command from the className of the element and removes the prefix wysiwyg-.
			*/
			var command = element.className.slice(8);
			// Is it one of the default execCommands?
			if (('|bold|italic|underline|strikethrough|justifyleft|' +
				 'justifycenter|justifyright|fontname|fontsize|forecolor|' + 
				 'createlink|superscript|subscript|insertunorderedlist|insertorderedlist|' +
				 // Encased in | so we don't by chance split a command.
				 'inserthorizontalrule|removeformat|').indexOf('|' + command + '|') > -1) {
				 // We have a match!, just execute the command easy peasy!
				 wysiwyg.execCommand(command);
				 wysiwyg.body.focus();
			}
			//if (element.className === 'wysiwyg-bold') {
				//insertHTML('<b>', '</b>');
			//}
		} else {
			return;
		}
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
			firstChild = wysiwyg.body;
			while (firstChild.firstChild) {
				firstChild = firstChild.firstChild;
			}

			range = wysiwyg.createRange();
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
			var div = wysiwyg.createElement('div');
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
		var sel = wysiwyg.getSelection(),
			range  = selectedRange(sel),
			parent = range.commonAncestorContainer,
			lastChild,
			active,
			// Create an element.
			div = wysiwyg.createElement('div');
		
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
		frag = wysiwyg.createDocumentFragment();
		
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
			wysiwyg.body.focus();
		}
		//wysiwyg.body.focus();
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
		wysiwyg.body.focus();
		
		range = selectedRange();
		
		if (!range) {
			return false;
		}
		
		start += selectedHtml() + end;
		
		div = wysiwyg.createElement('div');
		node = wysiwyg.createDocumentFragment();
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
		wysiwyg.body.focus();
		// If browser cannot getSelection. Mainly for IE.
		if (!wysiwyg.getSelection) {
			//var range = wysiwyg.body.createTextRange();
			sel = wysiwyg.body.createTextRange();
			sel.moveStart('character', start);
			sel.select(); // We don't select cause of blank space for chrome/ff
		} else {
			sel = wysiwyg.getSelection();
			sel.collapse(wysiwyg.body.firstChild, start);
		}
	}

	/**
		* initEdiotr() is a rather large function but why split up into smaller functions
		* when its only needed on settings up the WYSIWYG editor on load and would be more
		* code and less minification.
		* 
		* This sets up the iframe and buttons for the WYSIWYG editor based on user defined options,
		* such as the textareas ID, tabindex, buttons, fonts, smileys and colours. 
		*
		* @class
		* @param {object} options - options
		* @param {string} options.id - The id of the textarea to attach the wysiwyg editor to.
		* @param {string} options.tabindex - The tabindex of the editor, so tabbing goes to the correct item in order.
		* @param {string} options.plugins=bbc - A list of plugins to load, see example for format.
		* @param {string[]} options.buttons - An array list of buttons see example for format.
		* @param {string[]} options.fonts - An array list of fonts see example for format.
		* @param {string[]} options.smileys - An array list of smiley's see example for format.
		* @todo Remove the bodyContent variable and put directly in iframe.
		* @see module:simpleEditor~addEvent
		* @example <caption>Example usage of wysiwyg.initEditor</caption>
		* // Setup the wysiwyg editor
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
		// Insert zero width space otherwise caret will be invisible on focus if empty.
		// TODO REMOVE THIS VAR AND JUST PUT IN IFRAME.
		var bodyContent = '&#8203;',
		// Get all the options.
		// If there are no user defined buttons use default.
			wysiwygButtons = options.buttons !== null && options.buttons !== '' ? defaultButtons() : options.buttons,
			// get plugins from options.
			wysiwygPlugins = options.plugins !== null && options.plugins !== '' ? options.plugins : ['bbc'];
		
		for (var i in wysiwygPlugins) {
			console.log('plugins/'+wysiwygPlugins[i]+'.js');
			//PluginManager.register(wysiwygPlugins[i]);
		}
		// Use window.document as its supported by all browsers
		// document is a property of window and IE needs it.	
		// This gets the textarea with the id given.
		wysiwygEditor = window.document.getElementById(options.id),
		
		// First we create the wysiwyg toolbar
		// That will later be appended to the textareas parent node.
		// Create the toolbar div!
		wysiwygBar = window.document.createElement('div');
		// Add swe-bar class to div.
		wysiwygBar.setAttribute('class', 'swe-bar');
		
		// Split the buttons up into groups.
		for (var i in wysiwygButtons) {
			// Create the group UL.
			var sweGroup = window.document.createElement('ul');
			sweGroup.setAttribute('class', 'swe-group');
			wysiwygBar.appendChild(sweGroup);
			// Split the group into individual buttons.
			for (var x in wysiwygButtons[i]) {
				// Title is at 1 get title here
				
				// Create the buttons li
				var sweButton = window.document.createElement('li');
				// If button font is enabled get userdefined or default fonts.
				if (wysiwygButtons[i][x][0] === 'font') {
					// Set class of li to dropdown.
					sweButton.setAttribute('class', 'dropdown swe');
					// Create the li's link
					var sweButtonLink = window.document.createElement('a');
					// Set the links attribute to wysiwyg buttons list.
					sweButtonLink.setAttribute('class', 'dropdown-toggle swe wysiwyg-' + wysiwygButtons[i][x][0]);
					// Append the button to the li.
					sweButton.appendChild(sweButtonLink);
					
					var sweFonts = window.document.createElement('ul');
					sweFonts.setAttribute('class', 'dropdown-menu');
					sweButton.appendChild(sweFonts);
					
					// If there are no user defined fonts use default.
					if (wysiwygFonts !== null && wysiwygFonts !== '') {
						var wysiwygFonts = defaultFonts();
					}
					// Split the fonts by ,
					for (var z in wysiwygFonts) {
						var fontButton = window.document.createElement('li');
						fontButton.setAttribute('style', 'font-family:' + wysiwygFonts[z]);
						var fontButtonLink = window.document.createElement('a');
						fontButtonLink.setAttribute('href', '#');
						fontButtonLink.innerHTML = wysiwygFonts[z];
						fontButton.appendChild(fontButtonLink);
						sweFonts.appendChild(fontButton);
					}
				} else {
					// Set the li class to swe
					sweButton.setAttribute('class', 'swe');
					// Create the li's link
					var sweButtonLink = window.document.createElement('a');
					// Set the links attribute to wysiwyg buttons list defined by user.
					sweButtonLink.setAttribute('class', 'wysiwyg-' + wysiwygButtons[i][x][0]);
					// Append the button to the li.
					sweButton.appendChild(sweButtonLink);
				}
				// Append the li to the ul group
				sweGroup.appendChild(sweButton);
			}
		}
		// Place the whole generated toolbar
		// at the parent node of the texarea, should be above the iframe!
		wysiwygEditor.parentNode.appendChild(wysiwygBar);
		
		// Adds a single event handler to the Simple WYSIWYG Editor toolbar.
		addEvent(
			wysiwygBar,
			'click',
			handleButtons
		);

		// Create a new iframe.
		/** @type element
		*	@description Creates a new iframe.
		*/
		var wysiwygFrame = window.document.createElement('iframe');
		// Set default iframe attributes.
		wysiwygFrame.setAttribute('frameborder', '0');
		wysiwygFrame.setAttribute('allowfullscreen', 'true');
		wysiwygFrame.setAttribute('tabindex', options.tabindex);
		wysiwygFrame.setAttribute('class', 'wysiwyg');
		
		// Append the iframe to the parent of the textarea.
		// Hopefully nothing is before that :S
		wysiwygEditor.parentNode.appendChild(wysiwygFrame);
		
		// Sets default vars depending on browser capabilities. IE
		// contentWindow Chrome - contentDocument IE, document maybe others.
		wysiwyg = wysiwygFrame.contentDocument || wysiwygFrame.contentWindow.document || wysiwygFrame.document;

		// Write the iframe contents to the iframe.
		wysiwyg.open();
		wysiwyg.write('<html><head><style>.ie * {min-height: auto !important} .ie table td {height:15px} @supports (-ms-ime-align:auto) { * { min-height: auto !important; } }</style><meta http-equiv="Content-Type" content="text/html;charset=utf-8"><link rel="stylesheet" type="text/css" href="css/simple-wysiwyg-iframe.css"></head><body contenteditable="true" style="" dir="ltr"><div>'+bodyContent+'</div></body></html>');
		wysiwyg.close();

		// Add event handlers for the WYSIWYG editor.
		// Focus on the editor when clicked.
		addEvent(
			wysiwyg.body,
			'click',
			function () { wysiwyg.body.focus(); }
		);
		// Focus on the editor once loaded.
		// TODO:: Maybe add as a user defined option?
		wysiwyg.body.focus();
		
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