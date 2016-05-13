/**
 * Full HTML5 compatibility rule set
 * Loosened and extended ruleset. Allows more freedom on user side
 * These rules define which tags and CSS classes are supported and which tags should be specially treated.
 */

var wysihtmlParserRulesDefaults = {
    "blockLevelEl": {
        "keep_styles": {
            "textAlign": /^((left)|(right)|(center)|(justify))$/i,
            "float": 1
        },
        "add_style": {
            "align": "align_text"
        },
        "check_attributes": {
            "id": "any"
        }
    },

    "makeDiv": {
        "rename_tag": "div",
        "one_of_type": {
            "alignment_object": 1
        },
        "remove_action": "unwrap",
        "keep_styles": {
            "textAlign": 1,
            "float": 1
        },
        "add_style": {
            "align": "align_text"
        },
        "check_attributes": {
            "id": "any"
        }
    }
};

var wysihtmlParserRules = {
    /**
     * CSS Class white-list
     * Following CSS classes won't be removed when parsed by the wysihtml HTML parser
     * If all classes should pass "any" as classes value. Ex: "classes": "any"
     */
    "classes": "any",

    /* blacklist of classes is only available if classes is set to any */
    "classes_blacklist": {
        "Apple-interchange-newline": 1,
        "MsoNormal": 1,
        "MsoPlainText": 1
    },
    
    "type_definitions": {
        
        "alignment_object": {
            "classes": {
                "wysiwyg-text-align-center": 1,
                "wysiwyg-text-align-justify": 1,
                "wysiwyg-text-align-left": 1,
                "wysiwyg-text-align-right": 1,
                "wysiwyg-float-left": 1,
                "wysiwyg-float-right": 1
            },
            "styles": {
                "float": ["left", "right"],
                "text-align": ["left", "right", "center"]
            }
        },
        
        "valid_image_src": {
            "attrs": {
                "src": /^[^data\:]/i
            }
        },
        
        "text_color_object": {
          "styles": {
            "color": true,
            "background-color": true
          }
        },
        
        "text_fontsize_object": {
          "styles": {
            "font-size": true
          }
        },
        
        "text_formatting_object": {
            "classes": {
                "wysiwyg-color-aqua": 1,
                "wysiwyg-color-black": 1,
                "wysiwyg-color-blue": 1,
                "wysiwyg-color-fuchsia": 1,
                "wysiwyg-color-gray": 1,
                "wysiwyg-color-green": 1,
                "wysiwyg-color-lime": 1,
                "wysiwyg-color-maroon": 1,
                "wysiwyg-color-navy": 1,
                "wysiwyg-color-olive": 1,
                "wysiwyg-color-purple": 1,
                "wysiwyg-color-red": 1,
                "wysiwyg-color-silver": 1,
                "wysiwyg-color-teal": 1,
                "wysiwyg-color-white": 1,
                "wysiwyg-color-yellow": 1,
                "wysiwyg-font-size-large": 1,
                "wysiwyg-font-size-larger": 1,
                "wysiwyg-font-size-medium": 1,
                "wysiwyg-font-size-small": 1,
                "wysiwyg-font-size-smaller": 1,
                "wysiwyg-font-size-x-large": 1,
                "wysiwyg-font-size-x-small": 1,
                "wysiwyg-font-size-xx-large": 1,
                "wysiwyg-font-size-xx-small": 1
            }
        }
    },

    "comments": 1, // if set allows comments to pass
    
    /**
     * Tag list
     *
     * The following options are available:
     *
     *    - add_class:        converts and deletes the given HTML4 attribute (align, clear, ...) via the given method to a css class
     *                        The following methods are implemented in wysihtml.dom.parse:
     *                          - align_text:  converts align attribute values (right/left/center/justify) to their corresponding css class "wysiwyg-text-align-*")
     *                            <p align="center">foo</p> ... becomes ... <p> class="wysiwyg-text-align-center">foo</p>
     *                          - clear_br:    converts clear attribute values left/right/all/both to their corresponding css class "wysiwyg-clear-*"
     *                            <br clear="all"> ... becomes ... <br class="wysiwyg-clear-both">
     *                          - align_img:    converts align attribute values (right/left) on <img> to their corresponding css class "wysiwyg-float-*"
     *                          
     *    - remove:             removes the element and its content
     *
     *    - unwrap              removes element but leaves content
     *
     *    - rename_tag:         renames the element to the given tag
     *
     *    - set_class:          adds the given class to the element (note: make sure that the class is in the "classes" white list above)
     *
     *    - set_attributes:     sets/overrides the given attributes
     *
     *    - check_attributes:   checks the given HTML attribute via the given method
     *                            - url:            allows only valid urls (starting with http:// or https://)
     *                            - src:            allows something like "/foobar.jpg", "http://google.com", ...
     *                            - href:           allows something like "mailto:bert@foo.com", "http://google.com", "/foobar.jpg"
     *                            - alt:            strips unwanted characters. if the attribute is not set, then it gets set (to ensure valid and compatible HTML)
     *                            - numbers:        ensures that the attribute only contains numeric (integer) characters (no float values or units)
     *                            - dimension:      for with/height attributes where floating point numbrs and percentages are allowed
     *                            - any:            allows anything to pass 
     */
    "tags": {
        "tr": {
            "add_style": {
                "align": "align_text"
            },
            "check_attributes": {
                "id": "any"
            }
        },
        "strike": {
            "unwrap": 1
        },
        "form": {
            "unwrap": 1
        },
        "rt": {
            "rename_tag": "span"
        },
        "code": {},
        "acronym": {
            "rename_tag": "span"
        },
        "br": {
            "add_class": {
                "clear": "clear_br"
            }
        },
        "details": {
            "unwrap": 1
        },
        "h4": wysihtmlParserRulesDefaults.blockLevelEl,
        "em": {},
        "title": {
            "remove": 1
        },
        "multicol": {
            "unwrap": 1
        },
        "figure": {
            "unwrap": 1
        },
        "xmp": {
            "unwrap": 1
        },
        "small": {
            "rename_tag": "span",
            "set_class": "wysiwyg-font-size-smaller"
        },
        "area": {
            "remove": 1
        },
        "time": {
            "unwrap": 1
        },
        "dir": {
            "rename_tag": "ul"
        },
        "bdi": {
            "unwrap": 1
        },
        "command": {
            "unwrap": 1
        },
        "ul": {
            "check_attributes": {
                "id": "any"
            }
        },
        "progress": {
            "rename_tag": "span"
        },
        "dfn": {
            "unwrap": 1
        },
        "iframe": {
            "check_attributes": {
                "src": "any",
                "width": "any",
                "height": "any",
                "frameborder": "any",
                "style": "any",
                "id": "any"
            }
        },
        "figcaption": {
            "unwrap": 1
        },
        "a": {
            "check_attributes": {
                "href": "href", // if you compiled master manually then change this from 'url' to 'href'
                "rel": "any",
                "target": "any",
                "id": "any"
            }
        },
        "img": {
            "one_of_type": {
                "valid_image_src": 1
            },
            "check_attributes": {
                "width": "dimension",
                "alt": "alt",
                "src": "src", // if you compiled master manually then change this from 'url' to 'src'
                "height": "dimension",
                "id": "any"
            },
            "add_class": {
                "align": "align_img"
            }
        },
        "rb": {
            "unwrap": 1
        },
        "footer": wysihtmlParserRulesDefaults.makeDiv,
        "noframes": {
            "remove": 1
        },
        "abbr": {
            "unwrap": 1
        },
        "u": {},
        "bgsound": {
            "remove": 1
        },
        "sup": {},
        "address": {
            "unwrap": 1
        },
        "basefont": {
            "remove": 1
        },
        "nav": {
            "unwrap": 1
        },
        "h1": wysihtmlParserRulesDefaults.blockLevelEl,
        "head": {
            "unwrap": 1
        },
        "tbody": wysihtmlParserRulesDefaults.blockLevelEl,
        "dd": {
            "unwrap": 1
        },
        "s": {
            "unwrap": 1
        },
        "li": {},
        "td": {
            "check_attributes": {
                "rowspan": "numbers",
                "colspan": "numbers",
                "valign": "any",
                "align": "any",
                "id": "any",
                "class": "any"
            },
            "keep_styles": {
                "backgroundColor": 1,
                "width": 1,
                "height": 1
            },
            "add_style": {
                "align": "align_text"
            }
        },
        "object": {
            "remove": 1
        },
        
        "div": {
            "one_of_type": {
                "alignment_object": 1
            },
            "remove_action": "unwrap",
            "keep_styles": {
                "textAlign": 1,
                "float": 1
            },
            "add_style": {
                "align": "align_text"
            },
            "check_attributes": {
                "id": "any",
                "contenteditable": "any"
            }
        },
        
        "option": {
            "remove":1
        },
        "select": {
            "remove":1
        },
        "i": {},
        "track": {
            "remove": 1
        },
        "wbr": {
            "remove": 1
        },
        "fieldset": {
            "unwrap": 1
        },
        "big": {
            "rename_tag": "span",
            "set_class": "wysiwyg-font-size-larger"
        },
        "button": {
            "unwrap": 1
        },
        "noscript": {
            "remove": 1
        },
        "svg": {
            "remove": 1
        },
        "input": {
            "remove": 1
        },
        "table": {
            "keep_styles": {
                "width": 1,
                "textAlign": 1,
                "float": 1
            },
            "check_attributes": {
                "id": "any"
            }
        },
        "keygen": {
            "remove": 1
        },
        "h5": wysihtmlParserRulesDefaults.blockLevelEl,
        "meta": {
            "remove": 1
        },
        "map": {
            "remove": 1
        },
        "isindex": {
            "remove": 1
        },
        "mark": {
            "unwrap": 1
        },
        "caption": wysihtmlParserRulesDefaults.blockLevelEl,
        "tfoot": wysihtmlParserRulesDefaults.blockLevelEl,
        "base": {
            "remove": 1
        },
        "video": {
            "remove": 1
        },
        "strong": {},
        "canvas": {
            "remove": 1
        },
        "output": {
            "unwrap": 1
        },
        "marquee": {
            "unwrap": 1
        },
        "b": {},
        "q": {
            "check_attributes": {
                "cite": "url",
                "id": "any"
            }
        },
        "applet": {
            "remove": 1
        },
        "span": {
            "one_of_type": {
                "text_formatting_object": 1,
                "text_color_object": 1,
                "text_fontsize_object": 1
            },
            "keep_styles": {
                "color": 1,
                "backgroundColor": 1,
                "fontSize": 1
            },
            "remove_action": "unwrap",
            "check_attributes": {
                "id": "any"
            }
        },
        "rp": {
            "unwrap": 1
        },
        "spacer": {
            "remove": 1
        },
        "source": {
            "remove": 1
        },
        "aside": wysihtmlParserRulesDefaults.makeDiv,
        "frame": {
            "remove": 1
        },
        "section": wysihtmlParserRulesDefaults.makeDiv,
        "body": {
            "unwrap": 1
        },
        "ol": {},
        "nobr": {
            "unwrap": 1
        },
        "html": {
            "unwrap": 1
        },
        "summary": {
            "unwrap": 1
        },
        "var": {
            "unwrap": 1
        },
        "del": {
            "unwrap": 1
        },
        "blockquote": {
            "keep_styles": {
                "textAlign": 1,
                "float": 1
            },
            "add_style": {
                "align": "align_text"
            },
            "check_attributes": {
                "cite": "url",
                "id": "any"
            }
        },
        "style": {
            "check_attributes": {
                "type": "any",
                "src": "any",
                "charset": "any"
            }
        },
        "device": {
            "remove": 1
        },
        "meter": {
            "unwrap": 1
        },
        "h3": wysihtmlParserRulesDefaults.blockLevelEl,
        "textarea": {
            "unwrap": 1
        },
        "embed": {
            "remove": 1
        },
        "hgroup": {
            "unwrap": 1
        },
        "font": {
            "rename_tag": "span",
            "add_class": {
                "size": "size_font"
            }
        },
        "tt": {
            "unwrap": 1
        },
        "noembed": {
            "remove": 1
        },
        "thead": {
            "add_style": {
                "align": "align_text"
            },
            "check_attributes": {
                "id": "any"
            }
        },
        "blink": {
            "unwrap": 1
        },
        "plaintext": {
            "unwrap": 1
        },
        "xml": {
            "remove": 1
        },
        "h6": wysihtmlParserRulesDefaults.blockLevelEl,
        "param": {
            "remove": 1
        },
        "th": {
            "check_attributes": {
                "rowspan": "numbers",
                "colspan": "numbers",
                "valign": "any",
                "align": "any",
                "id": "any"
            },
            "keep_styles": {
                "backgroundColor": 1,
                "width": 1,
                "height": 1
            },
            "add_style": {
                "align": "align_text"
            }
        },
        "legend": {
            "unwrap": 1
        },
        "hr": {},
        "label": {
            "unwrap": 1
        },
        "dl": {
            "unwrap": 1
        },
        "kbd": {
            "unwrap": 1
        },
        "listing": {
            "unwrap": 1
        },
        "dt": {
            "unwrap": 1
        },
        "nextid": {
            "remove": 1
        },
        "pre": {},
        "center": wysihtmlParserRulesDefaults.makeDiv,
        "audio": {
            "remove": 1
        },
        "datalist": {
            "unwrap": 1
        },
        "samp": {
            "unwrap": 1
        },
        "col": {
            "remove": 1
        },
        "article": wysihtmlParserRulesDefaults.makeDiv,
        "cite": {},
        "link": {
            "remove": 1
        },
        "script": {
            "check_attributes": {
                "type": "any",
                "src": "any",
                "charset": "any"
            }
        },
        "bdo": {
            "unwrap": 1
        },
        "menu": {
            "rename_tag": "ul"
        },
        "colgroup": {
            "remove": 1
        },
        "ruby": {
            "unwrap": 1
        },
        "h2": wysihtmlParserRulesDefaults.blockLevelEl,
        "ins": {
            "unwrap": 1
        },
        "p": wysihtmlParserRulesDefaults.blockLevelEl,
        "sub": {},
        "comment": {
            "remove": 1
        },
        "frameset": {
            "remove": 1
        },
        "optgroup": {
            "unwrap": 1
        },
        "header": wysihtmlParserRulesDefaults.makeDiv
    }
};


