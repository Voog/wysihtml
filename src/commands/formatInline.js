/**
 * Unifies all inline tags additions and removals
 * See https://github.com/Voog/wysihtml/pull/169 for specification of action
 */

(function(wysihtml5) {

  var defaultTag = "SPAN",
      INLINE_ELEMENTS = "b, big, i, small, tt, abbr, acronym, cite, code, dfn, em, kbd, strong, samp, var, a, bdo, br, q, span, sub, sup, button, label, textarea, input, select",
      queryAliasMap = {
        "b": "b, strong",
        "strong": "b, strong",
        "em": "em, i",
        "i": "em, i"
      };

  function getWrapNode(textNode, options) {
    var nodeName = options && options.nodeName || defaultTag,
        element = textNode.ownerDocument.createElement(nodeName);

    // Remove similar classes before applying className
    if (options.classRegExp) {
      element.className = element.className.replace(options.classRegExp, "");
    }

    if (options.className) {
      element.classList.add(options.className);
    }

    if (options.styleProperty && typeof options.styleValue !== "undefined") {
      element.style[wysihtml5.browser.fixStyleKey(options.styleProperty)] = options.styleValue;
    }

    return element;
  }

  function formatTextNode(textNode, options) {
    var wrapNode = getWrapNode(textNode, options);

    textNode.parentNode.insertBefore(wrapNode, textNode);
    wrapNode.appendChild(textNode);
  }

  function unformatTextNode(textNode, composer, options) {
    var container = composer.element,
        wrapNode = findSimilarTextNodeWrapper(textNode, options, container),
        newWrapNode;

    if (wrapNode) {
      newWrapNode = wrapNode.cloneNode(false);

      wysihtml5.dom.domNode(textNode).escapeParent(wrapNode, newWrapNode);
      removeFormatFromElement(newWrapNode, options);
    }
  }

  function formatTextRange(range, composer, options) {
    var wrapNode = getWrapNode(range.endContainer, options);

    range.surroundContents(wrapNode);
    composer.selection.selectNode(wrapNode);
  }

  // Fetch all textnodes in selection
  // Empty textnodes are ignored except the one containing text caret
  function getSelectedTextNodes(selection, splitBounds) {
    var textNodes = [];

    if (!selection.isCollapsed()) {
      textNodes = selection.getOwnNodes([3], function(node) {
        // Exclude empty nodes except caret node
        return (!wysihtml5.dom.domNode(node).is.emptyTextNode());
      }, splitBounds);
    }

    return textNodes;
  }

  function findSimilarTextNodeWrapper(textNode, options, container, exact) {
    var node = textNode,
        similarOptions = exact ? options : correctOptionsForSimilarityCheck(options);

    do {
      if (node.nodeType === 1 && isSimilarNode(node, similarOptions)) {
        return node;
      }
      node = node.parentNode;
    } while (node && node !== container);

    return null;
  }

  function correctOptionsForSimilarityCheck(options) {
    return {
      nodeName: options.nodeName || null,
      className: (!options.classRegExp) ? options.className || null : null,
      classRegExp: options.classRegExp || null,
      styleProperty: options.styleProperty || null
    };
  }

  // Finds inline node with similar nodeName/style/className
  // If nodeName is specified inline node with the same (or alias) nodeName is expected to prove similar
  function isSimilarNode(node, options) {
    var o;
    if (options.nodeName) {
      var query = queryAliasMap[options.nodeName.toLowerCase()] || options.nodeName.toLowerCase();
      return wysihtml5.dom.domNode(node).test({ query: query });
    } else {
      o = wysihtml5.lang.object(options).clone();
      o.query = INLINE_ELEMENTS; // make sure only inline elements with styles and classes are counted
      return wysihtml5.dom.domNode(node).test(options);
    }
  }

  function selectTextNodes(textNodes, composer) {
    var range = rangy.createRange(composer.doc),
        lastText = textNodes[textNodes.length - 1];

    range.setStart(textNodes[0], 0);
    range.setEnd(lastText, lastText.length);
    composer.selection.setSelection(range);
  }

  function selectTextNode(node, start, end) {
    var doc = node.ownerDocument,
        win = doc.defaultView || doc.parentWindow,
        range = rangy.createRange(doc),
        selection = rangy.getSelection(win);

    range.setStartAndEnd(node, start, end);
    selection.setSingleRange(range);
  }

  function getState(composer, options, exact) {
    var searchNodes = getSelectedTextNodes(composer.selection),
        nodes = [],
        partial = false,
        node, range, caretNode;

    if (searchNodes.length === 0 && composer.selection.isCollapsed()) {
      caretNode = composer.selection.getSelection().anchorNode;
      if (caretNode.nodeType === 3) {
        searchNodes = [caretNode];
      }
    }

    // Handle collapsed selection caret
    if (!searchNodes.length) {
      range = composer.selection.getOwnRanges()[0];
      if (range) {
        searchNodes = [range.endContainer];
      }
    }

    for (var i = 0, maxi = searchNodes.length; i < maxi; i++) {
      node = findSimilarTextNodeWrapper(searchNodes[i], options, composer.element, exact);
      if (node) {
        nodes.push(node);
      } else {
        partial = true;
      }
    }
    
    return {
      nodes: nodes,
      partial: partial
    };
  }

  // Returns if caret is inside a word in textnode (not on boundary)
  // If selection anchornode is not text node, returns false
  function caretIsInsideWord(selection) {
    var anchor, offset, beforeChar, afterChar;
    if (selection) {
      anchor = selection.anchorNode;
      offset = selection.anchorOffset;
      if (anchor && anchor.nodeType === 3 && offset > 0 && offset < anchor.data.length) {
        beforeChar = anchor.data[offset - 1];
        afterChar = anchor.data[offset];
        return (/\w/).test(beforeChar) && (/\w/).test(afterChar);
      }
    }
    return false;
  }

  // Returns a range and textnode containing object from caret position covering a whole word
  // wordOffsety describes the original position of caret in the new textNode 
  // Caret has to be inside a textNode.
  function getRangeForWord(selection) {
    var anchor, offset, doc, range, offsetStart, offsetEnd, beforeChar, afterChar,
        txtNodes = [];
    if (selection) {
      anchor = selection.anchorNode;
      offset = offsetStart = offsetEnd = selection.anchorOffset;
      doc = anchor.ownerDocument;
      range = rangy.createRange(doc);

      if (anchor && anchor.nodeType === 3) {

        while (offsetStart > 0 && (/\w/).test(anchor.data[offsetStart - 1])) {
          offsetStart--;
        }

        while (offsetEnd < anchor.data.length && (/\w/).test(anchor.data[offsetEnd])) {
          offsetEnd++;
        }

        range.setStartAndEnd(anchor, offsetStart, offsetEnd);
        range.splitBoundaries();
        txtNodes = range.getNodes([3], function(node) {
          return (!wysihtml5.dom.domNode(node).is.emptyTextNode());
        });

        return {
          wordOffset: offset - offsetStart,
          range: range,
          textNode: txtNodes[0]
        };

      }
    }
    return false;
  }

  function hasNoClass(element) {
    return (/^\s*$/).test(element.className);
  }

  function hasNoStyle(element) {
    return !element.getAttribute('style') || (/^\s*$/).test(element.getAttribute('style'));
  }

  function removeFormatFromElement(element, options) {
    var attr, newNode, a;

    if (options.className) {
      element.classList.remove(options.className);
      if (hasNoClass(element)) {
        element.removeAttribute('class');
      }
    }

    // change/remove style
    if (options.styleProperty) {
      if (element.style[wysihtml5.browser.fixStyleKey(options.styleProperty)].trim().replace(/, /g, ",") === options.styleValue) {
        element.style[wysihtml5.browser.fixStyleKey(options.styleProperty)] = '';
      } else {
        element.style[wysihtml5.browser.fixStyleKey(options.styleProperty)] = options.styleValue;
      }
    }
    if (hasNoStyle(element)) {
      element.removeAttribute('style');
    }

    if ((options.nodeName && element.nodeName === options.nodeName) || (!options.nodeName && element.nodeName === defaultTag)) {


      attr = wysihtml5.dom.getAttributes(element);
      if (hasNoClass(element) && hasNoStyle(element) && attr.length === 0) {
        wysihtml5.dom.unwrap(element);
      } else if (!options.nodeName) {
        newNode = element.ownerDocument.createElement(defaultTag);

        // pass present attributes
        for (a in attr) {
          if (attr.hasOwnProperty(a)) {
            newNode.setAttribute(a, attr[a]);
          }
        }

        while (element.firstChild) {
          newNode.appendChild(element.firstChild);
        }
        element.parentNode.insertBefore(newNode, element);
        element.parentNode.removeChild(element);
      }

    }
  }

  function cleanupAndSetSelection(composer, textNodes, options) {
    if (textNodes.length > 0) {
      selectTextNodes(textNodes, composer);
    }

    mergeConsequentSimilarElements(getState(composer, options).nodes);

    if (textNodes.length > 0) {
      selectTextNodes(textNodes, composer);
    }
  }

  function cleanupAndSetCaret(composer, textNode, offset, options) {
    selectTextNode(textNode, offset);
    mergeConsequentSimilarElements(getState(composer, options).nodes);
    selectTextNode(textNode, offset);
  }

  function removeFormat(composer, textNodes, state, options) {
    var exactState = getState(composer, options, true),
        selection = composer.selection.getSelection(),
        wordObj, textNode, newNode, i;

    if (!textNodes.length) {
      // Selection is caret
      if (caretIsInsideWord(selection)) {

        // Unformat whole word 
        wordObj = getRangeForWord(selection);
        textNode = wordObj.textNode;
        unformatTextNode(wordObj.textNode, composer, options);
        cleanupAndSetCaret(composer, wordObj.textNode, wordObj.wordOffset, options);

      } else {

        // Escape caret out of format
        textNode = composer.doc.createTextNode(wysihtml5.INVISIBLE_SPACE);
        newNode = state.nodes[0].cloneNode(false);
        newNode.appendChild(textNode);
        composer.selection.splitElementAtCaret(state.nodes[0], newNode);
        removeFormatFromElement(newNode, options);
        cleanupAndSetSelection(composer, [textNode], options);
      }

    } else {

      if (!exactState.partial) {
        // If whole selection (all textnodes) are in the applied format
        // remove the format from selection
        for (i = textNodes.length; i--;) {
          unformatTextNode(textNodes[i], composer, options);
        }

      } else {
        
        // Selection is partially in format
        // change it to new if format if textnode allreafy in similar state
        // else just apply
        
        for (i = textNodes.length; i--;) {
          
          if (findSimilarTextNodeWrapper(textNodes[i], options, composer.element)) {
            unformatTextNode(textNodes[i], composer, options);
          }

          if (!findSimilarTextNodeWrapper(textNodes[i], options, composer.element)) {
            formatTextNode(textNodes[i], options);
          }
        }

      }

      cleanupAndSetSelection(composer, textNodes, options);
    }
  }

  function applyFormat(composer, textNodes, options) {
    var wordObj, i,
        selection = composer.selection.getSelection();
 
    if (!textNodes.length) {
      // Handle collapsed selection caret and return
      if (caretIsInsideWord(selection)) {

        wordObj = getRangeForWord(selection);
        formatTextNode(wordObj.textNode, options);
        cleanupAndSetCaret(composer, wordObj.textNode, wordObj.wordOffset, options);

      } else {

        formatTextRange(composer.selection.getOwnRanges()[0], composer, options);

      }
      
    } else {
      // Handle textnodes in selection and apply format

      for (i = textNodes.length; i--;) {
        formatTextNode(textNodes[i], options);
      }

      cleanupAndSetSelection(composer, textNodes, options);
    }
  }

  // Contents of 2 elements are merged to fitst element. second element is removed as consequence
  function mergeContents(element1, element2) {
    while (element2.firstChild) {
      element1.appendChild(element2.firstChild);
    }
    element2.parentNode.removeChild(element2);
  }

  //
  function isSameNode(element1, element2) {
    var classes1, classes2,
        attr1, attr2;

    if (element1.nodeType !== 1 || element2.nodeType !== 1) {
      return false;
    }

    if (element1.nodeName !== element2.nodeName) {
      return false;
    }


    classes1 = element1.className.trim().replace(/\s+/g, ' ').split(' ');
    classes2 = element2.className.trim().replace(/\s+/g, ' ').split(' ');
    if (wysihtml5.lang.array(classes1).without(classes2).length > 0) {
      return false;
    }

    attr1 = wysihtml5.dom.getAttributes(element1);
    attr2 = wysihtml5.dom.getAttributes(element2);
    if (attr1.length > attr2.length) {
      return false;
    }
    for (var a in attr1) {
      if (attr1.hasOwnProperty(a)) {
        if (typeof attr2[a] === undefined || attr2[a] !== attr1[a]) {
          return false;
        }
      }
    }

    return true;
  }

  function mergeConsequentSimilarElements(elements) {
    for (var i = elements.length; i--;) {
      
      if (elements[i] && elements[i].parentNode) { // Test if node is not allready removed in cleanup

        if (elements[i].nextSibling && isSameNode(elements[i], elements[i].nextSibling)) {
          mergeContents(elements[i], elements[i].nextSibling);
        }

        if (elements[i].previousSibling && isSameNode(elements[i]  , elements[i].previousSibling)) {
          mergeContents(elements[i].previousSibling, elements[i]);
        }

      }
    }
  }

  wysihtml5.commands.formatInline = {

    // Basics:
    // In case of plain text or inline state not set wrap all non-empty textnodes with
    // In case a similar inline wrapper node is detected on one of textnodes, the wrapper node is changed (if fully contained) or split and changed (partially contained)
    //    In case of changing mode every textnode is addressed separatly
    exec: function(composer, command, options) {

      // If properties is passed as a string, correct options with that nodeName
      options = (typeof options === "string") ? { nodeName: options } : options;
      if (options.nodeName) { options.nodeName = options.nodeName.toUpperCase(); }

      // Join adjactent textnodes first
      composer.element.normalize();

      var textNodes = getSelectedTextNodes(composer.selection, true),
          state = getState(composer, options);
      if (state.nodes.length > 0) {
        // Text allready has the format applied
        removeFormat(composer, textNodes, state, options);
      } else {
        // Selection is not in the applied format
        applyFormat(composer, textNodes, options);
      }
      
      composer.element.normalize();
    },

    state: function(composer, command, options) {
      // If properties is passed as a string, correct options with that nodeName
      options = (typeof options === "string") ? { nodeName: options } : options;
      if (options.nodeName) { options.nodeName = options.nodeName.toUpperCase(); }

      var nodes = getState(composer, options, true).nodes;
      
      return (nodes.length === 0) ? false : nodes;
    }
  };

})(wysihtml5);
