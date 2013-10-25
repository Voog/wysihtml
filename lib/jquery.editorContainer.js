(function($) {
    
    var defaults = {
        insertable_into: ".editable",
        block_elements: "p, div, h1, h2, h3, h4, pre, blockquote, table",
        inline_elements: "br, hr"
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
            this.$el.on('mousedown.editorcontainer', $.proxy(this.handleMouseDown, this));
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
                place;
            
            this.mx = event.clientX + $(this.doc.defaultView).scrollLeft();
            this.my = event.clientY + $(this.doc.defaultView).scrollTop();
        
            if ($target.closest(this.settings.insertable_into).length) {
                place = this.getClosestBlock($target);
            } else {
                place = this.getClosestEditable();
            }
            
            if (place) {
                this.place = place;
                this.addTag(place.positioning.pos, place.positioning.dir + ' ' +  place.positioning.type);
            }
            
        },
        
        handleMouseUp: function (event){
            $(this.doc).off("mousemove.editorcontainer mouseup.editorcontainer mouseleave.editorcontainer");
            this.removeTag();
            if (this.place && this.place.$el.get(0) !== this.$el.get(0)) {
                switch(this.place.positioning.dir) {
                    case "above": 
                        this.$el.css('float', 'none');
                        this.place.$el.before(this.$el);
                    break;
                    case "below":
                        this.$el.css('float', 'none');
                        this.place.$el.after(this.$el);
                    break;
                    case "left": 
                        this.$el.css('float', 'left');
                        this.place.$el.before(this.$el);
                    break;
                    case "right":
                        this.$el.css('float', 'right');
                        this.place.$el.before(this.$el);
                    break;
                }
            }
        },
        
        handleMouseLeave: function (event){
            
        },
        
        getClosestBlock: function ($target) {
            if (this.$editables.length) {
                var $closestBlock = $target.closest(this.$editables.children(this.settings.block_elements));
                
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
                vSection = Math.floor((this.my - pos.top) / (h/3)),
                hSection = Math.floor((this.mx - pos.left) / (w / ((vSection == 1) ? 2 : 3)));
            if (hSection < 1) {
                return {
                    "dir": "left",
                    "type": "inside",
                    "pos": pos
                };
            } else if (hSection > 1 || (vSection == 1 && hSection == 1)) {
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
            this.$editables = $(this.doc).find(this.settings.insertable_into);
            this.editables = $.map(this.$editables, function(el) {
                var pos = $(el).offset();
                return {
                    "$el": $(el),
                    "x1": pos.left,
                    "y1": pos.top,
                    "x2": pos.left + $(el).width(),
                    "y2": pos.top +$(el).height()
                };
            });
        },
        
        getClosestEditable: function($target) {
            for (var i = 0, maxi = this.editables.length; i < maxi; i++) {
                if (
                    this.editables[i].x1 <= this.mx &&
                    this.editables[i].x2 >= this.mx &&
                    this.editables[i].y1 -30 <= this.my &&
                    this.editables[i].y2 +30 >= this.my
                ) {
                    if (this.my <= this.editables[i].y1 + ((this.editables[i].y2 - this.editables[i].y1)/2)) {
                        
                        return {
                            "positioning": {
                                "dir": "above",
                                "type": "editable",
                                "pos": {
                                    "top": this.editables[i].y1,
                                    "left": this.editables[i].x1 + ((this.editables[i].y2 - this.editables[i].y1)/2)
                                }
                            },
                            "$el": this.editables[i].$el
                        };
                        
                    } else {
                        
                        return {
                            "positioning": {
                                "dir": "below",
                                "type": "editable",
                                "pos": {
                                    "top": this.editables[i].y2,
                                    "left": this.editables[i].x1 + ((this.editables[i].y2 - this.editables[i].y1)/2)
                                }
                            },
                            "$el": this.editables[i].$el
                        };
                        
                    }
                }
            }
            return null;
        }
        
        
    };
    
    $.fn.editorContainer = function() {
        return this.each(function() {
            $(this).data('editorContainer', new EditorContainer(this));
        });
    };
    
})(jQuery);