(function() {
    // Paste cleanup rules universal for all rules (also applied to content copied from editor)
    var commonRules = wysihtml.lang.object(wysihtmlParserRules).clone(true);
    commonRules.comments    = false;
    commonRules.selectors   = { "a u": "unwrap"};
    commonRules.tags.style  = { "remove": 1 };
    commonRules.tags.script = { "remove": 1 };
    commonRules.tags.head = { "remove": 1 };
    
    // Paste cleanup for unindentified source
    var universalRules = wysihtml.lang.object(commonRules).clone(true);
    universalRules.tags.div.one_of_type.alignment_object = 1;
    universalRules.tags.div.remove_action = "unwrap";
    universalRules.tags.div.check_attributes.style = false;
    universalRules.tags.div.keep_styles = {
        "textAlign": /^((left)|(right)|(center)|(justify))$/i,
        "float": 1
    };
    universalRules.tags.span.keep_styles = false;

    // Paste cleanup for MS Office
    // TODO: should be extended to stricter ruleset, as current set will probably not cover all Office bizarreness
    var msOfficeRules = wysihtml.lang.object(universalRules).clone(true);
    msOfficeRules.classes = {};

    window.wysihtmlParserPasteRulesets = [
        {
            condition: /<font face="Times New Roman"|class="?Mso|style="[^"]*\bmso-|style='[^'']*\bmso-|w:WordDocument|class="OutlineElement|id="?docs\-internal\-guid\-/i,
            set: msOfficeRules
        },{
            condition: /<meta name="copied-from" content="wysihtml">/i,
            set: commonRules
        },{
            set: universalRules
        }
    ];

})();
