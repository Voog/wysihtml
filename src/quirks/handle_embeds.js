wysihtml5.quirks.handleEmbeds = (function() {
    
    var dom = wysihtml5.dom,
        maskData = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
    
    var EmbedHandler = function(element, edit) {
        this.editable = element;
        this.editor = edit;
        this.embeds = null;
        this.mask = null;
        this.observers = [];
        this.activeElement = null;
        this.resizer = null;
        this.resizeWindowHandler = null;
        this.sideclickHandler = null;
        this.keypressHandler = null;
        this.transferKey = "wysihtml5/elementdrop";
        this.trackerID = (new Date()).getTime() + '.' + (Math.random()*100);
        this.init();
    };
    
    EmbedHandler.prototype = {
        init: function () {
            this.embeds = this.getEmbeds();
            this.observeEmbeds();
            this.makeMask();
        },
        
        refresh: function() {
            this.stopObserving();
            this.endResizeMode();
            if (this.sideclickHandler) {
                this.sideclickHandler.stop();
                this.sideclickHandler = null;
            }
            this.removeMask();
            this.embeds = this.getEmbeds();
            this.observeEmbeds();
            this.makeMask();
        },
        
        getEmbeds: function() {
            var iframes =           dom.query(this.editable, 'iframe'),
                ifameObjs =         dom.query(iframes, 'object, embed'),
                objects =           wysihtml5.lang.array(dom.query(this.editable, 'object')).without(ifameObjs),
                embedInObjects =    dom.query(objects, 'embed'),
                allEmbeds =         wysihtml5.lang.array(dom.query(this.editable, 'embed')).without(ifameObjs),
                embeds =            wysihtml5.lang.array(allEmbeds).without(embedInObjects);

            return [].concat(iframes, objects, embeds);
        },
        
        observeEmbeds: function() {
            for (var i = 0, maxi = this.embeds.length; i < maxi; i++) {
                this.observers.push({
                    "mouseover": dom.observe(this.embeds[i], "mouseover", this.handleMouseOver, this)
                });
            }
            this.resizeWindowHandler = dom.observe(this.editable.ownerDocument.defaultView, "resize", this.handleWindowResize, this);
        },
        
        stopObserving: function() {
            for (var i = 0, maxi = this.observers.length; i < maxi; i++) {
                this.observers[i].mouseover.stop();
            }
            this.observers = [];
            if (this.resizeWindowHandler) {
                this.resizeWindowHandler.stop();
                this.resizeWindowHandler = null;
            }
        },
        
        handleMouseOver: function(event) {
            var target = event.target;
            this.addMask(target);
        },
        
        addMask: function(element) {
            this.activeElement = element;
            this.positionMask();
            this.editable.ownerDocument.body.appendChild(this.mask);
        },
        
        positionMask: function() {
            if (this.activeElement) {
                var offset = dom.offset(this.activeElement);
                this.mask.style.height = this.activeElement.offsetHeight + 'px';
                this.mask.style.width = this.activeElement.offsetWidth + 'px';
                this.mask.style.position = "absolute";
                this.mask.style.top = offset.top + 'px';
                this.mask.style.left = offset.left + 'px';
            }
        },
        
        removeMask: function() {
            if (this.mask.parentNode) {
                this.mask = this.mask.parentNode.removeChild(this.mask);
                this.activeElement = null;
            }
        },
        
        makeMask: function() {
            var that = this;
                this.mask = this.editable.ownerDocument.createElement('img');   
                this.mask.src = maskData;

            this.mask.title = "";
            
            this.mask.setAttribute("data-tracker", this.trackerID);
            
            // TODO: instead of this check find a way to add custom data in safari without preventing drag start on mask (will prevent filicker if this works)            
            if (!wysihtml5.browser.hasDragstartSetdataIssue()) {
                dom.observe(this.mask, "dragstart", function(event) {
                    try {
                        event.dataTransfer.setData(this.transferKey, this.trackerID);
                    } catch (err) {
                        // IE cannot do better than text to track insertion caret. Will insert one space though
                        event.dataTransfer.setData("text", " ");
                        this.trackerID = " ";
                        this.transferKey = "text";
                    }
                }, this);
            }
            
           
            dom.observe(this.mask, "dragend", function(event) {
                if (this.transferKey == "text") {
                    this.endResizeMode();
                    this.editor.composer.selection.insertNode(this.activeElement);
                    this.removeMask();
                } else {
                    var droppedMask = dom.query(this.editable, '[data-tracker="' + this.trackerID +  '"]')[0];
                    if (droppedMask) {
                        this.endResizeMode();
                        droppedMask.parentNode.insertBefore(this.activeElement, droppedMask);
                        droppedMask.parentNode.removeChild(droppedMask);
                        this.removeMask();
                    }
                }
            }, this);
            
            dom.addClass(this.mask, "wysihtml5-temp");
            dom.observe(this.mask, "mouseout", this.removeMask, this); 
            dom.observe(this.mask, "click", this.startResizeMode, this);
        },
        
        startResizeMode: function(event) {
            var that = this;
            if (this.activeElement) {
                this.endResizeMode();
                this.resizer = wysihtml5.quirks.resize(this.activeElement, this.handleResize, this);
                setTimeout(function() {
                    if (that.sideclickHandler) {
                        that.sideclickHandler.stop();
                    }
                    that.sideclickHandler = dom.observe(that.editable.ownerDocument, "click", that.handleSideClick, that);
                }, 0);
                this.keypressHandler = dom.observe(that.editable.ownerDocument, "keydown", this.handleKeyDown, this); 
            }
        },
        
        endResizeMode: function() {
            if (this.resizer) {
                this.resizer.stop();
                this.resizer = null;
            }
            if (this.keypressHandler) {
                 this.keypressHandler.stop();
            }
        },
        
        handleSideClick: function(event) {
            var target = event.target;
            if (!dom.hasClass(target, "wysihtml5-quirks-resize-handle") && target !== this.mask) {
                this.endResizeMode();
                this.sideclickHandler.stop();
                this.sideclickHandler = null;
            }
        },
        
        handleWindowResize: function() {
            this.positionMask();
            if (this.resizer) { 
                this.resizer.refresh();
            }
        },
        
        handleResize: function (w, h) {
            this.mask.style.height = h + 'px';
            this.mask.style.width = w + 'px';
            this.positionMask();
        },
        
        handleKeyDown: function(event) {
            if (event.keyCode == 8) {
                event.preventDefault();
                if (this.activeElement) {
                    this.activeElement.parentNode.removeChild(this.activeElement);
                }
                this.refresh();
            }
        }
    };

    return EmbedHandler;
})();

