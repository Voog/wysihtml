(function(wysihtml5) {

  var dom = wysihtml5.dom,
      // When the caret is within a H1 and the H4 is invoked, the H1 should turn into H4
      // instead of creating a H4 within a H1 which would result in semantically invalid html
      UNNESTABLE_BLOCK_ELEMENTS = "h1, h2, h3, h4, h5, h6, p, pre, pre > code";
      BLOCK_ELEMENTS = "h1, h2, h3, h4, h5, h6, p, pre, div, pre > code";

  // Removes empty block level elements
  function cleanup (container) {
    var elements = container.querySelectorAll(BLOCK_ELEMENTS);
    for (var i = elements.length; i--;) {
      if (elements[i].innerHTML.trim() === "") {
        elements[i].parentNode.removeChild(elements[i]);
      }
    }
  }

  // The outermost un-nestable block element parent of from node
  function findOuterBlock(node, container) {
    var n = node;
        block = null;
        
    while (n && container && n !== container) {
      if (n.nodeType === 1 && n.matches(UNNESTABLE_BLOCK_ELEMENTS)) {
        block = n;
      }
      n = n.parentNode;
    }

    return block;
  }

  // Formats an element according to options nodeName, className, style 
  function applyOptionsToElement(element, options) {
    if (options.nodeName && element.nodeName !== options.nodeName) {
      element = dom.renameElement(element, options.nodeName);
    }
    if (options.className) {
      element.classList.add(options.className);
    }
    if (options.style) {
      element.style[wysihtml5.browser.fixStyleKey(options.style.prop)] = options.style.val;
    }
    return element;
  }

  // Wrap the range with a block level element
  // If element is one of unnestable block elements (ex: h2 inside h1), split nodes and insert between so nesting does not occur
  function wrapRangeWithElement(range, element, composer) {
    var r = range.cloneRange(),
        rangeStartContainer = r.startContainer,
        content = r.extractContents(), // removes the contents of selection from dom to documentfragment
        contentBlocks = (element.matches(UNNESTABLE_BLOCK_ELEMENTS)) ? content.querySelectorAll(UNNESTABLE_BLOCK_ELEMENTS) : [], // Find unnestable block elements in extracted contents (must be unwrapped) 
        firstOuterBlock = findOuterBlock(rangeStartContainer, composer.element); // The outermost un-nestable block element parent of selection start
        
    // Removes un-nestable block level elements from inside content
    for (var i = contentBlocks.length; i--;) {
      contentBlocks[i].parentNode.insertBefore(composer.doc.createElement('BR'), contentBlocks[i].nextSibling);
      wysihtml5.dom.unwrap(contentBlocks[i]);
    }

    // Wrap contents with given wrapper element
    element.appendChild(content);

    if (firstOuterBlock) {
      // If selection starts inside un-nestable block, split-escape the unnestable point and insert node between
      composer.selection.splitElementAtCaret(firstOuterBlock, element);
    } else {
      // Otherwise just insert
      r.insertNode(element);
    }
  }

  wysihtml5.commands.formatBlock = {
    exec: function(composer, command, options) {
      
      // If properties is passed as a string, look for tag with that tagName/query 
      if (typeof options === "string") {
        options = {
          nodeName: options.toUpperCase()
        };
      }

      var doc = composer.doc,
          defaultNodeName = composer.config.useLineBreaks ? "DIV" : "P",
          newNodeName = options.nodeName || defaultNodeName,
          newBlockElements = [],
          currentBlockElements, blockElement, ranges, range;
          

      if (composer.selection.isCollapsed()) {
        // Selection is caret

        // Create new block wrapper element
        blockElement = applyOptionsToElement(doc.createElement(newNodeName), options);
        blockElement.appendChild(doc.createTextNode(wysihtml5.INVISIBLE_SPACE));

        // Find current selection unwrappable block level elements (if new node can not be wrapped)
        // And if found, split outermost block element (assumed last in list) at caret
        currentBlockElements = this.state(composer, command, {
          query: (newNodeName === "DIV") ? BLOCK_ELEMENTS : UNNESTABLE_BLOCK_ELEMENTS
        });
        if (currentBlockElements.length > 0) {
          // Split outer block element and insert the new element
          composer.selection.splitElementAtCaret(currentBlockElements.pop(), blockElement);
        } else {
          // Insert the new element
          composer.selection.insertNode(blockElement);
        }

        composer.selection.selectNode(blockElement.firstChild);

      } else {
        // Selection is not collapsed

        // Get all selection ranges of current composer and iterate
        ranges = composer.selection.getOwnRanges();
        for (var i = ranges.length; i--;) {
          // Create new block wrapper element (on every iteration)
          blockElement = applyOptionsToElement(doc.createElement(newNodeName), options);
          newBlockElements.unshift(blockElement);
          // Wrap the current range with this block element
          wrapRangeWithElement(ranges[i], blockElement, composer);
        }

        // Remove empty block elements that may be left behind
        cleanup(composer.element);

        // Restore correct selection
        range = composer.selection.createRange();
        range.setStartBefore(newBlockElements[0]);
        range.setEndAfter(newBlockElements[newBlockElements.length - 1]);
        composer.selection.setSelection(range);
      }

    },

    state: function(composer, command, properties) {
      
      // If properties is passed as a string, look for tag with that tagName/query 
      if (typeof properties === "string") {
        properties = {
          query: properties
        };
      }

      var nodes = composer.selection.filterElements((function (element) { // Finds matching elements inside selection
            return wysihtml5.dom.domNode(element).test(properties);
          }).bind(this)),
          parentNodes = composer.selection.getSelectedOwnNodes(),
          parent;

      // Finds matching elements that are parents of selection and adds to nodes list
      for (var i = 0, maxi = parentNodes.length; i < maxi; i++) {
        parent = dom.getParentElement(parentNodes[i], properties, null, composer.element);
        if (parent && nodes.indexOf(parent) === -1) {
          nodes.push(parent);
        }
      }

      return (nodes.length === 0) ? false : nodes;
    }


  };
})(wysihtml5);
