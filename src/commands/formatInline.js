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

  function changeTextNodeWrapper(textNodes, nodeWrapper, options) {
    console.log('change');
  }

  // Fetch all textnodes in selection
  // Empty textnodes are ignored except the one containing text caret
  function getSelectedTextNodes(selection, splitBounds) {
    var caretNode = selection.isCollapsed() && selection.getSelectedNode(),
        textNodes = selection.getOwnNodes([3], function(node) {
          // Exclude empty nodes except caret node
          return (!wysihtml5.dom.domNode(node).is.emptyTextNode() || caretNode === node);
        }, splitBounds);

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

  function findSimilarTextNodeWrapper(textNode, options, container) {
    var node = textNode,
        similarOptions = correctOptionsForSimilarityCheck (options);

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
      className: options.className || null,
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

  wysihtml5.commands.formatInline = {

    // Basics:
    // In case of plain text or inline state not set wrap all non-empty textnodes with
    // In case a similar inline wrapper node is detected on one of textnodes, the wrapper node is changed (if fully contained) or split and changed (partially contained)
    //    In case of changing mode every textnode is addressed separatly
    exec: function(composer, command, options) {

      var textNodes = getSelectedTextNodes(composer.selection, true),
          stateNodes = this.state(composer, command, options),
          nodeWrapper, i;

      // If properties is passed as a string, correct options with that nodeName
      options = (typeof options === "string") ? { nodeName: options.toUpperCase() } : options;

      // Remove state if toggle set and state on and selection is collapsed

      if (stateNodes) {
        if (!textNodes.length) {
          var txtnode = composer.doc.createTextNode(wysihtml5.INVISIBLE_SPACE);
          wysihtml5.dom.domNode(txtnode).escapeParent(stateNodes[0]);
          composer.selection.selectNode(txtnode);
        } else {
          for (i = textNodes.length; i--;) {
            unformatTextNode(textNodes[i], composer, options);
          }
          selectTextNodes(textNodes, composer);
        }
        return;
      }

      // Handle collapsed selection caret and return
      if (!textNodes.length) {
        formatTextRange(composer.selection.getOwnRanges()[0], composer, options);
        return;
      }

      /*if (hasSimilarTextNodeWrapper(textNodes, options, composer.element)) {
        // Change mode triggered
        // only similar wrappernodes are changed 
        for (i = textNodes.length; i--;) {
          nodeWrapper = findSimilarTextNodeWrapper(textNodes[i], options, composer.element);
          if (nodeWrapper) {
            changeTextNodeWrapper(textNodes[i], nodeWrapper, options);
          } else {
            formatTextNode(textNodes[i], options);
          }
        }
      } else {*/
        // Apply mode
        for (i = textNodes.length; i--;) {
          formatTextNode(textNodes[i], options);
        }
        selectTextNodes(textNodes, composer);
      //}

    },

    state: function(composer, command, options) {
      var searchNodes = getSelectedTextNodes(composer.selection),
          nodes = [],
          node, range;

      // If properties is passed as a string, correct options with that nodeName
      options = (typeof options === "string") ? { nodeName: options.toUpperCase() } : options;


      // Handle collapsed selection caret
      if (!searchNodes.length) {
        range = composer.selection.getOwnRanges()[0];
        if (range) {
          searchNodes = [range.endContainer];
        }
      }

      for (var i = 0, maxi = searchNodes.length; i < maxi; i++) {
        node = findSimilarTextNodeWrapper(searchNodes[i], options, composer.element);
        if (node) {
          nodes.push(node);
        }
      }
      
      return (nodes.length === 0) ? false : nodes;
    }
  };

})(wysihtml5);
