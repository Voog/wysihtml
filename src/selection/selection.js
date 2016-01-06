/**
 * Selection API
 *
 * @example
 *    var selection = new wysihtml5.Selection(editor);
 */
(function(wysihtml5) {
  var dom = wysihtml5.dom;

  function _getCumulativeOffsetTop(element) {
    var top = 0;
    if (element.parentNode) {
      do {
        top += element.offsetTop || 0;
        element = element.offsetParent;
      } while (element);
    }
    return top;
  }

  // Provides the depth of ``descendant`` relative to ``ancestor``
  function getDepth(ancestor, descendant) {
      var ret = 0;
      while (descendant !== ancestor) {
          ret++;
          descendant = descendant.parentNode;
          if (!descendant)
              throw new Error("not a descendant of ancestor!");
      }
      return ret;
  }

  function getRangeNode(node, offset) {
    if (node.nodeType === 3) {
      return node;
    } else {
      return node.childNodes[offset] || node;
    }
  }

  function getWebkitSelectionFixNode(container) {
    var blankNode = document.createElement('span');

    var placeholderRemover = function(event) {
      // Self-destructs the caret and keeps the text inserted into it by user
      var lastChild;

      container.removeEventListener('mouseup', placeholderRemover);
      container.removeEventListener('keydown', placeholderRemover);
      container.removeEventListener('touchstart', placeholderRemover);
      container.removeEventListener('focus', placeholderRemover);
      container.removeEventListener('blur', placeholderRemover);
      container.removeEventListener('paste', delayedPlaceholderRemover);
      container.removeEventListener('drop', delayedPlaceholderRemover);
      container.removeEventListener('beforepaste', delayedPlaceholderRemover);

      if (blankNode && blankNode.parentNode) {
        blankNode.parentNode.removeChild(blankNode);
      }
    },
    delayedPlaceholderRemover = function (event) {
      if (blankNode && blankNode.parentNode) {
        setTimeout(placeholderRemover, 0);
      }
    };

    blankNode.appendChild(container.ownerDocument.createTextNode(wysihtml5.INVISIBLE_SPACE));
    blankNode.className = '_wysihtml5-temp-caret-fix';
    blankNode.style.display = 'block';
    blankNode.style.minWidth = '1px';
    blankNode.style.height = '0px';

    container.addEventListener('mouseup', placeholderRemover);
    container.addEventListener('keydown', placeholderRemover);
    container.addEventListener('touchstart', placeholderRemover);
    container.addEventListener('focus', placeholderRemover);
    container.addEventListener('blur', placeholderRemover);
    container.addEventListener('paste', delayedPlaceholderRemover);
    container.addEventListener('drop', delayedPlaceholderRemover);
    container.addEventListener('beforepaste', delayedPlaceholderRemover);

    return blankNode;
  }

  // Should fix the obtained ranges that cannot surrond contents normally to apply changes upon
  // Being considerate to firefox that sets range start start out of span and end inside on doubleclick initiated selection
  function expandRangeToSurround(range) {
      if (range.canSurroundContents()) return;

      var common = range.commonAncestorContainer,
          start_depth = getDepth(common, range.startContainer),
          end_depth = getDepth(common, range.endContainer);

      while(!range.canSurroundContents()) {
        // In the following branches, we cannot just decrement the depth variables because the setStartBefore/setEndAfter may move the start or end of the range more than one level relative to ``common``. So we need to recompute the depth.
        if (start_depth > end_depth) {
            range.setStartBefore(range.startContainer);
            start_depth = getDepth(common, range.startContainer);
        }
        else {
            range.setEndAfter(range.endContainer);
            end_depth = getDepth(common, range.endContainer);
        }
      }
  }

  wysihtml5.Selection = Base.extend(
    /** @scope wysihtml5.Selection.prototype */ {
    constructor: function(editor, contain, unselectableClass) {
      // Make sure that our external range library is initialized
      rangy.init();

      this.editor   = editor;
      this.composer = editor.composer;
      this.doc      = this.composer.doc;
      this.win      = this.composer.win;
      this.contain = contain;
      this.unselectableClass = unselectableClass || false;
    },

    /**
     * Get the current selection as a bookmark to be able to later restore it
     *
     * @return {Object} An object that represents the current selection
     */
    getBookmark: function() {
      var range = this.getRange();
      return range && range.cloneRange();
    },

    /**
     * Restore a selection retrieved via wysihtml5.Selection.prototype.getBookmark
     *
     * @param {Object} bookmark An object that represents the current selection
     */
    setBookmark: function(bookmark) {
      if (!bookmark) {
        return;
      }

      this.setSelection(bookmark);
    },

    /**
     * Set the caret in front of the given node
     *
     * @param {Object} node The element or text node where to position the caret in front of
     * @example
     *    selection.setBefore(myElement);
     */
    setBefore: function(node) {
      var range = rangy.createRange(this.doc);
      range.setStartBefore(node);
      range.setEndBefore(node);
      return this.setSelection(range);
    },

    // Constructs a self removing whitespace (ain absolute positioned span) for placing selection caret when normal methods fail.
    // Webkit has an issue with placing caret into places where there are no textnodes near by.
    createTemporaryCaretSpaceAfter: function (node) {
      var caretPlaceholder = this.doc.createElement('span'),
          caretPlaceholderText = this.doc.createTextNode(wysihtml5.INVISIBLE_SPACE),
          placeholderRemover = (function(event) {
            // Self-destructs the caret and keeps the text inserted into it by user
            var lastChild;

            this.contain.removeEventListener('mouseup', placeholderRemover);
            this.contain.removeEventListener('keydown', keyDownHandler);
            this.contain.removeEventListener('touchstart', placeholderRemover);
            this.contain.removeEventListener('focus', placeholderRemover);
            this.contain.removeEventListener('blur', placeholderRemover);
            this.contain.removeEventListener('paste', delayedPlaceholderRemover);
            this.contain.removeEventListener('drop', delayedPlaceholderRemover);
            this.contain.removeEventListener('beforepaste', delayedPlaceholderRemover);

            // If user inserted sth it is in the placeholder and sgould be unwrapped and stripped of invisible whitespace hack
            // Otherwise the wrapper can just be removed
            if (caretPlaceholder && caretPlaceholder.parentNode) {
              caretPlaceholder.innerHTML = caretPlaceholder.innerHTML.replace(wysihtml5.INVISIBLE_SPACE_REG_EXP, "");
              if ((/[^\s]+/).test(caretPlaceholder.innerHTML)) {
                lastChild = caretPlaceholder.lastChild;
                wysihtml5.dom.unwrap(caretPlaceholder);
                this.setAfter(lastChild);
              } else {
                caretPlaceholder.parentNode.removeChild(caretPlaceholder);
              }

            }
          }).bind(this),
          delayedPlaceholderRemover = function (event) {
            if (caretPlaceholder && caretPlaceholder.parentNode) {
              setTimeout(placeholderRemover, 0);
            }
          },
          keyDownHandler = function(event) {
            if (event.which !== 8 && event.which !== 91 && event.which !== 17 && (event.which !== 86 || (!event.ctrlKey && !event.metaKey))) {
              placeholderRemover();
            }
          };

      caretPlaceholder.className = '_wysihtml5-temp-caret-fix';
      caretPlaceholder.style.position = 'absolute';
      caretPlaceholder.style.display = 'block';
      caretPlaceholder.style.minWidth = '1px';
      caretPlaceholder.style.zIndex = '99999';
      caretPlaceholder.appendChild(caretPlaceholderText);

      node.parentNode.insertBefore(caretPlaceholder, node.nextSibling);
      this.setBefore(caretPlaceholderText);

      // Remove the caret fix on any of the following events (some are delayed as content change happens after event)
      this.contain.addEventListener('mouseup', placeholderRemover);
      this.contain.addEventListener('keydown', keyDownHandler);
      this.contain.addEventListener('touchstart', placeholderRemover);
      this.contain.addEventListener('focus', placeholderRemover);
      this.contain.addEventListener('blur', placeholderRemover);
      this.contain.addEventListener('paste', delayedPlaceholderRemover);
      this.contain.addEventListener('drop', delayedPlaceholderRemover);
      this.contain.addEventListener('beforepaste', delayedPlaceholderRemover);

      return caretPlaceholder;
    },

    /**
     * Set the caret after the given node
     *
     * @param {Object} node The element or text node where to position the caret in front of
     * @example
     *    selection.setBefore(myElement);
     * callback is an optional parameter accepting a function to execute when selection ahs been set
     */
    setAfter: function(node, notVisual, callback) {
      var win = this.win,
          range = rangy.createRange(this.doc),
          fixWebkitSelection = function() {
            // Webkit fails to add selection if there are no textnodes in that region
            // (like an uneditable container at the end of content).
            var parent = node.parentNode,
                lastSibling = parent ? parent.childNodes[parent.childNodes.length - 1] : null;

            if (!sel || (lastSibling === node && node.nodeType === 1 && win.getComputedStyle(node).display === "block")) {
              if (notVisual) {
                // If setAfter is used as internal between actions, self-removing caretPlaceholder has simpler implementation
                // and remove itself in call stack end instead on user interaction 
                var caretPlaceholder = this.doc.createTextNode(wysihtml5.INVISIBLE_SPACE);
                node.parentNode.insertBefore(caretPlaceholder, node.nextSibling);
                this.selectNode(caretPlaceholder);
                setTimeout(function() {
                  if (caretPlaceholder && caretPlaceholder.parentNode) {
                    caretPlaceholder.parentNode.removeChild(caretPlaceholder);
                  }
                }, 0);
              } else {
                this.createTemporaryCaretSpaceAfter(node);
              }
            }
          }.bind(this),
          sel;

      range.setStartAfter(node);
      range.setEndAfter(node);

      // In IE contenteditable must be focused before we can set selection
      // thus setting the focus if activeElement is not this composer
      if (!document.activeElement || document.activeElement !== this.composer.element) {
        var scrollPos = this.composer.getScrollPos();
        this.composer.element.focus();
        this.composer.setScrollPos(scrollPos);
        setTimeout(function() {
          sel = this.setSelection(range);
          fixWebkitSelection();
          if (callback) {
            callback(sel);
          }
        }.bind(this), 0);
      } else {
        sel = this.setSelection(range);
        fixWebkitSelection();
        if (callback) {
          callback(sel);
        }
      }
    },

    /**
     * Ability to select/mark nodes
     *
     * @param {Element} node The node/element to select
     * @example
     *    selection.selectNode(document.getElementById("my-image"));
     */
    selectNode: function(node, avoidInvisibleSpace) {
      var range           = rangy.createRange(this.doc),
          isElement       = node.nodeType === wysihtml5.ELEMENT_NODE,
          canHaveHTML     = "canHaveHTML" in node ? node.canHaveHTML : (node.nodeName !== "IMG"),
          content         = isElement ? node.innerHTML : node.data,
          isEmpty         = (content === "" || content === wysihtml5.INVISIBLE_SPACE),
          displayStyle    = dom.getStyle("display").from(node),
          isBlockElement  = (displayStyle === "block" || displayStyle === "list-item");

      if (isEmpty && isElement && canHaveHTML && !avoidInvisibleSpace) {
        // Make sure that caret is visible in node by inserting a zero width no breaking space
        try { node.innerHTML = wysihtml5.INVISIBLE_SPACE; } catch(e) {}
      }
      if (canHaveHTML) {
        range.selectNodeContents(node);
      } else {
        range.selectNode(node);
      }

      if (canHaveHTML && isEmpty && isElement) {
        range.collapse(isBlockElement);
      } else if (canHaveHTML && isEmpty) {
        range.setStartAfter(node);
        range.setEndAfter(node);
      }

      this.setSelection(range);
    },

    /**
     * Get the node which contains the selection
     *
     * @param {Boolean} [controlRange] (only IE) Whether it should return the selected ControlRange element when the selection type is a "ControlRange"
     * @return {Object} The node that contains the caret
     * @example
     *    var nodeThatContainsCaret = selection.getSelectedNode();
     */
    getSelectedNode: function(controlRange) {
      var selection,
          range;

      if (controlRange && this.doc.selection && this.doc.selection.type === "Control") {
        range = this.doc.selection.createRange();
        if (range && range.length) {
          return range.item(0);
        }
      }

      selection = this.getSelection(this.doc);
      if (selection.focusNode === selection.anchorNode) {
        return selection.focusNode;
      } else {
        range = this.getRange(this.doc);
        return range ? range.commonAncestorContainer : this.doc.body;
      }
    },

    fixSelBorders: function() {
      var range = this.getRange();
      expandRangeToSurround(range);
      this.setSelection(range);
    },

    getSelectedOwnNodes: function(controlRange) {
      var selection,
          ranges = this.getOwnRanges(),
          ownNodes = [];

      for (var i = 0, maxi = ranges.length; i < maxi; i++) {
          ownNodes.push(ranges[i].commonAncestorContainer || this.doc.body);
      }
      return ownNodes;
    },

    findNodesInSelection: function(nodeTypes) {
      var ranges = this.getOwnRanges(),
          nodes = [], curNodes;
      for (var i = 0, maxi = ranges.length; i < maxi; i++) {
        curNodes = ranges[i].getNodes([1], function(node) {
            return wysihtml5.lang.array(nodeTypes).contains(node.nodeName);
        });
        nodes = nodes.concat(curNodes);
      }
      return nodes;
    },

    filterElements: function(filter) {
      var ranges = this.getOwnRanges(),
          nodes = [], curNodes;

      for (var i = 0, maxi = ranges.length; i < maxi; i++) {
        curNodes = ranges[i].getNodes([1], function(element){
          return filter(element, ranges[i]);
        });
        nodes = nodes.concat(curNodes);
      }
      return nodes;
    },

    containsUneditable: function() {
      var uneditables = this.getOwnUneditables(),
          selection = this.getSelection();

      for (var i = 0, maxi = uneditables.length; i < maxi; i++) {
        if (selection.containsNode(uneditables[i])) {
          return true;
        }
      }

      return false;
    },

    // Deletes selection contents making sure uneditables/unselectables are not partially deleted
    // Triggers wysihtml5:uneditable:delete custom event on all deleted uneditables if customevents suppoorted
    deleteContents: function()  {
      var range = this.getRange();
      this.deleteRangeContents(range);
      this.setSelection(range);
    },
    
    // Makes sure all uneditable sare notified before deleting contents
    deleteRangeContents: function (range) {
      var startParent, endParent, uneditables, ev;
      
      if (this.unselectableClass) {
        if ((startParent = wysihtml5.dom.getParentElement(range.startContainer, { query: "." + this.unselectableClass }, false, this.contain))) {
          range.setStartBefore(startParent);
        }
        if ((endParent = wysihtml5.dom.getParentElement(range.endContainer, { query: "." + this.unselectableClass }, false, this.contain))) {
          range.setEndAfter(endParent);
        }

        // If customevents present notify uneditable elements of being deleted
        uneditables = range.getNodes([1], (function (node) {
          return wysihtml5.dom.hasClass(node, this.unselectableClass);
        }).bind(this));
        for (var i = uneditables.length; i--;) {
          try {
            ev = new CustomEvent("wysihtml5:uneditable:delete");
            uneditables[i].dispatchEvent(ev);
          } catch (err) {}
        }
      }
      range.deleteContents();
    },

    getCaretNode: function () {
      var selection = this.getSelection();
      return (selection && selection.anchorNode) ? getRangeNode(selection.anchorNode, selection.anchorOffset) : null;
    },

    getPreviousNode: function(node, ignoreEmpty) {
      var displayStyle;
      if (!node) {
        var selection = this.getSelection();
        node = (selection && selection.anchorNode) ? getRangeNode(selection.anchorNode, selection.anchorOffset) : null;
      }

      if (node === this.contain) {
          return false;
      }

      var ret = node.previousSibling,
          parent;

      if (ret === this.contain) {
          return false;
      }

      if (ret && ret.nodeType !== 3 && ret.nodeType !== 1) {
         // do not count comments and other node types
         ret = this.getPreviousNode(ret, ignoreEmpty);
      } else if (ret && ret.nodeType === 3 && (/^\s*$/).test(ret.textContent)) {
        // do not count empty textnodes as previous nodes
        ret = this.getPreviousNode(ret, ignoreEmpty);
      } else if (ignoreEmpty && ret && ret.nodeType === 1) {
        // Do not count empty nodes if param set.
        // Contenteditable tends to bypass and delete these silently when deleting with caret when element is inline-like
        displayStyle = wysihtml5.dom.getStyle("display").from(ret);
        if (
            !wysihtml5.lang.array(["BR", "HR", "IMG"]).contains(ret.nodeName) &&
            !wysihtml5.lang.array(["block", "inline-block", "flex", "list-item", "table"]).contains(displayStyle) &&
            (/^[\s]*$/).test(ret.innerHTML)
          ) {
            ret = this.getPreviousNode(ret, ignoreEmpty);
          }
      } else if (!ret && node !== this.contain) {
        parent = node.parentNode;
        if (parent !== this.contain) {
            ret = this.getPreviousNode(parent, ignoreEmpty);
        }
      }

      return (ret !== this.contain) ? ret : false;
    },

    // Gather info about caret location (caret node, previous and next node)
    getNodesNearCaret: function() {
      if (!this.isCollapsed()) {
        throw "Selection must be caret when using selection.getNodesNearCaret()";
      }

      var r = this.getOwnRanges(),
          caretNode, prevNode, nextNode, offset;

      if (r && r.length > 0) {
        if (r[0].startContainer.nodeType === 1) {
          caretNode = r[0].startContainer.childNodes[r[0].startOffset - 1];
          if (!caretNode && r[0].startOffset === 0) {
            // Is first position before all nodes
            nextNode = r[0].startContainer.childNodes[0];
          } else if (caretNode) {
            prevNode = caretNode.previousSibling;
            nextNode = caretNode.nextSibling;
          }
        } else {
          if (r[0].startOffset === 0 && r[0].startContainer.previousSibling) {
            caretNode = r[0].startContainer.previousSibling;
            if (caretNode.nodeType === 3) {
              offset = caretNode.data.length; 
            }
          } else {
            caretNode = r[0].startContainer;
            offset = r[0].startOffset;
          }
          prevNode = caretNode.previousSibling;
          nextNode = caretNode.nextSibling;
        }

        return {
          "caretNode": caretNode,
          "prevNode": prevNode,
          "nextNode": nextNode,
          "textOffset": offset
        };
      }

      return null;
    },

    getSelectionParentsByTag: function(tagName) {
      var nodes = this.getSelectedOwnNodes(),
          curEl, parents = [];

      for (var i = 0, maxi = nodes.length; i < maxi; i++) {
        curEl = (nodes[i].nodeName &&  nodes[i].nodeName === 'LI') ? nodes[i] : wysihtml5.dom.getParentElement(nodes[i], { query: 'li'}, false, this.contain);
        if (curEl) {
          parents.push(curEl);
        }
      }
      return (parents.length) ? parents : null;
    },

    getRangeToNodeEnd: function() {
      if (this.isCollapsed()) {
        var range = this.getRange(),
            sNode = range.startContainer,
            pos = range.startOffset,
            lastR = rangy.createRange(this.doc);

        lastR.selectNodeContents(sNode);
        lastR.setStart(sNode, pos);
        return lastR;
      }
    },

    caretIsLastInSelection: function() {
      var r = rangy.createRange(this.doc),
          s = this.getSelection(),
          endc = this.getRangeToNodeEnd().cloneContents(),
          endtxt = endc.textContent;

      return (/^\s*$/).test(endtxt);
    },

    caretIsFirstInSelection: function(includeLineBreaks) {
      var r = rangy.createRange(this.doc),
          s = this.getSelection(),
          range = this.getRange(),
          startNode = getRangeNode(range.startContainer, range.startOffset);
      
      if (startNode) {
        if (startNode.nodeType === wysihtml5.TEXT_NODE) {
          if (!startNode.parentNode) {
            return false;
          }
          if (!this.isCollapsed() || (startNode.parentNode.firstChild !== startNode && !wysihtml5.dom.domNode(startNode.previousSibling).is.block())) {
            return false;
          }
          var ws = this.win.getComputedStyle(startNode.parentNode).whiteSpace;
          return (ws === "pre" || ws === "pre-wrap") ? range.startOffset === 0 : (/^\s*$/).test(startNode.data.substr(0,range.startOffset));
        } else if (includeLineBreaks && wysihtml5.dom.domNode(startNode).is.lineBreak()) {
          return true;
        } else {
          r.selectNodeContents(this.getRange().commonAncestorContainer);
          r.collapse(true);
          return (this.isCollapsed() && (r.startContainer === s.anchorNode || r.endContainer === s.anchorNode) && r.startOffset === s.anchorOffset);
        }
      }
    },

    caretIsInTheBeginnig: function(ofNode) {
        var selection = this.getSelection(),
            node = selection.anchorNode,
            offset = selection.anchorOffset;
        if (ofNode && node) {
          return (offset === 0 && (node.nodeName && node.nodeName === ofNode.toUpperCase() || wysihtml5.dom.getParentElement(node.parentNode, { query: ofNode }, 1)));
        } else if (node) {
          return (offset === 0 && !this.getPreviousNode(node, true));
        }
    },

    // Returns object describing node/text before selection
    // If includePrevLeaves is true returns  also previous last leaf child if selection is in the beginning of current node
    getBeforeSelection: function(includePrevLeaves) {
      var sel = this.getSelection(),
          startNode = (sel.isBackwards()) ? sel.focusNode : sel.anchorNode,
          startOffset = (sel.isBackwards()) ? sel.focusOffset : sel.anchorOffset,
          rng = this.createRange(), endNode, inTmpCaret;

      // If start is textnode and all is whitespace before caret. Set start offset to 0
      if (startNode && startNode.nodeType === 3 && (/^\s*$/).test(startNode.data.slice(0, startOffset))) {
        startOffset = 0;
      }

      // Escape temproray helper nodes if selection in them
      inTmpCaret = wysihtml5.dom.getParentElement(startNode, { query: '._wysihtml5-temp-caret-fix' }, 1);
      if (inTmpCaret) {
        startNode = inTmpCaret.parentNode;
        startOffset = Array.prototype.indexOf.call(startNode.childNodes, inTmpCaret);
      }

      if (startNode) {
        if (startOffset > 0) {
          if (startNode.nodeType === 3) {
            rng.setStart(startNode, 0);
            rng.setEnd(startNode, startOffset);
            return {
              type: "text",
              range: rng,
              offset : startOffset,
              node: startNode
            };
          } else {
            rng.setStartBefore(startNode.childNodes[0]);
            endNode = startNode.childNodes[startOffset - 1];
            rng.setEndAfter(endNode);
            return {
              type: "element",
              range: rng,
              offset : startOffset,
              node: endNode
            };
          }
        } else {
          rng.setStartAndEnd(startNode, 0);

          if (includePrevLeaves) {
            var prevNode = this.getPreviousNode(startNode, true),
                prevLeaf = null;

            if(prevNode) {
              if (prevNode.nodeType === 1 && wysihtml5.dom.hasClass(prevNode, this.unselectableClass)) {
                prevLeaf = prevNode;
              } else {
                prevLeaf = wysihtml5.dom.domNode(prevNode).lastLeafNode();
              }
            }

            if (prevLeaf) {
              return {
                type: "leafnode",
                range: rng,
                offset : startOffset,
                node: prevLeaf
              };
            }
          }

          return {
            type: "none",
            range: rng,
            offset : startOffset,
            node: startNode
          };
        }
      }
      return null;
    },

    // TODO: Figure out a method from following 2 that would work universally
    executeAndRestoreRangy: function(method, restoreScrollPosition) {
      var sel = rangy.saveSelection(this.win);
      if (!sel) {
        method();
      } else {
        try {
          method();
        } catch(e) {
          setTimeout(function() { throw e; }, 0);
        }
      }
      rangy.restoreSelection(sel);
    },

    // TODO: has problems in chrome 12. investigate block level and uneditable area inbetween
    executeAndRestore: function(method, restoreScrollPosition) {
      var body                  = this.doc.body,
          oldScrollTop          = restoreScrollPosition && body.scrollTop,
          oldScrollLeft         = restoreScrollPosition && body.scrollLeft,
          className             = "_wysihtml5-temp-placeholder",
          placeholderHtml       = '<span class="' + className + '">' + wysihtml5.INVISIBLE_SPACE + '</span>',
          range                 = this.getRange(true),
          caretPlaceholder,
          newCaretPlaceholder,
          nextSibling, prevSibling,
          node, node2, range2,
          newRange;

      // Nothing selected, execute and say goodbye
      if (!range) {
        method(body, body);
        return;
      }

      if (!range.collapsed) {
        range2 = range.cloneRange();
        node2 = range2.createContextualFragment(placeholderHtml);
        range2.collapse(false);
        range2.insertNode(node2);
        range2.detach();
      }

      node = range.createContextualFragment(placeholderHtml);
      range.insertNode(node);

      if (node2) {
        caretPlaceholder = this.contain.querySelectorAll("." + className);
        range.setStartBefore(caretPlaceholder[0]);
        range.setEndAfter(caretPlaceholder[caretPlaceholder.length -1]);
      }
      this.setSelection(range);

      // Make sure that a potential error doesn't cause our placeholder element to be left as a placeholder
      try {
        method(range.startContainer, range.endContainer);
      } catch(e) {
        setTimeout(function() { throw e; }, 0);
      }
      caretPlaceholder = this.contain.querySelectorAll("." + className);
      if (caretPlaceholder && caretPlaceholder.length) {
        newRange = rangy.createRange(this.doc);
        nextSibling = caretPlaceholder[0].nextSibling;
        if (caretPlaceholder.length > 1) {
          prevSibling = caretPlaceholder[caretPlaceholder.length -1].previousSibling;
        }
        if (prevSibling && nextSibling) {
          newRange.setStartBefore(nextSibling);
          newRange.setEndAfter(prevSibling);
        } else {
          newCaretPlaceholder = this.doc.createTextNode(wysihtml5.INVISIBLE_SPACE);
          dom.insert(newCaretPlaceholder).after(caretPlaceholder[0]);
          newRange.setStartBefore(newCaretPlaceholder);
          newRange.setEndAfter(newCaretPlaceholder);
        }
        this.setSelection(newRange);
        for (var i = caretPlaceholder.length; i--;) {
          caretPlaceholder[i].parentNode.removeChild(caretPlaceholder[i]);
        }

      } else {
        // fallback for when all hell breaks loose
        this.contain.focus();
      }

      if (restoreScrollPosition) {
        body.scrollTop  = oldScrollTop;
        body.scrollLeft = oldScrollLeft;
      }

      // Remove it again, just to make sure that the placeholder is definitely out of the dom tree
      try {
        caretPlaceholder.parentNode.removeChild(caretPlaceholder);
      } catch(e2) {}
    },

    set: function(node, offset) {
      var newRange = rangy.createRange(this.doc);
      newRange.setStart(node, offset || 0);
      this.setSelection(newRange);
    },

    /**
     * Insert html at the caret or selection position and move the cursor after the inserted html
     * Replaces selection content if present
     *
     * @param {String} html HTML string to insert
     * @example
     *    selection.insertHTML("<p>foobar</p>");
     */
    insertHTML: function(html) {
      var range     = this.getRange(),
          node = this.doc.createElement('DIV'),
          fragment = this.doc.createDocumentFragment(),
          lastChild, lastEditorElement;
      
      if (range) {
        range.deleteContents();
        node.innerHTML = html;
        lastChild = node.lastChild;

        while (node.firstChild) {
          fragment.appendChild(node.firstChild);
        }
        range.insertNode(fragment);
        
        lastEditorElement = this.contain.lastChild;
        while (lastEditorElement && lastEditorElement.nodeType === 3 && lastEditorElement.previousSibling && (/^\s*$/).test(lastEditorElement.data)) {
          lastEditorElement = lastEditorElement.previousSibling;
        }

        if (lastChild) {
          // fixes some pad cases mostly on webkit where last nr is needed
          if (lastEditorElement && lastChild === lastEditorElement && lastChild.nodeType === 1) {
            this.contain.appendChild(this.doc.createElement('br'));
          }
          this.setAfter(lastChild);
        }
      }
    },

    /**
     * Insert a node at the caret position and move the cursor behind it
     *
     * @param {Object} node HTML string to insert
     * @example
     *    selection.insertNode(document.createTextNode("foobar"));
     */
    insertNode: function(node) {
      var range = this.getRange();
      if (range) {
        range.insertNode(node);
      }
    },

    canAppendChild: function (node) {
      var anchorNode, anchorNodeTagNameLower,
          voidElements = ["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"],
          range = this.getRange();

      anchorNode = node || range.startContainer;

      if (anchorNode) {
        anchorNodeTagNameLower = (anchorNode.tagName || anchorNode.nodeName).toLowerCase();
      }

      return voidElements.indexOf(anchorNodeTagNameLower) === -1;
    },

    splitElementAtCaret: function (element, insertNode) {
      var sel = this.getSelection(),
          range, contentAfterRangeStart,
          firstChild, lastChild, childNodes;

      if (sel.rangeCount > 0) {
        range = sel.getRangeAt(0).cloneRange(); // Create a copy of the selection range to work with

        range.setEndAfter(element); // Place the end of the range after the element
        contentAfterRangeStart = range.extractContents(); // Extract the contents of the element after the caret into a fragment

        childNodes = contentAfterRangeStart.childNodes;

        // Empty elements are cleaned up from extracted content
        for (var i = childNodes.length; i --;) {
          if (!wysihtml5.dom.domNode(childNodes[i]).is.visible()) {
            contentAfterRangeStart.removeChild(childNodes[i]);
          }
        }

        element.parentNode.insertBefore(contentAfterRangeStart, element.nextSibling);

        if (insertNode) {
          firstChild = insertNode.firstChild || insertNode;
          lastChild = insertNode.lastChild || insertNode;

          element.parentNode.insertBefore(insertNode, element.nextSibling);

          // Select inserted node contents
          if (firstChild && lastChild) {
             range.setStartBefore(firstChild);
             range.setEndAfter(lastChild);
             this.setSelection(range);
          }
        } else {
          range.setStartAfter(element);
          range.setEndAfter(element);
        }

        if (!wysihtml5.dom.domNode(element).is.visible()) {
          if (wysihtml5.dom.getTextContent(element) === '') {
            element.parentNode.removeChild(element);
          } else {
            element.parentNode.replaceChild(this.doc.createTextNode(" "), element);
          }
        }


      }
    },

    /**
     * Wraps current selection with the given node
     *
     * @param {Object} node The node to surround the selected elements with
     */
    surround: function(nodeOptions) {
      var ranges = this.getOwnRanges(),
          node, nodes = [];
      if (ranges.length == 0) {
        return nodes;
      }

      for (var i = ranges.length; i--;) {
        node = this.doc.createElement(nodeOptions.nodeName);
        nodes.push(node);
        if (nodeOptions.className) {
          node.className = nodeOptions.className;
        }
        if (nodeOptions.cssStyle) {
          node.setAttribute('style', nodeOptions.cssStyle);
        }
        try {
          // This only works when the range boundaries are not overlapping other elements
          ranges[i].surroundContents(node);
          this.selectNode(node);
        } catch(e) {
          // fallback
          node.appendChild(ranges[i].extractContents());
          ranges[i].insertNode(node);
        }
      }
      return nodes;
    },

    /**
     * Scroll the current caret position into the view
     * FIXME: This is a bit hacky, there might be a smarter way of doing this
     *
     * @example
     *    selection.scrollIntoView();
     */
    scrollIntoView: function() {
      var doc           = this.doc,
          tolerance     = 5, // px
          hasScrollBars = doc.documentElement.scrollHeight > doc.documentElement.offsetHeight,
          tempElement   = doc._wysihtml5ScrollIntoViewElement = doc._wysihtml5ScrollIntoViewElement || (function() {
            var element = doc.createElement("span");
            // The element needs content in order to be able to calculate it's position properly
            element.innerHTML = wysihtml5.INVISIBLE_SPACE;
            return element;
          })(),
          offsetTop;

      if (hasScrollBars) {
        this.insertNode(tempElement);
        offsetTop = _getCumulativeOffsetTop(tempElement);
        tempElement.parentNode.removeChild(tempElement);
        if (offsetTop >= (doc.body.scrollTop + doc.documentElement.offsetHeight - tolerance)) {
          doc.body.scrollTop = offsetTop;
        }
      }
    },

    /**
     * Select line where the caret is in
     */
    selectLine: function() {
      var r = rangy.createRange();
      if (wysihtml5.browser.supportsSelectionModify()) {
        this._selectLine_W3C();
      } else if (r.nativeRange && r.nativeRange.getBoundingClientRect) {
        // For IE Edge as it ditched the old api and did not fully implement the new one (as expected)
        this._selectLineUniversal();
      }
    },
    
    includeRangyRangeHelpers: function() {
      var s = this.getSelection(),
          r = s.getRangeAt(0),
          isHelperNode = function(node) {
            return (node && node.nodeType === 1 && node.classList.contains('rangySelectionBoundary'));
          },
          getNodeLength = function (node) {
            if (node.nodeType === 1) {
              return node.childNodes && node.childNodes.length || 0;
            } else {
              return node.data && node.data.length || 0;
            }
          },
          anode = s.anchorNode.nodeType === 1 ? s.anchorNode.childNodes[s.anchorOffset] : s.anchorNode,
          fnode = s.focusNode.nodeType === 1 ? s.focusNode.childNodes[s.focusOffset] : s.focusNode;
      
      if (fnode && s.focusOffset === getNodeLength(fnode) && fnode.nextSibling && isHelperNode(fnode.nextSibling)) {
        r.setEndAfter(fnode.nextSibling);
      }
      if (anode && s.anchorOffset === 0 && anode.previousSibling && isHelperNode(anode.previousSibling)) {
        r.setStartBefore(anode.previousSibling);
      }
      r.select();
    },

    /**
     * See https://developer.mozilla.org/en/DOM/Selection/modify
     */
    _selectLine_W3C: function() {
      var selection = this.win.getSelection(),
          initialBoundry = [selection.anchorNode, selection.anchorOffset, selection.focusNode, selection.focusOffset];
          
      selection.modify("move", "left", "lineboundary");
      selection.modify("extend", "right", "lineboundary");
      
      // IF lineboundary extending did not change selection try universal fallback (FF fails sometimes without a reason)
      if (selection.anchorNode === initialBoundry[0] &&
          selection.anchorOffset === initialBoundry[1] &&
          selection.focusNode === initialBoundry[2] &&
          selection.focusOffset === initialBoundry[3]
      ) {
        this._selectLineUniversal();
      } else {
        this.includeRangyRangeHelpers();
      }
    },

    // collapses selection to current line beginning or end
    toLineBoundary: function (location, collapse) {
      collapse = (typeof collapse === 'undefined') ? false : collapse;
      if (wysihtml5.browser.supportsSelectionModify()) {
        var selection = this.win.getSelection();

        selection.modify("extend", location, "lineboundary");
        if (collapse) {
          if (location === "left") {
            selection.collapseToStart();
          } else if (location === "right") {
            selection.collapseToEnd();
          }
        }
      }
    },

    getRangeRect: function(r) {
      var textNode = this.doc.createTextNode("i"),
          testNode = this.doc.createTextNode("i"),
          rect, cr;

      /*testNode.style.visibility = "hidden";
      testNode.style.width = "0px";
      testNode.style.display = "inline-block";
      testNode.style.overflow = "hidden";
      testNode.appendChild(textNode);*/

      if (r.collapsed) {
        r.insertNode(testNode);
        r.selectNode(testNode);
        rect = r.nativeRange.getBoundingClientRect();
        r.deleteContents();

      } else {
        rect = r.nativeRange.getBoundingClientRect();
      }

      return rect;

    },

    _selectLineUniversal: function() {
      var s = this.getSelection(),
          r = s.getRangeAt(0),
          rect,
          startRange, endRange, testRange,
          count = 0,
          amount, testRect, found,
          that = this,
          isLineBreakingElement = function(el) {
            return el && el.nodeType === 1 && (that.win.getComputedStyle(el).display === "block" || wysihtml5.lang.array(['BR', 'HR']).contains(el.nodeName));
          },
          prevNode = function(node) {
            var pnode = node;
            if (pnode) {
              while (pnode && ((pnode.nodeType === 1 && pnode.classList.contains('rangySelectionBoundary')) || (pnode.nodeType === 3 && (/^\s*$/).test(pnode.data)))) {
                pnode = pnode.previousSibling;
              }
            }
            return pnode;
          };

      startRange = r.cloneRange();
      endRange = r.cloneRange();

      if (r.collapsed) {
        // Collapsed state can not have a bounding rect. Thus need to expand it at least by 1 character first while not crossing line boundary
        // TODO: figure out a shorter and more readable way
        if (r.startContainer.nodeType === 3 && r.startOffset < r.startContainer.data.length) {
          r.moveEnd('character', 1);
        } else if (r.startContainer.nodeType === 1 && r.startContainer.childNodes[r.startOffset] && r.startContainer.childNodes[r.startOffset].nodeType === 3 && r.startContainer.childNodes[r.startOffset].data.length > 0) {
          r.moveEnd('character', 1);
        } else if (
          r.startOffset > 0 &&
          (
            r.startContainer.nodeType === 3 ||
            (
              r.startContainer.nodeType === 1 &&
              !isLineBreakingElement(prevNode(r.startContainer.childNodes[r.startOffset - 1]))
            )
          )
        ) {
          r.moveStart('character', -1);
        }
      }
      if (!r.collapsed) {
        r.insertNode(this.doc.createTextNode(wysihtml5.INVISIBLE_SPACE));
      }
      
      // Is probably just empty line as can not be expanded
      rect = r.nativeRange.getBoundingClientRect();
      // If startnode is not line break allready move the start position of range by -1 character until clientRect top changes;
      do {
        amount = r.moveStart('character', -1);
        testRect =  r.nativeRange.getBoundingClientRect();
        
        if (!testRect || Math.floor(testRect.top) !== Math.floor(rect.top)) {
          r.moveStart('character', 1);
          found = true;
        }
        count++;
      } while (amount !== 0 && !found && count < 2000);
      count = 0;
      found = false;
      rect = r.nativeRange.getBoundingClientRect();
      
      if (r.endContainer !== this.contain || (this.contain.lastChild && this.contain.childNodes[r.endOffset] !== this.contain.lastChild)) {
        do {
          amount = r.moveEnd('character', 1);
          testRect =  r.nativeRange.getBoundingClientRect();
          if (!testRect || Math.floor(testRect.bottom) !== Math.floor(rect.bottom)) {
            r.moveEnd('character', -1);

            // Fix a IE line end marked by linebreak element although caret is before it
            // If causes problems should be changed to be applied only to IE
            if (r.endContainer && r.endContainer.nodeType === 1 && r.endContainer.childNodes[r.endOffset] && r.endContainer.childNodes[r.endOffset].nodeType === 1 && r.endContainer.childNodes[r.endOffset].nodeName === "BR" && r.endContainer.childNodes[r.endOffset].previousSibling) {
              if (r.endContainer.childNodes[r.endOffset].previousSibling.nodeType === 1) {
                r.setEnd(r.endContainer.childNodes[r.endOffset].previousSibling, r.endContainer.childNodes[r.endOffset].previousSibling.childNodes.length);
              } else if (r.endContainer.childNodes[r.endOffset].previousSibling.nodeType === 3) {
                r.setEnd(r.endContainer.childNodes[r.endOffset].previousSibling, r.endContainer.childNodes[r.endOffset].previousSibling.data.length);
              }
            }
            found = true;
          }
          count++;
        } while (amount !== 0 && !found && count < 2000);
      }
      r.select();
      this.includeRangyRangeHelpers();
    },

    getText: function() {
      var selection = this.getSelection();
      return selection ? selection.toString() : "";
    },

    getNodes: function(nodeType, filter) {
      var range = this.getRange();
      if (range) {
        return range.getNodes(Array.isArray(nodeType) ? nodeType : [nodeType], filter);
      } else {
        return [];
      }
    },

    // Gets all the elements in selection with nodeType
    // Ignores the elements not belonging to current editable area
    // If filter is defined nodes must pass the filter function with true to be included in list
    getOwnNodes: function(nodeType, filter, splitBounds) {
      var ranges = this.getOwnRanges(),
          nodes = [];
      for (var r = 0, rmax = ranges.length; r < rmax; r++) {
        if (ranges[r]) {
          if (splitBounds) {
            ranges[r].splitBoundaries();
          }
          nodes = nodes.concat(ranges[r].getNodes(Array.isArray(nodeType) ? nodeType : [nodeType], filter));
        }
      }

      return nodes;
    },

    fixRangeOverflow: function(range) {
      if (this.contain && this.contain.firstChild && range) {
        var containment = range.compareNode(this.contain);
        if (containment !== 2) {
          if (containment === 1) {
            range.setStartBefore(this.contain.firstChild);
          }
          if (containment === 0) {
            range.setEndAfter(this.contain.lastChild);
          }
          if (containment === 3) {
            range.setStartBefore(this.contain.firstChild);
            range.setEndAfter(this.contain.lastChild);
          }
        } else if (this._detectInlineRangeProblems(range)) {
          var previousElementSibling = range.endContainer.previousElementSibling;
          if (previousElementSibling) {
            range.setEnd(previousElementSibling, this._endOffsetForNode(previousElementSibling));
          }
        }
      }
    },

    _endOffsetForNode: function(node) {
      var range = document.createRange();
      range.selectNodeContents(node);
      return range.endOffset;
    },

    _detectInlineRangeProblems: function(range) {
      var position = dom.compareDocumentPosition(range.startContainer, range.endContainer);
      return (
        range.endOffset == 0 &&
        position & 4 //Node.DOCUMENT_POSITION_FOLLOWING
      );
    },

    getRange: function(dontFix) {
      var selection = this.getSelection(),
          range = selection && selection.rangeCount && selection.getRangeAt(0);

      if (dontFix !== true) {
        this.fixRangeOverflow(range);
      }

      return range;
    },

    getOwnUneditables: function() {
      var allUneditables = dom.query(this.contain, '.' + this.unselectableClass),
          deepUneditables = dom.query(allUneditables, '.' + this.unselectableClass);

      return wysihtml5.lang.array(allUneditables).without(deepUneditables);
    },

    // Returns an array of ranges that belong only to this editable
    // Needed as uneditable block in contenteditabel can split range into pieces
    // If manipulating content reverse loop is usually needed as manipulation can shift subsequent ranges
    getOwnRanges: function()  {
      var ranges = [],
          r = this.getRange(),
          tmpRanges;

      if (r) { ranges.push(r); }

      if (this.unselectableClass && this.contain && r) {
        var uneditables = this.getOwnUneditables(),
            tmpRange;
        if (uneditables.length > 0) {
          for (var i = 0, imax = uneditables.length; i < imax; i++) {
            tmpRanges = [];
            for (var j = 0, jmax = ranges.length; j < jmax; j++) {
              if (ranges[j]) {
                switch (ranges[j].compareNode(uneditables[i])) {
                  case 2:
                    // all selection inside uneditable. remove
                  break;
                  case 3:
                    //section begins before and ends after uneditable. spilt
                    tmpRange = ranges[j].cloneRange();
                    tmpRange.setEndBefore(uneditables[i]);
                    tmpRanges.push(tmpRange);

                    tmpRange = ranges[j].cloneRange();
                    tmpRange.setStartAfter(uneditables[i]);
                    tmpRanges.push(tmpRange);
                  break;
                  default:
                    // in all other cases uneditable does not touch selection. dont modify
                    tmpRanges.push(ranges[j]);
                }
              }
              ranges = tmpRanges;
            }
          }
        }
      }
      return ranges;
    },

    getSelection: function() {
      return rangy.getSelection(this.win);
    },

    // Sets selection in document to a given range
    // Set selection method detects if it fails to set any selection in document and returns null on fail
    // (especially needed in webkit where some ranges just can not create selection for no reason)
    setSelection: function(range) {
      var selection = rangy.getSelection(this.win);
      selection.setSingleRange(range);
      return (selection && selection.anchorNode && selection.focusNode) ? selection : null;
    },



    // Webkit has an ancient error of not selecting all contents when uneditable block element is first or last in editable area
    selectAll: function() {
      var range = this.createRange(),
          composer = this.composer,
          that = this,
          blankEndNode = getWebkitSelectionFixNode(this.composer.element),
          blankStartNode = getWebkitSelectionFixNode(this.composer.element),
          s;

      var doSelect = function() {
        range.setStart(composer.element, 0);
        range.setEnd(composer.element, composer.element.childNodes.length);
        s = that.setSelection(range);
      };

      var notSelected = function() {
        return !s || (s.nativeSelection && s.nativeSelection.type && (s.nativeSelection.type === "Caret" || s.nativeSelection.type === "None"));
      }

      wysihtml5.dom.removeInvisibleSpaces(this.composer.element);
      doSelect();
      
      if (this.composer.element.firstChild && notSelected())  {
        // Try fixing end
        this.composer.element.appendChild(blankEndNode);
        doSelect();

        if (notSelected()) {
          // Remove end fix
          blankEndNode.parentNode.removeChild(blankEndNode);
          
          // Try fixing beginning
          this.composer.element.insertBefore(blankStartNode, this.composer.element.firstChild);
          doSelect();
          
          if (notSelected()) {
            // Try fixing both
            this.composer.element.appendChild(blankEndNode);
            doSelect();
          }
        }
      }
    },

    createRange: function() {
      return rangy.createRange(this.doc);
    },

    isCollapsed: function() {
        return this.getSelection().isCollapsed;
    },

    getHtml: function() {
      return this.getSelection().toHtml();
    },

    getPlainText: function () {
      return this.getSelection().toString();
    },

    isEndToEndInNode: function(nodeNames) {
      var range = this.getRange(),
          parentElement = range.commonAncestorContainer,
          startNode = range.startContainer,
          endNode = range.endContainer;


        if (parentElement.nodeType === wysihtml5.TEXT_NODE) {
          parentElement = parentElement.parentNode;
        }

        if (startNode.nodeType === wysihtml5.TEXT_NODE && !(/^\s*$/).test(startNode.data.substr(range.startOffset))) {
          return false;
        }

        if (endNode.nodeType === wysihtml5.TEXT_NODE && !(/^\s*$/).test(endNode.data.substr(range.endOffset))) {
          return false;
        }

        while (startNode && startNode !== parentElement) {
          if (startNode.nodeType !== wysihtml5.TEXT_NODE && !wysihtml5.dom.contains(parentElement, startNode)) {
            return false;
          }
          if (wysihtml5.dom.domNode(startNode).prev({ignoreBlankTexts: true})) {
            return false;
          }
          startNode = startNode.parentNode;
        }

        while (endNode && endNode !== parentElement) {
          if (endNode.nodeType !== wysihtml5.TEXT_NODE && !wysihtml5.dom.contains(parentElement, endNode)) {
            return false;
          }
          if (wysihtml5.dom.domNode(endNode).next({ignoreBlankTexts: true})) {
            return false;
          }
          endNode = endNode.parentNode;
        }

        return (wysihtml5.lang.array(nodeNames).contains(parentElement.nodeName)) ? parentElement : false;
    },

    isInThisEditable: function() {
      var sel = this.getSelection(),
          fnode = sel.focusNode,
          anode = sel.anchorNode;

      // In IE node contains will not work for textnodes, thus taking parentNode
      if (fnode && fnode.nodeType !== 1) {
        fnode = fnode.parentNode;
      }

      if (anode && anode.nodeType !== 1) {
        anode = anode.parentNode;
      }

      return anode && fnode &&
             (wysihtml5.dom.contains(this.composer.element, fnode) || this.composer.element === fnode) &&
             (wysihtml5.dom.contains(this.composer.element, anode) || this.composer.element === anode);
    },

    deselect: function() {
      var sel = this.getSelection();
      sel && sel.removeAllRanges();
    }
  });

})(wysihtml5);
