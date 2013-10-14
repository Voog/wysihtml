wysihtml5.quirks.handleEmbeds = (function() {
  
    var dom = wysihtml5.dom,
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
        //console.log(target.nodeName);
    };
    
    


    var init = function (element, edit) {
        editable = element;
        editor = edit;
        embeds = getEmbeds();
        observeEmbeds();
        
        return {
            "refresh": refreshEmbeds
        };
    };

    return init;
})();

