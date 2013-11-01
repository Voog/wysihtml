(function($) {
  
    jQuery.fn.inlineOffset = function() {
        var el = $('<div/>').css({
            'display':'inline-block',
            'height': '1em'
        }).insertBefore(this[0]);
        var pos = el.offset();
        pos.height = el.height();
        el.remove();
        return pos;
    };
    
    var defaults = {
        insertable_into: ".editable",
        container_class: ".dragdrop-container",
        block_elements: "p, div, h1, h2, h3, h4, pre, blockquote, table",
        inside_block_elements: "li",
        inline_elements: "br, hr",
        left_class: "dragdrop-container-left",
        right_class: "dragdrop-container-right"
    };
    
    var EditorContainer = function(el, options) {
        this.$el = $(el);
        this.settings = $.extend(defaults, options);
        
        this.doc = this.$el.get(0).ownerDocument;
        
        this.init();
    };
    
    EditorContainer.prototype = {
        init: function() {
            this.$tag = this.makeTag();
            if (this.settings.handler) {
                this.$el.children(this.settings.handler).on('mousedown.editorcontainer', $.proxy(this.handleMouseDown, this));
            } else {
                this.$el.on('mousedown.editorcontainer', $.proxy(this.handleMouseDown, this));
            }
        },
        
        handleMouseDown : function(event) {
            event.preventDefault();
            var pos = this.$el.position();
            this.updateEditablesCache();
            
            $(this.doc).on({
                "mousemove.editorcontainer": $.proxy(this.handleMouseMove, this),
                "mouseup.editorcontainer": $.proxy(this.handleMouseUp, this),
                "mouseleave.editorcontainer": $.proxy(this.handleMouseLeave, this)
            });
            
        },
        
        makeTag: function () {
            return $('<div/>').addClass('editor-container-tag');
        },
        
        removeTag: function() {
            if (this.$tag) {
                this.$tag.detach();
            }
        },
        
        addTag: function (pos, text) {
            var p = $.extend({
                    "left" : "",
                    "top": ""
                }, pos); 
            this.$tag.css(p);
            this.$tag.html(text);
            if (!this.$tag.get(0).parentNode) {
                $(this.doc.body).append(this.$tag);
            }
            
        },
        
        handleMouseMove: function (event) {
            var $target = $(event.target),
                place,
                place_inline,
                place_block,
                place_firstline,
                $closestInsertable = $target.closest(this.settings.insertable_into);
            
            this.mx = event.clientX + $(this.doc.defaultView).scrollLeft();
            this.my = event.clientY + $(this.doc.defaultView).scrollTop();
        
            if ($closestInsertable.length) {
                place_inline = this.getClosestInline($target);
                place_block = this.getClosestBlock($target);
                place_firstline = this.getClosestEditableFirstLine($target);
                
                if (place_block && place_block.$el.closest(this.settings.insertable_into).get(0) === $closestInsertable.get(0)) {
                    place = place_block;
                } else if (place_inline && place_inline.$el.closest(this.settings.insertable_into).get(0) === $closestInsertable.get(0)) {
                    place = place_inline;
                } else if (place_firstline && place_firstline.$el.closest(this.settings.insertable_into).get(0) === $closestInsertable.get(0)) {
                    place = place_firstline;
                } else {
                    place = place_block || place_inline || place_firstline;
                }
            } else {
                place = this.getClosestEditable();
            }
            
            if (place) {
                this.place = place;
                this.addTag(place.positioning.pos, place.positioning.dir + ' ' +  place.positioning.type);
            }  
        },
        
        // in webkit at least floated element occasionally will not be rendered to view
        // even if correctly inserted to dom. do not know why.
        // this will force the render
        forceElementRerender: function($el) {
            setTimeout($.proxy(function() {
                $el.css('float', 'none');
                setTimeout($.proxy(function() {
                    $el.css('float', '');
                }, this), 0);
            }, this), 0);
        },
        
        handleMouseUp: function (event){
            $(this.doc).off("mousemove.editorcontainer mouseup.editorcontainer mouseleave.editorcontainer");
            this.removeTag();
            if (this.place && this.place.$el.get(0) !== this.$el.get(0)) {
                this.$el.removeClass(this.settings.left_class + ' ' + this.settings.right_class);
                switch(this.place.positioning.dir) {
                    case "above":
                        if (this.place.positioning.type == "editable") {
                            this.place.$el.closest(this.settings.container_class).before(this.$el);
                        } else {
                            this.place.$el.before(this.$el);
                        }
                    break;
                    case "below":
                        if (this.place.positioning.type == "editable") {
                            this.place.$el.closest(this.settings.container_class).after(this.$el);
                        } else {
                            this.place.$el.after(this.$el);
                        }
                    break;
                    case "prepend":
                        this.place.$el.prepend(this.$el);
                    break;
                    case "left":
                        if (this.place.positioning.type == "inside inline") {
                            this.place.$el.after(this.$el);
                        } else if (this.place.positioning.type == "editable firstline") {
                            this.place.$el.prepend(this.$el);
                        } else {
                            this.place.$el.before(this.$el);
                        }
                        this.$el.addClass(this.settings.left_class);
                        this.forceElementRerender(this.$el);
                    break;
                    case "right":
                        if (this.place.positioning.type == "inside inline") {
                             this.place.$el.after(this.$el);
                        } else if (this.place.positioning.type == "editable firstline") {
                            this.place.$el.prepend(this.$el);                         
                        } else {
                           this.place.$el.before(this.$el);
                        }
                        this.$el.addClass(this.settings.right_class);
                        this.forceElementRerender(this.$el);
                    break;
                    
                }
            }
        },
        
        handleMouseLeave: function (event){
            
        },
        
        getClosestBlock: function ($target) {
            if (this.$editables.length) {
                var $closestBlock = $target.closest(this.$insideBlocks);
                
                if ($closestBlock.length) {
                    return {
                        "positioning": this.getBlockPositioning($closestBlock),
                        "$el": $closestBlock
                    };
                }
            }
            return null;
        },
        
        getBlockPositioning: function ($el) {
            var pos = $el.offset(),
                w = $el.width(),
                h = $el.height(),
                vSection = Math.floor((this.my - pos.top) / (h/2)),
                hSection = Math.floor((this.mx - pos.left) / (w/3));
                
            if (hSection < 1) {
                return {
                    "dir": "left",
                    "type": "inside",
                    "pos": pos
                };
            } else if (hSection > 1) {
                return {
                    "dir": "right",
                    "type": "inside",
                    "pos": {
                        "top": pos.top,
                        "left": pos.left + w
                    }
                };
            } else if (vSection < 1) {
                return {
                    "dir": "above",
                    "type": "inside",
                    "pos": {
                        "top": pos.top,
                        "left": pos.left + (w/2)
                    }
                };
            } else {
                return {
                    "dir": "below",
                    "type": "inside",
                    "pos": {
                        "top": pos.top + h,
                        "left": pos.left + (w/2)
                    }
                };
            }
        },
        
        updateEditablesCache: function() {
            // cache inline elements inside editables
            
            this.$inlineElements = $([]);
            this.inlineElements = [];
          
            // cache editables
            this.$editables = $(this.doc).find(this.settings.insertable_into);
            this.editables = $.map(this.$editables, $.proxy(function(el) {
                var pos = $(el).offset(),
                    $inliners = $(el).find(this.settings.inline_elements).not($(el).find(this.settings.container_class + ' ' + this.settings.inline_elements));
                
                
                // iterate inliners with editables as it saves some loops    
                this.$inlineElements.add($inliners);
                
                this.inlineElements = this.inlineElements.concat($.map($inliners, function(iel) {
                    var ipos = $(iel).inlineOffset();
                    return {
                        "$el": $(iel),
                        "x1": pos.left,
                        "y1": ipos.top,
                        "x2": pos.left + $(el).width(),
                        "y2": ipos.top + ipos.height
                    };
                }));
                
                return {
                    "$el": $(el),
                    "x1": pos.left,
                    "y1": pos.top,
                    "x2": pos.left + $(el).width(),
                    "y2": pos.top +$(el).height()
                };
            }, this));
            
            // cache block level elements inside editables
            var $insideElements = this.$editables.find(this.settings.inside_block_elements),
                $Level1BlockElements = this.$editables.children(this.settings.block_elements);
                
            this.$insideBlocks = $insideElements.add($Level1BlockElements);
            
        },
        
        getClosestEditable: function($target) {
            var spacer = 30,
                obj;
                
            for (var i = 0, maxi = this.editables.length; i < maxi; i++) {
                
                if (this.editables[i].x1 <= this.mx && this.editables[i].x2 >= this.mx) {
                    
                    obj = {
                        "positioning": {
                            "type": "editable",
                            "pos": {
                                "top": this.editables[i].y1,
                                "left": this.editables[i].x1 + ((this.editables[i].y2 - this.editables[i].y1)/2)
                            }
                        },
                        "$el": this.editables[i].$el
                    };
                    
                    // above
                    if (this.my <= this.editables[i].y1 && this.my >= this.editables[i].y1 - spacer) {
                        obj.positioning.dir = "above";
                        return obj;
                    }
                    
                    // below
                    if (this.my >= this.editables[i].y2 && this.my <= this.editables[i].y2 + spacer) {
                        obj.positioning.dir = "below";
                        obj.positioning.pos.top = this.editables[i].y2;
                        return obj;
                    }
                    
                    // every editable has the before first line as additional place to drop
                    if (this.editables[i].y1 >= this.mx && this.editables[i].y1 + spacer <= this.mx) {
                        w = this.editables[i].x2 - this.editables[i].x1;
                        hSection = Math.floor((this.mx - this.editables[i].x1) / (w/3));
                        
                        obj.positioning.type = "editable firstline";
                        
                        if (hSection < 1) {
                            obj.positioning.dir = "left";
                            return obj;
                        } else if (hSection > 1) {
                            obj.positioning.dir = "right";
                            obj.positioning.pos.left += w; 
                            return obj;
                        } else {
                            obj.positioning.dir = "prepend";
                            obj.positioning.pos.left += w/2; 
                            return obj;
                        }
                        
                    }
                    
                }
            }
            return null;
        },
        
        // every editable has the before first line as additional place to drop
        getClosestEditableFirstLine: function($target) {
            var spacer = 30,
                that = this,
                editable = $(this.editables).filter(function() {
                    return this.$el.get(0)  === $target.closest(that.settings.insertable_into).get(0);
                })[0],
                w, hSection,
                obj = {
                    "positioning": {
                        "type": "editable",
                        "pos": {
                            "top": editable.y1,
                            "left": editable.x1
                        }
                    },
                    "$el": editable.$el
                };
              
            if (editable.x1 <= this.mx && editable.x2 >= this.mx) {
                if (editable.y1 <= this.my && editable.y1 + spacer >= this.my) {
                    w = editable.x2 - editable.x1;
                    hSection = Math.floor((this.mx - editable.x1) / (w/3));
                    obj.positioning.type = "editable firstline";
                    
                    if (hSection < 1) {
                        obj.positioning.dir = "left";
                        return obj;
                    } else if (hSection > 1) {
                        obj.positioning.dir = "right";
                        obj.positioning.pos.left += w; 
                        return obj;
                    } else {
                        obj.positioning.dir = "prepend";
                        obj.positioning.pos.left += w/2; 
                        return obj;
                    }
                }
            }
            return null;      
        },
        
        getClosestInline: function($target) {
            var w, hSection, obj;
            
            for (var i = 0, maxi = this.inlineElements.length; i < maxi; i++) {
                
                if (this.inlineElements[i].x1 <= this.mx && this.inlineElements[i].x2 >= this.mx &&
                    this.inlineElements[i].y1 <= this.my && this.inlineElements[i].y2 >= this.my) {
                    w = this.inlineElements[i].x2 - this.inlineElements[i].x1;
                    hSection = Math.floor((this.mx - this.inlineElements[i].x1) / (w/3));
                    obj = {
                        "positioning": {
                            "type": "inside inline",
                            "pos": {
                                "top": this.inlineElements[i].y1,
                                "left": this.inlineElements[i].x1
                            }
                        },
                        "$el": this.inlineElements[i].$el
                    };
                    
                    if (hSection < 1) {
                        obj.positioning.dir = "left";
                        return obj;
                    } else if (hSection > 1) {
                        obj.positioning.dir = "right";
                        obj.positioning.pos.left += w; 
                        return obj;
                    } else {
                        obj.positioning.dir = "below";
                        obj.positioning.pos.left += w/2; 
                        return obj;
                    }
                }
            }
            return null;
        }
        
    };
    
    $.fn.editorContainer = function(options) {
        return this.each(function() {
            $(this).data('editorContainer', new EditorContainer(this, options));
        });
    };
    
})(jQuery);