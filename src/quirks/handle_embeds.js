wysihtml5.quirks.handleEmbeds = (function() {
    
    
  
    var dom = wysihtml5.dom,
        maskData = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
        mask = null,
        editable = null,
        editor = null,
        embeds = null,
        observers = [];
  
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
    };
    
    var removeMask = function() {
        mask = mask.parentNode.removeChild(mask);
    };
    
    var makeMask = function() {
        mask = editable.ownerDocument.createElement('img');
        mask.src = maskData;
        mask.title = "";
        
        
        dom.observe(mask, "mouseout", removeMask);
        dom.observe(mask, "click", startResizeMode);
    }
    
    var startResizeMode = function(event) {
        
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

