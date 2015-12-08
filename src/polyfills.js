wysihtml5.polyfills = function(win, doc) {

  // TODO: in future try to replace most inline compability checks with polyfills for code readability 

  // IE8 SUPPORT BLOCK
  // You can compile without all this if IE8 is not needed

  // String trim for ie8
  if (!String.prototype.trim) {
    (function() {
      // Make sure we trim BOM and NBSP
      var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
      String.prototype.trim = function() {
        return this.replace(rtrim, '');
      };
    })();
  }

  // addEventListener, removeEventListener
  (function() {
    var s_add = 'addEventListener',
        s_rem = 'removeEventListener';
    if( doc[s_add] ) return;
    win.Element.prototype[ s_add ] = win[ s_add ] = doc[ s_add ] = function( on, fn, self ) {
      return (self = this).attachEvent( 'on' + on, function(e){
        var e = e || win.event;
        e.target = e.target || e.srcElement;
        e.preventDefault  = e.preventDefault  || function(){e.returnValue = false};
        e.stopPropagation = e.stopPropagation || function(){e.cancelBubble = true};
        e.which = e.button ? ( e.button === 2 ? 3 : e.button === 4 ? 2 : e.button ) : e.keyCode;
        fn.call(self, e);
      });
    };
    win.Element.prototype[ s_rem ] = win[ s_rem ] = doc[ s_rem ] = function( on, fn ) {
      return this.detachEvent( 'on' + on, fn );
    };
  })();

  // element.textContent polyfill.
  if (Object.defineProperty && Object.getOwnPropertyDescriptor && Object.getOwnPropertyDescriptor(win.Element.prototype, "textContent") && !Object.getOwnPropertyDescriptor(win.Element.prototype, "textContent").get) {
    (function() {
      var innerText = Object.getOwnPropertyDescriptor(win.Element.prototype, "innerText");
      Object.defineProperty(win.Element.prototype, "textContent",
        {
          get: function() {
            return innerText.get.call(this);
          },
          set: function(s) {
            return innerText.set.call(this, s);
          }
        }
      );
    })();
  }

  // isArray polyfill for ie8
  if(!Array.isArray) {
    Array.isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    };
  }

  // Array indexOf for ie8
  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(a,f) {
      for(var c=this.length,r=-1,d=f>>>0; ~(c-d); r=this[--c]===a?c:r);
      return r;
    };
  }

  // Function.prototype.bind()
  // TODO: clean the code from variable 'that' as it can be confusing
  if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs   = Array.prototype.slice.call(arguments, 1),
          fToBind = this,
          fNOP    = function() {},
          fBound  = function() {
            return fToBind.apply(this instanceof fNOP && oThis
                   ? this
                   : oThis,
                   aArgs.concat(Array.prototype.slice.call(arguments)));
          };

      fNOP.prototype = this.prototype;
      fBound.prototype = new fNOP();

      return fBound;
    };
  }

  // closest and matches polyfill
  // https://github.com/jonathantneal/closest
  (function (ELEMENT) {
    ELEMENT.matches = ELEMENT.matches || ELEMENT.mozMatchesSelector || ELEMENT.msMatchesSelector || ELEMENT.oMatchesSelector || ELEMENT.webkitMatchesSelector || function matches(selector) {
      var
      element = this,
      elements = (element.document || element.ownerDocument).querySelectorAll(selector),
      index = 0;

      while (elements[index] && elements[index] !== element) {
        ++index;
      }

      return elements[index] ? true : false;
    };

    ELEMENT.closest = ELEMENT.closest || function closest(selector) {
      var element = this;

      while (element) {
        if (element.matches(selector)) {
          break;
        }

        element = element.parentElement;
      }

      return element;
    };
  }(Element.prototype));

  // Element.classList for ie8-9 (toggle all IE)
  // source http://purl.eligrey.com/github/classList.js/blob/master/classList.js

  if ("document" in win) {
    // Full polyfill for browsers with no classList support
    if (!("classList" in doc.createElement("_"))) {
      (function(view) {
        "use strict";
        if (!('Element' in view)) return;

        var
          classListProp = "classList",
          protoProp = "prototype",
          elemCtrProto = view.Element[protoProp],
          objCtr = Object,
          strTrim = String[protoProp].trim || function() {
            return this.replace(/^\s+|\s+$/g, "");
          },
          arrIndexOf = Array[protoProp].indexOf || function(item) {
            var
              i = 0,
              len = this.length;
            for (; i < len; i++) {
              if (i in this && this[i] === item) {
                return i;
              }
            }
            return -1;
          }, // Vendors: please allow content code to instantiate DOMExceptions
          DOMEx = function(type, message) {
            this.name = type;
            this.code = DOMException[type];
            this.message = message;
          },
          checkTokenAndGetIndex = function(classList, token) {
            if (token === "") {
              throw new DOMEx(
                "SYNTAX_ERR", "An invalid or illegal string was specified"
              );
            }
            if (/\s/.test(token)) {
              throw new DOMEx(
                "INVALID_CHARACTER_ERR", "String contains an invalid character"
              );
            }
            return arrIndexOf.call(classList, token);
          },
          ClassList = function(elem) {
            var
              trimmedClasses = strTrim.call(elem.getAttribute("class") || ""),
              classes = trimmedClasses ? trimmedClasses.split(/\s+/) : [],
              i = 0,
              len = classes.length;
            for (; i < len; i++) {
              this.push(classes[i]);
            }
            this._updateClassName = function() {
              elem.setAttribute("class", this.toString());
            };
          },
          classListProto = ClassList[protoProp] = [],
          classListGetter = function() {
            return new ClassList(this);
          };
        // Most DOMException implementations don't allow calling DOMException's toString()
        // on non-DOMExceptions. Error's toString() is sufficient here.
        DOMEx[protoProp] = Error[protoProp];
        classListProto.item = function(i) {
          return this[i] || null;
        };
        classListProto.contains = function(token) {
          token += "";
          return checkTokenAndGetIndex(this, token) !== -1;
        };
        classListProto.add = function() {
          var
            tokens = arguments,
            i = 0,
            l = tokens.length,
            token, updated = false;
          do {
            token = tokens[i] + "";
            if (checkTokenAndGetIndex(this, token) === -1) {
              this.push(token);
              updated = true;
            }
          }
          while (++i < l);

          if (updated) {
            this._updateClassName();
          }
        };
        classListProto.remove = function() {
          var
            tokens = arguments,
            i = 0,
            l = tokens.length,
            token, updated = false,
            index;
          do {
            token = tokens[i] + "";
            index = checkTokenAndGetIndex(this, token);
            while (index !== -1) {
              this.splice(index, 1);
              updated = true;
              index = checkTokenAndGetIndex(this, token);
            }
          }
          while (++i < l);

          if (updated) {
            this._updateClassName();
          }
        };
        classListProto.toggle = function(token, force) {
          token += "";

          var
            result = this.contains(token),
            method = result ?
            force !== true && "remove" :
            force !== false && "add";

          if (method) {
            this[method](token);
          }

          if (force === true || force === false) {
            return force;
          } else {
            return !result;
          }
        };
        classListProto.toString = function() {
          return this.join(" ");
        };

        if (objCtr.defineProperty) {
          var classListPropDesc = {
            get: classListGetter,
            enumerable: true,
            configurable: true
          };
          try {
            objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
          } catch (ex) { // IE 8 doesn't support enumerable:true
            if (ex.number === -0x7FF5EC54) {
              classListPropDesc.enumerable = false;
              objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
            }
          }
        } else if (objCtr[protoProp].__defineGetter__) {
          elemCtrProto.__defineGetter__(classListProp, classListGetter);
        }

      }(win));

    } else if ("DOMTokenList" in win) {
      // There is full or partial native classList support, so just check if we need
      // to normalize the add/remove and toggle APIs.
      // DOMTokenList is expected to exist (removes conflicts with multiple polyfills present on site)

      (function() {
        "use strict";

        var testElement = doc.createElement("_");

        testElement.classList.add("c1", "c2");

        // Polyfill for IE 10/11 and Firefox <26, where classList.add and
        // classList.remove exist but support only one argument at a time.
        if (!testElement.classList.contains("c2")) {
          var createMethod = function(method) {
            var original = win.DOMTokenList.prototype[method];

            win.DOMTokenList.prototype[method] = function(token) {
              var i, len = arguments.length;

              for (i = 0; i < len; i++) {
                token = arguments[i];
                original.call(this, token);
              }
            };
          };
          createMethod('add');
          createMethod('remove');
        }

        testElement.classList.toggle("c3", false);

        // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
        // support the second argument.
        if (testElement.classList.contains("c3")) {
          var _toggle = win.DOMTokenList.prototype.toggle;

          win.DOMTokenList.prototype.toggle = function(token, force) {
            if (1 in arguments && !this.contains(token) === !force) {
              return force;
            } else {
              return _toggle.call(this, token);
            }
          };

        }

        testElement = null;
      }());

    }

  }

  // Safary has a bug of not restoring selection after node.normalize correctly.
  // Detects the misbegaviour and patches it
  var normalizeHasCaretError = function() {
    if ("createRange" in document && "getSelection" in window) {
      var e = document.createElement('div'),
          t1 = document.createTextNode('a'),
          t2 = document.createTextNode('a'),
          t3 = document.createTextNode('a'),
          r = document.createRange(),
          s, ret;

      e.setAttribute('contenteditable', 'true');
      e.appendChild(t1);
      e.appendChild(t2);
      e.appendChild(t3);
      document.body.appendChild(e);
      r.setStart(t2, 1);
      r.setEnd(t2, 1);

      s = window.getSelection();
      s.removeAllRanges();
      s.addRange(r);
      e.normalize();
      s = window.getSelection();

      ret = (e.childNodes.length !== 1 || s.anchorNode !== e.firstChild || s.anchorOffset !== 2);
      e.parentNode.removeChild(e);
      s.removeAllRanges();
      return ret;
    }
  };

  var getTextNodes = function(node){
    var all = [];
    for (node=node.firstChild;node;node=node.nextSibling){
      if (node.nodeType == 3) {
          all.push(node);
      } else {
        all = all.concat(getTextNodes(node));
      }
    }
    return all;
  };

  var isInDom = function(node) {
    var doc = node.ownerDocument,
        n = node;

    do {
      if (n === doc) {
        return true;
      }
      n = n.parentNode;
    } while(n);

    return false;
  };

  var normalizeFix = function() {
    var f = Node.prototype.normalize;
    var nf = function() {
      var texts = getTextNodes(this),
          s = this.ownerDocument.defaultView.getSelection(),
          anode = s.anchorNode,
          aoffset = s.anchorOffset,
          aelement = anode && anode.nodeType === 1 && anode.childNodes.length > 0 ? anode.childNodes[aoffset] : undefined,
          fnode = s.focusNode,
          foffset = s.focusOffset,
          felement = fnode && fnode.nodeType === 1 && foffset > 0 ? fnode.childNodes[foffset -1] : undefined,
          r = this.ownerDocument.createRange(),
          prevTxt = texts.shift(),
          curText = prevTxt ? texts.shift() : null;

      if (felement && felement.nodeType === 3) {
        fnode = felement;
        foffset = felement.nodeValue.length;
        felement = undefined;
      }

      if (aelement && aelement.nodeType === 3) {
        anode = aelement;
        aoffset = 0;
        aelement = undefined;
      }

      if ((anode === fnode && foffset < aoffset) || (anode !== fnode && (anode.compareDocumentPosition(fnode) & Node.DOCUMENT_POSITION_PRECEDING) && !(anode.compareDocumentPosition(fnode) & Node.DOCUMENT_POSITION_CONTAINS))) {
        fnode = [anode, anode = fnode][0];
        foffset = [aoffset, aoffset = foffset][0];
      }

      while(prevTxt && curText) {
        if (curText.previousSibling && curText.previousSibling === prevTxt) {
          if (anode === curText) {
            anode = prevTxt;
            aoffset = prevTxt.nodeValue.length +  aoffset;
          }
          if (fnode === curText) {
            fnode = prevTxt;
            foffset = prevTxt.nodeValue.length +  foffset;
          }
          prevTxt.nodeValue = prevTxt.nodeValue + curText.nodeValue;
          curText.parentNode.removeChild(curText);
          curText = texts.shift();
        } else {
          prevTxt = curText;
          curText = texts.shift();
        }
      }

      if (felement) {
        foffset = Array.prototype.indexOf.call(felement.parentNode.childNodes, felement) + 1;
      }

      if (aelement) {
        aoffset = Array.prototype.indexOf.call(aelement.parentNode.childNodes, aelement);
      }

      if (isInDom(this) && anode && anode.parentNode && fnode && fnode.parentNode) {
        r.setStart(anode, aoffset);
        r.setEnd(fnode, foffset);
        s.removeAllRanges();
        s.addRange(r);
      }
    };
    Node.prototype.normalize = nf;
  };
  
  var F = function() {
    window.removeEventListener("load", F);
    if ("Node" in window && "normalize" in Node.prototype && normalizeHasCaretError()) {
      normalizeFix();
    }
  };
  
  if (doc.readyState !== "complete") {
    window.addEventListener("load", F);
  } else {
    F();
  }

  // CustomEvent for ie9 and up
  function nativeCustomEventSupported() {
    try {
      var p = new CustomEvent('cat', {detail: {foo: 'bar'}});
      return  'cat' === p.type && 'bar' === p.detail.foo;
    } catch (e) {}
    return false;
  }
  var customEventSupported = nativeCustomEventSupported();

  // Polyfills CustomEvent object for IE9 and up
  (function() {
    if (!customEventSupported && "CustomEvent" in window) {
      function CustomEvent(event, params) {
        params = params || {bubbles: false, cancelable: false, detail: undefined};
        var evt = doc.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
      }
      CustomEvent.prototype = win.Event.prototype;
      win.CustomEvent = CustomEvent;
      customEventSupported = true;
    }
  })();
};

wysihtml5.polyfills(window, document);
