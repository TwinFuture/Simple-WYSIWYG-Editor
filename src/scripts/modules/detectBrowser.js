	/**
		* @module detectBrowser
		* @description This is a simple module containing a single function for detecting browser.
	*/
	/**
		* Detects users browser by using duct-typing
		* This also caches the result, so that each time the function is called,
		* it doesn't need to keep checking.
		*
		* We only need Firefox and IE/EDGE detection.
		* @class
		* @return {string} <code>_cache</code>The browser detected 'Firefox' 'IE' 'Edge' 'Unknown'
		* @see module:detectBrowser~browser._cache
		* @example <caption>Example usage of browser()</caption>
		* // returns string containing browser found.
		* var browser = browser();
		* console.log(browser);
		* @todo Possibly remove this as we can check in other optimised ways, possible?
	*/
	browser = function() {
		// Return cached result if available, else get result then cache it.
		if (browser.prototype._cache) {
			return browser.prototype._cache;
		}
		// Opera 8.0+ (UA detection to detect Blink/v8-powered Opera.
		//var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0,
		/** 
			* @type {boolean}
			* @description Returns true or false by checking Firefox's API to install addons. Firefox 1.0+
		*/
		var isFirefox = typeof InstallTrigger !== 'undefined',
		// At least Safari 3+: "[object HTMLElementConstructor]"
		//isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0 || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification),
		// Chrome 1+
		//isChrome = !!window.chrome && !!window.chrome.webstore,
		// Blink engine detection
		//isBlink = (isChrome || isOpera) && !!window.CSS,
		/** 
			* @type {boolean}
			* @description Returns true or false by checking for Conditional compilation and document.documentMode. Can detect from IE 6-11.
		*/
		isIE = /*@cc_on!@*/false || !!document.documentMode,
		/**
			* @type {boolean}
			* @description Returns true or false by checking for the StyleMedia constructor. Edge 20+
		*/
		isEdge = !isIE && !!window.StyleMedia;
		// Cache and return result.
		/**
			* @memberof module:detectBrowser~browser
			* @name _cache
			* @type {string}
			* @description Returns or caches a string containing detected browser or 'Unknown'.
		*/
		return browser.prototype._cache =
			//isOpera ? 'Opera' :
			isFirefox ? 'Firefox' :
			//isSafari ? 'Safari' :
			//isChrome ? 'Chrome' :
			//isBlink ? 'Blink' :
			isIE ? 'IE' :
			isEdge ? 'Edge' :
			'Unknown';
	};