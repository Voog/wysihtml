wysihtml5.dom.position = function(element) {

    var getPosition = function() {
        var offsetParent, offset,
        	parentOffset = { top: 0, left: 0 };

        if (element.style.position === "fixed") {
        	offset = element.getBoundingClientRect();
        } else {
        	offsetParent = offsetParent();
        	offset = wysihtml5.dom.offset(element).get();
        	if (offsetParent.nodeName.toLowerCase() !== "html") {
        		parentOffset = wysihtml5.dom.offset(offsetParent).get();
        	}
        	parentOffset.top += parseFloat(offsetParent.style.borderTopWidth);
        	parentOffset.left += parseFloat(offsetParent.style.borderLeftWidth);
        }
        return {
            top: offset.top - parentOffset.top - parseFloat(element.style.marginTop),
        	left: offset.left - parentOffset.left - parseFloat(element.style.marginLeft)
        };
    };
    
    var offsetParent = function() {
    	var offsetParent = element.offsetParent || element.ownerDocument;
		while (offsetParent && (offsetParent.nodeName.toLowerCase() !== "html"  && offsetParent.style.position === "static")) {
			offsetParent = offsetParent.offsetParent;
		}
		return offsetParent || element.ownerDocument;
    };
    
    return getPosition;
};