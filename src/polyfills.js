wysihtml.polyfills = function(win, doc) {

  // TODO: in future try to replace most inline compability checks with polyfills for code readability 

  // closest, matches, and remove polyfill
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

    ELEMENT.remove = ELEMENT.remove || function remove() {
      if (this.parentNode) {
        this.parentNode.removeChild(this);
      }
    };

  }(win.Element.prototype));

  if (!('classList' in doc.documentElement) && win.Object.defineProperty && typeof HTMLElement !== 'undefined') {
    win.Object.defineProperty(HTMLElement.prototype, 'classList', {
      get: function() {
        var self = this;
        function update(fn) {
          return function(value) {
            var classes = self.className.split(/\s+/),
                index = classes.indexOf(value);

            fn(classes, index, value);
            self.className = classes.join(' ');
          };
        }

        var ret = {
            add: update(function(classes, index, value) {
              ~index || classes.push(value);
            }),

            remove: update(function(classes, index) {
              ~index && classes.splice(index, 1);
            }),

            toggle: update(function(classes, index, value) {
              ~index ? classes.splice(index, 1) : classes.push(value);
            }),

            contains: function(value) {
              return !!~self.className.split(/\s+/).indexOf(value);
            },

            item: function(i) {
              return self.className.split(/\s+/)[i] || null;
            }
          };

        win.Object.defineProperty(ret, 'length', {
          get: function() {
            return self.className.split(/\s+/).length;
          }
        });

        return ret;
      }
    });
  }

  // Safary has a bug of not restoring selection after node.normalize correctly.
  // Detects the misbegaviour and patches it
  var normalizeHasCaretError = function() {
    if ("createRange" in doc && "getSelection" in win) {
      var e = doc.createElement('div'),
          t1 = doc.createTextNode('a'),
          t2 = doc.createTextNode('a'),
          t3 = doc.createTextNode('a'),
          r = doc.createRange(),
          s, ret;

      e.setAttribute('contenteditable', 'true');
      e.appendChild(t1);
      e.appendChild(t2);
      e.appendChild(t3);
      doc.body.appendChild(e);
      r.setStart(t2, 1);
      r.setEnd(t2, 1);

      s = win.getSelection();
      s.removeAllRanges();
      s.addRange(r);
      e.normalize();
      s = win.getSelection();

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
    var f = win.Node.prototype.normalize;
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

      if ((anode === fnode && foffset < aoffset) || (anode !== fnode && (anode.compareDocumentPosition(fnode) & win.Node.DOCUMENT_POSITION_PRECEDING) && !(anode.compareDocumentPosition(fnode) & win.Node.DOCUMENT_POSITION_CONTAINS))) {
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
    win.Node.prototype.normalize = nf;
  };
  
  var F = function() {
    win.removeEventListener("load", F);
    if ("Node" in win && "normalize" in win.Node.prototype && normalizeHasCaretError()) {
      normalizeFix();
    }
  };
  
  if (doc.readyState !== "complete") {
    win.addEventListener("load", F);
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
    if (!customEventSupported && "CustomEvent" in win) {
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

wysihtml.polyfills(window, document);
