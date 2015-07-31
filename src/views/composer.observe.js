/**
 * Taking care of events
 *  - Simulating 'change' event on contentEditable element
 *  - Handling drag & drop logic
 *  - Catch paste events
 *  - Dispatch proprietary newword:composer event
 *  - Keyboard shortcuts
 */
(function(wysihtml5) {
  var dom       = wysihtml5.dom,
      browser   = wysihtml5.browser,
      /**
       * Map keyCodes to query commands
       */
      shortcuts = {
        "66": "bold",     // B
        "73": "italic",   // I
        "85": "underline" // U
      };

  // Adds multiple eventlisteners to target, bound to one callback
  // TODO: If needed elsewhere make it part of wysihtml5.dom or sth
  var addListeners = function (target, events, callback) {
    for(var i = 0, max = events.length; i < max; i++) {
      target.addEventListener(events[i], callback, false);
    }
  };

  // Removes multiple eventlisteners from target, bound to one callback
  // TODO: If needed elsewhere make it part of wysihtml5.dom or sth
  var removeListeners = function (target, events, callback) {
    for(var i = 0, max = events.length; i < max; i++) {
      target.removeEventListener(events[i], callback, false);
    }
  };

  // Override for giving user ability to delete last line break in table cell
  var fixLastBrDeletionInTable = function(composer, force) {
    if (composer.selection.caretIsLastInSelection()) {
      var sel = composer.selection.getSelection(),
          aNode = sel.anchorNode;
      if (aNode && aNode.nodeType === 1 && (wysihtml5.dom.getParentElement(aNode, {query: 'td, th'}, false, composer.element) || force)) {
        var nextNode = aNode.childNodes[sel.anchorOffset];
        if (nextNode && nextNode.nodeType === 1 & nextNode.nodeName === "BR") {
          nextNode.parentNode.removeChild(nextNode);
          return true;
        }
      }
    }
    return false;
  };

  // If found an uneditable before caret then notify it before deletion
  var handleUneditableDeletion = function(composer) {
    var before = composer.selection.getBeforeSelection(true);
    if (before && (before.type === "element" || before.type === "leafnode") && before.node.nodeType === 1 && before.node.classList.contains(composer.config.classNames.uneditableContainer)) {
      if (fixLastBrDeletionInTable(composer, true)) {
        return true;
      }
      try {
        var ev = new CustomEvent("wysihtml5:uneditable:delete");
        before.node.dispatchEvent(ev);
      } catch (err) {}
      before.node.parentNode.removeChild(before.node);
      return true;
    }
    return false;
  };

  // Deletion with caret in the beginning of headings needs special attention
  // Heading does not concate text to previous block node correctly (browsers do unexpected miracles here especially webkit)
  var fixDeleteInTheBeginnigOfHeading = function(composer) {
    var selection = composer.selection,
        prevNode = selection.getPreviousNode();

    if (selection.caretIsFirstInSelection() &&
        prevNode &&
        prevNode.nodeType === 1 &&
        (/block/).test(composer.win.getComputedStyle(prevNode).display)
    ) {
      if ((/^\s*$/).test(prevNode.textContent || prevNode.innerText)) {
        // If heading is empty remove the heading node
        prevNode.parentNode.removeChild(prevNode);
        return true;
      } else {
        if (prevNode.lastChild) {
          var selNode = prevNode.lastChild,
              selectedNode = selection.getSelectedNode(),
              commonAncestorNode = wysihtml5.dom.domNode(prevNode).commonAncestor(selectedNode, composer.element);
              curNode = commonAncestorNode ? wysihtml5.dom.getParentElement(selectedNode, {
                query: "h1, h2, h3, h4, h5, h6, p, pre, div, blockquote"
              }, false, commonAncestorNode) : null;
          
            if (curNode) {
              while (curNode.firstChild) {
                prevNode.appendChild(curNode.firstChild);
              }
              selection.setAfter(selNode);
              return true;
            } else if (selectedNode.nodeType === 3) {
              prevNode.appendChild(selectedNode);
              selection.setAfter(selNode);
              return true;
            }
        }
      }
    }
    return false;
  };

  var handleDeleteKeyPress = function(event, composer) {
    var selection = composer.selection,
        element = composer.element;

    if (selection.isCollapsed()) {
      if (fixDeleteInTheBeginnigOfHeading(composer)) {
        event.preventDefault();
        return;
      }
      if (fixLastBrDeletionInTable(composer)) {
        event.preventDefault();
        return;
      }
      if (handleUneditableDeletion(composer)) {
        event.preventDefault();
        return;
      }
    } else {
      if (selection.containsUneditable()) {
        event.preventDefault();
        selection.deleteContents();
      }
    }
  };

  var handleTabKeyDown = function(composer, element, shiftKey) {
    if (!composer.selection.isCollapsed()) {
      composer.selection.deleteContents();
    } else if (composer.selection.caretIsInTheBeginnig('li')) {
      if (shiftKey) {
        if (composer.commands.exec('outdentList')) return;
      } else {
        if (composer.commands.exec('indentList')) return;
      }
    }

    // Is &emsp; close enough to tab. Could not find enough counter arguments for now.
    composer.commands.exec("insertHTML", "&emsp;");
  };

  var handleDomNodeRemoved = function(event) {
      if (this.domNodeRemovedInterval) {
        clearInterval(domNodeRemovedInterval);
      }
      this.parent.fire("destroy:composer");
  };

  // Listens to "drop", "paste", "mouseup", "focus", "keyup" events and fires
  var handleUserInteraction = function (event) {
    this.parent.fire("beforeinteraction", event).fire("beforeinteraction:composer", event);
    setTimeout((function() {
      this.parent.fire("interaction", event).fire("interaction:composer", event);
    }).bind(this), 0);
  };

  var handleFocus = function(event) {
    this.parent.fire("focus", event).fire("focus:composer", event);

    // Delay storing of state until all focus handler are fired
    // especially the one which resets the placeholder
    setTimeout((function() {
      this.focusState = this.getValue(false, false);
    }).bind(this), 0);
  };

  var handleBlur = function(event) {
    if (this.focusState !== this.getValue(false, false)) {
      //create change event if supported (all except IE8)
      var changeevent = event;
      if(typeof Object.create == 'function') {
        changeevent = Object.create(event, { type: { value: 'change' } });
      }
      this.parent.fire("change", changeevent).fire("change:composer", changeevent);
    }
    this.parent.fire("blur", event).fire("blur:composer", event);
  };

  var handlePaste = function(event) {
    this.parent.fire(event.type, event).fire(event.type + ":composer", event);
    if (event.type === "paste") {
      setTimeout((function() {
        this.parent.fire("newword:composer");
      }).bind(this), 0);
    }
  };

  var handleCopy = function(event) {
    if (this.config.copyedFromMarking) {
      // If supported the copied source can be based directly on selection
      // Very useful for webkit based browsers where copy will otherwise contain a lot of code and styles based on whatever and not actually in selection.
      if (event.clipboardData) {
        event.clipboardData.setData("text/html", this.config.copyedFromMarking + this.selection.getHtml());
        event.clipboardData.setData("text/plain", this.selection.getPlainText());
        event.preventDefault();
      }
      this.parent.fire(event.type, event).fire(event.type + ":composer", event);
    }
  };

  var handleKeyUp = function(event) {
    var keyCode = event.keyCode;
    if (keyCode === wysihtml5.SPACE_KEY || keyCode === wysihtml5.ENTER_KEY) {
      this.parent.fire("newword:composer");
    }
  };

  var handleMouseDown = function(event) {
    if (!browser.canSelectImagesInContentEditable()) {
      // Make sure that images are selected when clicking on them
      var target = event.target,
          allImages = this.element.querySelectorAll('img'),
          notMyImages = this.element.querySelectorAll('.' + this.config.classNames.uneditableContainer + ' img'),
          myImages = wysihtml5.lang.array(allImages).without(notMyImages);

      if (target.nodeName === "IMG" && wysihtml5.lang.array(myImages).contains(target)) {
        this.selection.selectNode(target);
      }
    }
  };

  // TODO: mouseover is not actually a foolproof and obvious place for this, must be changed as it modifies dom on random basis
  // Shows url in tooltip when hovering links or images
  var handleMouseOver = function(event) {
    var titlePrefixes = {
          IMG: "Image: ",
          A:   "Link: "
        },
        target   = event.target,
        nodeName = target.nodeName,
        title;

    if (nodeName !== "A" && nodeName !== "IMG") {
      return;
    }
    if(!target.hasAttribute("title")){
      title = titlePrefixes[nodeName] + (target.getAttribute("href") || target.getAttribute("src"));
      target.setAttribute("title", title);
    }
  };

  var handleClick = function(event) {
    if (this.config.classNames.uneditableContainer) {
      // If uneditables is configured, makes clicking on uneditable move caret after clicked element (so it can be deleted like text)
      // If uneditable needs text selection itself event.stopPropagation can be used to prevent this behaviour
      var uneditable = wysihtml5.dom.getParentElement(event.target, { query: "." + this.config.classNames.uneditableContainer }, false, this.element);
      if (uneditable) {
        this.selection.setAfter(uneditable);
      }
    }
  };

  var handleDrop = function(event) {
    if (!browser.canSelectImagesInContentEditable()) {
      // TODO: if I knew how to get dropped elements list from event I could limit it to only IMG element case
      setTimeout((function() {
        this.selection.getSelection().removeAllRanges();
      }).bind(this), 0);
    }
  };

  var handleKeyDown = function(event) {
    var keyCode = event.keyCode,
        command = shortcuts[keyCode],
        target, parent;

    // Select all (meta/ctrl + a)
    if ((event.ctrlKey || event.metaKey) && keyCode === 65) {
      this.selection.selectAll();
      event.preventDefault();
      return;
    }

    // Shortcut logic
    if ((event.ctrlKey || event.metaKey) && !event.altKey && command) {
      this.commands.exec(command);
      event.preventDefault();
    }

    if (keyCode === wysihtml5.BACKSPACE_KEY) {
      // Delete key override for special cases
      handleDeleteKeyPress(event, this);
    }

    // Make sure that when pressing backspace/delete on selected images deletes the image and it's anchor
    if (keyCode === wysihtml5.BACKSPACE_KEY || keyCode === wysihtml5.DELETE_KEY) {
      target = this.selection.getSelectedNode(true);
      if (target && target.nodeName === "IMG") {
        event.preventDefault();
        parent = target.parentNode;
        parent.removeChild(target);// delete the <img>
        // And it's parent <a> too if it hasn't got any other child nodes
        if (parent.nodeName === "A" && !parent.firstChild) {
          parent.parentNode.removeChild(parent);
        }
        setTimeout((function() {
          wysihtml5.quirks.redraw(this.element);
        }).bind(this), 0);
      }
    }

    if (this.config.handleTabKey && keyCode === wysihtml5.TAB_KEY) {
      // TAB key handling
      event.preventDefault();
      handleTabKeyDown(this, this.element, event.shiftKey);
    }

  };

  var handleIframeFocus = function(event) {
    setTimeout((function() {
      if (this.doc.querySelector(":focus") !== this.element) {
        this.focus();
      }
    }).bind(this), 0);
  };

  var handleIframeBlur = function(event) {
    setTimeout((function() {
      this.selection.getSelection().removeAllRanges();
    }).bind(this), 0);
  };

  // Table management
  // If present enableObjectResizing and enableInlineTableEditing command should be called with false to prevent native table handlers
  var initTableHandling = function () {
    var hideHandlers = function () {
          this.doc.execCommand("enableObjectResizing", false, "false");
          this.doc.execCommand("enableInlineTableEditing", false, "false");
        },
        iframeInitiator = (function() {
          hideHandlers.call(this);
          removeListeners(this.sandbox.getIframe(), ["focus", "mouseup", "mouseover"], iframeInitiator);
        }).bind(this);

    if( this.doc.execCommand &&
        wysihtml5.browser.supportsCommand(this.doc, "enableObjectResizing") &&
        wysihtml5.browser.supportsCommand(this.doc, "enableInlineTableEditing"))
    {
      if (this.sandbox.getIframe) {
        addListeners(this.sandbox.getIframe(), ["focus", "mouseup", "mouseover"], iframeInitiator);
      } else {
        setTimeout((function() {
          hideHandlers.call(this);
        }).bind(this), 0);
      }
    }
    this.tableSelection = wysihtml5.quirks.tableCellsSelection(this.element, this.parent);
  };

  wysihtml5.views.Composer.prototype.observe = function() {
    var that                = this,
        container           = (this.sandbox.getIframe) ? this.sandbox.getIframe() : this.sandbox.getContentEditable(),
        element             = this.element,
        focusBlurElement    = (browser.supportsEventsInIframeCorrectly() || this.sandbox.getContentEditable) ? this.element : this.sandbox.getWindow();

    this.focusState = this.getValue(false, false);

    // --------- destroy:composer event ---------
    container.addEventListener(["DOMNodeRemoved"], handleDomNodeRemoved.bind(this), false);

    // DOMNodeRemoved event is not supported in IE 8
    // TODO: try to figure out a polyfill style fix, so it could be transferred to polyfills and removed if ie8 is not needed
    if (!browser.supportsMutationEvents()) {
      this.domNodeRemovedInterval = setInterval(function() {
        if (!dom.contains(document.documentElement, container)) {
          handleDomNodeRemoved.call(this);
        }
      }, 250);
    }

    // --------- User interactions --
    if (this.config.handleTables) {
      // If handleTables option is true, table handling functions are bound
      initTableHandling.call(this);
    }

    addListeners(focusBlurElement, ["drop", "paste", "mouseup", "focus", "keyup"], handleUserInteraction.bind(this));
    focusBlurElement.addEventListener("focus", handleFocus.bind(this), false);
    focusBlurElement.addEventListener("blur",  handleBlur.bind(this), false);
    
    addListeners(this.element, ["drop", "paste", "beforepaste"], handlePaste.bind(this), false);
    this.element.addEventListener("copy",       handleCopy.bind(this), false);
    this.element.addEventListener("mousedown",  handleMouseDown.bind(this), false);
    this.element.addEventListener("mouseover",  handleMouseOver.bind(this), false);
    this.element.addEventListener("click",      handleClick.bind(this), false);
    this.element.addEventListener("drop",       handleDrop.bind(this), false);
    this.element.addEventListener("keyup",      handleKeyUp.bind(this), false);
    this.element.addEventListener("keydown",    handleKeyDown.bind(this), false);

    this.element.addEventListener("dragenter", (function() {
      this.parent.fire("unset_placeholder");
    }).bind(this), false);

  };
})(wysihtml5);
