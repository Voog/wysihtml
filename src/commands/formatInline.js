/**
 * Unifies all inline tags additions and removals
 * See https://github.com/Voog/wysihtml/pull/169 for specification of action
 */

(function(wysihtml5) {

  var defaultTag = "SPAN",
      INLINE_ELEMENTS = "b, big, i, small, tt, abbr, acronym, cite, code, dfn, em, kbd, strong, samp, var, a, bdo, br, q, span, sub, sup, button, label, textarea, input, select, u",
      queryAliasMap = {
        "b": "b, strong",
        "strong": "b, strong",
        "em": "em, i",
        "i": "em, i"
      };

  function hasNoClass(element) {
    return (/^\s*$/).test(element.className);
  }

  function hasNoStyle(element) {
    return !element.getAttribute('style') || (/^\s*$/).test(element.getAttribute('style'));
  }

  // Associative arrays in javascript are really objects and do not have length defined
  // Thus have to check emptyness in a different way
  function hasNoAttributes(element) {
    var attr = wysihtml5.dom.getAttributes(element);
    return wysihtml5.lang.object(attr).isEmpty();
  }

  // compares two nodes if they are semantically the same
  // Used in cleanup to find consequent semantically similar elements for merge
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

    if (attr1.length !== attr2.length || !wysihtml5.lang.object(wysihtml5.lang.object(attr1).difference(attr2)).isEmpty()) {
      return false;
    }

    return true;
  }

  function createWrapNode(textNode, options) {
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

    if (options.attribute) {
      if (typeof options.attribute === "object") {
        for (var a in options.attribute) {
          if (options.attribute.hasOwnProperty(a)) {
            element.setAttribute(a, options.attribute[a]);
          }
        }
      } else if (typeof options.attributeValue !== "undefined") {
        element.setAttribute(options.attribute, options.attributeValue);
      }
    }

    return element;
  }

  // Tests if attr2 list contains all attributes present in attr1
  // Note: attr 1 can have more attributes than attr2
  function containsSameAttributes(attr1, attr2) {
    for (var a in attr1) {
      if (attr1.hasOwnProperty(a)) {
        if (typeof attr2[a] === undefined || attr2[a] !== attr1[a]) {
          return false;
        }
      }
    }
    return true;
  }

  // If attrbutes and values are the same > remove
  // if attributes or values 
  function updateElementAttributes(element, newAttributes, toggle) {
    var attr = wysihtml5.dom.getAttributes(element),
        fullContain = containsSameAttributes(newAttributes, attr),
        attrDifference = wysihtml5.lang.object(attr).difference(newAttributes),
        a, b;

    if (fullContain && toggle !== false) {
      for (a in newAttributes) {
        if (newAttributes.hasOwnProperty(a)) {
          element.removeAttribute(a);
        }
      }
    } else {

      /*if (!wysihtml5.lang.object(attrDifference).isEmpty()) {
        for (b in attrDifference) {
          if (attrDifference.hasOwnProperty(b)) {
            element.removeAttribute(b);
          }
        }
      }*/

      for (a in newAttributes) {
        if (newAttributes.hasOwnProperty(a)) {
          element.setAttribute(a, newAttributes[a]);
        }
      }
    }
  }

  function updateFormatOfElement(element, options) {
    var attr, newNode, a, newAttributes, nodeNameQuery, nodeQueryMatch;

    if (options.className) {
      if (options.toggle !== false && element.classList.contains(options.className)) {
        element.classList.remove(options.className);
      } else {
        if (options.classRegExp) {
          element.className = element.className.replace(options.classRegExp, '');
        }
        element.classList.add(options.className);
      }
      if (hasNoClass(element)) {
        element.removeAttribute('class');
      }
    }

    // change/remove style
    if (options.styleProperty) {
      if (options.toggle !== false && element.style[wysihtml5.browser.fixStyleKey(options.styleProperty)].trim().replace(/, /g, ",") === options.styleValue) {
        element.style[wysihtml5.browser.fixStyleKey(options.styleProperty)] = '';
      } else {
        element.style[wysihtml5.browser.fixStyleKey(options.styleProperty)] = options.styleValue;
      }
    }
    if (hasNoStyle(element)) {
      element.removeAttribute('style');
    }

    if (options.attribute) {
      if (typeof options.attribute === "object") {
        newAttributes =  options.attribute;
      } else {
        newAttributes = {};
        newAttributes[options.attribute] = options.attributeValue || '';
      }
      updateElementAttributes(element, newAttributes, options.toggle);
    }


    // Handle similar semantically same elements (queryAliasMap)
    nodeNameQuery = options.nodeName ? queryAliasMap[options.nodeName.toLowerCase()] || options.nodeName.toLowerCase() : null;
    nodeQueryMatch = nodeNameQuery ? wysihtml5.dom.domNode(element).test({ query: nodeNameQuery }) : false;
    
    // Unwrap element if no attributes present and node name given
    // or no attributes and if no nodename set but node is the default
    if (!options.nodeName || options.nodeName === defaultTag || nodeQueryMatch) {
      if (
        ((options.toggle !== false && nodeQueryMatch) || (!options.nodeName && element.nodeName === defaultTag)) &&
        hasNoClass(element) && hasNoStyle(element) && hasNoAttributes(element)
      ) {
        wysihtml5.dom.unwrap(element);
      }

    }
  }

  // Fetch all textnodes in selection
  // Empty textnodes are ignored except the one containing text caret
  function getSelectedTextNodes(selection, splitBounds) {
    var textNodes = [];

    if (!selection.isCollapsed()) {
      textNodes = textNodes.concat(selection.getOwnNodes([3], function(node) {
        // Exclude empty nodes except caret node
        return (!wysihtml5.dom.domNode(node).is.emptyTextNode());
      }, splitBounds));
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
  // If nodeName is specified inline node with the same (or alias) nodeName is expected to prove similar regardless of attributes
  function isSimilarNode(node, options) {
    var o;
    if (options.nodeName) {
      var query = queryAliasMap[options.nodeName.toLowerCase()] || options.nodeName.toLowerCase();
      return wysihtml5.dom.domNode(node).test({ query: query });
    } else {
      o = wysihtml5.lang.object(options).clone();
      o.query = INLINE_ELEMENTS; // make sure only inline elements with styles and classes are counted
      return wysihtml5.dom.domNode(node).test(o);
    }
  }

  function selectRange(composer, range) {
    var d = document.documentElement || document.body,
        oldScrollTop  = d.scrollTop,
        oldScrollLeft = d.scrollLeft,
        selection = rangy.getSelection(composer.win);

    rangy.getSelection(composer.win).removeAllRanges();
    
    // IE looses focus of contenteditable on removeallranges and can not set new selection unless contenteditable is focused again
    try {
      rangy.getSelection(composer.win).addRange(range);
    } catch (e) {}
    if (!composer.doc.activeElement || !wysihtml5.dom.contains(composer.element, composer.doc.activeElement)) {
      composer.element.focus();
      d.scrollTop  = oldScrollTop;
      d.scrollLeft = oldScrollLeft;
      rangy.getSelection(composer.win).addRange(range);
    }
  }

  function selectTextNodes(textNodes, composer) {
    var range = rangy.createRange(composer.doc),
        lastText = textNodes[textNodes.length - 1];

    if (textNodes[0] && lastText) {
      range.setStart(textNodes[0], 0);
      range.setEnd(lastText, lastText.length);
      selectRange(composer, range);
    }
    
  }

  function selectTextNode(composer, node, start, end) {
    var range = rangy.createRange(composer.doc);
    if (node) {
      range.setStart(node, start);
      range.setEnd(node, typeof end !== 'undefined' ? end : start);
      selectRange(composer, range);
    }
  }

  function getState(composer, options, exact) {
    var searchNodes = getSelectedTextNodes(composer.selection),
        nodes = [],
        partial = false,
        node, range, caretNode;

    if (composer.selection.isInThisEditable()) {

      if (searchNodes.length === 0 && composer.selection.isCollapsed()) {
        caretNode = composer.selection.getSelection().anchorNode;
        if (!caretNode) {
          // selection not in editor
          return {
              nodes: [],
              partial: false
          };
        }
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

  // Contents of 2 elements are merged to fitst element. second element is removed as consequence
  function mergeContents(element1, element2) {
    while (element2.firstChild) {
      element1.appendChild(element2.firstChild);
    }
    element2.parentNode.removeChild(element2);
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
    selectTextNode(composer, textNode, offset);
    mergeConsequentSimilarElements(getState(composer, options).nodes);
    selectTextNode(composer, textNode, offset);
  }

  // Formats a textnode with given options
  function formatTextNode(textNode, options) {
    var wrapNode = createWrapNode(textNode, options);

    textNode.parentNode.insertBefore(wrapNode, textNode);
    wrapNode.appendChild(textNode);
  }

  // Changes/toggles format of a textnode
  function unformatTextNode(textNode, composer, options) {
    var container = composer.element,
        wrapNode = findSimilarTextNodeWrapper(textNode, options, container),
        newWrapNode;

    if (wrapNode) {
      newWrapNode = wrapNode.cloneNode(false);

      wysihtml5.dom.domNode(textNode).escapeParent(wrapNode, newWrapNode);
      updateFormatOfElement(newWrapNode, options);
    }
  }

  // Removes the format around textnode
  function removeFormatFromTextNode(textNode, composer, options) {
    var container = composer.element,
        wrapNode = findSimilarTextNodeWrapper(textNode, options, container);

    if (wrapNode) {
      wysihtml5.dom.domNode(textNode).escapeParent(wrapNode);
    }
  }

  // Creates node around caret formated with options
  function formatTextRange(range, composer, options) {
    var wrapNode = createWrapNode(range.endContainer, options);

    range.surroundContents(wrapNode);
    composer.selection.selectNode(wrapNode);
  }

  // Changes/toggles format of whole selection
  function updateFormat(composer, textNodes, state, options) {
    var exactState = getState(composer, options, true),
        selection = composer.selection.getSelection(),
        wordObj, textNode, newNode, i;

    if (!textNodes.length) {
      // Selection is caret


      if (options.toggle !== false) {
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
          updateFormatOfElement(newNode, options);
          cleanupAndSetSelection(composer, [textNode], options);
          var s = composer.selection.getSelection();
          if (s.anchorNode && s.focusNode) {
            // Has an error in IE when collapsing selection. probably from rangy
            try {
              s.collapseToEnd();
            } catch (e) {}
          }
        }
      } else {
        // In non-toggle mode the closest state element has to be found and the state updated differently
        for (i = state.nodes.length; i--;) {
          updateFormatOfElement(state.nodes[i], options);
        }
      }

    } else {

      if (!exactState.partial && options.toggle !== false) {

        // If whole selection (all textnodes) are in the applied format
        // remove the format from selection
        // Non-toggle mode never removes. Remove has to be called explicitly
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

  // Removes format from selection
  function removeFormat(composer, textNodes, state, options) {
    var textNode, textOffset, newNode, i,
        selection = composer.selection.getSelection();

    if (!textNodes.length) {    
      textNode = selection.anchorNode;
      textOffset = selection.anchorOffset;

      for (i = state.nodes.length; i--;) {
        wysihtml5.dom.unwrap(state.nodes[i]);
      }

      cleanupAndSetCaret(composer, textNode, textOffset, options);
    } else {
      for (i = textNodes.length; i--;) {
        removeFormatFromTextNode(textNodes[i], composer, options);
      }
      cleanupAndSetSelection(composer, textNodes, options);
    }
  }

  // Adds format to selection
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
        var r = composer.selection.getOwnRanges()[0];
        if (r) {
          formatTextRange(r, composer, options);
        }
      }
      
    } else {
      // Handle textnodes in selection and apply format
      for (i = textNodes.length; i--;) {
        formatTextNode(textNodes[i], options);
      }
      cleanupAndSetSelection(composer, textNodes, options);
    }
  }
  
  // If properties is passed as a string, correct options with that nodeName
  function fixOptions(options) {
    options = (typeof options === "string") ? { nodeName: options } : options;
    if (options.nodeName) { options.nodeName = options.nodeName.toUpperCase(); }
    return options;
  }

  wysihtml5.commands.formatInline = {

    // Basics:
    // In case of plain text or inline state not set wrap all non-empty textnodes with
    // In case a similar inline wrapper node is detected on one of textnodes, the wrapper node is changed (if fully contained) or split and changed (partially contained)
    //    In case of changing mode every textnode is addressed separatly
    exec: function(composer, command, options) {
      options = fixOptions(options);

      // Join adjactent textnodes first
      composer.element.normalize();

      var textNodes = getSelectedTextNodes(composer.selection, true),
          state = getState(composer, options);
      if (state.nodes.length > 0) {
        // Text allready has the format applied
        updateFormat(composer, textNodes, state, options);
      } else {
        // Selection is not in the applied format
        applyFormat(composer, textNodes, options);
      }
      composer.element.normalize();
    },

    remove: function(composer, command, options) {
      options = fixOptions(options);
      composer.element.normalize();

      var textNodes = getSelectedTextNodes(composer.selection, true),
          state = getState(composer, options);

      if (state.nodes.length > 0) {
        // Text allready has the format applied
        removeFormat(composer, textNodes, state, options);
      }
      
      composer.element.normalize();
    },

    state: function(composer, command, options) {
      options = fixOptions(options);
      var nodes = getState(composer, options, true).nodes;
      return (nodes.length === 0) ? false : nodes;
    }
  };

})(wysihtml5);
