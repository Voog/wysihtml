/**
 * formatInline scenarios for tag "B" (| = caret, |foo| = selected text)
 *
 *   #1 caret in unformatted text:
 *      abcdefg|
 *   output:
 *      abcdefg<b>|</b>
 *
 *   #2 unformatted text selected:
 *      abc|deg|h
 *   output:
 *      abc<b>|deg|</b>h
 *
 *   #3 unformatted text selected across boundaries:
 *      ab|c <span>defg|h</span>
 *   output:
 *      ab<b>|c </b><span><b>defg</b>|h</span>
 *
 *   #4 formatted text entirely selected
 *      <b>|abc|</b>
 *   output:
 *      |abc|
 *
 *   #5 formatted text partially selected
 *      <b>ab|c|</b>
 *   output:
 *      <b>ab</b>|c|
 *
 *   #6 formatted text selected across boundaries
 *      <span>ab|c</span> <b>de|fgh</b>
 *   output:
 *      <span>ab|c</span> de|<b>fgh</b>
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

  function isVisibleTextNode(node) {
    if (node.data && (/[^\s]/g).test(node.data)) {
      return true;
    }
    return false;
  }

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
    var container = composer.element;
        wrapNode = findSimilarTextNodeWrapper(textNode, options, container);
    if (wrapNode) {
      wysihtml5.dom.domNode(textNode).escapeParent(wrapNode);
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

  function hasSimilarTextNodeWrapper(textNodes, options, container) {
    for (var i = textNodes.length; i--;) {
      if (findSimilarTextNodeWrapper(textNodes[i], options, container)) {
        return true;
      }
    }
    return false;
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

  function correctOptionsForSimilarityCheck (options) {
    return {
      nodeName: options.nodeName || null,
      className: (!options.classRegExp) ? options.className || null : null,
      classRegExp: options.classRegExp || null,
      styleProperty: options.styleProperty || null
    };
  }

  // Finds inline node with similar nodeName/style/className
  // If nodeName is specified inline node with the same (or alias) nodeName is expected to prove similar
  function isSimilarNode (node, options) {
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

  function selectTextNodes (textNodes, composer) {
    var range = rangy.createRange(composer.doc),
        lastText = textNodes[textNodes.length - 1];

    range.setStart(textNodes[0], 0);
    range.setEnd(lastText, lastText.length);
    composer.selection.setSelection(range);
  }

  function getState(composer, options, exact) {
    var searchNodes = getSelectedTextNodes(composer.selection),
        nodes = [],
        partial = false,
        node, range;

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

  function selectTextNode(node, start, end) {
    var doc = node.ownerDocument,
        win = doc.defaultView || doc.parentWindow,
        range = rangy.createRange(doc),
        selection = rangy.getSelection(win);

    range.setStartAndEnd(node, start, end);
    selection.setSingleRange(range);
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

  wysihtml5.commands.formatInline = {

    // Basics:
    // In case of plain text or inline state not set wrap all non-empty textnodes with
    // In case a similar inline wrapper node is detected on one of textnodes, the wrapper node is changed (if fully contained) or split and changed (partially contained)
    //    In case of changing mode every textnode is addressed separatly
    exec: function(composer, command, options) {

      // If properties is passed as a string, correct options with that nodeName
      options = (typeof options === "string") ? { nodeName: options.toUpperCase() } : options;

      // Join adjactent textnodes first
      composer.element.normalize();

      var textNodes = getSelectedTextNodes(composer.selection, true),
          state = getState(composer, options),
          exactState = getState(composer, options, true),
          selection = composer.selection.getSelection(),
          nodeWrapper, i, wordObj;

      

      // Remove state if state is on and selection is collapsed
      if (state.nodes.length > 0) {
        // Text allready has the format applied
        if (!textNodes.length) {
          // Selection is caret

          if (caretIsInsideWord(selection)) {

            // Unformat whole word 
            wordObj = getRangeForWord(selection);
            textNode = wordObj.textNode;
            unformatTextNode(wordObj.textNode, composer, options);
            selectTextNode(wordObj.textNode, wordObj.wordOffset);
          
          } else {

            // Toggle the format state
            var txtnode = composer.doc.createTextNode(wysihtml5.INVISIBLE_SPACE);
            composer.selection.splitElementAtCaret(state.nodes[0], txtnode);
            composer.selection.selectNode(txtnode);

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
            // Remove previous format and apply new 
            for (i = textNodes.length; i--;) {
              unformatTextNode(textNodes[i], composer, options);
            }
            for (i = textNodes.length; i--;) {
              formatTextNode(textNodes[i], options);
            }

          }

          selectTextNodes(textNodes, composer);
        }
        composer.element.normalize();
        return;
      }

      // Selection is not in the applied format
      // Handle collapsed selection caret and return
      if (!textNodes.length) {

        if (caretIsInsideWord(selection)) {

          wordObj = getRangeForWord(selection);
          formatTextNode(wordObj.textNode, options);
          selectTextNode(wordObj.textNode, wordObj.wordOffset);

        } else {
          formatTextRange(composer.selection.getOwnRanges()[0], composer, options);
        }

        composer.element.normalize();
        
        return;
      }

      // Handle textnodes in selection and apply format
      for (i = textNodes.length; i--;) {
        formatTextNode(textNodes[i], options);
      }

      selectTextNodes(textNodes, composer);

      composer.element.normalize();

    },

    state: function(composer, command, options) {
      // If properties is passed as a string, correct options with that nodeName
      options = (typeof options === "string") ? { nodeName: options.toUpperCase() } : options;

      var nodes = getState(composer, options, true).nodes;
      
      return (nodes.length === 0) ? false : nodes;
    }
  };

})(wysihtml5);
