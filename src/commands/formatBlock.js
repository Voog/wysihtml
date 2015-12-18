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

  function getRangeNode(node, offset) {
    if (node.nodeType === 3) {
      return node;
    } else {
      return node.childNodes[offset] || node;
    }
  }

  // Returns if node is a line break
  function isBr(n) {
    return n && n.nodeType === 1 && n.nodeName === "BR";
  }

  // Is block level element
  function isBlock(n, composer) {
    return n && n.nodeType === 1 && composer.win.getComputedStyle(n).display === "block";
  }

  // Returns if node is the rangy selection bookmark element (that must not be taken into account in most situatons and is removed on selection restoring)
  function isBookmark(n) {
    return n && n.nodeType === 1 && n.classList.contains('rangySelectionBoundary');
  }

  // Is line breaking node
  function isLineBreaking(n, composer) {
    return isBr(n) || isBlock(n, composer);
  }

  // Removes empty block level elements
  function cleanup(composer, newBlockElements) {
    wysihtml5.dom.removeInvisibleSpaces(composer.element);
    var container = composer.element,
        allElements = container.querySelectorAll(BLOCK_ELEMENTS),
        noEditQuery = composer.config.classNames.uneditableContainer + ([""]).concat(BLOCK_ELEMENTS.split(',')).join(", " + composer.config.classNames.uneditableContainer + ' '),
        uneditables = container.querySelectorAll(noEditQuery),
        elements = wysihtml5.lang.array(allElements).without(uneditables), // Lets not touch uneditable elements and their contents
        nbIdx;

    for (var i = elements.length; i--;) {
      if (elements[i].innerHTML.replace(/[\uFEFF]/g, '') === "" && (newBlockElements.length === 0 || elements[i] !== newBlockElements[newBlockElements.length - 1])) {
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
    var style, classes,
        prevNode = element.previousSibling,
        nextNode = element.nextSibling,
        unwrapped = false;

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

    if (options.nodeName && element.nodeName.toLowerCase() === options.nodeName.toLowerCase()) {
      style = element.getAttribute('style');
      if (!style || style.trim() === '') {
        dom.unwrap(element);
        unwrapped = true;
      } else {
        element = dom.renameElement(element, defaultNodeName(composer));
      }
    }

    // Clean up blank style attribute
    if (element.getAttribute('style') !== null && element.getAttribute('style').trim() === "") {
      element.removeAttribute('style');
    }

    if (unwrapped) {
      applySurroundingLineBreaks(prevNode, nextNode, composer);
    }
  }

  // Unwraps block level elements from inside content
  // Useful as not all block level elements can contain other block-levels
  function unwrapBlocksFromContent(element) {
    var blocks = element.querySelectorAll(BLOCK_ELEMENTS) || [], // Find unnestable block elements in extracted contents
        nextEl, prevEl;

    for (var i = blocks.length; i--;) {
      nextEl = wysihtml5.dom.domNode(blocks[i]).next({nodeTypes: [1,3], ignoreBlankTexts: true}),
      prevEl = wysihtml5.dom.domNode(blocks[i]).prev({nodeTypes: [1,3], ignoreBlankTexts: true});
      
      if (nextEl && nextEl.nodeType !== 1 && nextEl.nodeName !== 'BR') {
        if ((blocks[i].innerHTML || blocks[i].nodeValue || '').trim() !== '') {
          blocks[i].parentNode.insertBefore(blocks[i].ownerDocument.createElement('BR'), nextEl);
        }
      }
      if (nextEl && nextEl.nodeType !== 1 && nextEl.nodeName !== 'BR') {
        if ((blocks[i].innerHTML || blocks[i].nodeValue || '').trim() !== '') {
          blocks[i].parentNode.insertBefore(blocks[i].ownerDocument.createElement('BR'), nextEl);
        }
      }
      wysihtml5.dom.unwrap(blocks[i]);
    }
  }

  // Fix ranges that visually cover whole block element to actually cover the block
  function fixRangeCoverage(range, composer) {
    var node,
        start = range.startContainer,
        end = range.endContainer;

    // If range has only one childNode and it is end to end the range, extend the range to contain the container element too
    // This ensures the wrapper node is modified and optios added to it
    if (start && start.nodeType === 1 && start === end) {
      if (start.firstChild === start.lastChild && range.endOffset === 1) {
        if (start !== composer.element && start.nodeName !== 'LI' && start.nodeName !== 'TD') {
          range.setStartBefore(start);
          range.setEndAfter(end);
        }
      }
      return;
    }

    // If range starts outside of node and ends inside at textrange and covers the whole node visually, extend end to cover the node end too
    if (start && start.nodeType === 1 && end.nodeType === 3) {
      if (start.firstChild === end && range.endOffset === end.data.length) {
        if (start !== composer.element && start.nodeName !== 'LI' && start.nodeName !== 'TD') {
          range.setEndAfter(start);
        }
      }
      return;
    }
    
    // If range ends outside of node and starts inside at textrange and covers the whole node visually, extend start to cover the node start too
    if (end && end.nodeType === 1 && start.nodeType === 3) {
      if (end.firstChild === start && range.startOffset === 0) {
        if (end !== composer.element && end.nodeName !== 'LI' && end.nodeName !== 'TD') {
          range.setStartBefore(end);
        }
      }
      return;
    }

    // If range covers a whole textnode and the textnode is the only child of node, extend range to node 
    if (start && start.nodeType === 3 && start === end && start.parentNode.childNodes.length === 1) {
      if (range.endOffset == end.data.length && range.startOffset === 0) {
        node = start.parentNode;
        if (node !== composer.element && node.nodeName !== 'LI' && node.nodeName !== 'TD') {
          range.setStartBefore(node);
          range.setEndAfter(node);
        }
      }
      return;
    }
  }
  
  // Scans ranges array for insertion points that are not allowed to insert block tags fixes/splits illegal ranges
  // Some places do not allow block level elements inbetween (inside ul and outside li)
  // TODO: might need extending for other nodes besides li (maybe dd,dl,dt)
  function fixNotPermittedInsertionPoints(ranges) {
    var newRanges = [],
        lis, j, maxj, tmpRange, rangePos, closestLI;
        
    for (var i = 0, maxi = ranges.length; i < maxi; i++) {
      
      // Fixes range start and end positions if inside UL or OL element (outside of LI)
      if (ranges[i].startContainer.nodeType === 1 && ranges[i].startContainer.matches('ul, ol')) {
        ranges[i].setStart(ranges[i].startContainer.childNodes[ranges[i].startOffset], 0);
      }
      if (ranges[i].endContainer.nodeType === 1 && ranges[i].endContainer.matches('ul, ol')) {
        closestLI = ranges[i].endContainer.childNodes[Math.max(ranges[i].endOffset - 1, 0)];
        if (closestLI.childNodes) {
          ranges[i].setEnd(closestLI, closestLI.childNodes.length);
        }
      }

      // Get all LI eleemnts in selection (fully or partially covered)
      // And make sure ranges are either inside LI or outside UL/OL
      // Split and add new ranges as needed to cover same range content
      // TODO: Needs improvement to accept DL, DD, DT
      lis = ranges[i].getNodes([1], function(node) {
        return node.nodeName === "LI";
      });
      if (lis.length > 0) {
      
        for (j = 0, maxj = lis.length; j < maxj; j++) {
          rangePos = ranges[i].compareNode(lis[j]);

          // Fixes start of range that crosses LI border
          if (rangePos === ranges[i].NODE_AFTER || rangePos === ranges[i].NODE_INSIDE) {
            // Range starts before and ends inside the node

            tmpRange = ranges[i].cloneRange();
            closestLI = wysihtml5.dom.domNode(lis[j]).prev({nodeTypes: [1]});
            
            if (closestLI) {
              tmpRange.setEnd(closestLI, closestLI.childNodes.length);
            } else if (lis[j].closest('ul, ol')) {
              tmpRange.setEndBefore(lis[j].closest('ul, ol'));
            } else {
              tmpRange.setEndBefore(lis[j]);
            }
            newRanges.push(tmpRange);
            ranges[i].setStart(lis[j], 0);
          }
          
          // Fixes end of range that crosses li border
          if (rangePos === ranges[i].NODE_BEFORE || rangePos === ranges[i].NODE_INSIDE) {
            // Range starts inside the node and ends after node
            
            tmpRange = ranges[i].cloneRange();
            tmpRange.setEnd(lis[j], lis[j].childNodes.length);
            newRanges.push(tmpRange);
            
            // Find next LI in list and if present set range to it, else 
            closestLI = wysihtml5.dom.domNode(lis[j]).next({nodeTypes: [1]});
            if (closestLI) {
              ranges[i].setStart(closestLI, 0);
            } else if (lis[j].closest('ul, ol')) {
              ranges[i].setStartAfter(lis[j].closest('ul, ol'));
            } else {
              ranges[i].setStartAfter(lis[j]);
            } 
          }
        }
        newRanges.push(ranges[i]);
      } else {
        newRanges.push(ranges[i]);
      }
    }
    return newRanges;
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
        outerInlines, first, last, prev, next;
    
    if (firstOuterBlock) {
      // If selection starts inside un-nestable block, split-escape the unnestable point and insert node between
      first = fragment.firstChild;
      last = fragment.lastChild;

      composer.selection.splitElementAtCaret(firstOuterBlock, fragment);

      next = wysihtml5.dom.domNode(last).next({nodeTypes: [1,3], ignoreBlankTexts: true});
      prev = wysihtml5.dom.domNode(first).prev({nodeTypes: [1,3], ignoreBlankTexts: true});

      if (first && !isLineBreaking(first, composer) && prev && !isLineBreaking(prev, composer)) {
        first.parentNode.insertBefore(composer.doc.createElement('br'), first);
      }

      if (last && !isLineBreaking(last, composer) && next && !isLineBreaking(next, composer)) {
        next.parentNode.insertBefore(composer.doc.createElement('br'), next);
      }

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
        var fc = fragment.firstChild,
            lc = fragment.lastChild;

        range.insertNode(fragment);
        // restore range position as it might get lost in webkit sometimes
        range.setStartBefore(fc);
        range.setEndAfter(lc);
      }
    }
  }
  
  // Removes all block formatting from range
  function clearRangeBlockFromating(range, closestBlockName, composer) {
    var r = range.cloneRange(),
        prevNode = getRangeNode(r.startContainer, r.startOffset).previousSibling,
        nextNode = getRangeNode(r.endContainer, r.endOffset).nextSibling,
        content = r.extractContents(),
        fragment = composer.doc.createDocumentFragment(),
        children, blocks,
        first = true;
        
    while(content.firstChild) {
      // Iterate over all selection content first level childNodes
      if (content.firstChild.nodeType === 1 && content.firstChild.matches(BLOCK_ELEMENTS)) {
        // If node is a block element
        // Split block formating and add new block to wrap caret
        
        unwrapBlocksFromContent(content.firstChild);
        children = wysihtml5.dom.unwrap(content.firstChild);
        
        // Add line break before if needed
        if (children.length > 0) {
          if (
            (fragment.lastChild && (fragment.lastChild.nodeType !== 1 || !isLineBreaking(fragment.lastChild, composer))) ||
            (!fragment.lastChild && prevNode && (prevNode.nodeType !== 1 || isLineBreaking(prevNode, composer)))
          ){
            fragment.appendChild(composer.doc.createElement('BR'));
          }
        }
        
        for (var c = 0, cmax = children.length; c < cmax; c++) {
          fragment.appendChild(children[c]);
        }
        
        // Add line break after if needed
        if (children.length > 0) {
          if (fragment.lastChild.nodeType !== 1 || !isLineBreaking(fragment.lastChild, composer)) {
            if (nextNode || fragment.lastChild !== content.lastChild) {
              fragment.appendChild(composer.doc.createElement('BR'));
            }
          }
        }
        
      } else {
        fragment.appendChild(content.firstChild);
      }
      
      first = false;
    }
    blocks = wysihtml5.lang.array(fragment.childNodes).get();
    injectFragmentToRange(fragment, r, composer);
    return blocks;
  }
  
  // When block node is inserted, look surrounding nodes and remove surplous linebreak tags (as block format breaks line itself)
  function removeSurroundingLineBreaks(prevNode, nextNode, composer) {
    var prevPrev = prevNode && wysihtml5.dom.domNode(prevNode).prev({nodeTypes: [1,3], ignoreBlankTexts: true});
    if (isBr(nextNode)) {
      nextNode.parentNode.removeChild(nextNode);
    }
    if (isBr(prevNode) && (!prevPrev || prevPrev.nodeType !== 1 || composer.win.getComputedStyle(prevPrev).display !== "block")) {
      prevNode.parentNode.removeChild(prevNode);
    }
  }

  function applySurroundingLineBreaks(prevNode, nextNode, composer) {
    var prevPrev;

    if (prevNode && isBookmark(prevNode)) {
      prevNode = prevNode.previousSibling;
    }
    if (nextNode && isBookmark(nextNode)) {
      nextNode = nextNode.nextSibling;
    }

    prevPrev = prevNode && prevNode.previousSibling;

    if (prevNode && (prevNode.nodeType !== 1 || (composer.win.getComputedStyle(prevNode).display !== "block" && !isBr(prevNode))) && prevNode.parentNode) {
      prevNode.parentNode.insertBefore(composer.doc.createElement('br'), prevNode.nextSibling);
    }

    if (nextNode && (nextNode.nodeType !== 1 || composer.win.getComputedStyle(nextNode).display !== "block") && nextNode.parentNode) {
      nextNode.parentNode.insertBefore(composer.doc.createElement('br'), nextNode);
    }
  }

  var isWhitespaceBefore = function (textNode, offset) {
    var str = textNode.data ? textNode.data.slice(0, offset) : "";
    return (/^\s*$/).test(str);
  }

  var isWhitespaceAfter = function (textNode, offset) {
    var str = textNode.data ? textNode.data.slice(offset) : "";
    return (/^\s*$/).test(str);
  }

  var trimBlankTextsAndBreaks = function(fragment) {
    if (fragment) {
      while (fragment.firstChild && fragment.firstChild.nodeType === 3 && (/^\s*$/).test(fragment.firstChild.data) && fragment.lastChild !== fragment.firstChild) {
        fragment.removeChild(fragment.firstChild);
      }

      while (fragment.lastChild && fragment.lastChild.nodeType === 3 && (/^\s*$/).test(fragment.lastChild.data) && fragment.lastChild !== fragment.firstChild) {
        fragment.removeChild(fragment.lastChild);
      }

      if (fragment.firstChild && fragment.firstChild.nodeType === 1 && fragment.firstChild.nodeName === "BR" && fragment.lastChild !== fragment.firstChild) {
        fragment.removeChild(fragment.firstChild);
      }

      if (fragment.lastChild && fragment.lastChild.nodeType === 1 && fragment.lastChild.nodeName === "BR" && fragment.lastChild !== fragment.firstChild) {
        fragment.removeChild(fragment.lastChild);
      }
    }
  }

  // Wrap the range with a block level element
  // If element is one of unnestable block elements (ex: h2 inside h1), split nodes and insert between so nesting does not occur
  function wrapRangeWithElement(range, options, closestBlockName, composer) {
    var similarOptions = options ? correctOptionsForSimilarityCheck(options) : null,
        r = range.cloneRange(),
        rangeStartContainer = r.startContainer,
        startNode = getRangeNode(r.startContainer, r.startOffset),
        endNode = getRangeNode(r.endContainer, r.endOffset),
        prevNode = (r.startContainer === startNode && startNode.nodeType === 3 && !isWhitespaceBefore(startNode, r.startOffset)) ? startNode :  wysihtml5.dom.domNode(startNode).prev({nodeTypes: [1,3], ignoreBlankTexts: true}),
        nextNode = (
          (
            r.endContainer.nodeType === 1 &&
            r.endContainer.childNodes[r.endOffset] === endNode &&
            (
              endNode.nodeType === 1 ||
              !isWhitespaceAfter(endNode, r.endOffset) &&
              !wysihtml5.dom.domNode(endNode).is.rangyBookmark()
            )
          ) || (
            r.endContainer === endNode &&
            endNode.nodeType === 3 &&
            !isWhitespaceAfter(endNode, r.endOffset)
          )
        ) ? endNode : wysihtml5.dom.domNode(endNode).next({nodeTypes: [1,3], ignoreBlankTexts: true}),
        content = r.extractContents(),
        fragment = composer.doc.createDocumentFragment(),
        similarOuterBlock = similarOptions ? wysihtml5.dom.getParentElement(rangeStartContainer, similarOptions, null, composer.element) : null,
        splitAllBlocks = !closestBlockName || !options || (options.nodeName === "BLOCKQUOTE" && closestBlockName === "BLOCKQUOTE"),
        firstOuterBlock = similarOuterBlock || findOuterBlock(rangeStartContainer, composer.element, splitAllBlocks), // The outermost un-nestable block element parent of selection start
        wrapper, blocks, children,
        firstc, lastC;

    if (wysihtml5.dom.domNode(nextNode).is.rangyBookmark()) {
      endNode = nextNode;
      nextNode = endNode.nextSibling;
    }

    trimBlankTextsAndBreaks(content);

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
    removeSurroundingLineBreaks(prevNode, nextNode, composer);

    // Fix webkit madness by inserting linebreak rangy after cursor marker to blank last block
    // (if it contains rangy bookmark, so selection can be restored later correctly)
    if (blocks.length > 0 &&
      (
        typeof blocks[blocks.length - 1].lastChild === "undefined" || wysihtml5.dom.domNode(blocks[blocks.length - 1].lastChild).is.rangyBookmark()
      )
    ) {
      blocks[blocks.length - 1].appendChild(composer.doc.createElement('br'));
    }
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
        
    // Some places do not allow block level elements inbetween (inside ul and outside li, inside table and outside of td/th)
    ranges = fixNotPermittedInsertionPoints(ranges);
        
    for (var i = ranges.length; i--;) {
      fixRangeCoverage(ranges[i], composer);
      closestBlockName = getParentBlockNodeName(ranges[i].startContainer, composer);
      if (method === "remove") {
        newBlockElements = newBlockElements.concat(clearRangeBlockFromating(ranges[i], closestBlockName, composer));
      } else {
        newBlockElements = newBlockElements.concat(wrapRangeWithElement(ranges[i], options, closestBlockName, composer));
      }
    }
    return newBlockElements;
  }
  
  // If properties is passed as a string, look for tag with that tagName/query 
  function parseOptions(options) {
    if (typeof options === "string") {
      options = {
        nodeName: options.toUpperCase()
      };
    }
    return options;
  }

  function caretIsOnEmptyLine(composer) {
    var caretInfo;
    if (composer.selection.isCollapsed()) {
      caretInfo = composer.selection.getNodesNearCaret();
      if (caretInfo && caretInfo.caretNode) {
        if (
          // caret is allready breaknode
          wysihtml5.dom.domNode(caretInfo.caretNode).is.lineBreak() ||
          // caret is textnode
          (caretInfo.caretNode.nodeType === 3 && caretInfo.textOffset === 0 && (!caretInfo.prevNode || wysihtml5.dom.domNode(caretInfo.prevNode).is.lineBreak())) ||
          // Caret is temprorary rangy selection marker
          (caretInfo.caretNode.nodeType === 1 && caretInfo.caretNode.classList.contains('rangySelectionBoundary') &&
            (!caretInfo.prevNode || wysihtml5.dom.domNode(caretInfo.prevNode).is.lineBreak() || wysihtml5.dom.domNode(caretInfo.prevNode).is.block()) &&
            (!caretInfo.nextNode || wysihtml5.dom.domNode(caretInfo.nextNode).is.lineBreak() || wysihtml5.dom.domNode(caretInfo.nextNode).is.block())
          )
        ) {
          return true;
        }
      }
    }
    return false;
  }

  wysihtml5.commands.formatBlock = {
    exec: function(composer, command, options) {
      options = parseOptions(options);
      var newBlockElements = [],
          ranges, range, bookmark, state, closestBlockName;

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
          if (caretIsOnEmptyLine(composer)) {
            composer.selection.selectLine();
          } else {
            expandCaretToBlock(composer, options && options.nodeName ? options.nodeName.toUpperCase() : undefined);
          }
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
    
    // Removes all block formatting from selection
    remove: function(composer, command, options) {
      options = parseOptions(options);
      var newBlockElements, bookmark;
      
      // If selection is caret expand it to cover nearest suitable block element or row if none found
      if (composer.selection.isCollapsed()) {
        bookmark = rangy.saveSelection(composer.win);
        expandCaretToBlock(composer, options && options.nodeName ? options.nodeName.toUpperCase() : undefined);
      }
      
      newBlockElements = formatSelection("remove", composer);
      newBlockElements = cleanup(composer, newBlockElements);
      
      // Restore selection
      if (bookmark) {
        rangy.restoreSelection(bookmark);
      } else {
        selectElements(newBlockElements, composer);
      }
    },

    // If options as null is passed returns status describing all block level elements
    state: function(composer, command, options) {
      options = parseOptions(options);

      var nodes = composer.selection.filterElements((function (element) { // Finds matching elements inside selection
            return wysihtml5.dom.domNode(element).test(options || { query: BLOCK_ELEMENTS });
          }).bind(this)),
          parentNodes = composer.selection.getSelectedOwnNodes(),
          parent;

      // Finds matching elements that are parents of selection and adds to nodes list
      for (var i = 0, maxi = parentNodes.length; i < maxi; i++) {
        parent = dom.getParentElement(parentNodes[i], options || { query: BLOCK_ELEMENTS }, null, composer.element);
        if (parent && nodes.indexOf(parent) === -1) {
          nodes.push(parent);
        }
      }

      return (nodes.length === 0) ? false : nodes;
    }

  };
})(wysihtml5);
