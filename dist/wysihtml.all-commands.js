;(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define('wysihtml.all-commands', ['wysihtml'], factory);
    } else if(typeof exports == 'object') {
        factory(require('wysihtml'));
    } else {
        factory(window.wysihtml);
    }
}(function(wysihtml) {

/*
	Base.js, version 1.1a
	Copyright 2006-2010, Dean Edwards
	License: http://www.opensource.org/licenses/mit-license.php
*/

var Base = function() {
	// dummy
};

Base.extend = function(_instance, _static) { // subclass
	var extend = Base.prototype.extend;
	
	// build the prototype
	Base._prototyping = true;
	var proto = new this;
	extend.call(proto, _instance);
  proto.base = function() {
    // call this method from any other method to invoke that method's ancestor
  };
	delete Base._prototyping;
	
	// create the wrapper for the constructor function
	//var constructor = proto.constructor.valueOf(); //-dean
	var constructor = proto.constructor;
	var klass = proto.constructor = function() {
		if (!Base._prototyping) {
			if (this._constructing || this.constructor == klass) { // instantiation
				this._constructing = true;
				constructor.apply(this, arguments);
				delete this._constructing;
			} else if (arguments[0] != null) { // casting
				return (arguments[0].extend || extend).call(arguments[0], proto);
			}
		}
	};
	
	// build the class interface
	klass.ancestor = this;
	klass.extend = this.extend;
	klass.forEach = this.forEach;
	klass.implement = this.implement;
	klass.prototype = proto;
	klass.toString = this.toString;
	klass.valueOf = function(type) {
		//return (type == "object") ? klass : constructor; //-dean
		return (type == "object") ? klass : constructor.valueOf();
	};
	extend.call(klass, _static);
	// class initialisation
	if (typeof klass.init == "function") klass.init();
	return klass;
};

Base.prototype = {	
	extend: function(source, value) {
		if (arguments.length > 1) { // extending with a name/value pair
			var ancestor = this[source];
			if (ancestor && (typeof value == "function") && // overriding a method?
				// the valueOf() comparison is to avoid circular references
				(!ancestor.valueOf || ancestor.valueOf() != value.valueOf()) &&
				/\bbase\b/.test(value)) {
				// get the underlying method
				var method = value.valueOf();
				// override
				value = function() {
					var previous = this.base || Base.prototype.base;
					this.base = ancestor;
					var returnValue = method.apply(this, arguments);
					this.base = previous;
					return returnValue;
				};
				// point to the underlying method
				value.valueOf = function(type) {
					return (type == "object") ? value : method;
				};
				value.toString = Base.toString;
			}
			this[source] = value;
		} else if (source) { // extending with an object literal
			var extend = Base.prototype.extend;
			// if this object has a customised extend method then use it
			if (!Base._prototyping && typeof this != "function") {
				extend = this.extend || extend;
			}
			var proto = {toSource: null};
			// do the "toString" and other methods manually
			var hidden = ["constructor", "toString", "valueOf"];
			// if we are prototyping then include the constructor
			var i = Base._prototyping ? 0 : 1;
			while (key = hidden[i++]) {
				if (source[key] != proto[key]) {
					extend.call(this, key, source[key]);

				}
			}
			// copy each of the source object's properties to this object
			for (var key in source) {
				if (!proto[key]) extend.call(this, key, source[key]);
			}
		}
		return this;
	}
};

// initialise
Base = Base.extend({
	constructor: function() {
		this.extend(arguments[0]);
	}
}, {
	ancestor: Object,
	version: "1.1",
	
	forEach: function(object, block, context) {
		for (var key in object) {
			if (this.prototype[key] === undefined) {
				block.call(context, object[key], key, object);
			}
		}
	},
		
	implement: function() {
		for (var i = 0; i < arguments.length; i++) {
			if (typeof arguments[i] == "function") {
				// if it's a function, call it
				arguments[i](this.prototype);
			} else {
				// add the interface using the extend method
				this.prototype.extend(arguments[i]);
			}
		}
		return this;
	},
	
	toString: function() {
		return String(this.valueOf());
	}
});
wysihtml.commands.alignCenterStyle = (function() {
  var nodeOptions = {
    styleProperty: "textAlign",
    styleValue: "center",
    toggle: true
  };
  
  return {
    exec: function(composer, command) {
      return wysihtml.commands.formatBlock.exec(composer, "formatBlock", nodeOptions);
    },

    state: function(composer, command) {
      return wysihtml.commands.formatBlock.state(composer, "formatBlock", nodeOptions);
    }
  };
})();

wysihtml.commands.alignJustifyStyle = (function() {
  var nodeOptions = {
    styleProperty: "textAlign",
    styleValue: "justify",
    toggle: true
  };

  return {
    exec: function(composer, command) {
      return wysihtml.commands.formatBlock.exec(composer, "formatBlock", nodeOptions);
    },

    state: function(composer, command) {
      return wysihtml.commands.formatBlock.state(composer, "formatBlock", nodeOptions);
    }
  };
})();

wysihtml.commands.alignLeftStyle = (function() {
  var nodeOptions = {
    styleProperty: "textAlign",
    styleValue: "left",
    toggle: true
  };

  return {
    exec: function(composer, command) {
      return wysihtml.commands.formatBlock.exec(composer, "formatBlock", nodeOptions);
    },

    state: function(composer, command) {
      return wysihtml.commands.formatBlock.state(composer, "formatBlock", nodeOptions);
    }
  };
})();

wysihtml.commands.alignRightStyle = (function() {
  var nodeOptions = {
    styleProperty: "textAlign",
    styleValue: "right",
    toggle: true
  };

  return {
    exec: function(composer, command) {
      return wysihtml.commands.formatBlock.exec(composer, "formatBlock", nodeOptions);
    },

    state: function(composer, command) {
      return wysihtml.commands.formatBlock.state(composer, "formatBlock", nodeOptions);
    }
  };
})();

/* Sets text background color by inline styles */
wysihtml.commands.bgColorStyle = (function() {
  return {
    exec: function(composer, command, color) {
      var colorVals  = wysihtml.quirks.styleParser.parseColor("background-color:" + (color.color || color), "background-color"),
          colString;

      if (colorVals) {
        colString = (colorVals[3] === 1 ? "rgb(" + [colorVals[0], colorVals[1], colorVals[2]].join(', ') : "rgba(" + colorVals.join(', ')) + ')';
        wysihtml.commands.formatInline.exec(composer, command, {styleProperty: 'backgroundColor', styleValue: colString});
      }
    },

    state: function(composer, command, color) {
      var colorVals  = color ? wysihtml.quirks.styleParser.parseColor("background-color:" + (color.color || color), "background-color") : null,
          colString;

      if (colorVals) {
        colString = (colorVals[3] === 1 ? "rgb(" + [colorVals[0], colorVals[1], colorVals[2]].join(', ') : "rgba(" + colorVals.join(', ')) + ')';
      }

      return wysihtml.commands.formatInline.state(composer, command, {styleProperty: 'backgroundColor', styleValue: colString});
    },

    remove: function(composer, command) {
      return wysihtml.commands.formatInline.remove(composer, command, {styleProperty: 'backgroundColor'});
    },

    stateValue: function(composer, command, props) {
      var st = this.state(composer, command),
          colorStr,
          val = false;

      if (st && wysihtml.lang.object(st).isArray()) {
        st = st[0];
      }

      if (st) {
        colorStr = st.getAttribute('style');
        if (colorStr) {
          val = wysihtml.quirks.styleParser.parseColor(colorStr, "background-color");
          return wysihtml.quirks.styleParser.unparseColor(val, props);
        }
      }
      return false;
    }
  };
})();

wysihtml.commands.bold = (function() {
  var nodeOptions = {
    nodeName: "B",
    toggle: true
  };
  
  return {
    exec: function(composer, command) {
      wysihtml.commands.formatInline.exec(composer, command, nodeOptions);
    },

    state: function(composer, command) {
      return wysihtml.commands.formatInline.state(composer, command, nodeOptions);
    }
  };
})();

/* Formats block for as a <pre><code class="classname"></code></pre> block
 * Useful in conjuction for sytax highlight utility: highlight.js
 *
 * Usage:
 *
 * editorInstance.composer.commands.exec("formatCode", "language-html");
*/
wysihtml.commands.formatCode = (function() {
  return {
    exec: function(composer, command, classname) {
      var pre = this.state(composer)[0],
          code, range, selectedNodes;

      if (pre) {
        // caret is already within a <pre><code>...</code></pre>
        composer.selection.executeAndRestore(function() {
          code = pre.querySelector("code");
          wysihtml.dom.replaceWithChildNodes(pre);
          if (code) {
            wysihtml.dom.replaceWithChildNodes(code);
          }
        });
      } else {
        // Wrap in <pre><code>...</code></pre>
        range = composer.selection.getRange();
        selectedNodes = range.extractContents();
        pre = composer.doc.createElement("pre");
        code = composer.doc.createElement("code");

        if (classname) {
          code.className = classname;
        }

        pre.appendChild(code);
        code.appendChild(selectedNodes);
        range.insertNode(pre);
        composer.selection.selectNode(pre);
      }
    },

    state: function(composer) {
      var selectedNode = composer.selection.getSelectedNode(), node;
      if (selectedNode && selectedNode.nodeName && selectedNode.nodeName == "PRE"&&
          selectedNode.firstChild && selectedNode.firstChild.nodeName && selectedNode.firstChild.nodeName == "CODE") {
        return [selectedNode];
      } else {
        node = wysihtml.dom.getParentElement(selectedNode, { query: "pre code" });
        return node ? [node.parentNode] : false;
      }
    }
  };
})();

/**
 * Inserts an <img>
 * If selection is already an image link, it removes it
 *
 * @example
 *    // either ...
 *    wysihtml.commands.insertImage.exec(composer, "insertImage", "http://www.google.de/logo.jpg");
 *    // ... or ...
 *    wysihtml.commands.insertImage.exec(composer, "insertImage", { src: "http://www.google.de/logo.jpg", title: "foo" });
 */
wysihtml.commands.insertImage = (function() {
  var NODE_NAME = "IMG";
  return {
    exec: function(composer, command, value) {
      value = typeof(value) === "object" ? value : { src: value };

      var doc     = composer.doc,
          image   = this.state(composer),
          textNode,
          parent;

      // If image is selected and src ie empty, set the caret before it and delete the image
      if (image && !value.src) {
        composer.selection.setBefore(image);
        parent = image.parentNode;
        parent.removeChild(image);

        // and it's parent <a> too if it hasn't got any other relevant child nodes
        wysihtml.dom.removeEmptyTextNodes(parent);
        if (parent.nodeName === "A" && !parent.firstChild) {
          composer.selection.setAfter(parent);
          parent.parentNode.removeChild(parent);
        }

        // firefox and ie sometimes don't remove the image handles, even though the image got removed
        wysihtml.quirks.redraw(composer.element);
        return;
      }

      // If image selected change attributes accordingly
      if (image) {
        for (var key in value) {
          if (value.hasOwnProperty(key)) {
            image.setAttribute(key === "className" ? "class" : key, value[key]);
          }
        }
        return;
      }

      // Otherwise lets create the image
      image = doc.createElement(NODE_NAME);

      for (var i in value) {
        image.setAttribute(i === "className" ? "class" : i, value[i]);
      }

      composer.selection.insertNode(image);
      if (wysihtml.browser.hasProblemsSettingCaretAfterImg()) {
        textNode = doc.createTextNode(wysihtml.INVISIBLE_SPACE);
        composer.selection.insertNode(textNode);
        composer.selection.setAfter(textNode);
      } else {
        composer.selection.setAfter(image);
      }
    },

    state: function(composer) {
      var doc = composer.doc,
          selectedNode,
          text,
          imagesInSelection;

      if (!wysihtml.dom.hasElementWithTagName(doc, NODE_NAME)) {
        return false;
      }

      selectedNode = composer.selection.getSelectedNode();
      if (!selectedNode) {
        return false;
      }

      if (selectedNode.nodeName === NODE_NAME) {
        // This works perfectly in IE
        return selectedNode;
      }

      if (selectedNode.nodeType !== wysihtml.ELEMENT_NODE) {
        return false;
      }

      text = composer.selection.getText();
      text = wysihtml.lang.string(text).trim();
      if (text) {
        return false;
      }

      imagesInSelection = composer.selection.getNodes(wysihtml.ELEMENT_NODE, function(node) {
        return node.nodeName === "IMG";
      });

      if (imagesInSelection.length !== 1) {
        return false;
      }

      return imagesInSelection[0];
    }
  };
})();

wysihtml.commands.fontSize = (function() {
  var REG_EXP = /wysiwyg-font-size-[0-9a-z\-]+/g;

  return {
    exec: function(composer, command, size) {
      wysihtml.commands.formatInline.exec(composer, command, {className: "wysiwyg-font-size-" + size, classRegExp: REG_EXP, toggle: true});
    },

    state: function(composer, command, size) {
      return wysihtml.commands.formatInline.state(composer, command, {className: "wysiwyg-font-size-" + size});
    }
  };
})();

/* Set font size by inline style */
wysihtml.commands.fontSizeStyle = (function() {
  return {
    exec: function(composer, command, size) {
      size = size.size || size;
      if (!(/^\s*$/).test(size)) {
        wysihtml.commands.formatInline.exec(composer, command, {styleProperty: "fontSize", styleValue: size, toggle: false});
      }
    },

    state: function(composer, command, size) {
      return wysihtml.commands.formatInline.state(composer, command, {styleProperty: "fontSize", styleValue: size || undefined});
    },

    remove: function(composer, command) {
      return wysihtml.commands.formatInline.remove(composer, command, {styleProperty: "fontSize"});
    },

    stateValue: function(composer, command) {
      var styleStr,
          st = this.state(composer, command);

      if (st && wysihtml.lang.object(st).isArray()) {
          st = st[0];
      }
      if (st) {
        styleStr = st.getAttribute("style");
        if (styleStr) {
          return wysihtml.quirks.styleParser.parseFontSize(styleStr);
        }
      }
      return false;
    }
  };
})();

wysihtml.commands.foreColor = (function() {
  var REG_EXP = /wysiwyg-color-[0-9a-z]+/g;

  return {
    exec: function(composer, command, color) {
      wysihtml.commands.formatInline.exec(composer, command, {className: "wysiwyg-color-" + color, classRegExp: REG_EXP, toggle: true});
    },

    state: function(composer, command, color) {
      return wysihtml.commands.formatInline.state(composer, command, {className: "wysiwyg-color-" + color});
    }
  };
})();

/* Sets text color by inline styles */
wysihtml.commands.foreColorStyle = (function() {
  return {
    exec: function(composer, command, color) {
      var colorVals, colString;

      if (!color) { return; }

      colorVals = wysihtml.quirks.styleParser.parseColor("color:" + (color.color || color), "color");

      if (colorVals) {
        colString = (colorVals[3] === 1 ? "rgb(" + [colorVals[0], colorVals[1], colorVals[2]].join(", ") : "rgba(" + colorVals.join(', ')) + ')';
        wysihtml.commands.formatInline.exec(composer, command, {styleProperty: "color", styleValue: colString});
      }
    },

    state: function(composer, command, color) {
      var colorVals  = color ? wysihtml.quirks.styleParser.parseColor("color:" + (color.color || color), "color") : null,
          colString;


      if (colorVals) {
        colString = (colorVals[3] === 1 ? "rgb(" + [colorVals[0], colorVals[1], colorVals[2]].join(", ") : "rgba(" + colorVals.join(', ')) + ')';
      }

      return wysihtml.commands.formatInline.state(composer, command, {styleProperty: "color", styleValue: colString});
    },

    remove: function(composer, command) {
      return wysihtml.commands.formatInline.remove(composer, command, {styleProperty: "color"});
    },

    stateValue: function(composer, command, props) {
      var st = this.state(composer, command),
          colorStr,
          val = false;

      if (st && wysihtml.lang.object(st).isArray()) {
        st = st[0];
      }

      if (st) {
        colorStr = st.getAttribute("style");
        if (colorStr) {
          val = wysihtml.quirks.styleParser.parseColor(colorStr, "color");
          return wysihtml.quirks.styleParser.unparseColor(val, props);
        }
      }
      return false;
    }
  };
})();

wysihtml.commands.insertBlockQuote = (function() {
  var nodeOptions = {
    nodeName: "BLOCKQUOTE",
    toggle: true
  };
  
  return {
    exec: function(composer, command) {
      return wysihtml.commands.formatBlock.exec(composer, "formatBlock", nodeOptions);
    },

    state: function(composer, command) {
      return wysihtml.commands.formatBlock.state(composer, "formatBlock", nodeOptions);
    }
  };
})();

wysihtml.commands.insertOrderedList = (function() {
  return {
    exec: function(composer, command) {
      wysihtml.commands.insertList.exec(composer, command, "OL");
    },

    state: function(composer, command) {
      return wysihtml.commands.insertList.state(composer, command, "OL");
    }
  };
})();

wysihtml.commands.insertUnorderedList = (function() {
  return {
    exec: function(composer, command) {
      wysihtml.commands.insertList.exec(composer, command, "UL");
    },

    state: function(composer, command) {
      return wysihtml.commands.insertList.state(composer, command, "UL");
    }
  };
})();

wysihtml.commands.italic = (function() { 
  var nodeOptions = {
    nodeName: "I",
    toggle: true
  };

  return {
    exec: function(composer, command) {
      wysihtml.commands.formatInline.exec(composer, command, nodeOptions);
    },

    state: function(composer, command) {
      return wysihtml.commands.formatInline.state(composer, command, nodeOptions);
    }
  };

})();

wysihtml.commands.justifyCenter = (function() {
  var nodeOptions = {
    className: "wysiwyg-text-align-center",
    classRegExp: /wysiwyg-text-align-[0-9a-z]+/g,
    toggle: true
  };

  return {
    exec: function(composer, command) {
      return wysihtml.commands.formatBlock.exec(composer, "formatBlock", nodeOptions);
    },

    state: function(composer, command) {
      return wysihtml.commands.formatBlock.state(composer, "formatBlock", nodeOptions);
    }
  };
  
})();

wysihtml.commands.justifyFull = (function() {
  var nodeOptions = {
    className: "wysiwyg-text-align-justify",
    classRegExp: /wysiwyg-text-align-[0-9a-z]+/g,
    toggle: true
  };

  return {
    exec: function(composer, command) {
      return wysihtml.commands.formatBlock.exec(composer, "formatBlock", nodeOptions);
    },

    state: function(composer, command) {
      return wysihtml.commands.formatBlock.state(composer, "formatBlock", nodeOptions);
    }
  };
})();

wysihtml.commands.justifyLeft = (function() {
  var nodeOptions = {
    className: "wysiwyg-text-align-left",
    classRegExp: /wysiwyg-text-align-[0-9a-z]+/g,
    toggle: true
  };

  return {
    exec: function(composer, command) {
      return wysihtml.commands.formatBlock.exec(composer, "formatBlock", nodeOptions);
    },

    state: function(composer, command) {
      return wysihtml.commands.formatBlock.state(composer, "formatBlock", nodeOptions);
    }
  };
})();

wysihtml.commands.justifyRight = (function() {
  var nodeOptions = {
    className: "wysiwyg-text-align-right",
    classRegExp: /wysiwyg-text-align-[0-9a-z]+/g,
    toggle: true
  };

  return {
    exec: function(composer, command) {
      return wysihtml.commands.formatBlock.exec(composer, "formatBlock", nodeOptions);
    },

    state: function(composer, command) {
      return wysihtml.commands.formatBlock.state(composer, "formatBlock", nodeOptions);
    }
  };
})();

wysihtml.commands.subscript = (function() {
  var nodeOptions = {
    nodeName: "SUB",
    toggle: true
  };

  return {
    exec: function(composer, command) {
      wysihtml.commands.formatInline.exec(composer, command, nodeOptions);
    },

    state: function(composer, command) {
      return wysihtml.commands.formatInline.state(composer, command, nodeOptions);
    }
  };

})();

wysihtml.commands.superscript = (function() {
  var nodeOptions = {
    nodeName: "SUP",
    toggle: true
  };

  return {
    exec: function(composer, command) {
      wysihtml.commands.formatInline.exec(composer, command, nodeOptions);
    },

    state: function(composer, command) {
      return wysihtml.commands.formatInline.state(composer, command, nodeOptions);
    }
  };

})();

wysihtml.commands.underline = (function() {
  var nodeOptions = {
    nodeName: "U",
    toggle: true
  };

  return {
    exec: function(composer, command) {
      wysihtml.commands.formatInline.exec(composer, command, nodeOptions);
    },

    state: function(composer, command) {
      return wysihtml.commands.formatInline.state(composer, command, nodeOptions);
    }
  };

})();

}));
