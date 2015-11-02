/* Formatblock
 * Is used to insert block level elements 
 * It tries to solve the case that some block elements should not contain other block level elements (h1-6, p, ...)
 * 
*/
(function(wysihtml5) {

  var dom = wysihtml5.dom,
      // When the caret is within a H1 and the H4 is invoked, the H1 should turn into H4
      // instead of creating a H4 within a H1 which would result in semantically invalid html
      UNNESTABLE_BLOCK_ELEMENTS = "h1, h2, h3, h4, h5, h6, p, pre",
      BLOCK_ELEMENTS = "h1, h2, h3, h4, h5, h6, p, pre, div, blockquote",
      INLINE_ELEMENTS = "b, big, i, small, tt, abbr, acronym, cite, code, dfn, em, kbd, strong, samp, var, a, bdo, br, q, span, sub, sup, button, label, textarea, input, select, u";

  function correctOptionsForSimilarityCheck(options) {
    return {
      nodeName: options.nodeName || null,
      className: (!options.classRegExp) ? options.className || null : null,
      classRegExp: options.classRegExp || null,
      styleProperty: options.styleProperty || null
    };
  }

  // Removes empty block level elements
  function cleanup(composer, newBlockElements) {
    wysihtml5.dom.removeInvisibleSpaces(composer.element);
    var container = composer.element,
        allElements = container.querySelectorAll(BLOCK_ELEMENTS),
        uneditables = container.querySelectorAll(composer.config.classNames.uneditableContainer),
        elements = wysihtml5.lang.array(allElements).without(uneditables),
        nbIdx;

    for (var i = elements.length; i--;) {
      if (elements[i].innerHTML.replace(/[\uFEFF]/g, '') === "") {
        // If cleanup removes some new block elements. remove them from newblocks array too
        nbIdx = wysihtml5.lang.array(newBlockElements).indexOf(elements[i]);
        if (nbIdx > -1) {
          newBlockElements.splice(nbIdx, 1);
        }
        elements[i].parentNode.removeChild(elements[i]);
      }
    }
    
    return newBlockElements;
  }

  function defaultNodeName(composer) {
    return composer.config.useLineBreaks ? "DIV" : "P";
  }

  // The outermost un-nestable block element parent of from node
  function findOuterBlock(node, container, allBlocks) {
    var n = node,
        block = null;
        
    while (n && container && n !== container) {
      if (n.nodeType === 1 && n.matches(allBlocks ? BLOCK_ELEMENTS : UNNESTABLE_BLOCK_ELEMENTS)) {
        block = n;
      }
      n = n.parentNode;
    }

    return block;
  }

  // Clone for splitting the inner inline element out of its parent inline elements context
  // For example if selection is in bold and italic, clone the outer nodes and wrap these around content and return
  function cloneOuterInlines(node, container) {
    var n = node,
        innerNode,
        parentNode,
        el = null,
        el2;

    while (n && container && n !== container) {
      if (n.nodeType === 1 && n.matches(INLINE_ELEMENTS)) {
        parentNode = n;
        if (el === null) {
          el = n.cloneNode(false);
          innerNode = el;
        } else {
          el2 = n.cloneNode(false);
          el2.appendChild(el);
          el = el2;
        }
      }
      n = n.parentNode;
    }

    return {
      parent: parentNode,
      outerNode: el,
      innerNode: innerNode
    };
  }

  // Formats an element according to options nodeName, className, styleProperty, styleValue
  // If element is not defined, creates new element
  // if opotions is null, remove format instead
  function applyOptionsToElement(element, options, composer) {

    if (!element) {
      element = composer.doc.createElement(options.nodeName || defaultNodeName(composer));
      // Add invisible space as otherwise webkit cannot set selection or range to it correctly
      element.appendChild(composer.doc.createTextNode(wysihtml5.INVISIBLE_SPACE));
    }

    if (options.nodeName && element.nodeName !== options.nodeName) {
      element = dom.renameElement(element, options.nodeName);
    }

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

  // Unsets element properties by options
  // If nodename given and matches current element, element is unwrapped or converted to default node (depending on presence of class and style attributes)
  function removeOptionsFromElement(element, options, composer) {
    var style, classes;

    if (options.styleProperty) {
      element.style[wysihtml5.browser.fixStyleKey(options.styleProperty)] = '';
    }
    if (options.className) {
      element.classList.remove(options.className);
    }

    if (options.classRegExp) {
      element.className = element.className.replace(options.classRegExp, "");
    }

    // Clean up blank class attribute
    if (element.getAttribute('class') !== null && element.getAttribute('class').trim() === "") {
      element.removeAttribute('class');
    }

    if (options.nodeName && element.nodeName === options.nodeName) {
      style = element.getAttribute('style');
      if (!style || style.trim() === '') {
        dom.unwrap(element);
      } else {
        element = dom.renameElement(element, defaultNodeName(composer));
      }
    }

    // Clean up blank style attribute
    if (element.getAttribute('style') !== null && element.getAttribute('style').trim() === "") {
      element.removeAttribute('style');
    }
  }

  // Unwraps block level elements from inside content
  // Useful as not all block level elements can contain other block-levels
  function unwrapBlocksFromContent(element) {
    var contentBlocks = element.querySelectorAll(BLOCK_ELEMENTS) || []; // Find unnestable block elements in extracted contents

    for (var i = contentBlocks.length; i--;) {
      if (!contentBlocks[i].nextSibling || contentBlocks[i].nextSibling.nodeType !== 1 || contentBlocks[i].nextSibling.nodeName !== 'BR') {
        if ((contentBlocks[i].innerHTML || contentBlocks[i].nodeValue || '').trim() !== '') {
          contentBlocks[i].parentNode.insertBefore(contentBlocks[i].ownerDocument.createElement('BR'), contentBlocks[i].nextSibling);
        }
      }
      wysihtml5.dom.unwrap(contentBlocks[i]);
    }
  }

  // Fix ranges that visually cover whole block element to actually cover the block
  function fixRangeCoverage(range, composer) {
    var node;

    if (range.startContainer && range.startContainer.nodeType === 1 && range.startContainer === range.endContainer) {
      if (range.startContainer.firstChild === range.startContainer.lastChild && range.endOffset === 1) {
        if (range.startContainer !== composer.element) {
          range.setStartBefore(range.startContainer);
          range.setEndAfter(range.endContainer);
        }
      }
      return;
    }

    if (range.startContainer && range.startContainer.nodeType === 1 && range.endContainer.nodeType === 3) {
      if (range.startContainer.firstChild === range.endContainer && range.endOffset === 1) {
        if (range.startContainer !== composer.element) {
          range.setEndAfter(range.startContainer);
        }
      }
      return;
    }

    if (range.endContainer && range.endContainer.nodeType === 1 && range.startContainer.nodeType === 3) {
      if (range.endContainer.firstChild === range.startContainer && range.endOffset === 1) {
        if (range.endContainer !== composer.element) {
          range.setStartBefore(range.endContainer);
        }
      }
      return;
    }


    if (range.startContainer && range.startContainer.nodeType === 3 && range.startContainer === range.endContainer && range.startContainer.parentNode) {
      if (range.startContainer.parentNode.firstChild === range.startContainer && range.endOffset == range.endContainer.length && range.startOffset === 0) {
        node = range.startContainer.parentNode;
        if (node !== composer.element) {
          range.setStartBefore(node);
          range.setEndAfter(node);
        }
      }
      return;
    }
  }
  
  // Return options object with nodeName set if original did not have any
  // Node name is set to local or global default
  function getOptionsWithNodename(options, defaultName, composer) {
    var correctedOptions = (options) ? wysihtml5.lang.object(options).clone(true) : null;
    if (correctedOptions) {  
      correctedOptions.nodeName = correctedOptions.nodeName || defaultName || defaultNodeName(composer);
    }
    return correctedOptions;
  }
  
  // Injects document fragment to range ensuring outer elements are split to a place where block elements are allowed to be inserted
  // Also wraps empty clones of split parent tags around fragment to keep formatting
  // If firstOuterBlock is given assume that instead of finding outer (useful for solving cases of some blocks are allowed into others while others are not)
  function injectFragmentToRange(fragment, range, composer, firstOuterBlock) {
    var rangeStartContainer = range.startContainer,
        firstOuterBlock = firstOuterBlock || findOuterBlock(rangeStartContainer, composer.element, true),
        outerInlines;
    
    if (firstOuterBlock) {
      // If selection starts inside un-nestable block, split-escape the unnestable point and insert node between
      composer.selection.splitElementAtCaret(firstOuterBlock, fragment);
    } else {
      // Ensure node does not get inserted into an inline where it is not allowed
      outerInlines = cloneOuterInlines(rangeStartContainer, composer.element);
      if (outerInlines.outerNode && outerInlines.innerNode && outerInlines.parent) {
        if (fragment.childNodes.length === 1) {
          while(fragment.firstChild.firstChild) {
            outerInlines.innerNode.appendChild(fragment.firstChild.firstChild);
          }
          fragment.firstChild.appendChild(outerInlines.outerNode);
        }
        composer.selection.splitElementAtCaret(outerInlines.parent, fragment);
      } else {
        // Otherwise just insert
        range.insertNode(fragment);
      }
    }
  }
  
  // Removes all block formatting from range
  function clearRangeBlockFromating(range, closestBlockName, composer) {
    fixRangeCoverage(range, composer);

    var r = range.cloneRange(),
        content = r.extractContents(),
        fragment = composer.doc.createDocumentFragment(),
        children, blocks;
        
    while(content.firstChild) {
      // Iterate over all selection content first level childNodes
      if (content.firstChild.nodeType == 1) {
        // If node is a block element
        // Split block formating and add new block to wrap caret
        
        unwrapBlocksFromContent(content.firstChild);
        children = wysihtml5.dom.unwrap(content.firstChild);
        for (var c = 0, cmax = children.length; c < cmax; c++) {
          fragment.appendChild(children[c]);
        }
        if (fragment.childNodes.length > 0) {
          fragment.appendChild(composer.doc.createElement('BR'));
        }
        
      } else {
        fragment.appendChild(content.firstChild);
      }
    }
    blocks = wysihtml5.lang.array(fragment.childNodes).get();
    injectFragmentToRange(fragment, r, composer);
    return blocks;
  }
  

  // Wrap the range with a block level element
  // If element is one of unnestable block elements (ex: h2 inside h1), split nodes and insert between so nesting does not occur
  function wrapRangeWithElement(range, options, closestBlockName, composer) {
    fixRangeCoverage(range, composer);
    
    var similarOptions = options ? correctOptionsForSimilarityCheck(options) : null,
        r = range.cloneRange(),
        rangeStartContainer = r.startContainer,
        content = r.extractContents(),
        fragment = composer.doc.createDocumentFragment(),
        similarOuterBlock = similarOptions ? wysihtml5.dom.getParentElement(rangeStartContainer, similarOptions, null, composer.element) : null,
        splitAllBlocks = !closestBlockName || !options || (options.nodeName === "BLOCKQUOTE" && closestBlockName === "BLOCKQUOTE"),
        firstOuterBlock = similarOuterBlock || findOuterBlock(rangeStartContainer, composer.element, splitAllBlocks), // The outermost un-nestable block element parent of selection start
        wrapper, blocks, children;

    if (options && options.nodeName === "BLOCKQUOTE") {
      
      // If blockquote is to be inserted no quessing just add it as outermost block on line or selection
      var tmpEl = applyOptionsToElement(null, options, composer);
      tmpEl.appendChild(content);
      fragment.appendChild(tmpEl);
      blocks = [tmpEl];
      
    } else {

      if (!content.firstChild) {
        // IF selection is caret (can happen if line is empty) add format around tag 
        fragment.appendChild(applyOptionsToElement(null, options, composer));
      } else {

        while(content.firstChild) {
          // Iterate over all selection content first level childNodes
          
          if (content.firstChild.nodeType == 1 && content.firstChild.matches(BLOCK_ELEMENTS)) {
            
            // If node is a block element
            // Escape(split) block formatting at caret
            applyOptionsToElement(content.firstChild, options, composer);
            if (content.firstChild.matches(UNNESTABLE_BLOCK_ELEMENTS)) {
              unwrapBlocksFromContent(content.firstChild);
            }
            fragment.appendChild(content.firstChild);
            
          } else {
            
            // Wrap subsequent non-block nodes inside new block element
            wrapper = applyOptionsToElement(null, getOptionsWithNodename(options, closestBlockName, composer), composer);
            while(content.firstChild && (content.firstChild.nodeType !== 1 || !content.firstChild.matches(BLOCK_ELEMENTS))) {
              if (content.firstChild.nodeType == 1 && wrapper.matches(UNNESTABLE_BLOCK_ELEMENTS)) {
                unwrapBlocksFromContent(content.firstChild);
              }
              wrapper.appendChild(content.firstChild);
            }
            fragment.appendChild(wrapper);
          }
        }
      }

      blocks = wysihtml5.lang.array(fragment.childNodes).get();
    }
    injectFragmentToRange(fragment, r, composer, firstOuterBlock);
    return blocks;
  }

  // Find closest block level element
  function getParentBlockNodeName(element, composer) {
    var parentNode = wysihtml5.dom.getParentElement(element, {
          query: BLOCK_ELEMENTS
        }, null, composer.element);

    return (parentNode) ? parentNode.nodeName : null;
  }
  
  // Expands caret to cover the closest block that:
  //   * cannot contain other block level elements (h1-6,p, etc)
  //   * Has the same nodeName that is to be inserted
  //   * has insertingNodeName
  //   * is DIV if insertingNodeName is not present
  //
  // If nothing found selects the current line
  function expandCaretToBlock(composer, insertingNodeName) {
    var parent = wysihtml5.dom.getParentElement(composer.selection.getOwnRanges()[0].startContainer, {
          query: UNNESTABLE_BLOCK_ELEMENTS + ', ' + (insertingNodeName ? insertingNodeName.toLowerCase() : 'div'),
        }, null, composer.element),
        range;

    if (parent) {
      range = composer.selection.createRange();
      range.selectNode(parent);
      composer.selection.setSelection(range);
    } else if (!composer.isEmpty()) {
      composer.selection.selectLine();
    }
  }
  
  // Set selection to begin inside first created block element (beginning of it) and end inside (and after content) of last block element
  // TODO: Checking nodetype might be unnescescary as nodes inserted by formatBlock are nodetype 1 anyway
  function selectElements(newBlockElements, composer) {
    var range = composer.selection.createRange(),
        lastEl = newBlockElements[newBlockElements.length - 1],
        lastOffset = (lastEl.nodeType === 1 && lastEl.childNodes) ? lastEl.childNodes.length | 0 :  lastEl.length || 0;

    range.setStart(newBlockElements[0], 0);
    range.setEnd(lastEl, lastOffset);
    range.select();
  }
  
  // Get all ranges from selection (takes out uneditables and out of editor parts) and apply format to each
  // Return created/modified block level elements 
  // Method can be either "apply" or "remove"
  function formatSelection(method, composer, options) {
    var ranges = composer.selection.getOwnRanges(),
        newBlockElements = [],
        closestBlockName;
        
    for (var i = ranges.length; i--;) {
      closestBlockName = getParentBlockNodeName(ranges[i].startContainer, composer);
      if (method === "remove") {
        newBlockElements = newBlockElements.concat(clearRangeBlockFromating(ranges[i], closestBlockName, composer));
      } else {
        newBlockElements = newBlockElements.concat(wrapRangeWithElement(ranges[i], options, closestBlockName, composer));
      }
    }
    return newBlockElements;
  }

  wysihtml5.commands.formatBlock = {
    exec: function(composer, command, options) {
      
      var newBlockElements = [],
          ranges, range, bookmark, state, closestBlockName;

      // If properties is passed as a string, look for tag with that tagName/query 
      if (typeof options === "string") {
        options = {
          nodeName: options.toUpperCase()
        };
      }
      
      // Find if current format state is active if options.toggle is set as true
      // In toggle case active state elemets are formatted instead of working directly on selection
      if (options && options.toggle) {
        state = this.state(composer, command, options);
      }
      if (state) {

        // Remove format from state nodes if toggle set and state on and selection is collapsed
        bookmark = rangy.saveSelection(composer.win);
        for (var j = 0, jmax = state.length; j < jmax; j++) {
          removeOptionsFromElement(state[j], options, composer);
        }

      } else {
        
        // If selection is caret expand it to cover nearest suitable block element or row if none found
        if (composer.selection.isCollapsed()) {
          bookmark = rangy.saveSelection(composer.win);
          expandCaretToBlock(composer, options ? options.nodeName : undefined);
        }
        
        if (options) {
          newBlockElements = formatSelection("apply", composer, options);
        } else {
          // Options == null means block formatting should be removed from selection
          newBlockElements = formatSelection("remove", composer);
        }
      }

      // Remove empty block elements that may be left behind
      // Also remove them from new blocks list
      newBlockElements = cleanup(composer, newBlockElements);
      
      // Restore selection
      if (bookmark) {
        rangy.restoreSelection(bookmark);
      } else {
        selectElements(newBlockElements, composer);
      }
    },

    // If properties as null is passed returns status describing all block level elements
    state: function(composer, command, properties) {
      
      // If properties is passed as a string, look for tag with that tagName/query 
      if (typeof properties === "string") {
        properties = {
          query: properties
        };
      }

      var nodes = composer.selection.filterElements((function (element) { // Finds matching elements inside selection
            return wysihtml5.dom.domNode(element).test(properties || { query: BLOCK_ELEMENTS });
          }).bind(this)),
          parentNodes = composer.selection.getSelectedOwnNodes(),
          parent;

      // Finds matching elements that are parents of selection and adds to nodes list
      for (var i = 0, maxi = parentNodes.length; i < maxi; i++) {
        parent = dom.getParentElement(parentNodes[i], properties || { query: BLOCK_ELEMENTS }, null, composer.element);
        if (parent && nodes.indexOf(parent) === -1) {
          nodes.push(parent);
        }
      }

      return (nodes.length === 0) ? false : nodes;
    }

  };
})(wysihtml5);
