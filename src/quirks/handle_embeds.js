wysihtml5.quirks.handleEmbeds = (function() {
    
    var dom = wysihtml5.dom,
        maskData = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
        mask = null,
        editable = null,
        editor = null,
        embeds = null,
        observers = [],
        activeElement = null,
        resizer = null,
        sideclickHandler = null;
  
    var getEmbeds = function() {
        var iframes =           dom.query(editable, 'iframe'),
            ifameObjs =         dom.query(iframes, 'object, embed'),
            objects =           wysihtml5.lang.array(dom.query(editable, 'object')).without(ifameObjs),
            embedInObjects =    dom.query(objects, 'embed'),
            allEmbeds =         wysihtml5.lang.array(dom.query(editable, 'embed')).without(ifameObjs),
            embeds =            wysihtml5.lang.array(allEmbeds).without(embedInObjects);

        return [].concat(iframes, objects, embeds);
    };

    var observeEmbeds = function() {
        for (var i = 0, maxi = embeds.length; i < maxi; i++) {
            observers.push({
                "mouseover": dom.observe(embeds[i], "mouseover", handleMouseOver)
            });
        }
    };
    
    var stopObserving = function() {
        for (var i = 0, maxi = observers.length; i < maxi; i++) {
            observers[i].mouseover.stop();
        }
        observers = [];
    };
    
    var refreshEmbeds = function() {
        stopObserving();
        embeds = getEmbeds();
        observeEmbeds();
    };

    var handleMouseOver = function(event) {
        target = event.target;
        addMask(target);
    };
    
    var addMask = function(element) { 
        element.parentNode.insertBefore(mask, element);
        mask.style.height = element.offsetHeight + 'px';
        mask.style.width = element.offsetWidth + 'px';
        mask.style.position = "absolute";
        activeElement = element;
    };
    
    var removeMask = function() {
        if (mask.parentNode) {
            mask = mask.parentNode.removeChild(mask);
            activeElement = null;
        }
    };
    
    var makeMask = function() {
        mask = editable.ownerDocument.createElement('img');
        mask.src = maskData;
        mask.title = "";
        mask.style.backgroundColor = "rgba(0,0,0,0.3)";
        dom.addClass(mask, "wysihtml5-temp");
        dom.observe(mask, "mouseout", removeMask);
        dom.observe(mask, "click", startResizeMode);
    }
    
    var startResizeMode = function(event) {
        if (activeElement) {
            if (resizer) {
                resizer.stop();
            }
            resizer = wysihtml5.quirks.resize(activeElement, handleResize);
            setTimeout(function() {
                sideclickHandler = dom.observe(editable.ownerDocument, "click", handleSideClick);
            }, 0);
        }
    };
    
    var handleSideClick = function(event) {
        var target = event.target;
        if (!dom.hasClass(target, "wysihtml5-quirks-resize-handle") && target !== mask) {
            resizer.stop();
            resizer = null;
            sideclickHandler.stop();
            sideclickHandler = null;
        }
    };
    
    var handleResize = function (w, h) {
        mask.style.height = h + 'px';
        mask.style.width = w + 'px';
    };

    var init = function (element, edit) {
        editable = element;
        editor = edit;
        embeds = getEmbeds();
        observeEmbeds();
        makeMask();
        
        return {
            "refresh": refreshEmbeds
        };
    };

    return init;
})();

