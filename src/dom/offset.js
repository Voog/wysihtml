wysihtml5.dom.offset = function(element, options) {
    
    var getOffset = function() {
        var doc = element.ownerDocument,
            docElem = doc.documentElement,
            win = doc.defaultView,
        	box = element.getBoundingClientRect();

    	return {
    		top: box.top + win.pageYOffset - docElem.clientTop,
    		left: box.left + win.pageXOffset - docElem.clientLeft
    	};
    };
    
    var setOffset = function() {
    	var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
            position = element.style.position || "static",
    		props = {};

    	if (position === "static" ) {
    		elem.style.position = "relative";
    	}

    	curOffset = getOffset();
    	curCSSTop = element.style.top;
    	curCSSLeft = element.style.left;

        // Need to be able to calculate position if either top or left is auto and position is either absolute or fixed
    	calculatePosition = (position === "absolute" || position === "fixed") && (curCSSTop + curCSSLeft).indexOf("auto") > -1;
    	if (calculatePosition) {
    		curPosition = wysihtml5.dom.position(element);
    		curTop = curPosition.top;
    		curLeft = curPosition.left;
    	} else {
    		curTop = parseFloat(curCSSTop) || 0;
    		curLeft = parseFloat(curCSSLeft) || 0;
    	}
        
    	if ( options.top != null ) {
    		props.top = (options.top - curOffset.top) + curTop;
    	}
    	if (options.left != null) {
    		props.left = ( options.left - curOffset.left ) + curLeft;
    	}

    	element.style.left = (typeof props.left !== "undefined") ? props.left + 'px' : "auto";
        element.style.top = (typeof props.top !== "undefined") ? props.top + 'px': "auto";
    };
    
    return (options) ? setOffset() : getOffset(); 
};